"use client";

import { useEffect, useRef, useState } from "react";

interface ArtworkPreviewProps {
  fileUrl: string;
  thumbnailUrl?: string | null;           // legacy single thumbnail (page 1)
  thumbnails?: Record<number, string>;    // per-page thumbnails: { 1: url, 2: url, ... }
  pageNumber?: number;                    // 1-based
  className?: string;
  onPageCountChange?: (count: number) => void;
}

/**
 * ArtworkPreview
 *
 * Priority for a given page:
 * 1. thumbnails[pageNumber] (server-generated, fastest)
 * 2. thumbnailUrl (legacy, only for page 1)
 * 3. Client-side PDF.js rendering (fallback)
 */
export function ArtworkPreview({
  fileUrl,
  thumbnailUrl,
  thumbnails,
  pageNumber = 1,
  className = "",
  onPageCountChange,
}: ArtworkPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Determine the best image source for the current page
  const pageThumbnail = thumbnails?.[pageNumber];
  const effectiveThumbnail =
    pageThumbnail || (pageNumber === 1 ? thumbnailUrl : null);

  useEffect(() => {
    // If we have a pre-generated thumbnail for this page, no need to render client-side
    if (effectiveThumbnail) {
      setIsLoading(false);
      setError(false);
      return;
    }

    let isMounted = true;

    const renderPage = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const pdfjsLib = await import("pdfjs-dist");
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        const pageCount = pdf.numPages;
        setTotalPages(pageCount);
        onPageCountChange?.(pageCount);

        const page = await pdf.getPage(Math.min(pageNumber, pageCount));

        const scale = 1.6;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas || !isMounted) return;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        if (isMounted) setIsLoading(false);
      } catch (err) {
        console.error("PDF preview failed:", err);
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    renderPage();

    return () => { isMounted = false; };
  }, [fileUrl, pageNumber, effectiveThumbnail, onPageCountChange]);

  // Use pre-generated thumbnail if available for this page
  if (effectiveThumbnail) {
    return (
      <img
        src={effectiveThumbnail}
        alt={`Artwork page ${pageNumber}`}
        className={`rounded border object-contain bg-white ${className}`}
      />
    );
  }

  return (
    <div className={`relative flex items-center justify-center rounded border bg-gray-100 ${className}`} style={{ minHeight: 220 }}>
      {isLoading && <div className="text-sm text-gray-500">Loading page {pageNumber}...</div>}

      {!isLoading && !error && <canvas ref={canvasRef} className="max-h-full rounded" />}

      {error && (
        <div className="text-center p-4">
          <div className="text-sm text-gray-500">Preview unavailable for page {pageNumber}</div>
          <a href={fileUrl} target="_blank" className="text-xs text-blue-600 hover:underline mt-1 block">
            Open original PDF
          </a>
        </div>
      )}

      {totalPages && totalPages > 1 && (
        <div className="absolute bottom-2 right-2 text-[10px] bg-white/90 px-1.5 py-0.5 rounded text-gray-600">
          Page {Math.min(pageNumber, totalPages)} / {totalPages}
        </div>
      )}
    </div>
  );
}
