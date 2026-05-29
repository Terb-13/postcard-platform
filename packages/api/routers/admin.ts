import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@postcard-platform/db/client";

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
  // Production partners management
  partners: router({
    list: adminProcedure.query(async () => {
      return prisma.productionPartner.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, isActive: true, apiKey: true, contactEmail: true, createdAt: true },
      });
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          contactEmail: z.string().email().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Generate a secure API key for the partner
        const apiKey = `ppk_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

        const partner = await prisma.productionPartner.create({
          data: {
            name: input.name,
            contactEmail: input.contactEmail,
            apiKey,
            isActive: true,
          },
        });

        return partner;
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
                savedMap: { select: { id: true, name: true, metadata: true } },
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

        // Send shipped email
        if (input.status === "SHIPPED" && input.trackingNumber) {
          const campaign = await prisma.campaign.findUnique({
            where: { id: job.campaignId },
            include: { organization: true },
          });
          const user = campaign
            ? await prisma.user.findFirst({
                where: { organizationId: campaign.organizationId },
                orderBy: { createdAt: "asc" },
              })
            : null;

          if (user?.email) {
            const { sendEmail, emailTemplates } = await import("../lib/email");
            const template = emailTemplates.jobShipped(campaign!.name, input.trackingNumber);
            await sendEmail({ to: user.email, subject: template.subject, html: template.html });
          }
        }

        return job;
      }),

    reassign: adminProcedure
      .input(
        z.object({
          jobId: z.string(),
          productionPartnerId: z.string().optional(),
          newPartnerId: z.string().optional(),
          note: z.string().optional(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const partnerId = input.productionPartnerId || input.newPartnerId;
        if (!partnerId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "partnerId is required" });
        }

        const job = await prisma.productionJob.update({
          where: { id: input.jobId },
          data: { productionPartnerId: partnerId },
        });

        const partner = await prisma.productionPartner.findUnique({
          where: { id: partnerId },
        });

        const noteText = input.note || input.reason || `Reassigned to ${partner?.name || "new partner"}`;

        await prisma.jobEvent.create({
          data: {
            productionJobId: job.id,
            status: job.status,
            note: noteText,
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

    // Proof review
    reviewProof: adminProcedure
      .input(
        z.object({
          jobId: z.string(),
          approved: z.boolean(),
          note: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const data: any = {
          proofApprovedAt: input.approved ? new Date() : null,
          proofApprovedBy: input.approved ? ctx.user.id : null,
        };

        const job = await prisma.productionJob.update({
          where: { id: input.jobId },
          data,
        });

        await prisma.jobEvent.create({
          data: {
            productionJobId: job.id,
            status: input.approved ? "PROOF_APPROVED" : "PROOF_REJECTED",
            note: input.note || (input.approved ? "Proof approved" : "Proof rejected - needs revision"),
            actor: "ops",
          },
        });

        // Send notification
        const campaign = await prisma.campaign.findUnique({
          where: { id: job.campaignId },
          include: { organization: true },
        });
        const user = campaign
          ? await prisma.user.findFirst({ where: { organizationId: campaign.organizationId }, orderBy: { createdAt: "asc" } })
          : null;

        if (user?.email) {
          const { sendEmail, emailTemplates } = await import("../lib/email");
          const template = emailTemplates.proofReviewed(campaign!.name, input.approved, input.note);
          await sendEmail({ to: user.email, subject: template.subject, html: template.html });
        }

        return job;
      }),
  }),

  // Compatibility alias for existing UI (StatusUpdateModal calls this)
  updateJobStatus: adminProcedure
    .input(
      z.object({
        jobId: z.string(),
        status: z.enum(["RECEIVED", "SENT_TO_PROVIDER", "SHIPPED", "DELIVERED"]),
        trackingNumber: z.string().optional(),
        message: z.string().optional(),
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
          note: input.message || `Status updated to ${input.status}`,
          actor: "ops",
        },
      });

      // Send shipped email
      if (input.status === "SHIPPED" && input.trackingNumber) {
        const campaign = await prisma.campaign.findUnique({
          where: { id: job.campaignId },
          include: { organization: true },
        });
        const user = campaign
          ? await prisma.user.findFirst({
              where: { organizationId: campaign.organizationId },
              orderBy: { createdAt: "asc" },
            })
          : null;

        if (user?.email) {
          const { sendEmail, emailTemplates } = await import("../lib/email");
          const template = emailTemplates.jobShipped(campaign!.name, input.trackingNumber);
          await sendEmail({ to: user.email, subject: template.subject, html: template.html });
        }
      }

      return job;
    }),

  // Artwork review actions
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
                productionPartner: { select: { name: true } },
              },
            },
          },
        });
      }),
  }),

  // Simple dashboard stats + analytics
  dashboard: router({
    stats: adminProcedure.query(async () => {
      const [totalJobs, shipped, delivered, activePartners] = await Promise.all([
        prisma.productionJob.count(),
        prisma.productionJob.count({ where: { status: "SHIPPED" } }),
        prisma.productionJob.count({ where: { status: "DELIVERED" } }),
        prisma.productionPartner.count({ where: { isActive: true } }),
      ]);

      return { totalJobs, shipped, delivered, activePartners };
    }),

    analytics: adminProcedure.query(async () => {
      const jobs = await prisma.productionJob.findMany({
        select: { status: true, createdAt: true, shippedAt: true, deliveredAt: true },
      });

      const turnaroundDays = jobs
        .filter((j) => j.shippedAt && j.deliveredAt)
        .map((j) => (new Date(j.deliveredAt!).getTime() - new Date(j.shippedAt!).getTime()) / (1000 * 3600 * 24));

      const avgTurnaround = turnaroundDays.length
        ? Math.round(turnaroundDays.reduce((a, b) => a + b, 0) / turnaroundDays.length)
        : null;

      const byStatus = jobs.reduce((acc, j) => {
        acc[j.status] = (acc[j.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalJobs: jobs.length,
        byStatus,
        avgDeliveryDays: avgTurnaround,
      };
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
