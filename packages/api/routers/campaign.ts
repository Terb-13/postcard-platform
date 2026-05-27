import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const campaignRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        size: z.string(),
        quantity: z.number().min(100),
        savedMapId: z.string().optional(),
        dropDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.create({
        data: {
          name: input.name,
          size: input.size,
          quantity: input.quantity,
          organizationId: ctx.user.organizationId,
          savedMapId: input.savedMapId ?? null,
          dropDate: input.dropDate ? new Date(input.dropDate) : null,
          status: "DRAFT",
        },
      });

      return campaign;
    }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.campaign.findMany({
      where: {
        organizationId: ctx.user.organizationId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        savedMap: true,
        artwork: true,
        productionJobs: {
          include: { productionPartner: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  }),

  // Upload or replace artwork for a campaign
  uploadArtwork: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        fileUrl: z.string(),
        fileName: z.string(),
        fileSize: z.number().optional(),
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
          status: "UPLOADED",
          prompt: null,
        },
        create: {
          campaignId: input.campaignId,
          fileUrl: input.fileUrl,
          fileName: input.fileName,
          fileSize: input.fileSize,
          status: "UPLOADED",
        },
      });

      return artwork;
    }),

  sendToProduction: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
      });

      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      if (campaign.status === "IN_PRODUCTION") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already in production" });
      }

      const firstActivePartner = await ctx.prisma.productionPartner.findFirst({
        where: { active: true },
        orderBy: { createdAt: "asc" },
      });

      const productionJob = await ctx.prisma.productionJob.create({
        data: {
          campaignId: campaign.id,
          productionPartnerId: firstActivePartner?.id || "",
          status: "RECEIVED",
          payload: {},
        },
      });

      await ctx.prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "IN_PRODUCTION" },
      });

      return { success: true, productionJob };
    }),
});
