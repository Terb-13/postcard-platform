"use client";

import { useCallback, useState } from "react";
import { TargetingMap } from "@/components/targeting/TargetingMap";
import { createDefaultSelection, DEMO_VIEW } from "@/components/targeting/defaults";
import { formatCurrency } from "@/lib/utils";
import {
  marketingContainer,
  marketingEyebrow,
  marketingMapSectionPy,
  marketingTitleLg,
} from "./marketing-design-system";

type LiveEstimate = {
  estimate: {
    reach?: number;
    pricing?: { totalPriceCents?: number; unitPriceCents?: number };
  } | null;
  isLoading: boolean;
  isUpdating: boolean;
};

function MarketingMapEstimatedTotal({
  live,
  hasSelection,
}: {
  live: LiveEstimate;
  hasSelection: boolean;
}) {
  const totalCents = live.estimate?.pricing?.totalPriceCents;
  const showAmount = hasSelection && !live.isLoading && totalCents != null;

  return (
    <div className="text-right text-sm">
      <p className="text-gray-500">Estimated total</p>
      <p className="text-3xl font-semibold tabular-nums tracking-tight text-[#0A2540]">
        {hasSelection && live.isLoading && totalCents == null
          ? "…"
          : showAmount
            ? formatCurrency(totalCents)
            : "$0"}
      </p>
      {live.isUpdating && hasSelection && (
        <p className="mt-0.5 text-xs text-[#0EA5E9]">Updating…</p>
      )}
    </div>
  );
}

/** redesign/index.html — Map tool section */
export function MarketingTargetingDemo() {
  const [selection, setSelection] = useState(() => createDefaultSelection());
  const [live, setLive] = useState<LiveEstimate>({
    estimate: null,
    isLoading: false,
    isUpdating: false,
  });

  const onMarketingEstimate = useCallback((payload: LiveEstimate) => {
    setLive(payload);
  }, []);

  const hasSelection = selection.zctas.length > 0;

  return (
    <section
      id="map-tool"
      className={`scroll-mt-24 border-t border-gray-200 bg-white ${marketingMapSectionPy}`}
    >
      <div className={marketingContainer}>
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={`${marketingEyebrow} mb-2 tracking-[0.1em]`}>Core Technology</p>
            <h2 className={marketingTitleLg}>Precision Targeting Map</h2>
          </div>
          <div className="shrink-0 text-right">
            <MarketingMapEstimatedTotal live={live} hasSelection={hasSelection} />
            <p className="mt-1 hidden text-sm text-gray-500 sm:block">
              Real Census data · Live pricing
            </p>
          </div>
        </div>

        <TargetingMap
          size="6x11"
          selection={selection}
          onSelectionChange={setSelection}
          demoMode
          marketingLayout
          onMarketingEstimate={onMarketingEstimate}
          readOnlySidebar
          hideDrawControl
          initialViewState={DEMO_VIEW}
          className="w-full"
        />
      </div>
    </section>
  );
}
