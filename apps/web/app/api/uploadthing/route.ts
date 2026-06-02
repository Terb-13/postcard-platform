import { createRouteHandler, createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import type { FileRouter } from "uploadthing/types";
import { getCurrentUser } from "@/lib/auth";
import {
  GUEST_SESSION_HEADER,
  getGuestOrganizationId,
  isValidGuestSessionId,
} from "@postcard-platform/api/lib/guest-org";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const f = createUploadthing();

const ourFileRouter = {
  artworkUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await getCurrentUser();
      if (user) {
        return {
          userId: user.id,
          organizationId: user.organizationId,
          guestSessionId: null as string | null,
        };
      }

      const guestHeader = req.headers.get(GUEST_SESSION_HEADER);
      const guestSessionId = isValidGuestSessionId(guestHeader)
        ? guestHeader.trim()
        : null;

      if (!guestSessionId) {
        throw new UploadThingError("Unauthorized");
      }

      const organizationId = await getGuestOrganizationId(prisma, guestSessionId);
      return {
        userId: null as string | null,
        organizationId,
        guestSessionId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", metadata.userId ?? metadata.guestSessionId);
      return { uploadedBy: metadata.userId ?? metadata.guestSessionId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
