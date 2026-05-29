"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { TargetingSelection } from "@/components/targeting";
import type { CampaignBasics } from "../schema";

type Props = {
  basics: CampaignBasics;
  targeting: TargetingSelection;
  estimate?: {
    reach?: number;
    avgMedianIncome?: number | null;
    pricing?: { quantity?: number; totalPriceCents?: number; unitPriceCents?: number };
  } | null;
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

export function ReviewStep({
  basics,
  targeting,
  estimate,
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

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="heading-sm">Review & schedule</h2>
        <p className="text-small text-[var(--color-text-muted)] mt-1">
          Confirm everything looks right before checkout.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Campaign
        </h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[var(--color-text-muted)]">Name</dt>
            <dd className="font-medium">{basics.name}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Size</dt>
            <dd className="font-medium">{basics.size.replace("x", "×")}&quot;</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Targeting
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {zctas.map((z) => (
            <Badge key={z} variant="accent">
              {z}
            </Badge>
          ))}
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-[var(--color-text-muted)]">Reach</dt>
            <dd className="font-medium">
              {formatNumber(
                estimate?.reach ??
                  targetingSummary?.estimate?.reach ??
                  0
              )}{" "}
              households
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Avg. income</dt>
            <dd className="font-medium">
              {estimate?.avgMedianIncome != null
                ? `$${formatNumber(estimate.avgMedianIncome)}`
                : targetingSummary?.estimate?.avgMedianIncome != null
                  ? `$${formatNumber(targetingSummary.estimate.avgMedianIncome)}`
                  : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Quantity</dt>
            <dd className="font-medium">{formatNumber(quantity)}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Creative
        </h3>
        <p className="text-sm">
          {campaign?.artwork?.fileName ? (
            <>
              <span className="font-medium">{campaign.artwork.fileName}</span>
              <Badge className="ml-2">{campaign.artwork.status}</Badge>
            </>
          ) : (
            <span className="text-[var(--color-text-muted)]">No artwork uploaded</span>
          )}
        </p>
      </section>

      <section className="rounded-2xl bg-[var(--color-bg-alt)] p-5 space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold">Estimated total</span>
          <span className="text-2xl font-bold">{formatCurrency(totalCents)}</span>
        </div>
        <p className="text-small text-[var(--color-text-muted)]">
          {formatNumber(quantity)} postcards × {formatCurrency(unitCents)} each
        </p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dropDate">Target drop date</Label>
          <Input
            id="dropDate"
            type="date"
            value={dropDate}
            onChange={(e) => onDropDateChange(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="notes">Notes for our team (optional)</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
            className="flex w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25"
            placeholder="Special instructions, timing, etc."
          />
        </div>
      </div>
    </div>
  );
}
