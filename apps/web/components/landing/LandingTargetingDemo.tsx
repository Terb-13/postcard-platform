"use client";

import { useState } from "react";
import { TargetingMap } from "@/components/targeting/TargetingMap";
import { createDefaultSelection, DEMO_VIEW } from "@/components/targeting/defaults";
import type { TargetingSelection } from "@/components/targeting/types";
import { AuthButtons } from "./AuthButtons";

export function LandingTargetingDemo() {
  const [selection, setSelection] = useState<TargetingSelection>(() => createDefaultSelection());

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)]">Live Census map</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Beverly Hills pre-loaded · tap ZIPs to explore
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-bg-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-muted)]">
          No login
        </span>
      </div>

      <div className="bg-[var(--color-bg-alt)]/30 p-3 sm:p-4">
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
        />
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 sm:flex-row sm:items-center sm:px-5">
        <p className="text-sm text-[var(--color-text-secondary)] sm:text-left">
          Search a ZIP, click boundaries, or pan the map — stats update from Census ACS.
        </p>
        <AuthButtons variant="demo" />
      </div>
    </div>
  );
}
