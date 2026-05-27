import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

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
      orderBy: {
        createdAt: "desc",
      },
      include: {
        savedMap: true,
      },
    });
  }),

  // @cursor: Add getById, update, triggerProduction, etc.
});
