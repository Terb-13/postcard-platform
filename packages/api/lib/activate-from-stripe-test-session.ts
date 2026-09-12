import type { PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { activateOrderForProduction } from "./activate-order-for-production";
import { isPreviewStripeTestCheckoutAllowed } from "./melissa-buyer-door";

/**
 * Preview-only fallback when STRIPE_WEBHOOK_SECRET is not set yet.
 * Verifies the Checkout Session is paid and activates the campaign.
 * Still does not buy a Melissa list or run mailing finalize.
 */
export async function activateFromStripeTestCheckoutSession(
  prisma: PrismaClient,
  stripe: Stripe,
  input: { sessionId: string; campaignId: string }
): Promise<{ activated: boolean; reason?: string }> {
  if (!isPreviewStripeTestCheckoutAllowed()) {
    return { activated: false, reason: "preview_test_checkout_disabled" };
  }

  const session = await stripe.checkout.sessions.retrieve(input.sessionId);
  if (session.payment_status !== "paid") {
    return { activated: false, reason: "session_not_paid" };
  }
  if (session.metadata?.campaignId !== input.campaignId) {
    return { activated: false, reason: "campaign_mismatch" };
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: input.campaignId },
    include: { savedMap: true },
  });
  if (!campaign) {
    return { activated: false, reason: "campaign_not_found" };
  }
  if (campaign.status === "PAID" || campaign.status === "IN_PRODUCTION" || campaign.status === "COMPLETED") {
    return { activated: false, reason: "already_paid" };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  await activateOrderForProduction(prisma, campaign, {
    amountPaidCents: session.amount_total ?? undefined,
    purchaserEmail: session.customer_details?.email ?? session.customer_email ?? null,
    paymentIntentId,
    actor: "system:stripe-success",
  });

  return { activated: true };
}
