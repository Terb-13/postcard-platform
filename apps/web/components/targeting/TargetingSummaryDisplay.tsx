"use client";

import { buildTargetingSummary } from "@/lib/targeting-summary";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

type Props = {
  metadata?: unknown;
  fallback?: { quantity?: number; totalPriceCents?: number | null };
  variant?: "compact" | "full";
  className?: string;
};

export function TargetingSummaryDisplay({
  metadata,
  fallback,
  variant = "compact",
  className,
}: Props) {
  const summary = buildTargetingSummary(metadata, fallback);
  if (!summary) return null;

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="text-sm text-gray-600">{summary.label}</p>
        <div className="flex flex-wrap gap-1.5">
          {summary.zctas.slice(0, 8).map((z) => (
            <Badge key={z} variant="accent">
              {z}
            </Badge>
          ))}
          {summary.zctas.length > 8 && (
            <span className="text-xs text-gray-400 self-center">
              +{summary.zctas.length - 8} more
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-[var(--color-border)] p-4 space-y-3", className)}>
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">Geo-targeting</p>
      <div className="flex flex-wrap gap-1.5">
        {summary.zctas.map((z) => (
          <Badge key={z} variant="accent">
            {z}
          </Badge>
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {summary.reach != null && (
          <div>
            <dt className="text-[var(--color-text-muted)]">Reach</dt>
            <dd className="font-medium">{formatNumber(summary.reach)} households</dd>
          </div>
        )}
        {summary.avgMedianIncome != null && (
          <div>
            <dt className="text-[var(--color-text-muted)]">Avg. income</dt>
            <dd className="font-medium">${formatNumber(summary.avgMedianIncome)}</dd>
          </div>
        )}
        {summary.quantity != null && (
          <div>
            <dt className="text-[var(--color-text-muted)]">Quantity</dt>
            <dd className="font-medium">{formatNumber(summary.quantity)}</dd>
          </div>
        )}
        {summary.totalPriceCents != null && (
          <div>
            <dt className="text-[var(--color-text-muted)]">Est. cost</dt>
            <dd className="font-medium">{formatCurrency(summary.totalPriceCents)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
