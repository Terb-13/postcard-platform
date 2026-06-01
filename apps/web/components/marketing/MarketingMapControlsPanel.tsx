"use client";

import { useState } from "react";
import { ZipSearch } from "@/components/targeting/ZipSearch";
import type { SelectedZcta, TargetingFilters } from "@/components/targeting/types";
import { cn } from "@/lib/utils";
import { MarketingDemographicFilters } from "./MarketingDemographicFilters";
import { formatTargetAreaSummary } from "./marketing-map-utils";
import type { MarketingMapVariant } from "./marketing-map-variant";
import {
  marketingMapFieldClass,
  marketingMapPanelClass,
  marketingMapPanelLabelClass,
} from "./marketing-map-styles";

type Props = {
  zctas: SelectedZcta[];
  onSelectZip: (zcta: SelectedZcta) => void;
  filters?: TargetingFilters;
  onFiltersChange: (filters: TargetingFilters | undefined) => void;
  variant?: MarketingMapVariant;
  className?: string;
};

/** redesign/index.html + map-tool.html — left panel */
export function MarketingMapControlsPanel({
  zctas,
  onSelectZip,
  filters,
  onFiltersChange,
  variant = "homepage",
  className,
}: Props) {
  const [radius, setRadius] = useState(2.5);
  const areaSummary = formatTargetAreaSummary(zctas);
  const searchLabel = variant === "homepage" ? "Target area" : "Search location";

  return (
    <aside
      className={cn(
        marketingMapPanelClass(variant),
        "order-1 flex flex-col lg:col-span-3",
        className
      )}
    >
      <div className="mb-6">
        <p className={marketingMapPanelLabelClass}>{searchLabel}</p>
        <ZipSearch
          onSelect={onSelectZip}
          className="marketing-zip-search"
          placeholder={variant === "homepage" ? "City, state, or ZIP code" : "Denver, CO or ZIP"}
        />
        {areaSummary ? (
          <input
            type="text"
            readOnly
            value={areaSummary}
            className={cn(
              marketingMapFieldClass,
              variant === "homepage" ? "mt-3 px-4 py-3" : "mt-3 text-gray-600"
            )}
            aria-label="Selected target area"
          />
        ) : null}
      </div>

      <MarketingDemographicFilters
        filters={filters}
        onChange={onFiltersChange}
        variant={variant}
        className="mb-6"
      />

      <div className={variant === "homepage" ? "mt-auto" : "mt-auto pt-2"}>
        <div
          className={cn(
            "flex justify-between text-sm text-[#0A2540]",
            variant === "homepage" ? "mb-2" : "mb-1.5"
          )}
        >
          <span className={variant === "homepage" ? "font-medium" : undefined}>Radius</span>
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
