"use client";

import { TargetingMap } from "@/components/targeting";
import type { TargetingSelection } from "@/components/targeting";

type Props = {
  size: string;
  targeting: TargetingSelection;
  onTargetingChange: (selection: TargetingSelection) => void;
  validationError?: string | null;
  censusError?: string | null;
  isEstimateLoading?: boolean;
};

export function TargetingStep({
  size,
  targeting,
  onTargetingChange,
  validationError,
  censusError,
  isEstimateLoading,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-1.5">
            Step 2 · Targeting
          </p>
          <h2 className="heading-sm text-[var(--color-text)]">
            Who should receive your postcards?
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
            Search ZIP codes, click the map, or draw a custom boundary. Reach and cost update
            live from US Census data.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-muted)] shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Census ACS · live
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800 flex items-start gap-2"
        >
          <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {validationError}
        </div>
      )}

      {censusError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800"
        >
          <p className="font-medium">Census data could not be loaded</p>
          <p className="mt-1 text-red-700/90">{censusError}</p>
        </div>
      )}

      {isEstimateLoading && targeting.zctas.length > 0 && !censusError && (
        <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          Loading Census estimates…
        </p>
      )}

      <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg-alt)]/40 p-3 sm:p-5 shadow-sm">
        <TargetingMap
          size={size}
          selection={targeting}
          onSelectionChange={onTargetingChange}
          mobileStatsSheet
        />
      </div>
    </div>
  );
}
