import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { isAdminRole } from "../lib/roles";

/**
 * Admin / Operations Router (ERP-like views)
 * Internal staff only. Uses Clerk roles for access control.
 */
export const adminRouter = router({
  // Role guard - blocks non-admin/ops users
  _adminCheck: protectedProcedure.use(async ({ ctx, next }) => {
    if (!isAdminRole(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin or Operations access required",
      });
    }
    return next();
  }),

  // ============================================
  // PRODUCTION JOBS - Main ERP view
  // ============================================
  productionJobs: {
    list: protectedProcedure
      .input(
        z.object({
          partnerId: z.string().optional(),
          status: z.string().optional(),
          organizationId: z.string().optional(),
          search: z.string().optional(), // search campaign name or org name
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(25),
        })
      )
      .query(async ({ ctx, input }) => {
        const where: any = {};

        if (input.partnerId) where.productionPartnerId = input.partnerId;
        if (input.status) where.status = input.status;
        if (input.organizationId) {
          where.campaign = { organizationId: input.organizationId };
        }
        if (input.search) {
          where.OR = [
            { campaign: { name: { contains: input.search, mode: "insensitive" } } },
            { campaign: { organization: { name: { contains: input.search, mode: "insensitive" } } } },
          ];
        }

        const jobs = await ctx.prisma.productionJob.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
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
              take: 3,
            },
          },
        });

        let nextCursor: string | undefined = undefined;
        if (jobs.length > input.limit) {
          const nextItem = jobs.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: jobs,
          nextCursor,
        };
      }),

    // Re-assign a job to a different print partner
    reassign: protectedProcedure
      .input(
        z.object({
          jobId: z.string(),
          newPartnerId: z.string(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const job = await ctx.prisma.productionJob.findUnique({
          where: { id: input.jobId },
        });

        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        const newPartner = await ctx.prisma.productionPartner.findUnique({
          where: { id: input.newPartnerId },
        });

        if (!newPartner || !newPartner.active) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or inactive partner" });
        }

        const updated = await ctx.prisma.productionJob.update({
          where: { id: input.jobId },
          data: {
            productionPartnerId: input.newPartnerId,
            status: "RECEIVED", // Reset status when reassigning
          },
        });

        await ctx.prisma.jobEvent.create({
          data: {
            productionJobId: input.jobId,
            status: "RECEIVED",
            message: `Job reassigned to new partner. Reason: ${input.reason || "Not provided"}`,
            metadata: { previousPartnerId: job.productionPartnerId, newPartnerId: input.newPartnerId },
          },
        });

        return updated;
      }),
  },

  // ============================================
  // CAMPAIGNS - Customer order overview
  // ============================================
  campaigns: {
    listAll: protectedProcedure
      .input(
        z.object({
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(25),
          search: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const where: any = {};

        if (input.search) {
          where.OR = [
            { name: { contains: input.search, mode: "insensitive" } },
            { organization: { name: { contains: input.search, mode: "insensitive" } } },
          ];
        }

        const campaigns = await ctx.prisma.campaign.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { createdAt: "desc" },
          include: {
            organization: true,
            productionJobs: {
              include: { productionPartner: true },
              orderBy: { createdAt: "desc" },
              take: 3,
            },
          },
        });

        let nextCursor: string | undefined = undefined;
        if (campaigns.length > input.limit) {
          const nextItem = campaigns.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: campaigns,
          nextCursor,
        };
      }),
  },

  // ============================================
  // PARTNERS
  // ============================================
  partners: {
    list: protectedProcedure.query(async ({ ctx }) => {
      return ctx.prisma.productionPartner.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { jobs: true } },
        },
      });
    }),
  },

  // ============================================
  // RECENT ACTIVITY FEED (Very useful for ops)
  // ============================================
  activity: {
    recent: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(5).max(100).default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        return ctx.prisma.jobEvent.findMany({
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            productionJob: {
              include: {
                campaign: { include: { organization: true } },
                productionPartner: true,
              },
            },
          },
        });
      }),
  },
});
