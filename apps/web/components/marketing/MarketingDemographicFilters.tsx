"use client";

import type { TargetingFilters } from "@/components/targeting/types";
import type { MarketingMapVariant } from "./marketing-map-variant";
import { marketingMapPanelLabelClass } from "./marketing-map-styles";

function isIncome75k(filters?: TargetingFilters) {
  return (filters?.minIncome ?? 0) >= 75000;
}

function isMovers(filters?: TargetingFilters) {
  return (filters?.minMoverPercent ?? 0) > 0;
}

type Props = {
  filters?: TargetingFilters;
  onChange: (filters: TargetingFilters | undefined) => void;
  variant?: MarketingMapVariant;
  className?: string;
};

const CHECKBOX_CLASS = "h-4 w-4 shrink-0 rounded border-gray-300 accent-[#0EA5E9]";

/** redesign/index.html + map-tool.html — demographic filter checkboxes */
export function MarketingDemographicFilters({
  filters,
  onChange,
  variant = "homepage",
  className,
}: Props) {
  const incomeOn = isIncome75k(filters);
  const moversOn = isMovers(filters);
  const sectionLabel = variant === "homepage" ? "Demographics" : "Filters";

  const setIncome = (checked: boolean) => {
    const next: TargetingFilters = { ...filters };
    if (checked) next.minIncome = 75000;
    else delete next.minIncome;
    const empty = !next.minIncome && !next.minMoverPercent && !next.maxIncome;
    onChange(empty ? undefined : next);
  };

  const setMovers = (checked: boolean) => {
    const next: TargetingFilters = { ...filters };
    if (checked) next.minMoverPercent = 5;
    else delete next.minMoverPercent;
    const empty = !next.minIncome && !next.minMoverPercent && !next.maxIncome;
    onChange(empty ? undefined : next);
  };

  return (
    <div className={className}>
      <p className={marketingMapPanelLabelClass}>{sectionLabel}</p>
      <div
        className={
          variant === "homepage" ? "space-y-2 text-sm text-gray-700" : "space-y-3 text-sm text-gray-700"
        }
      >
        <label className="flex cursor-pointer items-center gap-x-2">
          <input
            type="checkbox"
            checked={incomeOn}
            onChange={(e) => setIncome(e.target.checked)}
            className={CHECKBOX_CLASS}
          />
          <span>Household Income $75k+</span>
        </label>
        <label className="flex items-center gap-x-2 opacity-60" title="Coming soon">
          <input type="checkbox" checked disabled className={CHECKBOX_CLASS} />
          <span>Homeowners</span>
        </label>
        <label className="flex cursor-pointer items-center gap-x-2">
          <input
            type="checkbox"
            checked={moversOn}
            onChange={(e) => setMovers(e.target.checked)}
            className={CHECKBOX_CLASS}
          />
          <span>
            {variant === "homepage" ? "Recent Movers (last 12 mo)" : "Recent Movers"}
          </span>
        </label>
        {variant === "standalone" ? (
          <label className="flex items-center gap-x-2 opacity-60" title="Coming soon">
            <input type="checkbox" disabled className={CHECKBOX_CLASS} />
            <span>Business Owners</span>
          </label>
        ) : null}
      </div>
    </div>
  );
}
