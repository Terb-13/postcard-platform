import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/packages/api/lib/stripe";
import { prisma } from "@/lib/db";

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
    const session = event.data.object;

    const campaignId = session.metadata?.campaignId;
    const paymentIntentId = session.payment_intent as string;

    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      if (campaign) {
        // Mark as paid
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: "PAID",
            stripePaymentIntentId: paymentIntentId,
            paidAt: new Date(),
            amountPaid: (session.amount_total || 0) / 100,
          },
        });

        // Auto-create ProductionJob after successful payment
        const firstActivePartner = await prisma.productionPartner.findFirst({
          where: { active: true },
          orderBy: { createdAt: "asc" },
        });

        const productionJob = await prisma.productionJob.create({
          data: {
            campaignId: campaign.id,
            productionPartnerId: firstActivePartner?.id || "",
            status: "RECEIVED",
            payload: {
              campaignName: campaign.name,
              size: campaign.size,
              quantity: campaign.quantity,
              dropDate: campaign.dropDate,
            },
          },
        });

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: "IN_PRODUCTION" },
        });

        // Log the creation
        if (productionJob.id) {
          await prisma.jobEvent.create({
            data: {
              productionJobId: productionJob.id,
              status: "RECEIVED",
              message: firstActivePartner
                ? `Auto-created after payment - assigned to ${firstActivePartner.name}`
                : "Auto-created after payment - awaiting partner assignment",
            },
          });
        }

        console.log(`Campaign ${campaignId} paid and production job created.`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
