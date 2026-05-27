  uploadArtwork: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        fileUrl: z.string(),
        fileName: z.string(),
        fileSize: z.number().optional(),
        pageCount: z.number().optional(),   // NEW: detected on client before upload
      })
    )
    .mutation(async ({ input, ctx }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId },
      });

      if (!campaign || campaign.organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      const artwork = await ctx.prisma.artwork.upsert({
        where: { campaignId: input.campaignId },
        update: {
          fileUrl: input.fileUrl,
          fileName: input.fileName,
          fileSize: input.fileSize,
          pageCount: input.pageCount,
          status: "UPLOADED",
          thumbnailUrl: null,
        },
        create: {
          campaignId: input.campaignId,
          fileUrl: input.fileUrl,
          fileName: input.fileName,
          fileSize: input.fileSize,
          pageCount: input.pageCount,
          status: "UPLOADED",
        },
      });

      // Trigger Inngest thumbnail job
      await inngest.send({
        name: "artwork/uploaded",
        data: {
          artworkId: artwork.id,
          fileUrl: input.fileUrl,
        },
      });

      return artwork;
    }),