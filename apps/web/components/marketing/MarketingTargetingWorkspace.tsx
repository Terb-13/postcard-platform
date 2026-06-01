"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { TargetingMap } from "@/components/targeting/TargetingMap";
import { createDefaultSelection, DEMO_VIEW } from "@/components/targeting/defaults";
import { formatCurrency } from "@/lib/utils";
import {
  marketingContainer,
  marketingMapSectionPy,
  marketingTitleLg,
} from "./marketing-design-system";
import type { MarketingMapVariant } from "./marketing-map-variant";

type LiveEstimate = {
  estimate: {
    reach?: number;
    pricing?: { totalPriceCents?: number; unitPriceCents?: number };
  } | null;
  isLoading: boolean;
  isUpdating: boolean;
};

type Props = {
  /** homepage = index.html embed; standalone = map-tool.html */
  variant?: MarketingMapVariant;
  /** Show “CORE TECHNOLOGY” section header (homepage only) */
  showSectionHeader?: boolean;
  /** Show map-tool.html page chrome (breadcrumb + estimated total) */
  showPageChrome?: boolean;
};

function MapToolPageChrome({ live, hasSelection }: { live: LiveEstimate; hasSelection: boolean }) {
  const totalCents = live.estimate?.pricing?.totalPriceCents;
  const showAmount = hasSelection && !live.isLoading && totalCents != null;

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className={`${marketingContainer} py-8`}>
        <div className="mb-4 flex flex-wrap items-center gap-3 sm:justify-end">
          <Link
            href="/sign-up"
            className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-[#0A2540] hover:bg-gray-50"
          >
            Save Targeting
          </Link>
          <Link
            href="/campaigns/new"
            className="rounded-2xl bg-[#0A2540] px-6 py-2.5 text-sm font-semibold text-white hover:bg-black"
          >
            Continue to Design
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#0A2540]">
                ← Back to Home
              </Link>
              <span className="text-gray-300">/</span>
              <span>Map Tool</span>
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#0A2540]">
              Targeting Map
            </h1>
            <p className="text-gray-600">
              Select areas using real Census data • Live pricing updates
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-500">Estimated total</p>
            <p className="text-3xl font-semibold tabular-nums text-[#0A2540]">
              {hasSelection && live.isLoading && totalCents == null
                ? "…"
                : showAmount
                  ? formatCurrency(totalCents)
                  : "$0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Live map workspace — homepage section and /map-tool page */
export function MarketingTargetingWorkspace({
  variant = "homepage",
  showSectionHeader,
  showPageChrome = false,
}: Props) {
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
  const showHeader = showSectionHeader ?? variant === "homepage";

  const grid = (
    <TargetingMap
      size="6x11"
      selection={selection}
      onSelectionChange={setSelection}
      demoMode
      marketingLayout
      marketingMapVariant={variant}
      onMarketingEstimate={onMarketingEstimate}
      readOnlySidebar
      hideDrawControl
      initialViewState={DEMO_VIEW}
      className="w-full"
    />
  );

  if (showPageChrome) {
    return (
      <>
        <MapToolPageChrome live={live} hasSelection={hasSelection} />
        <div className="bg-[#fafaf9] pb-12">
          <div className={marketingContainer}>{grid}</div>
        </div>
      </>
    );
  }

  return (
    <section
      id="map-tool"
      className={`scroll-mt-24 border-t border-gray-200 bg-white ${marketingMapSectionPy}`}
    >
      <div className={marketingContainer}>
        {showHeader && (
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[1.5px] text-[#0EA5E9]">
                CORE TECHNOLOGY
              </p>
              <h2 className={marketingTitleLg}>Precision Targeting Map</h2>
            </div>
            <p className="hidden shrink-0 text-right text-sm text-gray-500 md:block">
              Real Census data • Live pricing
            </p>
          </div>
        )}
        {grid}
      </div>
    </section>
  );
}
