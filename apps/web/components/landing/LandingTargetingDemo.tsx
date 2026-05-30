"use client";

import { useState } from "react";
import { TargetingMap } from "@/components/targeting/TargetingMap";
import { createDefaultSelection, DEMO_VIEW } from "@/components/targeting/defaults";
import type { TargetingSelection } from "@/components/targeting/types";
import { AuthButtons } from "./AuthButtons";
import { formatCurrency, formatNumber } from "@/lib/utils";

function DemoSidebarFooter({
  selection,
  estimate,
  isLoading,
}: {
  selection: TargetingSelection;
  estimate?: { reach?: number; pricing?: { totalPriceCents?: number } } | null;
  isLoading?: boolean;
}) {
  const hasSelection = selection.zctas.length > 0;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)]/60 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Total reach
        </p>
        <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--color-text)]">
          {hasSelection && !isLoading && estimate?.reach != null
            ? `${formatNumber(estimate.reach)} households`
            : hasSelection && isLoading
              ? "Calculating…"
              : "Select ZIPs on the map"}
        </p>
        {estimate?.pricing?.totalPriceCents != null && !isLoading && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)] tabular-nums">
            Est. {formatCurrency(estimate.pricing.totalPriceCents)} to mail
          </p>
        )}
      </div>
      <AuthButtons variant="demo" />
    </div>
  );
}

export function LandingTargetingDemo() {
  const [selection, setSelection] = useState<TargetingSelection>(() => createDefaultSelection());

  return (
    <TargetingMap
      size="6x11"
      selection={selection}
      onSelectionChange={setSelection}
      demoMode
      readOnlySidebar
      mobileStatsSheet
      hideDrawControl
      initialViewState={DEMO_VIEW}
      className="w-full"
      sidebarFooter={({ estimate, isLoading }) => (
        <DemoSidebarFooter
          selection={selection}
          estimate={estimate}
          isLoading={isLoading}
        />
      )}
    />
  );
}
