import Link from "next/link";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { activateFromStripeTestCheckoutSession } from "@postcard-platform/api/lib/activate-from-stripe-test-session";
import { isPreviewOnlyTargeting } from "@/lib/melissa-buyer-door";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string; session_id?: string }>;
}) {
  const { campaignId, session_id: sessionId } = await searchParams;

  let previewOnly = false;
  if (campaignId && sessionId) {
    try {
      await activateFromStripeTestCheckoutSession(prisma, stripe, {
        sessionId,
        campaignId,
      });
    } catch (err) {
      console.error("Preview Stripe test checkout activation failed", err);
    }
  }
  if (campaignId) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { targetingMetadata: true },
    });
    previewOnly = isPreviewOnlyTargeting(campaign?.targetingMetadata);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </div>

      <h1 className="mb-3 text-3xl font-semibold text-gray-900">Payment successful</h1>

      <p className="mb-8 text-gray-600">
        {previewOnly
          ? "Thank you. This Stripe test payment is complete. Melissa list buy and finalize stay blocked on this Preview draft."
          : "Thank you. Your campaign is paid. Next, confirm carrier routes and your final piece count so we can send accurate files to print."}
      </p>

      <div className="space-y-3">
        {campaignId && !previewOnly ? (
          <Link
            href={`/campaigns/${campaignId}/finalize`}
            className="block w-full rounded-lg bg-[#0EA5E9] py-3 font-medium text-white hover:bg-[#0284c7]"
          >
            Review final targeting & cost
          </Link>
        ) : null}
        {campaignId && previewOnly ? (
          <Link
            href={`/account/orders/${campaignId}`}
            className="block w-full rounded-lg bg-[#0EA5E9] py-3 font-medium text-white hover:bg-[#0284c7]"
          >
            View test order
          </Link>
        ) : null}
        <Link
          href="/production"
          className="block w-full rounded-lg border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          View production jobs
        </Link>
        <Link
          href="/campaigns"
          className="block w-full rounded-lg border py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to my campaigns
        </Link>
      </div>

      <p className="mt-8 text-xs text-gray-500">You will receive an email confirmation shortly.</p>
    </div>
  );
}
