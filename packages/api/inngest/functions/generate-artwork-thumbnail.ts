import { inngest } from "../client";
import { prisma } from "../../db/client";
import { uploadToR2 } from "../../lib/r2";

import * as pdfjsLib from "pdfjs-dist";
import { createCanvas } from "@napi-rs/canvas";

// Configure pdfjs for Node environment
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve("pdfjs-dist/build/pdf.worker.js");

const THUMBNAIL_WIDTH = 900;
const MAX_PAGES = 6;

export const generateArtworkThumbnail = inngest.createFunction(
  { id: "generate-artwork-thumbnail", concurrency: 3 },
  { event: "artwork/uploaded" },
  async ({ event, step }) => {
    const { artworkId, fileUrl, maxPages = MAX_PAGES } = event.data;

    const pdfBuffer = await step.run("download-pdf", async () => {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`Failed to download PDF: ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    });

    const { pageCount } = await step.run("inspect-pdf", async () => {
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
      const pngBuffer = await step.run(`render-page-${pageNum}`, async () => {
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

        return canvas.toBuffer("image/png");
      });

      const key = `artwork-thumbnails/${artworkId}/p${pageNum}.png`;
      const url = await step.run(`upload-page-${pageNum}`, async () => {
        return uploadToR2(pngBuffer, key, "image/png");
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
