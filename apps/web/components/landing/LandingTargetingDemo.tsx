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
      <div className="targeting-demo-header flex items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">
              Live Census targeting
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] truncate">
              ACS 5-year · real ZIP boundaries
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-subtle)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-accent)] shrink-0">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          No login
        </span>
      </div>

      <div className="p-3 sm:p-4 lg:p-5 bg-[var(--color-bg-alt)]/40">
        <TargetingMap
          size="6x11"
          selection={selection}
          onSelectionChange={setSelection}
          demoMode
          readOnlySidebar
          mobileStatsSheet
          initialViewState={DEMO_VIEW}
        />
      </div>

      <div className="border-t border-[var(--color-border)] px-4 py-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--color-surface)]">
        <p className="text-sm text-[var(--color-text-secondary)] text-center sm:text-left leading-relaxed">
          <span className="font-medium text-[var(--color-text)]">Beverly Hills pre-loaded.</span>{" "}
          Search, tap ZIPs, or draw a custom area — then start your campaign.
        </p>
        <AuthButtons variant="demo" />
      </div>
    </div>
  );
}
