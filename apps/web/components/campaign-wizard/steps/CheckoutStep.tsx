"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { WizardStepHeader } from "../WizardStepHeader";
import {
  CampaignHistoryLink,
  GuestCheckoutAccountPrompt,
} from "../GuestCheckoutAccountPrompt";

type Props = {
  campaign?: {
    id?: string;
    name?: string;
    status?: string;
    quantity?: number;
    totalPriceCents?: number | null;
    unitPriceCents?: number | null;
    artwork?: { status?: string } | null;
  } | null;
  onPay: () => void;
  isPaying: boolean;
};

export function CheckoutStep({ campaign, onPay, isPaying }: Props) {
  const artworkApproved = campaign?.artwork?.status === "APPROVED";
  const canPay = artworkApproved && campaign?.status !== "PAID";
  const quantity = campaign?.quantity ?? 0;
  const totalCents = campaign?.totalPriceCents ?? 0;
  const unitCents = campaign?.unitPriceCents ?? 0;

  return (
    <div className="mx-auto max-w-lg space-y-6 md:space-y-8">
      <WizardStepHeader
        title="Complete your campaign"
        description="Secure payment via Stripe. Production starts after our team approves your artwork."
        className="text-center sm:text-left [&_.heading-sm]:sm:mx-0"
      />

      {campaign && (
        <>
          <div className="wizard-review-pricing text-left">
            <p className="text-micro font-semibold uppercase tracking-wide text-white/55">
              Campaign total
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {totalCents != null ? formatCurrency(totalCents) : "—"}
            </p>
            <p className="mt-2 text-sm text-white/60">
              {formatNumber(quantity)} postcards
              {unitCents ? ` × ${formatCurrency(unitCents)} each` : ""}
            </p>
            <p className="mt-4 border-t border-white/10 pt-4 text-sm font-medium text-white">
              {campaign.name}
            </p>
          </div>

          <CheckoutDetail label="Artwork status">
            <Badge variant={artworkApproved ? "success" : "default"}>
              {campaign.artwork?.status ?? "Not uploaded"}
            </Badge>
          </CheckoutDetail>
        </>
      )}

      {!artworkApproved ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Artwork review required</p>
          <p className="mt-2 leading-relaxed opacity-90">
            Our ops team will review your PDF within a few hours. You&apos;ll receive an email when
            it&apos;s approved — then return here to pay.
          </p>
        </div>
      ) : (
        <>
          <GuestCheckoutAccountPrompt campaignId={campaign?.id} />
          {canPay ? (
            <Button size="lg" className="min-h-[52px] w-full" onClick={onPay} disabled={isPaying}>
              {isPaying ? "Redirecting to Stripe…" : "Pay with Stripe"}
            </Button>
          ) : (
            <p className="text-center text-sm text-[var(--color-text-muted)]">
              This campaign has already been paid or is in production.
            </p>
          )}
        </>
      )}

      <div className="text-center">
        <CampaignHistoryLink className="text-sm text-[var(--color-accent)] hover:underline" />
      </div>
    </div>
  );
}

function CheckoutDetail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="wizard-review-card flex items-center justify-between gap-4">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      {children}
    </div>
  );
}
