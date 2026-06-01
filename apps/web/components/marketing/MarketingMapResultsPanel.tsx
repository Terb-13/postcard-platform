"use client";

import Link from "next/link";
import { formatCurrency, formatUnitPrice, formatNumber, cn } from "@/lib/utils";
import type { SelectedZcta } from "@/components/targeting/types";
import type { MarketingMapVariant } from "./marketing-map-variant";
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
  variant?: MarketingMapVariant;
  className?: string;
};

const CTA_CLASS =
  "flex w-full items-center justify-center rounded-3xl bg-[#0EA5E9] font-semibold text-white transition-colors hover:bg-[#0284c7]";

/** redesign/index.html (homepage) + map-tool.html (standalone) — results panel */
export function MarketingMapResultsPanel({
  zctas,
  estimate,
  isLoading,
  isUpdating,
  variant = "homepage",
  className,
}: Props) {
  const hasSelection = zctas.length > 0;
  const reach = estimate?.reach;
  const totalCents = estimate?.pricing?.totalPriceCents;
  const unitCents = estimate?.pricing?.unitPriceCents;
  const showReach = hasSelection && !isLoading && reach != null;

  if (variant === "standalone") {
    return (
      <aside className={cn(marketingMapPanelClass("standalone"), "flex flex-col", className)}>
        <div className="min-h-[5rem] flex-1">
          <p className={marketingMapPanelLabelClass}>Selected areas</p>
          <div className="text-sm leading-relaxed text-gray-600">
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

        <div className="mt-auto border-t border-gray-200 pt-6">
          <div className="mb-1 flex justify-between text-sm">
            <span>Estimated reach</span>
            <span className="font-semibold tabular-nums text-[#0A2540]">
              {showReach ? formatNumber(reach) : "0"}
            </span>
          </div>
          <div className="mb-4 flex justify-between">
            <span className="text-sm">Total cost</span>
            <span className="text-xl font-semibold tabular-nums text-[#0A2540]">
              {showReach && totalCents != null ? formatCurrency(totalCents) : "$0"}
            </span>
          </div>
          {isUpdating && hasSelection && (
            <p className="mb-3 text-xs font-medium text-[#0EA5E9]">Updating live…</p>
          )}
          <Link href="/campaigns/new" className={cn(CTA_CLASS, "py-3.5 text-sm")}>
            Continue to Design & Order
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className={cn(marketingMapPanelClass("homepage"), "flex flex-col", className)}>
      <div>
        <p className="mb-1 text-sm font-semibold text-[#0A2540]">Selected reach</p>
        {hasSelection && isLoading && reach == null ? (
          <p className="text-6xl font-semibold tracking-tighter text-gray-300">…</p>
        ) : (
          <>
            <p
              className={cn(
                "font-semibold tabular-nums tracking-tighter text-[#0A2540]",
                showReach ? "text-6xl leading-none" : "text-6xl text-gray-300"
              )}
            >
              {showReach ? formatNumber(reach) : "0"}
            </p>
            <p className="text-sm text-gray-500">households</p>
          </>
        )}
        {isUpdating && hasSelection && (
          <p className="mt-2 text-xs font-medium text-[#0EA5E9]">Updating live…</p>
        )}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <p className="mb-3 text-sm font-semibold text-[#0A2540]">Estimated cost</p>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className={cn(
              "font-semibold tabular-nums text-[#0A2540]",
              showReach && totalCents != null ? "text-4xl" : "text-4xl text-gray-300"
            )}
          >
            {showReach && totalCents != null ? formatCurrency(totalCents) : "$0"}
          </span>
          {unitCents != null && showReach && (
            <span className="text-xs text-gray-500">
              ({formatUnitPrice(unitCents)} per piece)
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">Includes printing + postage</p>
      </div>

      <div className="mt-auto pt-8">
        <Link href="/campaigns/new" className={cn(CTA_CLASS, "py-4 text-lg")}>
          Continue to Design
        </Link>
        <p className="mt-2 text-center text-[10px] text-gray-400">Save targeting for later</p>
      </div>
    </aside>
  );
}
