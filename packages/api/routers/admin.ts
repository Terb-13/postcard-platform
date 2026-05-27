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
        include: {
          campaign: {
            include: {
              organization: true,
            },
          },
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

      // Send shipping notification when status becomes SHIPPED
      if (input.status === "SHIPPED" && input.trackingNumber) {
        const orgUser = await ctx.prisma.user.findFirst({
          where: { organizationId: job.campaign.organizationId },
          orderBy: { createdAt: "asc" },
        });

        if (orgUser?.email) {
          const template = emailTemplates.jobShipped(
            job.campaign.name,
            input.trackingNumber
          );
          await sendEmail({
            to: orgUser.email,
            subject: template.subject,
            html: template.html,
          });
        }
      }

      return job;
    }),
