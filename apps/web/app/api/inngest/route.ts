import { serve } from "inngest/next";
import { inngest } from "@postcard-platform/api/inngest/client";
import { generateArtworkThumbnail } from "@postcard-platform/api/inngest/functions/generate-artwork-thumbnail";

export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateArtworkThumbnail],
});
