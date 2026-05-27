import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const mapRouter = router({
  save: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        zip: z.string(),
        routeIds: z.array(z.string()),
        totalPieces: z.number(),
        demographics: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.savedMap.create({
        data: {
          ...input,
          organizationId: ctx.user.organizationId,
        },
      });
    }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.savedMap.findMany({
      where: {
        organizationId: ctx.user.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  // @cursor: Add delete, update, etc.
});
