import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import {
  ensureMailingJobForCampaign,
  finalizeMailingJob,
} from "../services/mailing-finalize.service";
import { calculatePricing } from "../services/pricing.service";
import { fetchEddmRoutes } from "../services/eddm.service";

export const mailingRouter = router({
  getByCampaignId: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
        include: { mailingJob: true },
      });
      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }
      return campaign.mailingJob;
    }),

  finalize: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        runHandoff: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
      });
      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }
      return finalizeMailingJob(input.campaignId, {
        runHandoff: input.runHandoff,
      });
    }),

  calculatePricing: protectedProcedure
    .input(
      z.object({
        size: z.string(),
        quantity: z.number().int().min(0),
        productType: z.enum(["EDDM", "TARGETED"]).optional(),
        source: z.enum(["estimate", "final"]).optional(),
      })
    )
    .query(({ input }) =>
      calculatePricing({
        size: input.size,
        quantity: input.quantity,
        productType: input.productType,
        source: input.source,
      })
    ),

  eddmRoutes: protectedProcedure
    .input(
      z.object({
        zctas: z.array(z.string().min(5).max(10)).min(1).max(20),
        householdByZip: z.record(z.string(), z.number().int().min(0)).optional(),
      })
    )
    .query(async ({ input }) => fetchEddmRoutes({ zctas: input.zctas }, input.householdByZip)),
});
