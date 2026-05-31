"use client";

import type { TargetingFilters } from "@/components/targeting/types";
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
  className?: string;
};

const CHECKBOX_CLASS = "h-4 w-4 shrink-0 rounded border-gray-300 accent-[#0EA5E9]";

/** redesign/map-tool.html — active filters only (no disabled placeholder rows) */
export function MarketingDemographicFilters({ filters, onChange, className }: Props) {
  const incomeOn = isIncome75k(filters);
  const moversOn = isMovers(filters);

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
      <p className={marketingMapPanelLabelClass}>Filters</p>
      <div className="space-y-3 text-sm text-gray-700">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={incomeOn}
            onChange={(e) => setIncome(e.target.checked)}
            className={CHECKBOX_CLASS}
          />
          <span>Household Income $75k+</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={moversOn}
            onChange={(e) => setMovers(e.target.checked)}
            className={CHECKBOX_CLASS}
          />
          <span>Recent Movers</span>
        </label>
      </div>
    </div>
  );
}
