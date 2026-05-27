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
      include: { savedMap: true },
    });
  }),

  // New: Finalize a campaign and create a ProductionJob
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

      if (campaign.status !== "PAID" && campaign.status !== "DRAFT") {
        // In real flow this would be after payment
      }

      // For now: create job with no partner assigned (ops can assign later)
      const productionJob = await ctx.prisma.productionJob.create({
        data: {
          campaignId: campaign.id,
          productionPartnerId: "", // Will be assigned by ops or auto later
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

      return { campaign, productionJob };
    }),

  // @cursor: Add getById, update, full trigger to specific partner, etc.
});
