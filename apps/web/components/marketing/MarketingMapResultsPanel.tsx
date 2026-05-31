"use client";

import Link from "next/link";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import type { SelectedZcta } from "@/components/targeting/types";
import { marketingMapPanelClass, marketingMapPanelLabelClass } from "./marketing-map-styles";

type Estimate = {
  reach?: number;
  pricing?: {
    totalPriceCents?: number;
    unitPriceCents?: number;
  };
} | null;

type Props = {
  zctas: SelectedZcta[];
  estimate: Estimate;
  isLoading?: boolean;
  isUpdating?: boolean;
  className?: string;
};

/**
 * redesign/index.html (homepage map) + map-tool.html — live results panel.
 * Prominent reach + cost, teal CTA pinned to bottom.
 */
export function MarketingMapResultsPanel({
  zctas,
  estimate,
  isLoading,
  isUpdating,
  className,
}: Props) {
  const hasSelection = zctas.length > 0;
  const reach = estimate?.reach;
  const totalCents = estimate?.pricing?.totalPriceCents;
  const unitCents = estimate?.pricing?.unitPriceCents;
  const showReach = hasSelection && !isLoading && reach != null;

  return (
    <aside className={cn(marketingMapPanelClass, "flex flex-col", className)}>
      <div className="flex min-h-[5rem] flex-col">
        <p className={marketingMapPanelLabelClass}>Selected areas</p>
        <div className="flex-1 text-sm leading-relaxed text-gray-600">
          {hasSelection ? (
            <ul className="space-y-1.5">
              {zctas.map((z) => (
                <li key={z.zcta} className="font-medium text-[#0A2540]">
                  {z.placeName?.split(",").slice(0, 2).join(",") ?? `ZIP ${z.zcta}`}
                </li>
              ))}
            </ul>
          ) : (
            <p>Click areas on the map to select</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-1 flex-col border-t border-gray-200 pt-6">
        <div className="flex-1">
          <p className={marketingMapPanelLabelClass}>Selected reach</p>
          {hasSelection && isLoading && reach == null ? (
            <p className="text-4xl font-semibold tracking-tighter text-gray-300">…</p>
          ) : (
            <>
              <p
                className={cn(
                  "font-semibold tabular-nums tracking-tighter text-[#0A2540]",
                  showReach ? "text-6xl leading-none" : "text-5xl text-gray-300"
                )}
              >
                {showReach ? formatNumber(reach) : "0"}
              </p>
              <p className="mt-1 text-sm text-gray-500">households</p>
            </>
          )}
          {isUpdating && hasSelection && (
            <p className="mt-2 text-xs font-medium text-[#0EA5E9]">Updating live…</p>
          )}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className={cn(marketingMapPanelLabelClass, "mb-3")}>Estimated cost</p>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              className={cn(
                "font-semibold tabular-nums tracking-tight text-[#0A2540]",
                showReach && totalCents != null ? "text-4xl" : "text-3xl text-gray-300"
              )}
            >
              {showReach && totalCents != null ? formatCurrency(totalCents) : "$0"}
            </span>
            {unitCents != null && showReach && (
              <span className="text-xs text-gray-500">
                ({formatCurrency(unitCents)} per piece)
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Includes printing + postage</p>
        </div>

        <div className="mt-auto pt-8">
          <Link
            href="/sign-up"
            className="flex w-full items-center justify-center rounded-3xl bg-[#0EA5E9] py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7] sm:py-4 sm:text-lg"
          >
            Continue to Design & Order
          </Link>
          <p className="mt-2 text-center text-[10px] text-gray-400">Save targeting for later</p>
        </div>
      </div>
    </aside>
  );
}
