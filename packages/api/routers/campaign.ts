import { z } from "zod";
import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { inngest } from "../inngest/client";
import { stripe } from "../lib/stripe";
import { getACSStats } from "../lib/census";
import { mapCensusError } from "../lib/census-errors";
import { calculateCampaignPricing } from "../lib/pricing";

async function loadTargetingStats(zctas: string[]) {
  try {
    return await getACSStats(zctas);
  } catch (err) {
    mapCensusError(err);
  }
}

type TargetingCriteriaSnapshot = {
  geoJson: Prisma.InputJsonValue;
  filters?: Prisma.InputJsonValue;
  estimatedReach: number;
  estimatedCostCents: number;
};

async function upsertTargetingCriteria(
  prisma: PrismaClient,
  campaignId: string,
  snapshot: TargetingCriteriaSnapshot
) {
  const estimatedCost = snapshot.estimatedCostCents / 100;

  await prisma.targetingCriteria.upsert({
    where: { campaignId },
    create: {
      campaignId,
      geoJson: snapshot.geoJson,
      filters: snapshot.filters ?? undefined,
      estimatedReach: snapshot.estimatedReach,
      estimatedCost,
    },
    update: {
      geoJson: snapshot.geoJson,
      filters: snapshot.filters ?? undefined,
      estimatedReach: snapshot.estimatedReach,
      estimatedCost,
    },
  });
}

function buildTargetingCriteriaSnapshot(
  targeting: {
    zctas: string[];
    geoJson?: unknown;
    filters?: unknown;
  },
  reach: number,
  totalPriceCents: number
): TargetingCriteriaSnapshot {
  const geoJson = (targeting.geoJson ?? {
    type: "FeatureCollection",
    features: targeting.zctas.map((z) => ({
      type: "Feature",
      properties: { zcta: z },
      geometry: null,
    })),
  }) as Prisma.InputJsonValue;

  return {
    geoJson,
    filters: targeting.filters as Prisma.InputJsonValue | undefined,
    estimatedReach: reach,
    estimatedCostCents: totalPriceCents,
  };
}

const targetingInputSchema = z
  .object({
    zctas: z.array(z.string()).min(1).max(50),
    geoJson: z.any().optional(),
    filters: z
      .object({
        minIncome: z.number().optional(),
        maxIncome: z.number().optional(),
        minMoverPercent: z.number().optional(),
      })
      .optional(),
    quantityOverride: z.number().int().min(100).optional(),
    savedMapName: z.string().optional(),
  })
  .optional();

export const campaignRouter = router({
  // Create a new draft campaign (optionally with Census targeting)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        size: z.string(),
        quantity: z.number().int().min(100).optional(),
        dropDate: z.string().optional(), // ISO date string
        notes: z.string().optional(),
        targeting: targetingInputSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const dropDate = input.dropDate ? new Date(input.dropDate) : null;

      let quantity = input.quantity ?? 500;
      let unitPriceCents: number | undefined;
      let totalPriceCents: number | undefined;
      let targetingMetadata: Prisma.InputJsonValue | undefined;
      let savedMapId: string | undefined;

      if (input.targeting?.zctas?.length) {
        const stats = await loadTargetingStats(input.targeting.zctas);
        const reach = stats.households > 0 ? stats.households : stats.population;
        const pricing = calculateCampaignPricing({
          size: input.size,
          estimatedReach: reach,
          quantityOverride: input.targeting.quantityOverride,
        });

        quantity = pricing.quantity;
        unitPriceCents = pricing.unitPriceCents;
        totalPriceCents = pricing.totalPriceCents;

        targetingMetadata = {
          zctas: input.targeting.zctas,
          filters: input.targeting.filters,
          estimate: {
            reach,
            households: stats.households,
            population: stats.population,
            avgMedianIncome: stats.avgMedianIncome,
            avgMoverPercent: stats.avgMoverPercent,
            zctaCount: stats.zctaCount,
          },
          pricing,
        };

        const geoJson = input.targeting.geoJson ?? {
          type: "FeatureCollection",
          features: input.targeting.zctas.map((z) => ({
            type: "Feature",
            properties: { zcta: z },
            geometry: null,
          })),
        };

        const savedMap = await ctx.prisma.savedMap.create({
          data: {
            organizationId: ctx.user.organizationId,
            name: input.targeting.savedMapName ?? `${input.name} targeting`,
            geoJson,
            metadata: targetingMetadata,
          },
        });
        savedMapId = savedMap.id;
      }

      const campaign = await ctx.prisma.campaign.create({
        data: {
          organizationId: ctx.user.organizationId,
          name: input.name,
          size: input.size,
          quantity,
          dropDate,
          notes: input.notes,
          status: "DRAFT",
          savedMapId,
          targetingMetadata,
          unitPriceCents,
          totalPriceCents,
        },
      });

      if (input.targeting?.zctas?.length && totalPriceCents != null) {
        const reach =
          (targetingMetadata as { estimate?: { reach?: number } } | undefined)?.estimate
            ?.reach ?? quantity;
        await upsertTargetingCriteria(
          ctx.prisma,
          campaign.id,
          buildTargetingCriteriaSnapshot(
            {
              zctas: input.targeting.zctas,
              geoJson: input.targeting.geoJson,
              filters: input.targeting.filters,
            },
            reach,
            totalPriceCents
          )
        );
      }

      return campaign;
    }),

  // Update draft campaign during wizard (before payment)
  updateDraft: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        size: z.string().optional(),
        quantity: z.number().int().min(100).optional(),
        dropDate: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        targeting: targetingInputSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.prisma.campaign.findUnique({
        where: { id: input.id },
      });

      if (!existing || existing.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }
      if (existing.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft campaigns can be updated",
        });
      }

      const data: Prisma.CampaignUpdateInput = {};
      if (input.name != null) data.name = input.name;
      if (input.size != null) data.size = input.size;
      if (input.quantity != null) data.quantity = input.quantity;
      if (input.dropDate !== undefined) {
        data.dropDate = input.dropDate ? new Date(input.dropDate) : null;
      }
      if (input.notes !== undefined) data.notes = input.notes;

      if (input.targeting?.zctas?.length) {
        const stats = await loadTargetingStats(input.targeting.zctas);
        const reach = stats.households > 0 ? stats.households : stats.population;
        const pricing = calculateCampaignPricing({
          size: (input.size ?? existing.size) as string,
          estimatedReach: reach,
          quantityOverride: input.targeting.quantityOverride,
        });

        data.quantity = pricing.quantity;
        data.unitPriceCents = pricing.unitPriceCents;
        data.totalPriceCents = pricing.totalPriceCents;
        const targetingMeta: Prisma.InputJsonValue = {
          zctas: input.targeting.zctas,
          filters: input.targeting.filters,
          estimate: {
            reach,
            households: stats.households,
            population: stats.population,
            avgMedianIncome: stats.avgMedianIncome,
            avgMoverPercent: stats.avgMoverPercent,
            zctaCount: stats.zctaCount,
          },
          pricing,
        };
        data.targetingMetadata = targetingMeta;

        const geoJson = (input.targeting.geoJson ?? {
          type: "FeatureCollection",
          features: input.targeting.zctas.map((z) => ({
            type: "Feature",
            properties: { zcta: z },
            geometry: null,
          })),
        }) as Prisma.InputJsonValue;

        if (existing.savedMapId) {
          await ctx.prisma.savedMap.update({
            where: { id: existing.savedMapId },
            data: {
              geoJson,
              metadata: targetingMeta,
            },
          });
        } else {
          const savedMap = await ctx.prisma.savedMap.create({
            data: {
              organizationId: ctx.user.organizationId,
              name: input.targeting.savedMapName ?? `${existing.name} targeting`,
              geoJson,
              metadata: targetingMeta,
            },
          });
          data.savedMap = { connect: { id: savedMap.id } };
        }
      }

      const updated = await ctx.prisma.campaign.update({
        where: { id: input.id },
        data,
      });

      if (input.targeting?.zctas?.length) {
        const reach =
          (
            (data.targetingMetadata ?? existing.targetingMetadata) as {
              estimate?: { reach?: number };
            } | null
          )?.estimate?.reach ?? updated.quantity;
        const totalCents = updated.totalPriceCents ?? existing.totalPriceCents ?? 0;

        await upsertTargetingCriteria(
          ctx.prisma,
          input.id,
          buildTargetingCriteriaSnapshot(
            {
              zctas: input.targeting.zctas,
              geoJson: input.targeting.geoJson,
              filters: input.targeting.filters,
            },
            reach,
            totalCents
          )
        );
      }

      return updated;
    }),

  // List my campaigns with artwork (incl. thumbnails) + production job info for timeline/preview
  getMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.campaign.findMany({
      where: {
        organizationId: ctx.user.organizationId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        savedMap: true,
        artwork: {
          include: {
            thumbnails: {
              orderBy: { page: "asc" },
            },
          },
        },
        productionJobs: {
          include: {
            productionPartner: {
              select: { id: true, name: true },
            },
            events: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
      },
    });
  }),

  // Upload or replace artwork for a campaign. Client sends pageCount for instant feedback.
  uploadArtwork: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        fileUrl: z.string(),
        fileName: z.string(),
        fileSize: z.number().optional(),
        pageCount: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
      });

      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      const artwork = await ctx.prisma.artwork.upsert({
        where: { campaignId: input.campaignId },
        update: {
          fileUrl: input.fileUrl,
          fileName: input.fileName,
          fileSize: input.fileSize,
          pageCount: input.pageCount,
          status: "UPLOADED",
          thumbnailUrl: null,
          notes: null, // clear previous rejection notes on re-upload
          reviewedAt: null,
          reviewedBy: null,
        },
        create: {
          campaignId: input.campaignId,
          fileUrl: input.fileUrl,
          fileName: input.fileName,
          fileSize: input.fileSize,
          pageCount: input.pageCount,
          status: "UPLOADED",
        },
      });

      // Fire background thumbnail generation (populates ArtworkThumbnail rows)
      await inngest.send({
        name: "artwork/uploaded",
        data: {
          artworkId: artwork.id,
          fileUrl: input.fileUrl,
        },
      });

      return artwork;
    }),

  // Mark campaign ready and create Stripe Checkout session
  createCheckoutSession: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
        include: { artwork: true },
      });

      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }
      if (!campaign.artwork || campaign.artwork.status !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Artwork must be approved by our team before payment",
        });
      }

      const unitPriceCents =
        campaign.unitPriceCents ??
        calculateCampaignPricing({
          size: campaign.size,
          estimatedReach: campaign.quantity,
        }).unitPriceCents;
      const totalCents =
        campaign.totalPriceCents ?? Math.round(unitPriceCents * campaign.quantity);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/production/success?session_id={CHECKOUT_SESSION_ID}&campaignId=${campaign.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/campaigns`,
        customer_email: ctx.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Postcard Campaign: ${campaign.name}`,
                description: `${campaign.quantity} × ${campaign.size} postcards (EDDM)`,
              },
              unit_amount: totalCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          campaignId: campaign.id,
          organizationId: ctx.user.organizationId,
        },
      });

      await ctx.prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          status: "READY_FOR_PAYMENT",
          stripeSessionId: session.id,
          totalPriceCents: totalCents,
        },
      });

      return { url: session.url };
    }),

  // After successful payment (or manual), finalize and send to production queue
  // (webhook usually does the heavy lifting; this is a fallback/manual trigger)
  finalizeForProduction: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
      });
      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      // In production the Stripe webhook does: mark PAID + create ProductionJob + auto-assign
      // Here we just ensure status
      const updated = await ctx.prisma.campaign.update({
        where: { id: input.campaignId },
        data: { status: "PAID" },
      });
      return updated;
    }),

  // Simple get one (for detail pages if needed later)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.id },
        include: {
          savedMap: true,
          artwork: { include: { thumbnails: { orderBy: { page: "asc" } } } },
          productionJobs: true,
        },
      });
      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });
      }
      return campaign;
    }),

  // xAI powered concept generation
  generateConcepts: protectedProcedure
    .input(z.object({ prompt: z.string().min(10) }))
    .mutation(async ({ input }) => {
      const { generatePostcardConcepts } = await import("@postcard-platform/ai/xai");
      const result = await generatePostcardConcepts(input.prompt);
      return { result };
    }),
});
