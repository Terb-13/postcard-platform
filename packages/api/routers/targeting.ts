import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import {
  CensusConfigError,
  audienceEstimateFromStats,
  getACSStats,
} from "../lib/census";
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

function mapCensusError(err: unknown): never {
  if (err instanceof CensusConfigError) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: err.message });
  }
  if (err instanceof TRPCError) {
    throw err;
  }
  if (err instanceof Error) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: err.message,
      cause: err,
    });
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Unexpected error loading Census data",
  });
}

function applyFilters(
  stats: Awaited<ReturnType<typeof getACSStats>>,
  filters?: z.infer<typeof filtersSchema>
) {
  if (!filters) return stats;

  const filtered = stats.zctas.filter((z) => {
    if (filters.minIncome != null && (z.medianIncome == null || z.medianIncome < filters.minIncome)) {
      return false;
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
    return true;
  });

  const population = filtered.reduce((s, r) => s + r.population, 0);
  const households = filtered.reduce((s, r) => s + r.households, 0);
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

export const targetingRouter = router({
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

  /** Campaign wizard — authenticated audience + pricing preview */
  estimateAudience: protectedProcedure
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
      const zctas = input.zctas ?? [];

      if (zctas.length === 0) {
        return {
          reach: 0,
          households: 0,
          population: 0,
          avgMedianIncome: null,
          avgMoverPercent: null,
          zctaCount: 0,
          zctas: [] as Awaited<ReturnType<typeof getACSStats>>["zctas"],
          pricing: calculateCampaignPricing({
            size: input.size,
            estimatedReach: 0,
            quantityOverride: input.quantityOverride,
          }),
          geoJson: input.geoJson ?? null,
        };
      }

      try {
        const rawStats = await getACSStats(zctas);
        const stats = applyFilters(rawStats, input.filters);
        const reach = stats.households > 0 ? stats.households : stats.population;
        const pricing = calculateCampaignPricing({
          size: input.size,
          estimatedReach: reach,
          quantityOverride: input.quantityOverride,
        });

        return {
          reach,
          households: stats.households,
          population: stats.population,
          avgMedianIncome: stats.avgMedianIncome,
          avgMoverPercent: stats.avgMoverPercent,
          zctaCount: stats.zctaCount,
          zctas: stats.zctas,
          pricing,
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
      return getZctaBoundaries(input.zctas);
    }),

  /** ZCTAs visible in map viewport */
  getZctasInBounds: publicProcedure
    .input(
      z.object({
        bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
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
