import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { inngest } from "../inngest/client";
import { stripe } from "../lib/stripe";

export const campaignRouter = router({
  // Create a new draft campaign
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        size: z.string(),
        quantity: z.number().int().min(100),
        dropDate: z.string().optional(), // ISO date string
      })
    )
    .mutation(async ({ input, ctx }) => {
      const dropDate = input.dropDate ? new Date(input.dropDate) : null;

      const campaign = await ctx.prisma.campaign.create({
        data: {
          organizationId: ctx.user.organizationId,
          name: input.name,
          size: input.size,
          quantity: input.quantity,
          dropDate: dropDate,
          status: "DRAFT",
        },
      });

      return campaign;
    }),

  // List my campaigns with artwork (incl. thumbnails) + production job info for timeline/preview
  getMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.campaign.findMany({
      where: {
        organizationId: ctx.user.organizationId,
      },
      orderBy: { createdAt: "desc" },
      include: {
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

      // Simple pricing example (in real app pull from config or calc)
      const unitPriceCents = 0.12 * 100; // $0.12 base example for EDDM
      const totalCents = Math.round(unitPriceCents * campaign.quantity);

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
          artwork: { include: { thumbnails: { orderBy: { page: "asc" } } } },
          productionJobs: true,
        },
      });
      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });
      }
      return campaign;
    }),
});
