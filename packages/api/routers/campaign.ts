import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { protectedProcedure, campaignProcedure, assertCampaignAccess, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { inngest } from "../inngest/client";
import { stripe } from "../lib/stripe";
import { getACSStats } from "../lib/census";
import { mapCensusError } from "../lib/census-errors";
import { calculateCampaignPricing } from "../lib/pricing";
import { claimGuestCampaigns } from "../lib/claim-guest-campaigns";
import { isValidGuestSessionId } from "../lib/guest-org";
import { createTestOrderForOrganization } from "../lib/test-order";
import { isTestOrdersEnabled } from "../lib/activate-order-for-production";
import { trackingForCampaign } from "../lib/order-tracking-helpers";

async function loadTargetingStats(zctas: string[]) {
  try {
    return await getACSStats(zctas);
  } catch (err) {
    mapCensusError(err);
  }
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
  create: campaignProcedure
    .input(
      z.object({
        name: z.string().min(1),
        size: z.string(),
        quantity: z.number().int().min(100).optional(),
        productType: z.enum(["EDDM", "TARGETED"]).optional(),
        productSlug: z.string().optional(),
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
            organizationId: ctx.organizationId,
            name: input.targeting.savedMapName ?? `${input.name} targeting`,
            geoJson,
            metadata: targetingMetadata,
          },
        });
        savedMapId = savedMap.id;
      }

      const campaign = await ctx.prisma.campaign.create({
        data: {
          organizationId: ctx.organizationId,
          guestSessionId: ctx.user ? null : ctx.guestSessionId,
          name: input.name,
          size: input.size,
          productType: input.productType ?? "EDDM",
          productSlug: input.productSlug ?? null,
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

      return campaign;
    }),

  // Update draft campaign during wizard (before payment)
  updateDraft: campaignProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        size: z.string().optional(),
        productType: z.enum(["EDDM", "TARGETED"]).optional(),
        productSlug: z.string().optional(),
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

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }
      assertCampaignAccess(existing, ctx);
      if (existing.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft campaigns can be updated",
        });
      }

      const data: Prisma.CampaignUpdateInput = {};
      if (input.name != null) data.name = input.name;
      if (input.size != null) data.size = input.size;
      if (input.productType != null) data.productType = input.productType;
      if (input.productSlug !== undefined) data.productSlug = input.productSlug;
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
              organizationId: ctx.organizationId,
              name: input.targeting.savedMapName ?? `${existing.name} targeting`,
              geoJson,
              metadata: targetingMeta,
            },
          });
          data.savedMap = { connect: { id: savedMap.id } };
        }
      }

      return ctx.prisma.campaign.update({
        where: { id: input.id },
        data,
      });
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

  /** After sign-in, attach guest wizard campaigns to the user's organization. */
  claimGuestCampaigns: protectedProcedure
    .input(z.object({ guestSessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!isValidGuestSessionId(input.guestSessionId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid guest session id",
        });
      }

      return claimGuestCampaigns(
        ctx.prisma,
        input.guestSessionId.trim(),
        ctx.user.organizationId
      );
    }),

  /** Paid orders with customer-facing tracking summary (list + cards). */
  getOrderHistory: protectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.campaign.findMany({
      where: {
        organizationId: ctx.user.organizationId,
        status: { in: ["PAID", "IN_PRODUCTION", "COMPLETED"] },
      },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        size: true,
        quantity: true,
        productType: true,
        productSlug: true,
        status: true,
        paidAt: true,
        amountPaidCents: true,
        totalPriceCents: true,
        purchaserEmail: true,
        dropDate: true,
        createdAt: true,
        artwork: { select: { status: true } },
        productionJobs: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            trackingNumber: true,
            shippedAt: true,
            deliveredAt: true,
            productionPartner: { select: { name: true } },
            events: {
              orderBy: { createdAt: "desc" },
              take: 3,
              select: { id: true, status: true, note: true, createdAt: true },
            },
          },
        },
      },
    });

    return orders.map((order) => ({
      ...order,
      tracking: trackingForCampaign(order),
    }));
  }),

  /** Full order + production timeline (customer order detail page). */
  getOrderDetail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.user.organizationId,
          status: { in: ["PAID", "IN_PRODUCTION", "COMPLETED"] },
        },
        include: {
          savedMap: true,
          artwork: {
            include: { thumbnails: { orderBy: { page: "asc" } } },
          },
          mailingJob: true,
          productionJobs: {
            include: {
              productionPartner: { select: { id: true, name: true, contactEmail: true } },
              events: { orderBy: { createdAt: "desc" } },
            },
          },
        },
      });

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      return {
        ...campaign,
        tracking: trackingForCampaign(campaign),
      };
    }),

  /** Lightweight poll endpoint for order detail pages (same payload as getOrderDetail). */
  getOrderTracking: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.user.organizationId,
          status: { in: ["PAID", "IN_PRODUCTION", "COMPLETED"] },
        },
        select: {
          id: true,
          status: true,
          paidAt: true,
          artwork: { select: { status: true } },
          productionJobs: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              status: true,
              trackingNumber: true,
              shippedAt: true,
              deliveredAt: true,
              productionPartner: { select: { name: true } },
              events: {
                orderBy: { createdAt: "desc" },
                select: { id: true, status: true, note: true, createdAt: true },
              },
            },
          },
        },
      });

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      return {
        campaignId: campaign.id,
        tracking: trackingForCampaign(campaign),
      };
    }),

  /** Dev/demo: simulate paid order + production job without Stripe. */
  createTestOrder: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().optional(),
        name: z.string().optional(),
        simulateShipped: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return createTestOrderForOrganization(ctx.prisma, ctx.user.organizationId, input);
    }),

  canCreateTestOrder: protectedProcedure.query(() => isTestOrdersEnabled()),

  // Upload or replace artwork for a campaign. Client sends pageCount for instant feedback.
  uploadArtwork: campaignProcedure
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

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }
      assertCampaignAccess(campaign, ctx);

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
  createCheckoutSession: campaignProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
        include: { artwork: true },
      });

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }
      assertCampaignAccess(campaign, ctx);
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
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/campaigns/new?campaignId=${campaign.id}&step=4`,
        ...(ctx.user?.email ? { customer_email: ctx.user.email } : {}),
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
          organizationId: ctx.organizationId,
          ...(ctx.guestSessionId ? { guestSessionId: ctx.guestSessionId } : {}),
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
  getById: campaignProcedure
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
      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });
      }
      assertCampaignAccess(campaign, ctx);
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
