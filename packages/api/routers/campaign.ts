import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { stripe } from "../lib/stripe";

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

  // Create Stripe Checkout Session for sending to production
  createCheckoutSession: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
      });

      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      if (campaign.status === "IN_PRODUCTION" || campaign.stripePaymentIntentId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Campaign already paid or in production" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Production for: ${campaign.name}`,
                description: `${campaign.size} postcard × ${campaign.quantity}`,
              },
              unit_amount: Math.round(Number(campaign.totalPrice) * 100), // in cents
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/production?success=true&campaignId=${campaign.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/campaigns?canceled=true`,
        metadata: {
          campaignId: campaign.id,
          userId: ctx.user.id,
        },
      });

      await ctx.prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          stripeCheckoutSessionId: session.id,
          status: "READY_FOR_PAYMENT",
        },
      });

      return { checkoutUrl: session.url };
    }),

  // This will be called by the Stripe webhook after successful payment
  markCampaignAsPaid: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        paymentIntentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
      });

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.prisma.campaign.update({
        where: { id: input.campaignId },
        data: {
          status: "PAID",
          stripePaymentIntentId: input.paymentIntentId,
          paidAt: new Date(),
          amountPaid: campaign.totalPrice,
        },
      });

      return { success: true };
    }),

  sendToProduction: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // This can remain for ops/manual use, or we can deprecate it in favor of the payment flow
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
      });

      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (campaign.status !== "PAID") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Campaign must be paid before sending to production" });
      }

      // Auto-assign logic (same as before)
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
