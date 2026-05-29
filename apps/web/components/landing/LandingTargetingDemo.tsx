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
    <div className="rounded-3xl border border-[var(--color-border)] bg-white shadow-xl overflow-hidden">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)] px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[2px] text-[var(--color-accent)] uppercase">
              Live demo
            </p>
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight mt-1">
              Real Census data. Click ZIPs to explore.
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Census ACS · live estimates
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <TargetingMap
          size="6x11"
          selection={selection}
          onSelectionChange={setSelection}
          demoMode
          readOnlySidebar
          initialViewState={DEMO_VIEW}
        />
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-accent-subtle)] px-5 py-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--color-text-secondary)] text-center sm:text-left">
          Search any ZIP, click boundaries on the map, or draw a custom area — just like in the
          campaign wizard.
        </p>
        <AuthButtons variant="demo" />
      </div>
    </div>
  );
}
