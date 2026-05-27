  // ============================================
  // ARTWORK REVIEW (Ops side)
  // ============================================
  artwork: {
    review: protectedProcedure
      .input(
        z.object({
          campaignId: z.string(),
          status: z.enum(["APPROVED", "REJECTED"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const artwork = await ctx.prisma.artwork.findUnique({
          where: { campaignId: input.campaignId },
        });

        if (!artwork) {
          throw new TRPCError({ code: "NOT_FOUND", message: "No artwork found for this campaign" });
        }

        const updated = await ctx.prisma.artwork.update({
          where: { campaignId: input.campaignId },
          data: {
            status: input.status,
            notes: input.notes,
            reviewedAt: new Date(),
            reviewedBy: ctx.user.email,
          },
        });

        // Log event on the latest production job if exists
        const latestJob = await ctx.prisma.productionJob.findFirst({
          where: { campaignId: input.campaignId },
          orderBy: { createdAt: "desc" },
        });

        if (latestJob) {
          await ctx.prisma.jobEvent.create({
            data: {
              productionJobId: latestJob.id,
              status: latestJob.status,
              message: `Artwork ${input.status.toLowerCase()} by ops` + (input.notes ? `: ${input.notes}` : ""),
              metadata: { type: "ARTWORK_REVIEW", status: input.status },
            },
          });
        }

        return updated;
      }),
  },
