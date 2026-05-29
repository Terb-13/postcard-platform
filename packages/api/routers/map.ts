import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const mapRouter = router({
  save: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        zip: z.string().optional(),
        routeIds: z.array(z.string()).optional(),
        totalPieces: z.number().optional(),
        demographics: z.any().optional(),
        geoJson: z.any(), // Required by Prisma schema
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.savedMap.create({
        data: {
          name: input.name,
          geoJson: input.geoJson,
          organizationId: ctx.user.organizationId,
          metadata: {
            zip: input.zip,
            routeIds: input.routeIds,
            totalPieces: input.totalPieces,
            demographics: input.demographics,
          },
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
