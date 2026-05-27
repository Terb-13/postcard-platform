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
        productionJobs: {
          include: {
            productionPartner: true,
          },
          orderBy: { createdAt: "desc" },
          take: 3, // show recent jobs for this campaign
        },
      },
    });
  }),

  // Customer-facing action: Send this campaign to production
  sendToProduction: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
        include: { organization: true },
      });

      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      if (campaign.status === "IN_PRODUCTION") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Campaign is already in production" });
      }

      // Find first active partner for auto-assignment
      const firstActivePartner = await ctx.prisma.productionPartner.findFirst({
        where: { active: true },
        orderBy: { createdAt: "asc" },
      });

      const productionJob = await ctx.prisma.productionJob.create({
        data: {
          campaignId: campaign.id,
          productionPartnerId: firstActivePartner?.id || "",
          status: "RECEIVED",
          payload: {
            campaignName: campaign.name,
            size: campaign.size,
            quantity: campaign.quantity,
            dropDate: campaign.dropDate,
          },
        },
      });

      await ctx.prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "IN_PRODUCTION" },
      });

      if (productionJob.id) {
        await ctx.prisma.jobEvent.create({
          data: {
            productionJobId: productionJob.id,
            status: "RECEIVED",
            message: firstActivePartner
              ? `Sent to production - auto-assigned to ${firstActivePartner.name}`
              : "Sent to production - awaiting partner assignment by our team",
          },
        });
      }

      return { campaign, productionJob, assignedPartner: firstActivePartner };
    }),

  // @cursor: Add getById, update, payment webhook trigger, etc.
});
