"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import MapGL, { Layer, NavigationControl, Source } from "react-map-gl/mapbox";
import type { MapMouseEvent, MapRef } from "react-map-gl/mapbox";
import { featureCollection } from "@turf/helpers";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc/client";
import { cn, formatCurrency, formatNumber, formatTrpcError } from "@/lib/utils";
import { MarketingMapControlsPanel } from "@/components/marketing/MarketingMapControlsPanel";
import { MarketingMapResultsPanel } from "@/components/marketing/MarketingMapResultsPanel";
import { marketingMapCanvasClass } from "@/components/marketing/marketing-map-styles";
import type { MarketingMapVariant } from "@/components/marketing/marketing-map-variant";
import { ZipSearch } from "./ZipSearch";
import { StatsSidebar } from "./StatsSidebar";
import { DrawControl, useMapDrawInteractions } from "./MapDrawControl";
import { incomeToColor, INCOME_LEGEND_GRADIENT } from "./income-scale";
import type { SelectedZcta, TargetingSelection } from "./types";
import { MAX_TARGETING_ZCTAS } from "./types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
/** light-v11 supports custom fill/line layers; Standard style hides them without slot config */
const MAP_STYLE = "mapbox://styles/mapbox/light-v11";
const DEFAULT_CENTER = { longitude: -98.5795, latitude: 39.8283, zoom: 3.5 };
const VIEWPORT_ZOOM_MIN = 8;

function isValidBbox(bbox: [number, number, number, number] | null | undefined): boolean {
  if (!bbox) return false;
  const [west, south, east, north] = bbox;
  return (
    Number.isFinite(west) &&
    Number.isFinite(south) &&
    Number.isFinite(east) &&
    Number.isFinite(north) &&
    west < east &&
    south < north &&
    west >= -180 &&
    east <= 180 &&
    south >= -90 &&
    north <= 90
  );
}

type ViewState = { longitude: number; latitude: number; zoom: number };

type Props = {
  size: string;
  selection: TargetingSelection;
  onSelectionChange: (selection: TargetingSelection) => void;
  className?: string;
  /** Use public tRPC procedures for unauthenticated landing/demo use */
  demoMode?: boolean;
  /** Hide quantity override in sidebar */
  readOnlySidebar?: boolean;
  /** Initial map viewport (e.g. pre-zoomed demo area) */
  initialViewState?: ViewState;
  /** Hide lasso draw control */
  hideDrawControl?: boolean;
  /** Collapsible bottom sheet for stats on mobile (wizard mode) */
  mobileStatsSheet?: boolean;
  /** 3-column marketing layout (redesign/map-tool.html) — requires demoMode */
  marketingLayout?: boolean;
  /** homepage vs standalone map-tool page styling */
  marketingMapVariant?: MarketingMapVariant;
  /** Live estimate for marketing section header (total cost) */
  onMarketingEstimate?: (payload: {
    estimate: {
      reach?: number;
      pricing?: { totalPriceCents?: number; unitPriceCents?: number };
    } | null;
    isLoading: boolean;
    isUpdating: boolean;
  }) => void;
  /** Sticky footer inside sidebar (static node or render from live estimate) */
  sidebarFooter?:
    | ReactNode
    | ((ctx: {
        estimate: {
          reach?: number;
          pricing?: { totalPriceCents?: number };
        } | null;
        isLoading: boolean;
        selectedCount: number;
      }) => ReactNode);
};

export function TargetingMap({
  size,
  selection,
  onSelectionChange,
  className,
  demoMode = false,
  readOnlySidebar = false,
  initialViewState,
  hideDrawControl = false,
  mobileStatsSheet = false,
  marketingLayout = false,
  marketingMapVariant = "homepage",
  onMarketingEstimate,
  sidebarFooter,
}: Props) {
  const useMarketingLayout = demoMode && marketingLayout;
  const useMobileStatsSheet = mobileStatsSheet || useMarketingLayout;
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>(initialViewState ?? DEFAULT_CENTER);
  const [drawMode, setDrawMode] = useState(false);
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);
  const [selectionPulse, setSelectionPulse] = useState(false);
  const [mapNotice, setMapNotice] = useState<string | null>(null);
  const [pendingBbox, setPendingBbox] = useState<[number, number, number, number] | null>(null);
  const [debouncedBbox, setDebouncedBbox] = useState<[number, number, number, number] | null>(
    null
  );

  const zctaCodes = selection.zctas.map((z) => z.zcta);
  const selectedSet = useMemo(() => new Set(zctaCodes), [zctaCodes.join(",")]);

  const [debouncedZctas, setDebouncedZctas] = useState(zctaCodes);
  const [debouncedQuantityOverride, setDebouncedQuantityOverride] = useState(
    selection.quantityOverride
  );
  const filtersKey = JSON.stringify(selection.filters ?? {});
  const [debouncedFilters, setDebouncedFilters] = useState(selection.filters);
  const [debouncedFiltersKey, setDebouncedFiltersKey] = useState(filtersKey);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedZctas(zctaCodes), 400);
    return () => clearTimeout(t);
  }, [zctaCodes.join(",")]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuantityOverride(selection.quantityOverride), 400);
    return () => clearTimeout(t);
  }, [selection.quantityOverride]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters(selection.filters);
      setDebouncedFiltersKey(filtersKey);
    }, 400);
    return () => clearTimeout(t);
  }, [filtersKey, selection.filters]);

  const isEstimateStale =
    zctaCodes.join(",") !== debouncedZctas.join(",") ||
    selection.quantityOverride !== debouncedQuantityOverride ||
    filtersKey !== debouncedFiltersKey;
  useEffect(() => {
    if (isEstimateStale && zctaCodes.length > 0) {
      setSelectionPulse(true);
    }
  }, [isEstimateStale, zctaCodes.length]);

  useEffect(() => {
    if (!selectionPulse) return;
    const t = setTimeout(() => setSelectionPulse(false), 600);
    return () => clearTimeout(t);
  }, [selectionPulse, debouncedZctas.join(",")]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedBbox(isValidBbox(pendingBbox) ? pendingBbox : null);
    }, 400);
    return () => clearTimeout(t);
  }, [pendingBbox]);

  const authEstimateQuery = trpc.targeting.estimateAudience.useQuery(
    {
      zctas: debouncedZctas,
      size,
      quantityOverride: debouncedQuantityOverride,
      filters: debouncedFilters,
      geoJson: selection.geoJson,
    },
    {
      enabled: !demoMode && debouncedZctas.length > 0,
      staleTime: 60_000,
      placeholderData: (prev) => prev,
    }
  );

  const demoEstimateQuery = trpc.targeting.getCensusStatsForZctas.useQuery(
    {
      zctas: debouncedZctas,
      size,
      filters: debouncedFilters,
    },
    {
      enabled: demoMode && debouncedZctas.length > 0,
      staleTime: 60_000,
      placeholderData: (prev) => prev,
    }
  );

  const estimateQuery = demoMode ? demoEstimateQuery : authEstimateQuery;

  const censusError = estimateQuery.error;
  const censusErrorMessage = censusError ? formatTrpcError(censusError) : undefined;
  const censusErrorCode =
    censusError && typeof censusError === "object" && "data" in censusError
      ? String((censusError as { data?: { code?: string } }).data?.code ?? "")
      : undefined;

  const isUpdating =
    isEstimateStale ||
    (estimateQuery.isFetching && debouncedZctas.length > 0 && !!estimateQuery.data);
  const isInitialLoading =
    estimateQuery.isFetching && debouncedZctas.length > 0 && !estimateQuery.data;

  useEffect(() => {
    if (!useMarketingLayout || !onMarketingEstimate) return;
    onMarketingEstimate({
      estimate: estimateQuery.data ?? null,
      isLoading: isInitialLoading,
      isUpdating,
    });
  }, [
    useMarketingLayout,
    onMarketingEstimate,
    estimateQuery.data,
    isInitialLoading,
    isUpdating,
  ]);

  const selectedBoundaries = trpc.targeting.getZctaBoundaries.useQuery(
    { zctas: zctaCodes },
    { enabled: zctaCodes.length > 0, staleTime: 300_000 }
  );

  const viewportBoundaries = trpc.targeting.getZctasInBounds.useQuery(
    { bbox: debouncedBbox!, limit: 120 },
    {
      enabled: isValidBbox(debouncedBbox) && viewState.zoom >= VIEWPORT_ZOOM_MIN && !drawMode,
      staleTime: 120_000,
      retry: false,
    }
  );

  const findInPolygon = trpc.targeting.findZctasInPolygon.useMutation();

  useMapDrawInteractions(mapRef, drawMode);

  useEffect(() => {
    if (selectedBoundaries.isError) {
      setMapNotice(
        "Could not load ZIP boundaries. Check your connection or try fewer ZIPs."
      );
    }
  }, [selectedBoundaries.isError]);

  const statsByZcta = useMemo(() => {
    const map = new Map<string, { medianIncome: number | null; population: number }>();
    estimateQuery.data?.zctas?.forEach((z) => {
      map.set(z.zcta, { medianIncome: z.medianIncome, population: z.population });
    });
    return map;
  }, [estimateQuery.data?.zctas]);

  const enrichFeature = useCallback(
    (f: Feature<Polygon>, selected: boolean): Feature<Polygon> => {
      const zcta = String(f.properties?.zcta ?? f.properties?.ZCTA5 ?? "").padStart(5, "0");
      const stats = statsByZcta.get(zcta);
      const fillColor = selected
        ? incomeToColor(stats?.medianIncome)
        : "#e2e8f0";
      return {
        ...f,
        properties: {
          ...f.properties,
          zcta,
          selected,
          medianIncome: stats?.medianIncome ?? null,
          fillColor,
        },
      };
    },
    [statsByZcta]
  );

  const mapGeoJson = useMemo(() => {
    const byZcta = new Map<string, Feature<Polygon>>();

    viewportBoundaries.data?.features?.forEach((f) => {
      const props = f.properties as { zcta?: string; ZCTA5?: string } | null;
      const zcta = String(props?.zcta ?? props?.ZCTA5 ?? "").padStart(5, "0");
      if (zcta.length === 5 && !selectedSet.has(zcta)) {
        byZcta.set(zcta, enrichFeature(f as Feature<Polygon>, false));
      }
    });

    selectedBoundaries.data?.features?.forEach((f) => {
      const props = f.properties as { zcta?: string; ZCTA5?: string } | null;
      const zcta = String(props?.zcta ?? props?.ZCTA5 ?? "").padStart(5, "0");
      if (zcta.length === 5) {
        byZcta.set(zcta, enrichFeature(f as Feature<Polygon>, true));
      }
    });

    return featureCollection([...byZcta.values()]);
  }, [selectedBoundaries.data, viewportBoundaries.data, selectedSet, enrichFeature]);

  const updateViewportBbox = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || viewState.zoom < VIEWPORT_ZOOM_MIN) {
      setPendingBbox(null);
      return;
    }
    const b = map.getBounds();
    if (!b) return;
    setPendingBbox([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
  }, [viewState.zoom]);

  useEffect(() => {
    updateViewportBbox();
  }, [viewState.longitude, viewState.latitude, viewState.zoom, updateViewportBbox]);

  const addZcta = useCallback(
    (item: SelectedZcta) => {
      const zcta = item.zcta.replace(/\D/g, "").slice(0, 5).padStart(5, "0");
      if (zcta.length !== 5) return;
      if (selection.zctas.some((z) => z.zcta === zcta)) {
        setMapNotice(`ZIP ${zcta} is already selected.`);
        return;
      }
      if (selection.zctas.length >= MAX_TARGETING_ZCTAS) {
        setMapNotice(`Maximum ${MAX_TARGETING_ZCTAS} ZIP codes per campaign.`);
        return;
      }
      setMapNotice(null);
      const normalized = { ...item, zcta };
      const next = [...selection.zctas, normalized];
      onSelectionChange({ ...selection, zctas: next });
      if (normalized.center) {
        setViewState((v) => ({
          ...v,
          longitude: normalized.center![0],
          latitude: normalized.center![1],
          zoom: Math.max(v.zoom, 11),
        }));
      }
    },
    [selection, onSelectionChange]
  );

  const removeZcta = useCallback(
    (zcta: string) => {
      onSelectionChange({
        ...selection,
        zctas: selection.zctas.filter((z) => z.zcta !== zcta),
      });
    },
    [selection, onSelectionChange]
  );

  const toggleZcta = useCallback(
    (zcta: string, center?: [number, number]) => {
      if (selection.zctas.some((z) => z.zcta === zcta)) {
        removeZcta(zcta);
      } else {
        addZcta({ zcta, center, placeName: `ZCTA ${zcta}` });
      }
    },
    [selection.zctas, addZcta, removeZcta]
  );

  const clearSelection = useCallback(() => {
    onSelectionChange({ ...selection, zctas: [], quantityOverride: undefined });
  }, [selection, onSelectionChange]);

  const handlePolygonComplete = useCallback(
    async (feature: Feature<Polygon>) => {
      setDrawMode(false);
      try {
        const result = await findInPolygon.mutateAsync({
          polygon: {
            type: "Feature",
            geometry: feature.geometry as {
              type: "Polygon";
              coordinates: [number, number][][];
            },
            properties: {},
          },
        });
        const existing = new Set(selection.zctas.map((z) => z.zcta));
        const newItems: SelectedZcta[] = result.centroids
          .filter((c) => !existing.has(c.zcta))
          .map((c) => ({
            zcta: c.zcta,
            center: c.center,
            placeName: c.placeName,
          }));
        if (newItems.length === 0) {
          setMapNotice("No ZIP codes found in that area. Try a smaller or more zoomed-in shape.");
          return;
        }

        const merged = [...selection.zctas, ...newItems];
        let notice: string | null = null;
        let zctas = merged;
        if (merged.length > MAX_TARGETING_ZCTAS) {
          zctas = merged.slice(0, MAX_TARGETING_ZCTAS);
          notice = `Added ${newItems.length} ZIPs; capped at ${MAX_TARGETING_ZCTAS} per campaign.`;
        }
        setMapNotice(notice);
        onSelectionChange({
          ...selection,
          zctas,
          geoJson: featureCollection([feature]) as FeatureCollection,
        });
      } catch (err) {
        setMapNotice(
          formatTrpcError(err) ||
            "Could not find ZIP codes in that area. Try zooming in or drawing a smaller shape."
        );
      }
    },
    [findInPolygon, onSelectionChange, selection]
  );

  const onMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (drawMode) return;
      const feature = e.features?.find((f) => f.layer?.id === "zcta-fill");
      const zcta = feature?.properties?.zcta as string | undefined;
      if (!zcta) return;

      let center: [number, number] | undefined;
      const geom = feature?.geometry;
      if (geom && geom.type === "Polygon" && geom.coordinates[0]?.[0]) {
        const ring = geom.coordinates[0];
        let sx = 0;
        let sy = 0;
        const n = ring.length - 1;
        for (let i = 0; i < n; i++) {
          sx += ring[i]![0]!;
          sy += ring[i]![1]!;
        }
        center = [sx / n, sy / n];
      }

      toggleZcta(zcta, center);
    },
    [drawMode, toggleZcta]
  );

  const resolvedSidebarFooter =
    typeof sidebarFooter === "function"
      ? sidebarFooter({
          estimate: estimateQuery.data ?? null,
          isLoading: isInitialLoading,
          selectedCount: selection.zctas.length,
        })
      : sidebarFooter;

  const sidebarProps = {
    selectedCount: selection.zctas.length,
    estimate: estimateQuery.data ?? null,
    isLoading: isInitialLoading,
    isUpdating,
    isError: estimateQuery.isError,
    errorMessage: censusErrorMessage,
    errorCode: censusErrorCode || undefined,
    onRetry: () => estimateQuery.refetch(),
    quantityOverride: selection.quantityOverride,
    onQuantityOverrideChange: (q: number | undefined) =>
      onSelectionChange({ ...selection, quantityOverride: q }),
    onClearSelection: clearSelection,
    filters: selection.filters,
    onFiltersChange: (filters: TargetingSelection["filters"]) =>
      onSelectionChange({ ...selection, filters }),
    readOnly: readOnlySidebar,
    showFilters: !demoMode,
    showLegend: !demoMode,
    footerSlot: resolvedSidebarFooter,
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className={cn("rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center", className)}>
        <p className="font-medium text-amber-900">Mapbox token required</p>
        <p className="text-sm text-amber-800 mt-2">
          Add <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your
          environment.
        </p>
        <div className="mt-6 max-w-md mx-auto">
          <ZipSearch onSelect={addZcta} />
          <SelectedChips zctas={selection.zctas} onRemove={removeZcta} className="mt-4 justify-center" />
        </div>
        <div className="mt-6">
          <StatsSidebar {...sidebarProps} />
        </div>
      </div>
    );
  }

  if (useMarketingLayout) {
    const estimate = estimateQuery.data ?? null;
    const mapVariant = marketingMapVariant;
    const resultsPanel = (
      <MarketingMapResultsPanel
        zctas={selection.zctas}
        estimate={estimate}
        isLoading={isInitialLoading}
        isUpdating={isUpdating}
        variant={mapVariant}
      />
    );

    return (
      <div className={cn("marketing-map-grid grid grid-cols-1 gap-6 lg:grid-cols-12", className)}>
        <MarketingMapControlsPanel
          zctas={selection.zctas}
          onSelectZip={addZcta}
          filters={selection.filters}
          onFiltersChange={(filters) => onSelectionChange({ ...selection, filters })}
          variant={mapVariant}
        />

        <div className="order-2 flex flex-col lg:col-span-6">
          {mapNotice && (
            <p
              role="status"
              className="mb-3 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-900"
            >
              {mapNotice}
            </p>
          )}

          <div className={marketingMapCanvasClass(mapVariant)}>
            <MapGL
              ref={mapRef}
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              onMoveEnd={updateViewportBbox}
              mapboxAccessToken={MAPBOX_TOKEN}
              mapStyle={MAP_STYLE}
              interactiveLayerIds={drawMode ? [] : ["zcta-fill"]}
              onClick={onMapClick}
              cursor={drawMode ? "crosshair" : "pointer"}
              style={{ width: "100%", height: "100%" }}
            >
              <NavigationControl position="top-right" visualizePitch={false} showCompass={false} />
              {!hideDrawControl && (
                <DrawControl drawMode={drawMode} onPolygonComplete={handlePolygonComplete} />
              )}
              {(mapGeoJson.features.length > 0 || selectedBoundaries.isLoading) && (
                <Source id="zcta-areas" type="geojson" data={mapGeoJson}>
                  <Layer
                    id="zcta-fill"
                    type="fill"
                    paint={{
                      "fill-color": ["get", "fillColor"],
                      "fill-opacity": ["case", ["get", "selected"], 0.72, 0.35],
                    }}
                  />
                  <Layer
                    id="zcta-outline"
                    type="line"
                    paint={{
                      "line-color": ["case", ["get", "selected"], "#0A2540", "#94a3b8"],
                      "line-width": ["case", ["get", "selected"], 2, 0.75],
                      "line-opacity": ["case", ["get", "selected"], 1, 0.6],
                    }}
                  />
                </Source>
              )}
            </MapGL>

            {selectedBoundaries.isLoading && zctaCodes.length > 0 && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-gray-600 shadow-sm">
                  Loading ZIP boundaries…
                </span>
              </div>
            )}

            <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-2xl bg-white/95 px-3 py-2 text-xs font-medium text-gray-600 shadow-sm">
              Click ZIP boundaries to select
            </div>
          </div>
        </div>

        <div className="order-3 hidden lg:col-span-3 lg:flex lg:flex-col">{resultsPanel}</div>

        {useMobileStatsSheet && (
          <>
            {!mobileStatsOpen && (
              <MobileStatsFab
                estimate={estimate}
                selectedCount={selection.zctas.length}
                isLoading={isInitialLoading}
                isUpdating={isUpdating}
                onOpen={() => setMobileStatsOpen(true)}
                embedded={false}
                label="View live results"
              />
            )}
            <Sheet open={mobileStatsOpen} onOpenChange={setMobileStatsOpen}>
              <SheetContent
                side="bottom"
                className="flex max-h-[88vh] flex-col gap-0 overflow-hidden rounded-t-3xl border-gray-200 bg-[#fafaf9] p-0 lg:hidden"
              >
                <SheetHeader className="shrink-0 border-b border-gray-200 bg-white px-5 pb-4 pt-2 text-left">
                  <SheetTitle className="text-lg font-semibold text-[#0A2540]">
                    Live results
                  </SheetTitle>
                  <SheetDescription className="text-gray-600">
                    Reach and cost update as you select ZIPs
                  </SheetDescription>
                </SheetHeader>
                <div className="overflow-y-auto p-4 [&_aside]:min-h-0 [&_aside]:shadow-none">
                  {resultsPanel}
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative",
        demoMode ? "targeting-workspace" : "flex flex-col md:flex-row gap-4 md:gap-6",
        className
      )}
    >
      {demoMode && (
        <aside className="targeting-workspace-panel hidden lg:flex lg:flex-col">
          <div className="shrink-0 space-y-3 border-b border-[var(--color-border-subtle)] p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Current selection
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                {selection.zctas.length > 0
                  ? `${selection.zctas.length} ZIP${selection.zctas.length === 1 ? "" : "s"} selected`
                  : "None selected"}
              </p>
            </div>
            <ZipSearch onSelect={addZcta} />
            <SelectedChips zctas={selection.zctas} onRemove={removeZcta} />
          </div>
          <StatsSidebar
            className="min-h-0 flex-1 rounded-none border-0 shadow-none targeting-sidebar-flat"
            {...sidebarProps}
          />
        </aside>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-3",
          demoMode
            ? "targeting-workspace-main min-h-[320px] lg:min-h-[520px]"
            : "min-h-[320px] sm:min-h-[400px] md:min-h-[540px]",
          useMobileStatsSheet && (demoMode ? "pb-14 lg:pb-0" : "pb-2 md:pb-0")
        )}
      >
        {!demoMode && (
          <div className="targeting-toolbar relative z-20">
            <ZipSearch onSelect={addZcta} className="min-w-0 flex-1 sm:min-w-[200px]" />
            {!hideDrawControl && (
              <Button
                type="button"
                variant={drawMode ? "primary" : "outline"}
                size="sm"
                className={cn(
                  "targeting-draw-btn h-10 w-full shrink-0 sm:w-auto",
                  drawMode && "targeting-draw-btn-active"
                )}
                onClick={() => setDrawMode((d) => !d)}
                disabled={findInPolygon.isPending}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                </svg>
                {findInPolygon.isPending ? "Finding…" : drawMode ? "Drawing…" : "Draw area"}
              </Button>
            )}
          </div>
        )}

        {demoMode && (
          <>
            <div className="space-y-3 lg:hidden">
              <ZipSearch onSelect={addZcta} />
              <SelectedChips zctas={selection.zctas} onRemove={removeZcta} />
            </div>
            <div className="targeting-map-toolbar hidden shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-2 lg:flex">
              <div className="flex items-center gap-2">
                <span className="targeting-map-tab targeting-map-tab-active">Map</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Click ZIP boundaries · Census ACS data
              </p>
            </div>
          </>
        )}

        {!demoMode && <SelectedChips zctas={selection.zctas} onRemove={removeZcta} />}

        {mapNotice && (
          <p
            role="status"
            className="text-xs font-medium text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-2.5"
          >
            {mapNotice}
          </p>
        )}

        <div
          className={cn(
            "targeting-shell relative flex-1",
            demoMode && "targeting-shell-demo",
            demoMode ? "min-h-[240px] sm:min-h-[280px] lg:min-h-0 lg:flex-1" : "min-h-[300px] sm:min-h-[380px]"
          )}
        >
          {!demoMode && <div className="targeting-map-vignette" aria-hidden />}
          <MapGL
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            onMoveEnd={updateViewportBbox}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle={MAP_STYLE}
            interactiveLayerIds={drawMode ? [] : ["zcta-fill"]}
            onClick={onMapClick}
            cursor={drawMode ? "crosshair" : "pointer"}
            style={{
              width: "100%",
              height: "100%",
              minHeight: demoMode ? 280 : 300,
            }}
          >
            <NavigationControl position="top-right" visualizePitch={false} showCompass={false} />
            <DrawControl drawMode={drawMode} onPolygonComplete={handlePolygonComplete} />
            {(mapGeoJson.features.length > 0 || selectedBoundaries.isLoading) && (
              <Source id="zcta-areas" type="geojson" data={mapGeoJson}>
                <Layer
                  id="zcta-fill"
                  type="fill"
                  paint={{
                    "fill-color": ["get", "fillColor"],
                    "fill-opacity": ["case", ["get", "selected"], 0.72, 0.35],
                  }}
                />
                <Layer
                  id="zcta-outline"
                  type="line"
                  paint={{
                    "line-color": ["case", ["get", "selected"], "#0A2540", "#94a3b8"],
                    "line-width": ["case", ["get", "selected"], 2, 0.75],
                    "line-opacity": ["case", ["get", "selected"], 1, 0.6],
                  }}
                />
              </Source>
            )}
          </MapGL>

          {selection.zctas.length > 0 && !demoMode && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className={cn(
                  "targeting-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-transform duration-300",
                  selectionPulse && "scale-105"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                {selection.zctas.length} ZIP{selection.zctas.length === 1 ? "" : "s"}
              </span>
            </div>
          )}

          {isUpdating && selection.zctas.length > 0 && !demoMode && (
            <div className="absolute top-3 right-12 z-10">
              <span className="targeting-glass inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--color-accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                Live
              </span>
            </div>
          )}

          {drawMode && (
            <div className="absolute top-3 right-12 z-10 max-w-[200px]">
              <div className="targeting-glass rounded-xl px-3 py-2 text-[11px] font-medium text-[var(--color-text-secondary)] leading-snug">
                Click corners of your area, then double-click to close the shape
              </div>
            </div>
          )}

          {selectedBoundaries.isLoading && zctaCodes.length > 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <span className="targeting-glass rounded-full px-4 py-2 text-xs font-medium text-[var(--color-text-muted)]">
                Loading ZIP boundaries…
              </span>
            </div>
          )}

          {!demoMode && (
            <div className="absolute bottom-3 left-3 z-10 targeting-glass hidden max-w-[220px] rounded-xl p-3 sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Median income
              </p>
              <div
                className="targeting-legend-bar mb-2"
                style={{ background: INCOME_LEGEND_GRADIENT }}
              />
              <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
                <span>Lower</span>
                <span>Higher</span>
              </div>
            </div>
          )}
        </div>

        {!demoMode && (
          <p className="hidden text-[11px] leading-relaxed text-[var(--color-text-muted)] sm:block">
            {drawMode
              ? "Draw a boundary around neighborhoods you want to reach — matching ZIPs are added automatically."
              : "Click ZIP boundaries to toggle selection. Zoom in to explore more areas."}
          </p>
        )}
      </div>

      {!demoMode && (
        <StatsSidebar className="hidden md:flex md:w-[340px] shrink-0" {...sidebarProps} />
      )}

      {/* Mobile: FAB + bottom sheet (wizard + demo) */}
      {useMobileStatsSheet && (
        <>
          {!mobileStatsOpen && (
            <MobileStatsFab
              estimate={estimateQuery.data ?? null}
              selectedCount={selection.zctas.length}
              isLoading={isInitialLoading}
              isUpdating={isUpdating}
              onOpen={() => setMobileStatsOpen(true)}
              embedded={demoMode}
            />
          )}

          <Sheet open={mobileStatsOpen} onOpenChange={setMobileStatsOpen}>
            <SheetContent
              side="bottom"
              className="flex h-[min(88vh,720px)] max-h-[88vh] flex-col gap-0 overflow-hidden p-0 md:hidden"
            >
              <SheetHeader className="shrink-0 border-b border-[var(--color-border-subtle)] px-5 pb-4 pt-1 text-left">
                <SheetTitle>Audience intelligence</SheetTitle>
                <SheetDescription>US Census ACS · live reach and pricing</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <StatsSidebar
                  {...sidebarProps}
                  compact
                  className="targeting-sidebar-flat h-auto min-h-0 border-0 shadow-none rounded-none"
                />
              </div>
              {resolvedSidebarFooter && (
                <div className="shrink-0 border-t border-[var(--color-border-subtle)] p-4">
                  {resolvedSidebarFooter}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </>
      )}

      {!useMobileStatsSheet && (
        <StatsSidebar className="flex shrink-0 md:w-80 md:hidden" {...sidebarProps} />
      )}
    </div>
  );
}

function MobileStatsFab({
  estimate,
  selectedCount,
  isLoading,
  isUpdating,
  onOpen,
  embedded = false,
  label = "View targeting stats",
}: {
  estimate?: {
    reach?: number;
    pricing?: { totalPriceCents?: number };
  } | null;
  selectedCount: number;
  isLoading?: boolean;
  isUpdating?: boolean;
  onOpen: () => void;
  /** Position inside demo container instead of fixed to viewport */
  embedded?: boolean;
  label?: string;
}) {
  const hasSelection = selectedCount > 0;
  const summary =
    hasSelection && !isLoading && estimate?.reach != null
      ? `${formatNumber(estimate.reach)} households`
      : null;

  return (
    <div
      className={cn(
        "pointer-events-none z-30 md:hidden",
        embedded ? "absolute bottom-3 right-3" : "fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4"
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="targeting-stats-fab pointer-events-auto inline-flex max-w-[min(100vw-2rem,20rem)] items-center rounded-full border border-gray-200 bg-white px-4 py-2.5 text-left shadow-lg transition-transform active:scale-[0.98]"
        aria-label={label}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-[#0A2540]">{label}</span>
          {hasSelection ? (
            <span className="mt-0.5 block truncate text-[11px] text-[var(--color-text-muted)]">
              {isLoading && !estimate ? (
                "Calculating…"
              ) : (
                <>
                  {selectedCount} ZIP{selectedCount === 1 ? "" : "s"}
                  {summary ? ` · ${summary}` : ""}
                  {isUpdating ? " · updating" : ""}
                  {estimate?.pricing?.totalPriceCents != null &&
                    ` · ${formatCurrency(estimate.pricing.totalPriceCents)}`}
                </>
              )}
            </span>
          ) : (
            <span className="mt-0.5 block text-[11px] text-[var(--color-text-muted)]">
              Tap the map to build your audience
            </span>
          )}
        </span>
      </button>
    </div>
  );
}

function SelectedChips({
  zctas,
  onRemove,
  className,
}: {
  zctas: SelectedZcta[];
  onRemove: (zcta: string) => void;
  className?: string;
}) {
  if (zctas.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5 items-center", className)}>
      {zctas.map((z) => (
        <button
          key={z.zcta}
          type="button"
          onClick={() => onRemove(z.zcta)}
          className="targeting-chip"
          title="Remove from selection"
        >
          {z.zcta}
          <span aria-hidden className="opacity-60">×</span>
        </button>
      ))}
    </div>
  );
}
