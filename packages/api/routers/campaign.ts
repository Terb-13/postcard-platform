import { inngest } from "../inngest/client";

  // After creating/updating the artwork
  await inngest.send({
    name: "artwork/uploaded",
    data: {
      artworkId: artwork.id,
      fileUrl: input.fileUrl,
    },
  });
