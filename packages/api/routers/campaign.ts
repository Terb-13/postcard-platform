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
          include: { productionPartner: true },
          take: 1,
        },
      },
    });
  }),

  // Finalize campaign and create ProductionJob (with auto-assign to first active partner)
  finalizeForProduction: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
        include: { organization: true },
      });

      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      // Find first active partner for auto-assignment
      const firstActivePartner = await ctx.prisma.productionPartner.findFirst({
        where: { active: true },
        orderBy: { createdAt: "asc" },
      });

      const productionJob = await ctx.prisma.productionJob.create({
        data: {
          campaignId: campaign.id,
          productionPartnerId: firstActivePartner?.id || "", // Auto-assign if possible
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

      // Log initial event
      if (productionJob.id) {
        await ctx.prisma.jobEvent.create({
          data: {
            productionJobId: productionJob.id,
            status: "RECEIVED",
            message: firstActivePartner 
              ? `Auto-assigned to ${firstActivePartner.name}` 
              : "Created - awaiting partner assignment",
          },
        });
      }

      return { campaign, productionJob, assignedPartner: firstActivePartner };
    }),

  // @cursor: Add getById, update, full trigger to specific partner, payment webhook trigger, etc.
});
