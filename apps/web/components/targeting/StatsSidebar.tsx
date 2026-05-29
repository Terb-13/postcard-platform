"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

type EstimateData = {
  reach?: number;
  households?: number;
  population?: number;
  avgMedianIncome?: number | null;
  avgMoverPercent?: number | null;
  zctaCount?: number;
  pricing?: {
    quantity?: number;
    unitPriceCents?: number;
    totalPriceCents?: number;
    estimatedReach?: number;
    usedOverride?: boolean;
  };
};

type Props = {
  selectedCount: number;
  estimate?: EstimateData | null;
  isLoading?: boolean;
  isUpdating?: boolean;
  isError?: boolean;
  errorMessage?: string;
  errorCode?: string;
  onRetry?: () => void;
  quantityOverride?: number;
  onQuantityOverrideChange?: (value: number | undefined) => void;
  onClearSelection?: () => void;
  className?: string;
  readOnly?: boolean;
  compact?: boolean;
};

export function StatsSidebar({
  selectedCount,
  estimate,
  isLoading,
  isUpdating,
  isError,
  errorMessage,
  errorCode,
  onRetry,
  quantityOverride,
  onQuantityOverrideChange,
  onClearSelection,
  className,
  readOnly = false,
  compact = false,
}: Props) {
  const recommendedQty =
    estimate?.pricing?.estimatedReach ??
    estimate?.reach ??
    estimate?.pricing?.quantity ??
    null;
  const hasOverride = quantityOverride != null && quantityOverride > 0;

  return (
    <Card className={cn("flex flex-col h-full transition-opacity duration-200", className)}>
      <CardHeader className={cn(compact && "p-4 pb-2")}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className={cn(compact && "text-base")}>Audience & cost</CardTitle>
            {!compact && (
              <p className="text-small text-[var(--color-text-muted)]">
                Live estimates from US Census ACS data
              </p>
            )}
          </div>
          {selectedCount > 0 && onClearSelection && (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] shrink-0"
            >
              Clear
            </button>
          )}
        </div>

        {isUpdating && selectedCount > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-accent-subtle)] px-3 py-2 text-xs font-medium text-[var(--color-accent)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
            Updating estimate…
          </div>
        )}
      </CardHeader>

      <CardContent className={cn("flex-1 space-y-4 pt-0", compact && "p-4 pt-0")}>
        {selectedCount === 0 ? (
          <EmptyState />
        ) : isError ? (
          <ErrorState message={errorMessage} code={errorCode} onRetry={onRetry} />
        ) : (
          <>
            <div
              className={cn(
                "grid grid-cols-2 gap-3 transition-opacity duration-200",
                isUpdating && "opacity-70"
              )}
            >
              <Metric label="ZIPs selected" value={String(selectedCount)} loading={isLoading && !estimate} />
              <Metric
                label="Est. reach"
                value={estimate ? formatNumber(estimate.reach) : "—"}
                sub="households"
                loading={isLoading && !estimate}
                highlight={!isLoading}
              />
              <Metric
                label="Avg. income"
                value={
                  estimate?.avgMedianIncome != null
                    ? `$${formatNumber(estimate.avgMedianIncome)}`
                    : "—"
                }
                loading={isLoading && !estimate}
                highlight={!isLoading}
              />
              <Metric
                label="Mover proxy"
                value={
                  estimate?.avgMoverPercent != null ? `${estimate.avgMoverPercent}%` : "—"
                }
                sub="1-yr mobility"
                loading={isLoading && !estimate}
                highlight={!isLoading}
              />
            </div>

            {estimate && !isLoading && (
              <div className="flex flex-wrap gap-1.5">
                {(estimate.zctaCount ?? 0) > 0 && (
                  <Badge variant="accent">{estimate.zctaCount} ZCTAs matched</Badge>
                )}
                {estimate.pricing?.usedOverride && <Badge>Custom quantity</Badge>}
              </div>
            )}

            <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
              {!readOnly && (
                <div className="space-y-2">
                  <Label htmlFor="quantity-override">Postcard quantity</Label>

                  {recommendedQty != null && !isLoading && (
                    <div className="rounded-xl bg-[var(--color-bg-alt)] px-3 py-2.5 text-sm">
                      <span className="text-[var(--color-text-muted)]">Recommended: </span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {formatNumber(recommendedQty)}
                      </span>
                      <span className="text-[var(--color-text-muted)]"> from targeting</span>
                    </div>
                  )}

                  <Input
                    id="quantity-override"
                    type="number"
                    min={100}
                    step={100}
                    placeholder={
                      recommendedQty != null
                        ? `Use recommended (${formatNumber(recommendedQty)})`
                        : "Auto from reach"
                    }
                    value={quantityOverride ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) {
                        onQuantityOverrideChange?.(undefined);
                        return;
                      }
                      const n = parseInt(v, 10);
                      if (!Number.isNaN(n)) onQuantityOverrideChange?.(n);
                    }}
                  />

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-micro text-[var(--color-text-muted)]">
                      Leave blank to mail to your full estimated reach (min 100).
                    </p>
                    {hasOverride && (
                      <button
                        type="button"
                        onClick={() => onQuantityOverrideChange?.(undefined)}
                        className="text-micro font-medium text-[var(--color-accent)] hover:underline shrink-0"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "rounded-xl bg-[var(--color-bg-dark)] text-white p-4 transition-all duration-300",
                  isUpdating && "opacity-80"
                )}
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-sm opacity-80">Estimated total</span>
                  {isLoading && !estimate ? (
                    <span className="text-2xl font-bold animate-pulse">···</span>
                  ) : (
                    <span
                      className={cn(
                        "text-2xl font-bold tabular-nums transition-all duration-300",
                        isUpdating && "opacity-60"
                      )}
                    >
                      {estimate?.pricing?.totalPriceCents != null
                        ? formatCurrency(estimate.pricing.totalPriceCents)
                        : "—"}
                    </span>
                  )}
                </div>
                {estimate?.pricing && !(isLoading && !estimate) && (
                  <p className="text-xs opacity-70 mt-1">
                    {formatNumber(estimate.pricing.quantity ?? 0)} ×{" "}
                    {formatCurrency(estimate.pricing.unitPriceCents ?? 0)} each
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center space-y-4">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)]">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">No ZIP codes selected yet</p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Search a ZIP above, click areas on the map, or draw a custom boundary.
        </p>
      </div>
      <ol className="text-left text-xs text-[var(--color-text-muted)] space-y-1.5 max-w-[220px] mx-auto">
        <li className="flex gap-2">
          <span className="font-semibold text-[var(--color-accent)]">1.</span>
          Search or click ZIPs on the map
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-[var(--color-accent)]">2.</span>
          Watch reach &amp; cost update live
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-[var(--color-accent)]">3.</span>
          Adjust quantity if needed
        </li>
      </ol>
    </div>
  );
}

function ErrorState({
  message,
  code,
  onRetry,
}: {
  message?: string;
  code?: string;
  onRetry?: () => void;
}) {
  const detail =
    message?.trim() ||
    "Could not load Census data. Check your connection and try again.";

  return (
    <div className="rounded-xl bg-red-50 border border-red-100 p-4 space-y-3">
      <p className="text-sm font-medium text-red-900">Could not load Census data</p>
      <p className="text-sm text-red-800 leading-relaxed">{detail}</p>
      {code && (
        <p className="text-micro font-mono text-red-700/80">Error code: {code}</p>
      )}
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry estimate
        </Button>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  loading,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="metric">
      <p className="text-micro text-[var(--color-text-muted)] uppercase tracking-wide">{label}</p>
      {loading ? (
        <div className="h-7 w-16 bg-[var(--color-border)] rounded animate-pulse mt-1" />
      ) : (
        <>
          <p
            className={cn(
              "text-lg font-semibold text-[var(--color-text)] mt-0.5 tabular-nums transition-all duration-300",
              highlight && "animate-in fade-in duration-300"
            )}
          >
            {value}
          </p>
          {sub && <p className="text-micro text-[var(--color-text-muted)]">{sub}</p>}
        </>
      )}
    </div>
  );
}
