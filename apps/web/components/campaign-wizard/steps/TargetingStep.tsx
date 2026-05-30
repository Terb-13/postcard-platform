"use client";

import { TargetingMap } from "@/components/targeting";
import type { TargetingSelection } from "@/components/targeting";
import { CensusLiveBadge, WizardStepHeader } from "../WizardStepHeader";

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
  const hasSelection = targeting.zctas.length > 0;

  return (
    <div className="space-y-5 md:space-y-6">
      <WizardStepHeader
        title="Who should receive your postcards?"
        description="Search ZIP codes, click the map, or draw a custom boundary. Reach and cost update live from US Census data."
        badge={<CensusLiveBadge />}
      />

      {validationError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800"
        >
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
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

      {isEstimateLoading && hasSelection && !censusError && (
        <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
          Loading Census estimates…
        </p>
      )}

      {hasSelection && !censusError && (
        <p className="text-micro font-medium text-[var(--color-accent)]">
          {targeting.zctas.length} ZIP{targeting.zctas.length === 1 ? "" : "s"} selected · estimates
          update as you refine
        </p>
      )}

      <div className="wizard-targeting-stage">
        <TargetingMap
          size={size}
          selection={targeting}
          onSelectionChange={onTargetingChange}
          mobileStatsSheet
          className="w-full"
        />
      </div>
    </div>
  );
}
