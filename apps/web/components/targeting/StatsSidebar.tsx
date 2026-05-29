"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  isError?: boolean;
  quantityOverride?: number;
  onQuantityOverrideChange?: (value: number | undefined) => void;
  onClearSelection?: () => void;
  className?: string;
};

export function StatsSidebar({
  selectedCount,
  estimate,
  isLoading,
  isError,
  quantityOverride,
  onQuantityOverrideChange,
  onClearSelection,
  className,
}: Props) {
  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Audience & cost</CardTitle>
            <p className="text-small text-[var(--color-text-muted)]">
              Live estimates from US Census ACS data
            </p>
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
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pt-0">
        {selectedCount === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Search and select ZIP codes on the map to see reach and pricing.
            </p>
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
            Could not load Census data. Try again in a moment.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="ZIPs selected"
                value={String(selectedCount)}
                loading={isLoading}
              />
              <Metric
                label="Est. reach"
                value={estimate ? formatNumber(estimate.reach) : "—"}
                sub="households"
                loading={isLoading}
              />
              <Metric
                label="Avg. income"
                value={
                  estimate?.avgMedianIncome != null
                    ? `$${formatNumber(estimate.avgMedianIncome)}`
                    : "—"
                }
                loading={isLoading}
              />
              <Metric
                label="Mover proxy"
                value={
                  estimate?.avgMoverPercent != null
                    ? `${estimate.avgMoverPercent}%`
                    : "—"
                }
                sub="1-yr mobility"
                loading={isLoading}
              />
            </div>

            {estimate && !isLoading && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {estimate.zctaCount > 0 && (
                    <Badge variant="accent">{estimate.zctaCount} ZCTAs matched</Badge>
                  )}
                  {estimate?.pricing?.usedOverride && (
                    <Badge>Custom quantity</Badge>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
              <div>
                <Label htmlFor="quantity-override">Postcard quantity</Label>
                <Input
                  id="quantity-override"
                  type="number"
                  min={100}
                  step={100}
                  placeholder={
                    estimate?.pricing?.quantity != null
                      ? String(estimate.pricing.quantity)
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
                <p className="text-micro text-[var(--color-text-muted)] mt-1">
                  Leave blank to use estimated household reach (min 100).
                </p>
              </div>

              <div className="rounded-xl bg-[var(--color-bg-dark)] text-white p-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm opacity-80">Estimated total</span>
                  {isLoading ? (
                    <span className="text-2xl font-bold animate-pulse">···</span>
                  ) : (
                    <span className="text-2xl font-bold">
                      {estimate?.pricing?.totalPriceCents != null
                        ? formatCurrency(estimate.pricing.totalPriceCents)
                        : "—"}
                    </span>
                  )}
                </div>
                {estimate?.pricing && !isLoading && (
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

function Metric({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <div className="metric">
      <p className="text-micro text-[var(--color-text-muted)] uppercase tracking-wide">
        {label}
      </p>
      {loading ? (
        <div className="h-7 w-16 bg-[var(--color-border)] rounded animate-pulse mt-1" />
      ) : (
        <>
          <p className="text-lg font-semibold text-[var(--color-text)] mt-0.5">{value}</p>
          {sub && <p className="text-micro text-[var(--color-text-muted)]">{sub}</p>}
        </>
      )}
    </div>
  );
}
