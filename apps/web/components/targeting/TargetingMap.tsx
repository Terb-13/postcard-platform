"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Layer, NavigationControl, Source } from "react-map-gl/mapbox";
import type { MapMouseEvent, MapRef } from "react-map-gl/mapbox";
import { featureCollection } from "@turf/helpers";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";

import { trpc } from "@/lib/trpc/client";
import { cn, formatCurrency, formatNumber, formatTrpcError } from "@/lib/utils";
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
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>(initialViewState ?? DEFAULT_CENTER);
  const [drawMode, setDrawMode] = useState(false);
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);
  const [selectionPulse, setSelectionPulse] = useState(false);
  const [mapNotice, setMapNotice] = useState<string | null>(null);
  const [viewportBbox, setViewportBbox] = useState<[number, number, number, number] | null>(
    null
  );
  const [debouncedBbox, setDebouncedBbox] = useState<[number, number, number, number] | null>(
    null
  );

  const zctaCodes = selection.zctas.map((z) => z.zcta);
  const selectedSet = useMemo(() => new Set(zctaCodes), [zctaCodes.join(",")]);

  const [debouncedZctas, setDebouncedZctas] = useState(zctaCodes);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedZctas(zctaCodes), 400);
    return () => clearTimeout(t);
  }, [zctaCodes.join(",")]);

  const isEstimateStale = zctaCodes.join(",") !== debouncedZctas.join(",");
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
    if (!debouncedBbox) return;
    const t = setTimeout(() => setViewportBbox(debouncedBbox), 500);
    return () => clearTimeout(t);
  }, [debouncedBbox]);

  const authEstimateQuery = trpc.targeting.estimateAudience.useQuery(
    {
      zctas: debouncedZctas,
      size,
      quantityOverride: selection.quantityOverride,
      filters: selection.filters,
      geoJson: selection.geoJson,
    },
    {
      enabled: !demoMode && debouncedZctas.length > 0,
      staleTime: 60_000,
      placeholderData: (prev) => prev,
    }
  );

  const demoEstimateQuery = trpc.targeting.estimateAudienceFromZctas.useQuery(
    {
      zctas: debouncedZctas,
      size,
      quantityOverride: selection.quantityOverride,
      filters: selection.filters,
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

  const selectedBoundaries = trpc.targeting.getZctaBoundaries.useQuery(
    { zctas: zctaCodes },
    { enabled: zctaCodes.length > 0, staleTime: 300_000 }
  );

  const viewportBoundaries = trpc.targeting.getZctasInBounds.useQuery(
    { bbox: viewportBbox!, limit: 120 },
    {
      enabled: !!viewportBbox && viewState.zoom >= VIEWPORT_ZOOM_MIN && !drawMode,
      staleTime: 120_000,
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
        : "#e8edf4";
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
      setDebouncedBbox(null);
      return;
    }
    const b = map.getBounds();
    if (!b) return;
    setDebouncedBbox([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
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

  return (
    <div className={cn("flex flex-col lg:flex-row gap-5 lg:gap-6", className)}>
      <div className="flex-1 min-h-[320px] sm:min-h-[440px] lg:min-h-[540px] flex flex-col gap-3">
        <div className="targeting-toolbar relative z-20">
          <ZipSearch onSelect={addZcta} className="flex-1 min-w-[200px]" />
          {!hideDrawControl && (
            <button
              type="button"
              className={cn(
                "targeting-draw-btn shrink-0",
                drawMode && "targeting-draw-btn-active"
              )}
              onClick={() => setDrawMode((d) => !d)}
              disabled={findInPolygon.isPending}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
              </svg>
              {findInPolygon.isPending ? "Finding…" : drawMode ? "Drawing…" : "Draw area"}
            </button>
          )}
        </div>

        <SelectedChips zctas={selection.zctas} onRemove={removeZcta} />

        {mapNotice && (
          <p
            role="status"
            className="text-xs font-medium text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-2.5"
          >
            {mapNotice}
          </p>
        )}

        <div className="targeting-shell relative flex-1 min-h-[300px] sm:min-h-[380px]">
          <div className="targeting-map-vignette" aria-hidden />
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
            style={{ width: "100%", height: "100%", minHeight: 300 }}
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
                    "fill-opacity": ["case", ["get", "selected"], 0.78, 0.42],
                  }}
                />
                <Layer
                  id="zcta-outline-glow"
                  type="line"
                  filter={["==", ["get", "selected"], true]}
                  paint={{
                    "line-color": "#0A66C2",
                    "line-width": 6,
                    "line-blur": 4,
                    "line-opacity": 0.35,
                  }}
                />
                <Layer
                  id="zcta-outline"
                  type="line"
                  paint={{
                    "line-color": ["case", ["get", "selected"], "#0A2540", "#cbd5e1"],
                    "line-width": ["case", ["get", "selected"], 2.5, 1],
                  }}
                />
              </Source>
            )}
          </MapGL>

          {selection.zctas.length > 0 && (
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

          {isUpdating && selection.zctas.length > 0 && (
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

          <div className="absolute bottom-3 left-3 z-10 targeting-glass rounded-xl p-3 max-w-[220px] hidden sm:block">
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
        </div>

        <p className="text-[11px] text-[var(--color-text-muted)] hidden sm:block leading-relaxed">
          {drawMode
            ? "Draw a boundary around neighborhoods you want to reach — matching ZIPs are added automatically."
            : "Click ZIP boundaries to toggle selection. Zoom in to explore more areas."}
        </p>
      </div>

      {/* Desktop sidebar */}
      <StatsSidebar className="hidden lg:flex lg:w-[340px] shrink-0" {...sidebarProps} />

      {/* Mobile: sticky summary bar + bottom sheet */}
      {mobileStatsSheet && (
        <>
          <MobileStatsBar
            {...sidebarProps}
            isOpen={mobileStatsOpen}
            onToggle={() => setMobileStatsOpen((o) => !o)}
          />
          {mobileStatsOpen && (
            <>
              <button
                type="button"
                aria-label="Close stats panel"
                className="lg:hidden fixed inset-0 z-40 bg-[#0a2540]/25 backdrop-blur-sm"
                onClick={() => setMobileStatsOpen(false)}
              />
              <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[82vh] flex flex-col targeting-mobile-sheet animate-in slide-in-from-bottom duration-300">
                <div className="targeting-sheet-handle shrink-0" aria-hidden />
                <div className="sticky top-0 bg-[var(--color-surface)] px-5 py-3 flex items-center justify-between border-b border-[var(--color-border-subtle)] shrink-0">
                  <span className="font-semibold text-sm tracking-tight">Audience intelligence</span>
                  <button
                    type="button"
                    onClick={() => setMobileStatsOpen(false)}
                    className="text-xs font-semibold text-[var(--color-accent)] px-2 py-1"
                  >
                    Done
                  </button>
                </div>
                <div className="overflow-y-auto flex-1 overscroll-contain">
                  <StatsSidebar {...sidebarProps} compact className="targeting-sidebar-flat border-0 shadow-none rounded-none" />
                </div>
              </div>
            </>
          )}
        </>
      )}

      {!mobileStatsSheet && (
        <StatsSidebar className="lg:w-80 shrink-0 flex lg:hidden" {...sidebarProps} />
      )}
    </div>
  );
}

function MobileStatsBar({
  estimate,
  selectedCount,
  isLoading,
  isUpdating,
  isOpen,
  onToggle,
}: {
  estimate?: {
    reach?: number;
    pricing?: { totalPriceCents?: number; quantity?: number };
  } | null;
  selectedCount: number;
  isLoading?: boolean;
  isUpdating?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 px-3 pb-3 pt-6 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/95 to-transparent pointer-events-none">
      <button
        type="button"
        onClick={onToggle}
        className="targeting-mobile-bar pointer-events-auto w-full px-4 py-3.5 flex items-center justify-between gap-3 active:scale-[0.99] transition-transform"
      >
        <div className="text-left min-w-0 flex-1">
          {selectedCount === 0 ? (
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              Tap the map to build your audience
            </p>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {selectedCount} ZIP{selectedCount === 1 ? "" : "s"}
                {isUpdating && " · updating"}
              </p>
              <p className="text-base font-bold tabular-nums truncate tracking-tight mt-0.5">
                {isLoading && !estimate ? (
                  <span className="animate-pulse text-[var(--color-text-muted)]">Calculating…</span>
                ) : (
                  <>
                    {formatNumber(estimate?.reach ?? 0)}{" "}
                    <span className="text-sm font-medium text-[var(--color-text-muted)]">households</span>
                    {estimate?.pricing?.totalPriceCents != null && (
                      <span className="text-sm font-semibold text-[var(--color-accent)] ml-1.5">
                        {formatCurrency(estimate.pricing.totalPriceCents)}
                      </span>
                    )}
                  </>
                )}
              </p>
            </>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-accent)] shrink-0">
          {isOpen ? "Close" : "Details"}
          <svg
            className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
          </svg>
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
