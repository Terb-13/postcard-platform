import { inngest } from "../client";
import { prisma } from "@postcard-platform/db/client";
import { uploadToR2 } from "../../lib/r2";

import * as pdfjsLib from "pdfjs-dist";
import { createCanvas } from "@napi-rs/canvas";

// Note: workerSrc intentionally disabled (was causing module resolution issues in Vercel/Next bundler).
// pdfjs getDocument works server-side in Node with useWorkerFetch: false + isEvalSupported: false.

const THUMBNAIL_WIDTH = 900;
const MAX_PAGES = 6;

export const generateArtworkThumbnail = inngest.createFunction(
  { id: "generate-artwork-thumbnail", concurrency: 3 },
  { event: "artwork/uploaded" },
  async ({ event, step }) => {
    const { artworkId, fileUrl, maxPages = MAX_PAGES } = event.data;

    // Note: We re-fetch the PDF inside each step.run to avoid Inngest serialization issues with Buffer objects
    // (Buffers get turned into {type:'Buffer', data:[]} plain objects across step boundaries).

    const { pageCount } = await step.run("inspect-pdf", async () => {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`Failed to download PDF: ${res.status}`);
      const pdfBuffer = Buffer.from(await res.arrayBuffer());
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
      });
      const pdf = await loadingTask.promise;
      return { pageCount: pdf.numPages };
    });

    const pagesToGenerate = Math.min(pageCount, maxPages);
    const thumbnailUrls: Record<number, string> = {};

    for (let pageNum = 1; pageNum <= pagesToGenerate; pageNum++) {
      const url = await step.run(`render-and-upload-page-${pageNum}`, async () => {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error(`Failed to download PDF: ${res.status}`);
        const pdfBuffer = Buffer.from(await res.arrayBuffer());
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(pdfBuffer),
          useWorkerFetch: false,
          isEvalSupported: false,
        });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageNum);

        const viewport = page.getViewport({ scale: 1 });
        const scale = THUMBNAIL_WIDTH / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = createCanvas(scaledViewport.width, scaledViewport.height);
        const context = canvas.getContext("2d");

        await page.render({ canvasContext: context as any, viewport: scaledViewport }).promise;

        const pngBuffer = canvas.toBuffer("image/png");
        const key = `artwork-thumbnails/${artworkId}/p${pageNum}.png`;
        return uploadToR2(pngBuffer as Buffer, key, "image/png");
      });

      thumbnailUrls[pageNum] = url;
    }

    await step.run("persist-thumbnails", async () => {
      await prisma.artworkThumbnail.deleteMany({ where: { artworkId } });

      const data = Object.entries(thumbnailUrls).map(([page, url]) => ({
        artworkId,
        page: parseInt(page),
        url,
      }));

      await prisma.artworkThumbnail.createMany({ data });

      if (thumbnailUrls[1]) {
        await prisma.artwork.update({
          where: { id: artworkId },
          data: { thumbnailUrl: thumbnailUrls[1] },
        });
      }
    });

    return {
      success: true,
      artworkId,
      pagesGenerated: Object.keys(thumbnailUrls).length,
    };
  }
);
