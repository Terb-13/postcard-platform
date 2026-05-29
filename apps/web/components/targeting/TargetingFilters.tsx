"use client";

import { cn } from "@/lib/utils";
import {
  INCOME_PRESETS,
  filtersToPresetId,
  presetToFilters,
  INCOME_LEGEND_GRADIENT,
} from "./income-scale";
import type { TargetingFilters } from "./types";

type Props = {
  filters?: TargetingFilters;
  onChange: (filters: TargetingFilters | undefined) => void;
  className?: string;
  compact?: boolean;
};

export function TargetingFiltersPanel({ filters, onChange, className, compact }: Props) {
  const activeId = filtersToPresetId(filters);

  return (
    <div className={cn("targeting-filters", className)}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Income focus
        </span>
        {!compact && (
          <div
            className="h-1.5 flex-1 max-w-[120px] rounded-full opacity-80"
            style={{ background: INCOME_LEGEND_GRADIENT }}
            aria-hidden
          />
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {INCOME_PRESETS.map((preset) => {
          const isActive = activeId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(presetToFilters(preset.id))}
              className={cn(
                "targeting-filter-pill",
                isActive && "targeting-filter-pill-active"
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
