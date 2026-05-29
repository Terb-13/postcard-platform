"use client";

import { useState } from "react";
import { TargetingMap } from "@/components/targeting/TargetingMap";
import type { SelectedZcta, TargetingSelection } from "@/components/targeting/types";
import { AuthButtons } from "./AuthButtons";

const DEMO_ZCTAS: SelectedZcta[] = [
  { zcta: "90210", placeName: "Beverly Hills, CA", center: [-118.4065, 34.103] },
  { zcta: "90212", placeName: "Beverly Hills, CA", center: [-118.399, 34.062] },
  { zcta: "90024", placeName: "Los Angeles, CA", center: [-118.4395, 34.063] },
];

const DEMO_VIEW = { longitude: -118.415, latitude: 34.078, zoom: 11.5 };

export function LandingTargetingDemo() {
  const [selection, setSelection] = useState<TargetingSelection>({
    zctas: DEMO_ZCTAS,
  });

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-[var(--color-border)] bg-white shadow-lg lg:shadow-none lg:border-0 lg:rounded-none lg:bg-transparent">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)] px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 rounded-t-2xl sm:rounded-t-3xl lg:rounded-t-[1.25rem] overflow-hidden">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] min-w-0">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate font-medium">Census ACS · live estimates</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <span className="text-micro font-medium text-[var(--color-accent)]">No login required</span>
          <span className="hidden lg:inline text-micro text-[var(--color-text-muted)]">·</span>
          <span className="hidden lg:inline text-micro text-[var(--color-text-muted)]">
            Same engine as campaigns
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-5 lg:p-8">
        <TargetingMap
          size="6x11"
          selection={selection}
          onSelectionChange={setSelection}
          demoMode
          readOnlySidebar
          mobileStatsSheet
          initialViewState={DEMO_VIEW}
          className="lg:min-h-[560px]"
        />
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-b-2xl sm:rounded-b-3xl lg:rounded-b-[1.25rem]">
        <p className="text-sm lg:text-[15px] text-[var(--color-text-secondary)] text-center sm:text-left max-w-md">
          Same map as the campaign wizard — search ZIPs, tap boundaries, or draw an area.
        </p>
        <AuthButtons variant="demo" />
      </div>
    </div>
  );
}
