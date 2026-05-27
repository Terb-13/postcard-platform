import { serve } from "inngest/next";
import { inngest } from "@/packages/api/inngest/client";
import { generateArtworkThumbnail } from "@/packages/api/inngest/functions/generate-artwork-thumbnail";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateArtworkThumbnail],
});
