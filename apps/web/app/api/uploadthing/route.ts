import { createRouteHandler, createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  artworkUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await getCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id, organizationId: user.organizationId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for user:", metadata.userId);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
