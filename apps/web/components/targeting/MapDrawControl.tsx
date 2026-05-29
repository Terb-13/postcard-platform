"use client";

import { useEffect, useRef, useCallback, type RefObject } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

type DrawControlProps = {
  drawMode: boolean;
  onPolygonComplete: (feature: GeoJSON.Feature<GeoJSON.Polygon>) => void;
};

/**
 * Polygon draw control — mode changes only on toggle edges so we don't reset mid-draw.
 * Parent map should disable doubleClickZoom while drawMode is active.
 */
export function DrawControl({ drawMode, onPolygonComplete }: DrawControlProps) {
  const drawRef = useRef<MapboxDraw | null>(null);
  const drawModeRef = useRef(drawMode);
  const onCompleteRef = useRef(onPolygonComplete);
  onCompleteRef.current = onPolygonComplete;

  const handleCreate = useCallback((e: { features?: GeoJSON.Feature[] }) => {
    const feature = e.features?.[0];
    if (feature?.geometry?.type !== "Polygon") return;
    const ring = feature.geometry.coordinates[0];
    if (!ring || ring.length < 4) return;

    onCompleteRef.current(feature as GeoJSON.Feature<GeoJSON.Polygon>);
    drawRef.current?.deleteAll();
    drawRef.current?.changeMode("simple_select");
  }, []);

  const draw = useControl<MapboxDraw>(
    () => {
      const instance = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: false,
          trash: false,
          point: false,
          line_string: false,
          combine_features: false,
          uncombine_features: false,
        },
        defaultMode: "simple_select",
      });
      drawRef.current = instance;
      return instance;
    },
    ({ map }) => {
      map.on("draw.create", handleCreate);
    },
    ({ map }) => {
      map.off("draw.create", handleCreate);
      drawRef.current = null;
    }
  );

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const instance = drawRef.current;
    if (!instance) return;

    const wasDrawing = drawModeRef.current;
    drawModeRef.current = drawMode;

    if (drawMode && !wasDrawing) {
      instance.deleteAll();
      instance.changeMode("draw_polygon");
    } else if (!drawMode && wasDrawing) {
      instance.deleteAll();
      instance.changeMode("simple_select");
    }
  }, [drawMode]);

  return null;
}

/** Disable map interactions that break polygon completion (double-click zoom). */
export function useMapDrawInteractions(mapRef: RefObject<MapRef | null>, drawMode: boolean) {
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const apply = () => {
      if (drawMode) {
        map.doubleClickZoom.disable();
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
      } else {
        map.doubleClickZoom.enable();
        map.dragRotate.enable();
        map.touchZoomRotate.enableRotation();
      }
    };

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);

    return () => {
      map.off("load", apply);
      map.doubleClickZoom.enable();
      map.dragRotate.enable();
      map.touchZoomRotate.enableRotation();
    };
  }, [mapRef, drawMode]);
}
