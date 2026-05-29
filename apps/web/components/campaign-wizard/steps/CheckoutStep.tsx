"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Props = {
  campaign?: {
    id?: string;
    name?: string;
    status?: string;
    quantity?: number;
    totalPriceCents?: number | null;
    artwork?: { status?: string } | null;
  } | null;
  onPay: () => void;
  isPaying: boolean;
};

export function CheckoutStep({ campaign, onPay, isPaying }: Props) {
  const artworkApproved = campaign?.artwork?.status === "APPROVED";
  const canPay = artworkApproved && campaign?.status !== "PAID";

  return (
    <div className="space-y-6 max-w-lg mx-auto text-center">
      <div>
        <h2 className="heading-sm">Checkout</h2>
        <p className="text-small text-[var(--color-text-muted)] mt-2">
          Secure payment via Stripe. Production starts after our team approves your artwork.
        </p>
      </div>

      {campaign && (
        <div className="rounded-2xl border border-[var(--color-border)] p-6 text-left space-y-3">
          <p className="font-semibold">{campaign.name}</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            {campaign.quantity.toLocaleString()} postcards
          </p>
          <p className="text-2xl font-bold">
            {campaign.totalPriceCents != null
              ? formatCurrency(campaign.totalPriceCents)
              : "—"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Artwork status:{" "}
            <span className="font-medium">{campaign.artwork?.status ?? "Not uploaded"}</span>
          </p>
        </div>
      )}

      {!artworkApproved ? (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-900">
          <p className="font-medium">Artwork review required</p>
          <p className="mt-1 opacity-90">
            Our ops team will review your PDF within a few hours. You&apos;ll receive an email when
            it&apos;s approved — then return here or go to{" "}
            <Link href="/campaigns" className="underline font-medium">
              My Campaigns
            </Link>{" "}
            to pay.
          </p>
        </div>
      ) : canPay ? (
        <Button size="lg" className="w-full" onClick={onPay} disabled={isPaying}>
          {isPaying ? "Redirecting to Stripe…" : "Pay with Stripe"}
        </Button>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">
          This campaign has already been paid or is in production.
        </p>
      )}

      <Link href="/campaigns" className="text-sm text-[var(--color-accent)] hover:underline inline-block">
        View all campaigns →
      </Link>
    </div>
  );
}
