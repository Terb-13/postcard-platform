"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapGL, { Layer, NavigationControl, Source } from "react-map-gl/mapbox";
import type { MapMouseEvent, MapRef } from "react-map-gl/mapbox";
import { featureCollection } from "@turf/helpers";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZipSearch } from "./ZipSearch";
import { StatsSidebar } from "./StatsSidebar";
import { DrawControl } from "./MapDrawControl";
import { incomeToColor, INCOME_LEGEND } from "./income-scale";
import type { SelectedZcta, TargetingSelection } from "./types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DEFAULT_CENTER = { longitude: -98.5795, latitude: 39.8283, zoom: 3.5 };
const VIEWPORT_ZOOM_MIN = 8;

type Props = {
  size: string;
  selection: TargetingSelection;
  onSelectionChange: (selection: TargetingSelection) => void;
  className?: string;
};

export function TargetingMap({ size, selection, onSelectionChange, className }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(DEFAULT_CENTER);
  const [drawMode, setDrawMode] = useState(false);
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

  useEffect(() => {
    if (!debouncedBbox) return;
    const t = setTimeout(() => setViewportBbox(debouncedBbox), 500);
    return () => clearTimeout(t);
  }, [debouncedBbox]);

  const estimateQuery = trpc.targeting.estimateAudience.useQuery(
    {
      zctas: debouncedZctas,
      size,
      quantityOverride: selection.quantityOverride,
      filters: selection.filters,
      geoJson: selection.geoJson,
    },
    {
      enabled: debouncedZctas.length > 0,
      staleTime: 60_000,
      placeholderData: (prev) => prev,
    }
  );

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
      if (selection.zctas.some((z) => z.zcta === item.zcta)) return;
      const next = [...selection.zctas, item];
      onSelectionChange({ ...selection, zctas: next });
      if (item.center) {
        setViewState((v) => ({
          ...v,
          longitude: item.center![0],
          latitude: item.center![1],
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
        if (newItems.length > 0) {
          onSelectionChange({
            ...selection,
            zctas: [...selection.zctas, ...newItems],
            geoJson: featureCollection([feature]) as FeatureCollection,
          });
        }
      } catch {
        alert("Could not find ZIP codes in that area. Try zooming in or drawing a smaller shape.");
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
    isLoading: estimateQuery.isFetching && debouncedZctas.length > 0,
    isError: estimateQuery.isError,
    quantityOverride: selection.quantityOverride,
    onQuantityOverrideChange: (q: number | undefined) =>
      onSelectionChange({ ...selection, quantityOverride: q }),
    onClearSelection: clearSelection,
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
    <div className={cn("flex flex-col lg:flex-row gap-4", className)}>
      <div className="flex-1 min-h-[420px] lg:min-h-[520px] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <ZipSearch onSelect={addZcta} className="flex-1" />
          <Button
            type="button"
            variant={drawMode ? "primary" : "secondary"}
            size="sm"
            onClick={() => setDrawMode((d) => !d)}
            disabled={findInPolygon.isPending}
          >
            {findInPolygon.isPending
              ? "Finding ZIPs…"
              : drawMode
                ? "Drawing… click map"
                : "Draw custom area"}
          </Button>
        </div>

        <SelectedChips zctas={selection.zctas} onRemove={removeZcta} />

        <div className="relative flex-1 rounded-2xl overflow-hidden border border-[var(--color-border)] min-h-[360px]">
          <MapGL
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            onMoveEnd={updateViewportBbox}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/light-v11"
            interactiveLayerIds={drawMode ? [] : ["zcta-fill"]}
            onClick={onMapClick}
            cursor={drawMode ? "crosshair" : undefined}
            style={{ width: "100%", height: "100%", minHeight: 360 }}
          >
            <NavigationControl position="top-right" />
            <DrawControl drawMode={drawMode} onPolygonComplete={handlePolygonComplete} />
            {mapGeoJson.features.length > 0 && (
              <Source id="zcta-areas" type="geojson" data={mapGeoJson}>
                <Layer
                  id="zcta-fill"
                  type="fill"
                  paint={{
                    "fill-color": ["get", "fillColor"],
                    "fill-opacity": [
                      "case",
                      ["get", "selected"],
                      0.62,
                      0.35,
                    ],
                  }}
                />
                <Layer
                  id="zcta-outline"
                  type="line"
                  paint={{
                    "line-color": [
                      "case",
                      ["get", "selected"],
                      "#0A2540",
                      "#94a3b8",
                    ],
                    "line-width": [
                      "case",
                      ["get", "selected"],
                      3,
                      1,
                    ],
                  }}
                />
              </Source>
            )}
          </MapGL>

          {selection.zctas.length > 0 && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/95 backdrop-blur shadow-sm text-[var(--color-text)] border border-[var(--color-border)]">
                {selection.zctas.length} selected zip{selection.zctas.length === 1 ? "" : "s"}
              </Badge>
            </div>
          )}

          {drawMode && (
            <div className="absolute top-3 right-14 bg-[var(--color-bg-dark)] text-white text-xs px-3 py-2 rounded-xl shadow-md max-w-[200px]">
              Click to place points, double-click to finish
            </div>
          )}

          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-xl border border-[var(--color-border)] p-3 shadow-md max-w-[240px]">
            <p className="text-micro font-semibold text-[var(--color-text-secondary)] mb-2">
              Median income (selected)
            </p>
            <div className="flex flex-col gap-1.5">
              {INCOME_LEGEND.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-micro">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0 border border-black/5"
                    style={{ background: item.color }}
                  />
                  <span className="text-[var(--color-text-muted)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-micro text-[var(--color-text-muted)]">
          {drawMode
            ? "Draw a shape around the neighborhoods you want to reach."
            : "Click any ZIP on the map to add or remove it from your selection. Zoom in to see more ZIP boundaries."}
        </p>
      </div>

      <StatsSidebar className="lg:w-80 shrink-0" {...sidebarProps} />
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
          className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] px-2.5 py-1 text-xs font-medium hover:bg-[var(--color-accent)] hover:text-white transition-colors"
          title="Click to remove"
        >
          {z.zcta}
          <span aria-hidden>×</span>
        </button>
      ))}
    </div>
  );
}
