"use client";

import Link from "next/link";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

type GuestCheckoutAccountPromptProps = {
  campaignId?: string | null;
};

/** Optional account creation at checkout — does not block payment. */
export function GuestCheckoutAccountPrompt({ campaignId }: GuestCheckoutAccountPromptProps) {
  const redirectUrl = campaignId
    ? `/campaigns/new?campaignId=${campaignId}&step=4`
    : "/campaigns/new?step=4";

  return (
    <SignedOut>
      <div className="rounded-2xl border border-[#0EA5E9]/25 bg-[#0EA5E9]/5 p-5 text-sm text-[#0A2540]">
        <p className="font-semibold">Save your campaign & order history</p>
        <p className="mt-2 leading-relaxed text-gray-700">
          Create a free account to access your files, track production, and reorder faster. You can
          pay now as a guest — Stripe will collect your email for receipts.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <SignUpButton mode="modal" fallbackRedirectUrl={redirectUrl}>
            <button
              type="button"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black sm:w-auto"
            >
              Create free account
            </button>
          </SignUpButton>
          <span className="text-xs text-gray-600 sm:ml-2">Optional — continue below to pay</span>
        </div>
      </div>
    </SignedOut>
  );
}

/** Link for signed-in users vs guest-friendly copy */
export function CampaignHistoryLink({ className }: { className?: string }) {
  return (
    <>
      <SignedIn>
        <Link href="/campaigns" className={className}>
          View all campaigns →
        </Link>
      </SignedIn>
      <SignedOut>
        <Link href="/campaigns/new" className={className}>
          Continue your campaign →
        </Link>
      </SignedOut>
    </>
  );
}
