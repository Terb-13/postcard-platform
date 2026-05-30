"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { TargetingFiltersPanel } from "./TargetingFilters";
import { INCOME_LEGEND_GRADIENT } from "./income-scale";
import type { TargetingFilters } from "./types";

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
  filters?: TargetingFilters;
  onFiltersChange?: (filters: TargetingFilters | undefined) => void;
  className?: string;
  readOnly?: boolean;
  compact?: boolean;
  showFilters?: boolean;
  showLegend?: boolean;
  footerSlot?: React.ReactNode;
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
  filters,
  onFiltersChange,
  className,
  readOnly = false,
  compact = false,
  showFilters = true,
  showLegend = true,
  footerSlot,
}: Props) {
  const recommendedQty =
    estimate?.pricing?.estimatedReach ??
    estimate?.reach ??
    estimate?.pricing?.quantity ??
    null;
  const hasOverride = quantityOverride != null && quantityOverride > 0;

  return (
    <aside
      className={cn(
        "targeting-sidebar flex flex-col transition-opacity duration-200",
        compact ? "h-auto min-h-0" : "h-full",
        compact && "targeting-sidebar-flat border-0 shadow-none rounded-none",
        className
      )}
    >
      <header className={cn("p-5 pb-4 border-b border-[var(--color-border-subtle)]", compact && "p-4 pb-3")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={cn("text-base font-semibold tracking-tight text-[var(--color-text)]", compact && "text-sm")}>
              Audience intelligence
            </h3>
            {!compact && (
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                US Census ACS · updates live
              </p>
            )}
          </div>
          {selectedCount > 0 && onClearSelection && (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors shrink-0"
            >
              Clear all
            </button>
          )}
        </div>

        {isUpdating && selectedCount > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-accent-subtle)] px-3 py-2 text-xs font-medium text-[var(--color-accent)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
            Refreshing estimates…
          </div>
        )}
      </header>

      <div className={cn("flex-1 p-5 pt-4 space-y-5 overflow-y-auto", compact && "p-4 pt-3 space-y-4")}>
        {showFilters && onFiltersChange && (
          <TargetingFiltersPanel
            filters={filters}
            onChange={onFiltersChange}
            compact={compact}
          />
        )}

        {selectedCount === 0 ? (
          <EmptyState />
        ) : isError ? (
          <ErrorState message={errorMessage} code={errorCode} onRetry={onRetry} />
        ) : (
          <>
            <div
              className={cn(
                "targeting-stat-grid transition-opacity duration-200",
                isUpdating && "opacity-75"
              )}
            >
              <StatCard
                label="ZIP codes"
                value={String(selectedCount)}
                loading={isLoading && !estimate}
              />
              <StatCard
                label="Est. reach"
                value={estimate ? formatNumber(estimate.reach) : "—"}
                sub="households"
                loading={isLoading && !estimate}
                highlight
              />
              <StatCard
                label="Avg. income"
                value={
                  estimate?.avgMedianIncome != null
                    ? `$${formatNumber(estimate.avgMedianIncome)}`
                    : "—"
                }
                loading={isLoading && !estimate}
              />
              <StatCard
                label="New movers"
                value={
                  estimate?.avgMoverPercent != null ? `${estimate.avgMoverPercent}%` : "—"
                }
                sub="1-yr proxy"
                loading={isLoading && !estimate}
              />
            </div>

            {estimate && !isLoading && (estimate.zctaCount ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="accent">{estimate.zctaCount} ZCTAs in selection</Badge>
                {estimate.pricing?.usedOverride && <Badge>Custom qty</Badge>}
              </div>
            )}

            <div className="space-y-4 pt-1 border-t border-[var(--color-border-subtle)]">
              {!readOnly && (
                <div className="space-y-2.5">
                  <Label htmlFor="quantity-override" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Mail quantity
                  </Label>

                  {recommendedQty != null && !isLoading && (
                    <div className="flex items-baseline gap-1.5 rounded-lg bg-[var(--color-bg-alt)] px-3 py-2 text-sm">
                      <span className="text-[var(--color-text-muted)]">Recommended</span>
                      <span className="font-bold tabular-nums text-[var(--color-text)]">
                        {formatNumber(recommendedQty)}
                      </span>
                    </div>
                  )}

                  <Input
                    id="quantity-override"
                    type="number"
                    min={100}
                    step={100}
                    placeholder={
                      recommendedQty != null
                        ? `Auto (${formatNumber(recommendedQty)})`
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
                    className="h-11"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-[var(--color-text-muted)] leading-snug">
                      Blank = full estimated reach (min 100).
                    </p>
                    {hasOverride && (
                      <button
                        type="button"
                        onClick={() => onQuantityOverrideChange?.(undefined)}
                        className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline shrink-0"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "targeting-cost-card transition-opacity duration-300",
                  isUpdating && "opacity-85"
                )}
              >
                <div className="relative z-10">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                    Estimated campaign cost
                  </p>
                  <div className="flex items-end justify-between gap-3 mt-1">
                    {isLoading && !estimate ? (
                      <span className="text-3xl font-bold animate-pulse text-white/50">···</span>
                    ) : (
                      <span
                        className={cn(
                          "text-3xl font-bold tabular-nums tracking-tight transition-all duration-300",
                          isUpdating && "opacity-70"
                        )}
                      >
                        {estimate?.pricing?.totalPriceCents != null
                          ? formatCurrency(estimate.pricing.totalPriceCents)
                          : "—"}
                      </span>
                    )}
                  </div>
                  {estimate?.pricing && !(isLoading && !estimate) && (
                    <p className="text-xs text-white/60 mt-2 tabular-nums">
                      {formatNumber(estimate.pricing.quantity ?? 0)} postcards ×{" "}
                      {formatCurrency(estimate.pricing.unitPriceCents ?? 0)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {!compact && selectedCount > 0 && showLegend && (
        <footer className="px-5 pb-4 pt-2 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Income scale
            </span>
          </div>
          <div
            className="targeting-legend-bar"
            style={{ background: INCOME_LEGEND_GRADIENT }}
            aria-hidden
          />
        </footer>
      )}

      {footerSlot && (
        <footer className="targeting-selection-summary shrink-0 border-t border-[var(--color-border)] p-4">
          {footerSlot}
        </footer>
      )}
    </aside>
  );
}

function StatCard({
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
    <div className={cn("targeting-stat-card", highlight && "ring-1 ring-[var(--color-accent)]/15")}>
      <p className="targeting-stat-label">{label}</p>
      {loading ? (
        <div className="h-7 w-20 bg-[var(--color-border)] rounded-md animate-pulse mt-2" />
      ) : (
        <>
          <p className="targeting-stat-value">{value}</p>
          {sub && <p className="targeting-stat-sub">{sub}</p>}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-alt)]/40 px-5 py-6 text-center">
      <p className="text-sm font-medium text-[var(--color-text)]">Select ZIPs on the map</p>
      <p className="mx-auto mt-1.5 max-w-[240px] text-xs leading-relaxed text-[var(--color-text-muted)]">
        Search a ZIP or click boundaries to see live Census reach and pricing.
      </p>
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
  return (
    <div className="rounded-xl bg-red-50/80 border border-red-100 p-4 space-y-3">
      <p className="text-sm font-semibold text-red-900">Estimate unavailable</p>
      <p className="text-xs text-red-800 leading-relaxed">
        {message?.trim() || "Could not load Census data. Check your connection and try again."}
      </p>
      {code && <p className="text-[10px] font-mono text-red-700/70">Code: {code}</p>}
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
