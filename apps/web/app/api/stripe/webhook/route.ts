import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import { activateOrderForProduction } from "@postcard-platform/api/lib/activate-order-for-production";

export const runtime = "nodejs";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const campaignId = session.metadata?.campaignId as string | undefined;
    const paymentIntentId = session.payment_intent as string | undefined;

    if (!campaignId) {
      console.warn("Stripe webhook: missing campaignId in metadata");
      return NextResponse.json({ received: true });
    }

    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { organization: true, savedMap: true },
      });

      if (!campaign) {
        console.error(`Stripe webhook: Campaign ${campaignId} not found`);
        return NextResponse.json({ received: true });
      }

      const purchaserEmail =
        (session.customer_details?.email as string | undefined) ??
        (session.customer_email as string | undefined) ??
        null;

      const { productionJob, created } = await activateOrderForProduction(prisma, campaign, {
        amountPaidCents: session.amount_total ?? undefined,
        purchaserEmail,
        paymentIntentId,
        actor: "system:stripe-webhook",
      });

      if (!created) {
        console.log(`Stripe webhook: Campaign ${campaignId} already has a production job. Skipping.`);
        return NextResponse.json({ received: true });
      }

      // Send confirmation email
      const orgUser = await prisma.user.findFirst({
        where: { organizationId: campaign.organizationId },
        orderBy: { createdAt: "asc" },
      });

      if (orgUser?.email && process.env.RESEND_API_KEY) {
        const amountDollars = ((session.amount_total as number) || 0) / 100;
        const template = emailTemplates.paymentReceived(campaign.name, amountDollars);

        await sendEmail({
          to: orgUser.email,
          subject: template.subject,
          html: template.html,
        });
      } else if (purchaserEmail && process.env.RESEND_API_KEY) {
        const amountDollars = ((session.amount_total as number) || 0) / 100;
        const template = emailTemplates.paymentReceived(campaign.name, amountDollars);

        await sendEmail({
          to: purchaserEmail,
          subject: template.subject,
          html: template.html,
        });
      }

      console.log(`✅ Campaign ${campaignId} paid. ProductionJob ${productionJob.id} created.`);
    } catch (err) {
      console.error("Error processing Stripe webhook for campaign", campaignId, err);
      // Still return 200 so Stripe doesn't retry forever
    }
  }

  return NextResponse.json({ received: true });
}
