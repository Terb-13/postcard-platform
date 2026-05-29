"use client";

import { TargetingMap } from "@/components/targeting";
import type { TargetingSelection } from "@/components/targeting";

type Props = {
  size: string;
  targeting: TargetingSelection;
  onTargetingChange: (selection: TargetingSelection) => void;
  validationError?: string | null;
};

export function TargetingStep({
  size,
  targeting,
  onTargetingChange,
  validationError,
}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="heading-sm">Who should receive your postcards?</h2>
        <p className="text-small text-[var(--color-text-muted)] mt-1">
          Search ZIP codes, click the map, or draw a custom area. Reach and cost update live from
          US Census data.
        </p>
      </div>

      {validationError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {validationError}
        </div>
      )}

      <TargetingMap
        size={size}
        selection={targeting}
        onSelectionChange={onTargetingChange}
        mobileStatsSheet
      />
    </div>
  );
}
