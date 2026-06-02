import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Feature, Polygon } from "geojson";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import { audienceEstimateFromStats, getACSStats, PLACEHOLDER_RATE_CENTS } from "../lib/census";
import { mapCensusError } from "../lib/census-errors";
import { calculateCampaignPricing } from "../lib/pricing";
import {
  getZctaBoundaries,
  getZctasInBounds,
  findZctasInPolygon,
  featureCentroid,
} from "../lib/zcta-boundaries";

const filtersSchema = z
  .object({
    minIncome: z.number().optional(),
    maxIncome: z.number().optional(),
    minMoverPercent: z.number().optional(),
  })
  .optional();

const zctaArraySchema = z.array(z.string().min(5).max(10)).max(50);

const geoJsonPolygonSchema = z
  .object({
    type: z.literal("Feature"),
    geometry: z.object({
      type: z.literal("Polygon"),
      coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
    }),
    properties: z.record(z.unknown()).optional(),
  })
  .optional();

type ACSStats = Awaited<ReturnType<typeof getACSStats>>;

/** Household reach for one ZCTA after audience filters (income / movers). */
function filteredHouseholdsForZcta(
  z: ACSStats["zctas"][0],
  filters: z.infer<typeof filtersSchema>
): number {
  let households = z.households;

  if (filters.minIncome != null) {
    if (z.income75kPlusShare != null) {
      households = Math.round(households * z.income75kPlusShare);
    } else if (z.medianIncome == null || z.medianIncome < filters.minIncome) {
      return 0;
    }
  }

  if (filters.maxIncome != null && (z.medianIncome == null || z.medianIncome > filters.maxIncome)) {
    return 0;
  }

  if (filters.minMoverPercent != null) {
    if (z.moverPercent == null || z.moverPercent < filters.minMoverPercent) {
      return 0;
    }
    households = Math.round(households * (z.moverPercent / 100));
  }

  return households;
}

function applyFilters(stats: ACSStats, filters?: z.infer<typeof filtersSchema>): ACSStats {
  if (!filters) return stats;

  const filtered = stats.zctas.filter((z) => {
    if (filters.minIncome != null) {
      if (z.income75kPlusShare != null) {
        if (z.income75kPlusShare <= 0) return false;
      } else if (z.medianIncome == null || z.medianIncome < filters.minIncome) {
        return false;
      }
    }
    if (filters.maxIncome != null && (z.medianIncome == null || z.medianIncome > filters.maxIncome)) {
      return false;
    }
    if (
      filters.minMoverPercent != null &&
      (z.moverPercent == null || z.moverPercent < filters.minMoverPercent)
    ) {
      return false;
    }
    return filteredHouseholdsForZcta(z, filters) > 0;
  });

  const population = filtered.reduce((s, r) => s + r.population, 0);
  const households = filtered.reduce((s, r) => s + filteredHouseholdsForZcta(r, filters), 0);
  const incomes = filtered.map((r) => r.medianIncome).filter((n): n is number => n != null);
  const movers = filtered.map((r) => r.moverPercent).filter((n): n is number => n != null);

  return {
    zctaCount: filtered.length,
    population,
    households,
    avgMedianIncome:
      incomes.length > 0 ? Math.round(incomes.reduce((a, b) => a + b, 0) / incomes.length) : null,
    avgMoverPercent:
      movers.length > 0
        ? Math.round((movers.reduce((a, b) => a + b, 0) / movers.length) * 10) / 10
        : null,
    zctas: filtered,
  };
}

function reachFromStats(stats: ACSStats): number {
  return stats.households > 0 ? stats.households : stats.population;
}

/** Shared response shape: demographics + reach + $0.35/piece cost preview */
function censusStatsResponse(
  stats: ACSStats,
  options: { size?: string; quantityOverride?: number } = {}
) {
  const reach = reachFromStats(stats);
  const pricing = calculateCampaignPricing({
    size: options.size ?? "6x11",
    estimatedReach: reach,
    quantityOverride: options.quantityOverride,
  });

  return {
    reach,
    population: stats.population,
    households: stats.households,
    avgMedianIncome: stats.avgMedianIncome,
    avgMoverPercent: stats.avgMoverPercent,
    zctaCount: stats.zctaCount,
    zctas: stats.zctas,
    pricing,
    /** Placeholder unit rate used when POSTCARD_BASE_RATE_CENTS is unset */
    placeholderRateCents: PLACEHOLDER_RATE_CENTS,
  };
}

async function resolveZctasFromGeoJson(geoJson: unknown): Promise<string[]> {
  const parsed = geoJsonPolygonSchema.safeParse(geoJson);
  if (!parsed.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "geoJson must be a GeoJSON Feature with Polygon geometry when zctas are omitted",
    });
  }

  const result = await findZctasInPolygon(parsed.data as Feature<Polygon>);
  return result.zctas;
}

export const targetingRouter = router({
  /** ACS demographics + reach + cost preview for a list of ZCTAs */
  getCensusStatsForZctas: publicProcedure
    .input(
      z.object({
        zctas: zctaArraySchema,
        filters: filtersSchema,
        size: z.string().default("6x11"),
      })
    )
    .query(async ({ input }) => {
      try {
        const rawStats = await getACSStats(input.zctas);
        const stats = applyFilters(rawStats, input.filters);
        return censusStatsResponse(stats, { size: input.size });
      } catch (err) {
        mapCensusError(err);
      }
    }),

  /** @deprecated Prefer getCensusStatsForZctas */
  getStatsForZctas: publicProcedure
    .input(
      z.object({
        zctas: zctaArraySchema,
        filters: filtersSchema,
      })
    )
    .query(async ({ input }) => {
      try {
        const stats = await getACSStats(input.zctas);
        return applyFilters(stats, input.filters);
      } catch (err) {
        mapCensusError(err);
      }
    }),

  estimateAudienceFromZctas: publicProcedure
    .input(
      z.object({
        zctas: zctaArraySchema,
        filters: filtersSchema,
        size: z.string().default("6x11"),
        quantityOverride: z.number().int().min(100).optional(),
        baseRateCentsPerPiece: z.number().int().min(1).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const rawStats = await getACSStats(input.zctas);
        const stats = applyFilters(rawStats, input.filters);
        return audienceEstimateFromStats(stats, {
          size: input.size,
          quantityOverride: input.quantityOverride,
          baseRateCentsPerPiece: input.baseRateCentsPerPiece,
        });
      } catch (err) {
        mapCensusError(err);
      }
    }),

  /** Campaign wizard — audience + pricing preview from ZCTAs and/or drawn geoJson */
  estimateAudience: publicProcedure
    .input(
      z.object({
        zctas: zctaArraySchema.optional(),
        geoJson: z.any().optional(),
        filters: filtersSchema,
        size: z.string().default("6x11"),
        quantityOverride: z.number().int().min(100).optional(),
      })
    )
    .query(async ({ input }) => {
      let zctas = input.zctas ?? [];

      if (zctas.length === 0 && input.geoJson) {
        try {
          zctas = await resolveZctasFromGeoJson(input.geoJson);
        } catch (err) {
          if (err instanceof TRPCError) throw err;
          mapCensusError(err);
        }
      }

      if (zctas.length === 0) {
        return {
          ...censusStatsResponse(
            {
              zctaCount: 0,
              population: 0,
              households: 0,
              avgMedianIncome: null,
              avgMoverPercent: null,
              zctas: [],
            },
            { size: input.size, quantityOverride: input.quantityOverride }
          ),
          geoJson: input.geoJson ?? null,
        };
      }

      try {
        const rawStats = await getACSStats(zctas);
        const stats = applyFilters(rawStats, input.filters);
        return {
          ...censusStatsResponse(stats, {
            size: input.size,
            quantityOverride: input.quantityOverride,
          }),
          geoJson: input.geoJson ?? null,
        };
      } catch (err) {
        mapCensusError(err);
      }
    }),

  /** Geocode zip suggestions via Mapbox (server-side to keep token optional on client) */
  searchZips: publicProcedure
    .input(z.object({ query: z.string().min(2).max(20) }))
    .query(async ({ input }) => {
      const token = process.env.MAPBOX_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        return { features: [] as { zcta: string; placeName: string; center: [number, number] }[] };
      }

      const params = new URLSearchParams({
        access_token: token,
        types: "postcode",
        country: "us",
        limit: "8",
        autocomplete: "true",
      });

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input.query)}.json?${params}`;
      const res = await fetch(url);
      if (!res.ok) return { features: [] };

      const data = (await res.json()) as {
        features?: {
          place_name: string;
          center: [number, number];
          text: string;
          context?: { id: string; text: string }[];
        }[];
      };

      const features =
        data.features?.map((f) => ({
          zcta: f.text.replace(/\D/g, "").slice(0, 5),
          placeName: f.place_name,
          center: f.center,
        })) ?? [];

      return { features: features.filter((f) => f.zcta.length === 5) };
    }),

  /** Real ZCTA polygon boundaries (Census TIGERweb) */
  getZctaBoundaries: publicProcedure
    .input(z.object({ zctas: zctaArraySchema }))
    .query(async ({ input }) => {
      try {
        return await getZctaBoundaries(input.zctas);
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        const message =
          err instanceof Error ? err.message : "Failed to load ZIP boundaries from Census TIGERweb";
        throw new TRPCError({ code: "BAD_GATEWAY", message, cause: err });
      }
    }),

  /** ZCTAs visible in map viewport */
  getZctasInBounds: publicProcedure
    .input(
      z.object({
        bbox: z
          .tuple([z.number(), z.number(), z.number(), z.number()])
          .refine(
            ([west, south, east, north]) =>
              west < east &&
              south < north &&
              west >= -180 &&
              east <= 180 &&
              south >= -90 &&
              north <= 90,
            { message: "Invalid map bounding box" }
          ),
        limit: z.number().int().min(1).max(200).default(120),
      })
    )
    .query(async ({ input }) => {
      const bbox = input.bbox as [number, number, number, number];
      return getZctasInBounds(bbox, input.limit);
    }),

  /** ZCTAs inside a drawn polygon (lasso) */
  findZctasInPolygon: publicProcedure
    .input(
      z.object({
        polygon: z.object({
          type: z.literal("Feature"),
          geometry: z.object({
            type: z.literal("Polygon"),
            coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
          }),
          properties: z.record(z.unknown()).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const result = await findZctasInPolygon(
        input.polygon as Parameters<typeof findZctasInPolygon>[0]
      );
      const centroids = result.features.features.map((f) => {
        const c = featureCentroid(f as Parameters<typeof featureCentroid>[0]);
        const zcta = String(f.properties?.zcta ?? "");
        return { zcta, center: c as [number, number], placeName: `ZCTA ${zcta}` };
      });
      return { zctas: result.zctas, centroids };
    }),
});
