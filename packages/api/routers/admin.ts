import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "../db/client";
import { requireRole } from "../lib/roles";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Basic role guard - expand as needed
  const user = await prisma.user.findUnique({
    where: { clerkId: ctx.user?.clerkId ?? "" },
  });

  if (!user || !["OWNER", "ADMIN", "OPERATIONS"].includes(user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Ops access required" });
  }

  return next({
    ctx: { ...ctx, user },
  });
});

export const adminRouter = router({
  // List production partners (for filters + reassign)
  partners: router({
    list: adminProcedure.query(async () => {
      return prisma.productionPartner.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, isActive: true },
      });
    }),
  }),

  // Production Jobs (main ERP view)
  productionJobs: router({
    list: adminProcedure
      .input(
        z.object({
          status: z.string().optional(),
          partnerId: z.string().optional(),
          search: z.string().optional(),
          cursor: z.string().optional(),
          limit: z.number().min(1).max(100).default(25),
        })
      )
      .query(async ({ input }) => {
        const { status, partnerId, search, cursor, limit } = input;

        const where: any = {};

        if (status) where.status = status;
        if (partnerId) where.productionPartnerId = partnerId;

        if (search) {
          where.OR = [
            { campaign: { name: { contains: search, mode: "insensitive" } } },
            { campaign: { organization: { name: { contains: search, mode: "insensitive" } } } },
          ];
        }

        const jobs = await prisma.productionJob.findMany({
          where,
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { createdAt: "desc" },
          include: {
            campaign: {
              include: {
                organization: { select: { id: true, name: true } },
                artwork: {
                  include: { thumbnails: { orderBy: { page: "asc" } } },
                },
              },
            },
            productionPartner: { select: { id: true, name: true } },
            events: {
              orderBy: { createdAt: "desc" },
              take: 5,
            },
          },
        });

        let nextCursor: string | undefined = undefined;
        if (jobs.length > limit) {
          const nextItem = jobs.pop();
          nextCursor = nextItem!.id;
        }

        return { items: jobs, nextCursor };
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          jobId: z.string(),
          status: z.enum(["RECEIVED", "SENT_TO_PROVIDER", "SHIPPED", "DELIVERED"]),
          trackingNumber: z.string().optional(),
          note: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const job = await prisma.productionJob.update({
          where: { id: input.jobId },
          data: {
            status: input.status,
            trackingNumber: input.trackingNumber,
            shippedAt: input.status === "SHIPPED" ? new Date() : undefined,
            deliveredAt: input.status === "DELIVERED" ? new Date() : undefined,
          },
        });

        await prisma.jobEvent.create({
          data: {
            productionJobId: job.id,
            status: input.status,
            note: input.note || `Status updated to ${input.status}`,
            actor: "ops",
          },
        });

        // If shipped, you could trigger jobShipped email here in the future
        return job;
      }),

    reassign: adminProcedure
      .input(
        z.object({
          jobId: z.string(),
          productionPartnerId: z.string(),
          note: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const job = await prisma.productionJob.update({
          where: { id: input.jobId },
          data: { productionPartnerId: input.productionPartnerId },
        });

        const partner = await prisma.productionPartner.findUnique({
          where: { id: input.productionPartnerId },
        });

        await prisma.jobEvent.create({
          data: {
            productionJobId: job.id,
            status: job.status,
            note: input.note || `Reassigned to ${partner?.name || "new partner"}`,
            actor: "ops",
          },
        });

        return job;
      }),

    addNote: adminProcedure
      .input(
        z.object({
          jobId: z.string(),
          note: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const event = await prisma.jobEvent.create({
          data: {
            productionJobId: input.jobId,
            status: "NOTE_ADDED",
            note: input.note,
            actor: "ops",
          },
        });
        return event;
      }),
  }),

  // Artwork review actions (used from JobDetailDrawer)
  artwork: router({
    review: adminProcedure
      .input(
        z.object({
          campaignId: z.string(),
          status: z.enum(["APPROVED", "REJECTED"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const artwork = await prisma.artwork.update({
          where: { campaignId: input.campaignId },
          data: {
            status: input.status,
            notes: input.notes,
            reviewedAt: new Date(),
            reviewedBy: ctx.user.id,
          },
        });

        // Log event on the job if one exists
        const job = await prisma.productionJob.findUnique({
          where: { campaignId: input.campaignId },
        });

        if (job) {
          await prisma.jobEvent.create({
            data: {
              productionJobId: job.id,
              status: input.status === "APPROVED" ? "ARTWORK_APPROVED" : "ARTWORK_REJECTED",
              note: input.notes || `Artwork ${input.status.toLowerCase()}`,
              actor: "ops",
            },
          });
        }

        // TODO: Trigger Resend artworkRejected email when status === "REJECTED"

        return artwork;
      }),
  }),

  // Global recent activity feed
  activity: router({
    recent: adminProcedure
      .input(z.object({ limit: z.number().default(15) }))
      .query(async ({ input }) => {
        return prisma.jobEvent.findMany({
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            productionJob: {
              include: {
                campaign: {
                  include: { organization: { select: { name: true } } },
                },
              },
            },
          },
        });
      }),
  }),

  // Campaigns (for ops overview if needed)
  campaigns: router({
    listAll: adminProcedure
      .input(
        z.object({
          cursor: z.string().optional(),
          limit: z.number().default(20),
        })
      )
      .query(async ({ input }) => {
        // Basic implementation - expand later
        return prisma.campaign.findMany({
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { createdAt: "desc" },
          include: {
            organization: true,
            artwork: true,
          },
        });
      }),
  }),
});
