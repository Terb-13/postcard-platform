"use client";

import { useEffect, useRef, useCallback } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useControl } from "react-map-gl/mapbox";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

type DrawControlProps = {
  drawMode: boolean;
  onPolygonComplete: (feature: GeoJSON.Feature<GeoJSON.Polygon>) => void;
};

export function DrawControl({ drawMode, onPolygonComplete }: DrawControlProps) {
  const drawRef = useRef<MapboxDraw | null>(null);
  const onCompleteRef = useRef(onPolygonComplete);
  onCompleteRef.current = onPolygonComplete;

  const onCreate = useCallback((e: { features: GeoJSON.Feature[] }) => {
    const feature = e.features[0];
    if (feature?.geometry?.type === "Polygon") {
      onCompleteRef.current(feature as GeoJSON.Feature<GeoJSON.Polygon>);
    }
    drawRef.current?.deleteAll();
  }, []);

  const draw = useControl<MapboxDraw>(
    () => {
      const instance = new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        defaultMode: "simple_select",
      });
      drawRef.current = instance;
      return instance;
    },
    ({ map }) => {
      map.on("draw.create", onCreate);
    },
    ({ map }) => {
      map.off("draw.create", onCreate);
      drawRef.current = null;
    }
  );

  useEffect(() => {
    if (!draw) return;
    drawRef.current = draw;
    if (drawMode) {
      draw.changeMode("draw_polygon");
    } else {
      draw.changeMode("simple_select");
      draw.deleteAll();
    }
  }, [draw, drawMode]);

  return null;
}
