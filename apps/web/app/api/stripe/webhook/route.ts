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
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: "PAID",
          stripePaymentIntentId: paymentIntentId,
          paidAt: new Date(),
          amountPaid: (session.amount_total || 0) / 100,
        },
      });

      // Optionally auto-trigger production here, or let customer do it from UI
      console.log(`Campaign ${campaignId} has been paid.`);
    }
  }

  return NextResponse.json({ received: true });
}
