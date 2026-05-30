"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { TargetingSelection } from "@/components/targeting";
import { WizardStepHeader } from "../WizardStepHeader";
import type { CampaignBasics } from "../schema";

type Props = {
  basics: CampaignBasics;
  targeting: TargetingSelection;
  estimate?: {
    reach?: number;
    avgMedianIncome?: number | null;
    pricing?: { quantity?: number; totalPriceCents?: number; unitPriceCents?: number };
  } | null;
  isEstimateLoading?: boolean;
  isEstimateError?: boolean;
  dropDate: string;
  onDropDateChange: (v: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  campaign?: {
    quantity?: number;
    totalPriceCents?: number | null;
    unitPriceCents?: number | null;
    artwork?: { status?: string; fileName?: string | null } | null;
  } | null;
  targetingSummary?: {
    zctas?: string[];
    estimate?: { reach?: number; avgMedianIncome?: number };
  } | null;
};

function ReviewCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="wizard-review-card">
      <h3 className="wizard-review-card-title">{title}</h3>
      {children}
    </section>
  );
}

export function ReviewStep({
  basics,
  targeting,
  estimate,
  isEstimateLoading,
  isEstimateError,
  dropDate,
  onDropDateChange,
  notes,
  onNotesChange,
  campaign,
  targetingSummary,
}: Props) {
  const zctas = targeting.zctas.map((z) => z.zcta);
  const quantity = campaign?.quantity ?? estimate?.pricing?.quantity ?? 0;
  const totalCents =
    campaign?.totalPriceCents ?? estimate?.pricing?.totalPriceCents ?? 0;
  const unitCents =
    campaign?.unitPriceCents ?? estimate?.pricing?.unitPriceCents ?? 0;
  const reach =
    estimate?.reach ?? targetingSummary?.estimate?.reach ?? 0;
  const avgIncome =
    estimate?.avgMedianIncome ??
    targetingSummary?.estimate?.avgMedianIncome ??
    null;

  return (
    <div className="max-w-none space-y-6 md:max-w-2xl md:space-y-8">
      <WizardStepHeader
        step="Step 4 · Review"
        title="Review & schedule"
        description="Confirm your audience, creative, and cost before checkout."
      />

      <div className="wizard-review-pricing">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-micro font-semibold uppercase tracking-wide text-white/55">
              Estimated total
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {isEstimateLoading && !estimate ? (
                <span className="inline-block h-9 w-28 animate-pulse rounded-lg bg-white/20" />
              ) : (
                formatCurrency(totalCents)
              )}
            </p>
          </div>
          <p className="text-sm text-white/60">
            {formatNumber(quantity)} postcards × {formatCurrency(unitCents)} each
          </p>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-micro text-white/50">Reach</dt>
            <dd className="mt-0.5 text-sm font-semibold text-white">
              {isEstimateLoading && !estimate ? "…" : `${formatNumber(reach)} households`}
            </dd>
          </div>
          <div>
            <dt className="text-micro text-white/50">Avg. income</dt>
            <dd className="mt-0.5 text-sm font-semibold text-white">
              {avgIncome != null ? `$${formatNumber(avgIncome)}` : "—"}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-micro text-white/50">ZIPs selected</dt>
            <dd className="mt-0.5 text-sm font-semibold text-white">{zctas.length}</dd>
          </div>
        </dl>
      </div>

      <ReviewCard title="Campaign">
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-text-muted)]">Name</dt>
            <dd className="mt-0.5 font-medium text-[var(--color-bg-dark)]">{basics.name}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Size</dt>
            <dd className="mt-0.5 font-medium text-[var(--color-bg-dark)]">
              {basics.size.replace("x", "×")}&quot;
            </dd>
          </div>
        </dl>
      </ReviewCard>

      <ReviewCard title="Targeting">
        {isEstimateError && (
          <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Live estimate unavailable — showing last saved values.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {zctas.map((z) => (
            <Badge key={z} variant="accent">
              {z}
            </Badge>
          ))}
        </div>
      </ReviewCard>

      <ReviewCard title="Creative">
        {campaign?.artwork?.fileName ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-[var(--color-bg-dark)]">
              {campaign.artwork.fileName}
            </span>
            <Badge>{campaign.artwork.status}</Badge>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">No artwork uploaded</p>
        )}
      </ReviewCard>

      <ReviewCard title="Schedule">
        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2">
            <Label htmlFor="dropDate">Target drop date</Label>
            <Input
              id="dropDate"
              type="date"
              value={dropDate}
              onChange={(e) => onDropDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes for our team (optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
              className="flex min-h-[120px] w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-[15px] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25"
              placeholder="Special instructions, timing, etc."
            />
          </div>
        </div>
      </ReviewCard>
    </div>
  );
}
