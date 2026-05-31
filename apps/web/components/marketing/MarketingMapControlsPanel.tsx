"use client";

import { useState } from "react";
import { ZipSearch } from "@/components/targeting/ZipSearch";
import type { SelectedZcta, TargetingFilters } from "@/components/targeting/types";
import { cn } from "@/lib/utils";
import { MarketingDemographicFilters } from "./MarketingDemographicFilters";
import { formatTargetAreaSummary } from "./marketing-map-utils";
import {
  marketingMapPanelClass,
  marketingMapPanelLabelClass,
  marketingMapFieldClass,
} from "./marketing-map-styles";

type Props = {
  zctas: SelectedZcta[];
  onSelectZip: (zcta: SelectedZcta) => void;
  filters?: TargetingFilters;
  onFiltersChange: (filters: TargetingFilters | undefined) => void;
  className?: string;
};

/**
 * redesign/map-tool.html — left panel: search, filters, radius.
 * Contained white card; no workspace chips or pills.
 */
export function MarketingMapControlsPanel({
  zctas,
  onSelectZip,
  filters,
  onFiltersChange,
  className,
}: Props) {
  const [radius, setRadius] = useState(2.5);
  const areaSummary = formatTargetAreaSummary(zctas);

  return (
    <aside
      className={cn(
        marketingMapPanelClass,
        "order-1 flex flex-col gap-0 lg:col-span-3",
        className
      )}
    >
      <div className="mb-6">
        <p className={marketingMapPanelLabelClass}>Search location</p>
        <ZipSearch
          onSelect={onSelectZip}
          className="marketing-zip-search"
          placeholder="City, state, or ZIP code"
        />
        {areaSummary ? (
          <input
            type="text"
            readOnly
            value={areaSummary}
            className={cn(marketingMapFieldClass, "mt-3 text-gray-600")}
            aria-label="Selected target area"
          />
        ) : null}
      </div>

      <MarketingDemographicFilters
        filters={filters}
        onChange={onFiltersChange}
        className="mb-6"
      />

      <div className="mt-auto pt-2">
        <div className="mb-1.5 flex justify-between text-sm text-[#0A2540]">
          <span>Radius</span>
          <span className="font-semibold tabular-nums">{radius} mi</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.5}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-[#0EA5E9]"
          aria-label="Target radius in miles"
        />
      </div>
    </aside>
  );
}
