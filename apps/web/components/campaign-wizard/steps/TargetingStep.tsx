"use client";

import { TargetingMap } from "@/components/targeting";
import type { TargetingSelection } from "@/components/targeting";
import { CensusLiveBadge, WizardStepHeader } from "../WizardStepHeader";
import { MelissaRoutesPanel, type MelissaRoutesResult } from "../MelissaRoutesPanel";
import {
  MelissaListPreviewPanel,
  type MelissaListPreviewResult,
} from "../MelissaListPreviewPanel";

type Props = {
  size: string;
  targeting: TargetingSelection;
  onTargetingChange: (selection: TargetingSelection) => void;
  validationError?: string | null;
  censusError?: string | null;
  isEstimateLoading?: boolean;
  melissaDoor?: boolean;
  campaignId?: string | null;
  onMelissaRoutes?: (result: MelissaRoutesResult | null, error?: string | null) => void;
  listPreview?: MelissaListPreviewResult | null;
  onListPreview?: (result: MelissaListPreviewResult | null) => void;
};

export function TargetingStep({
  size,
  targeting,
  onTargetingChange,
  validationError,
  censusError,
  isEstimateLoading,
  melissaDoor = false,
  campaignId,
  onMelissaRoutes,
  listPreview,
  onListPreview,
}: Props) {
  const hasSelection = targeting.zctas.length > 0;
  const zctas = targeting.zctas.map((z) => z.zcta);

  return (
    <div className="space-y-5 md:space-y-6">
      <WizardStepHeader
        title={
          melissaDoor
            ? "Pick a ZIP, then attach Melissa routes"
            : "Who should receive your postcards?"
        }
        description={
          melissaDoor
            ? "Map selection loads live Melissa Occupant carrier routes. Optionally attach a list preview count. This saves a draft quote — pay later."
            : "Search ZIP codes, click the map, or draw a custom boundary. Reach and cost update live from US Census data."
        }
        badge={melissaDoor ? <MelissaDoorBadge /> : <CensusLiveBadge />}
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

      {!melissaDoor && censusError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800"
        >
          <p className="font-medium">Census data could not be loaded</p>
          <p className="mt-1 text-red-700/90">{censusError}</p>
        </div>
      )}

      {!melissaDoor && isEstimateLoading && hasSelection && !censusError && (
        <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
          Loading Census estimates…
        </p>
      )}

      {hasSelection && (
        <p className="text-micro font-medium text-[var(--color-accent)]">
          {targeting.zctas.length} ZIP{targeting.zctas.length === 1 ? "" : "s"} selected
          {melissaDoor ? " · Melissa Occupant next" : " · estimates update as you refine"}
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

      {melissaDoor && (
        <div className="space-y-4">
          <MelissaRoutesPanel zctas={zctas} onResult={onMelissaRoutes} />
          <MelissaListPreviewPanel
            zctas={zctas}
            filters={targeting.filters}
            campaignId={campaignId}
            attached={listPreview}
            onAttach={onListPreview}
          />
        </div>
      )}
    </div>
  );
}

function MelissaDoorBadge() {
  return (
    <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-alt)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
      Melissa · preview only
    </span>
  );
}
