import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

/**
 * Admin / Operations Router (ERP-like views)
 * These procedures are only for internal staff.
 * Access is controlled via Clerk roles.
 */
export const adminRouter = router({
  // Simple role guard middleware
  _adminCheck: protectedProcedure.use(async ({ ctx, next }) => {
    const role = ctx.user.role;
    // Using Clerk org roles or custom role. For now we check the role field.
    // In production you would also check Clerk's org:admin or similar.
    if (!["ADMIN", "OPERATIONS"].includes(role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin or Operations access required",
      });
    }
    return next();
  }),

  // Get all production jobs with rich details (main ERP view)
  productionJobs: {
    list: protectedProcedure
      .input(
        z.object({
          partnerId: z.string().optional(),
          status: z.string().optional(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        return ctx.prisma.productionJob.findMany({
          where: {
            ...(input.partnerId && { productionPartnerId: input.partnerId }),
            ...(input.status && { status: input.status }),
          },
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            campaign: {
              include: {
                organization: true,
              },
            },
            productionPartner: true,
            events: {
              orderBy: { createdAt: "desc" },
              take: 5,
            },
          },
        });
      }),
  },

  // Update status + tracking number (internal operations)
  updateJobStatus: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        status: z.enum(["RECEIVED", "SENT_TO_PROVIDER", "SHIPPED", "DELIVERED"]),
        trackingNumber: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.productionJob.update({
        where: { id: input.jobId },
        data: {
          status: input.status,
          ...(input.trackingNumber && { trackingNumber: input.trackingNumber }),
        },
      });

      await ctx.prisma.jobEvent.create({
        data: {
          productionJobId: input.jobId,
          status: input.status,
          message: input.message || `Status manually updated to ${input.status}`,
          metadata: input.trackingNumber ? { trackingNumber: input.trackingNumber } : undefined,
        },
      });

      return job;
    }),

  // List all campaigns with customer info
  campaigns: {
    listAll: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.campaign.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          organization: true,
          productionJobs: {
            include: {
              productionPartner: true,
            },
          },
        },
      });
    }),
  },

  // Basic partner management view
  partners: {
    list: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.productionPartner.findMany({
        orderBy: { createdAt: "desc" },
      });
    }),
  },
});
