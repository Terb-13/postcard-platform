/**
 * ZCTA polygon boundaries via US Census TIGERweb (2020 ZCTA5 layer).
 * Cached in-memory to avoid repeated ArcGIS calls.
 */

import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";

const TIGER_ZCTA_LAYER =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/PUMA_TAD_TAZ_UGA_ZCTA/MapServer/1/query";

type CacheEntry = { data: FeatureCollection; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeZcta(z: string): string {
  const digits = z.replace(/\D/g, "").slice(0, 5);
  if (digits.length !== 5) throw new Error(`Invalid ZCTA: ${z}`);
  return digits;
}

function cacheKey(kind: string, id: string): string {
  return `${kind}:${id}`;
}

function getCached(key: string): FeatureCollection | null {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  return null;
}

function setCache(key: string, data: FeatureCollection): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function tigerQuery(params: Record<string, string>): Promise<FeatureCollection> {
  const url = `${TIGER_ZCTA_LAYER}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`TIGERweb error (${res.status})`);
  }
  const data = (await res.json()) as FeatureCollection;
  return data?.features ? data : { type: "FeatureCollection", features: [] };
}

/** Fetch real ZCTA polygons for a list of zip codes */
export async function getZctaBoundaries(zctas: string[]): Promise<FeatureCollection> {
  const unique = [...new Set(zctas.map(normalizeZcta))].sort();
  if (unique.length === 0) {
    return { type: "FeatureCollection", features: [] };
  }

  const key = cacheKey("zctas", unique.join(","));
  const cached = getCached(key);
  if (cached) return cached;

  const where =
    unique.length === 1
      ? `ZCTA5='${unique[0]}'`
      : `ZCTA5 IN (${unique.map((z) => `'${z}'`).join(",")})`;

  const data = await tigerQuery({
    where,
    outFields: "ZCTA5",
    f: "geojson",
    returnGeometry: "true",
  });

  const features = data.features.map((f) => ({
    ...f,
    properties: {
      ...f.properties,
      zcta: String(f.properties?.ZCTA5 ?? f.properties?.zcta ?? "").padStart(5, "0"),
    },
  }));

  const result: FeatureCollection = { type: "FeatureCollection", features };
  setCache(key, result);
  return result;
}

/** Fetch ZCTAs intersecting a bounding box (viewport / draw envelope) */
export async function getZctasInBounds(
  bbox: [number, number, number, number],
  limit = 150
): Promise<FeatureCollection> {
  const [west, south, east, north] = bbox;
  const key = cacheKey(
    "bbox",
    `${west.toFixed(3)},${south.toFixed(3)},${east.toFixed(3)},${north.toFixed(3)}`
  );
  const cached = getCached(key);
  if (cached) return cached;

  const data = await tigerQuery({
    geometry: `${west},${south},${east},${north}`,
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "ZCTA5",
    f: "geojson",
    returnGeometry: "true",
    resultRecordCount: String(limit),
  });

  const features = data.features.map((f) => ({
    ...f,
    properties: {
      ...f.properties,
      zcta: String(f.properties?.ZCTA5 ?? "").padStart(5, "0"),
    },
  }));

  const result: FeatureCollection = { type: "FeatureCollection", features };
  setCache(key, result);
  return result;
}

/** Centroid of a polygon feature (for point-in-polygon tests) */
export function featureCentroid(
  feature: Feature<Polygon | MultiPolygon>
): [number, number] {
  const geom = feature.geometry;
  let coords: number[][] = [];

  if (geom.type === "Polygon") {
    coords = geom.coordinates[0] ?? [];
  } else if (geom.type === "MultiPolygon") {
    coords = geom.coordinates[0]?.[0] ?? [];
  }

  if (coords.length === 0) return [0, 0];

  let sx = 0;
  let sy = 0;
  const n = coords.length - 1; // exclude closing point
  for (let i = 0; i < n; i++) {
    sx += coords[i]![0]!;
    sy += coords[i]![1]!;
  }
  return [sx / n, sy / n];
}

export function featureBbox(
  feature: Feature<Polygon | MultiPolygon>
): [number, number, number, number] {
  const geom = feature.geometry;
  let coords: number[][] = [];

  if (geom.type === "Polygon") {
    coords = geom.coordinates.flat();
  } else {
    coords = geom.coordinates.flat(2);
  }

  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const c of coords) {
    const [lng, lat] = c as [number, number];
    west = Math.min(west, lng);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    north = Math.max(north, lat);
  }

  return [west, south, east, north];
}

/** Ray-casting point-in-polygon (GeoJSON polygon ring) */
function pointInRing(point: [number, number], ring: number[][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0]!;
    const yi = ring[i]![1]!;
    const xj = ring[j]![0]!;
    const yj = ring[j]![1]!;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInFeature(
  point: [number, number],
  feature: Feature<Polygon | MultiPolygon>
): boolean {
  const geom = feature.geometry;
  if (geom.type === "Polygon") {
    const [outer, ...holes] = geom.coordinates;
    if (!outer || !pointInRing(point, outer)) return false;
    return holes.every((hole) => !pointInRing(point, hole));
  }
  return geom.coordinates.some((poly) => {
    const [outer, ...holes] = poly;
    if (!outer || !pointInRing(point, outer)) return false;
    return holes.every((hole) => !pointInRing(point, hole));
  });
}

/** Find ZCTAs whose centroid falls inside a drawn polygon */
export async function findZctasInPolygon(
  polygon: Feature<Polygon>
): Promise<{ zctas: string[]; features: FeatureCollection }> {
  const bbox = featureBbox(polygon);
  const inBounds = await getZctasInBounds(bbox, 500);

  const matched = inBounds.features.filter((f) => {
    const centroid = featureCentroid(f as Feature<Polygon | MultiPolygon>);
    return pointInFeature(centroid, polygon);
  });

  const zctas = [
    ...new Set(
      matched
        .map((f) => String(f.properties?.zcta ?? f.properties?.ZCTA5 ?? ""))
        .filter((z) => z.length === 5)
    ),
  ];

  return {
    zctas,
    features: { type: "FeatureCollection", features: matched },
  };
}
