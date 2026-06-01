import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import { targetingPayloadBlock } from "@/lib/targeting-summary";
import { ensureMailingJobForCampaign } from "@postcard-platform/api/services/mailing-finalize.service";
import type { Prisma } from "@prisma/client";

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

      // Idempotency: if already paid + has a production job, do nothing
      const existingJob = await prisma.productionJob.findUnique({
        where: { campaignId },
      });

      if (existingJob) {
        console.log(`Stripe webhook: Campaign ${campaignId} already has a production job. Skipping.`);
        return NextResponse.json({ received: true });
      }

      // 1. Mark campaign as paid
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: "PAID",
          stripePaymentIntentId: paymentIntentId,
          paidAt: new Date(),
          amountPaidCents: session.amount_total ?? null,
        },
      });

      // 2. Auto-assign to first active production partner
      const firstActivePartner = await prisma.productionPartner.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });

      const targetingMeta = campaign.targetingMetadata ?? campaign.savedMap?.metadata;
      const targeting = targetingPayloadBlock(targetingMeta);

      const jobPayload = {
        campaignName: campaign.name,
        size: campaign.size,
        quantity: campaign.quantity,
        dropDate: campaign.dropDate?.toISOString() ?? null,
        totalPriceCents: campaign.totalPriceCents,
        notes: campaign.notes,
        ...(targeting ? { targeting } : {}),
      } satisfies Record<string, unknown>;

      // 3. Create the ProductionJob
      const productionJob = await prisma.productionJob.create({
        data: {
          campaignId: campaign.id,
          productionPartnerId: firstActivePartner?.id ?? null,
          status: "RECEIVED",
          payload: jobPayload as Prisma.InputJsonValue,
        },
      });

      // 3b. Fulfillment job (real route/list counts + final pricing — finalized via /api/campaigns/[id]/finalize)
      const mailingJob = await ensureMailingJobForCampaign(campaign);

      // 4. Advance campaign to IN_PRODUCTION
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "IN_PRODUCTION" },
      });

      // 5. Create audit event
      await prisma.jobEvent.create({
        data: {
          productionJobId: productionJob.id,
          status: "RECEIVED",
          note: firstActivePartner
            ? `Auto-created after payment. Assigned to ${firstActivePartner.name}`
            : "Auto-created after payment. Awaiting partner assignment.",
          actor: "system:stripe-webhook",
        },
      });

      // 6. Send confirmation email
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
      }

      console.log(
        `✅ Campaign ${campaignId} paid. ProductionJob ${productionJob.id}, MailingJob ${mailingJob.id} created.`
      );
    } catch (err) {
      console.error("Error processing Stripe webhook for campaign", campaignId, err);
      // Still return 200 so Stripe doesn't retry forever
    }
  }

  return NextResponse.json({ received: true });
}
