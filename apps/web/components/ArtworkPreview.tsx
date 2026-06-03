"use client";

import { useEffect, useRef, useState } from "react";

interface ArtworkPreviewProps {
  fileUrl: string;
  thumbnailUrl?: string | null;           // legacy single thumbnail (page 1)
  thumbnails?: Record<number, string>;    // per-page thumbnails: { 1: url, 2: url, ... }
  pageNumber?: number;                    // 1-based (for main viewer)
  pageCount?: number;                     // known page count from client upload (for early grid feedback)
  isGeneratingThumbnails?: boolean;       // show generating placeholders immediately after upload
  className?: string;
  onPageCountChange?: (count: number) => void;
  // Optional rejection notes banner (shown by parent or here)
  rejectionNotes?: string | null;
}

/**
 * ArtworkPreview
 *
 * Priority for a given page:
 * 1. thumbnails[pageNumber] (server-generated, fastest)
 * 2. thumbnailUrl (legacy, only for page 1)
 * 3. Client-side PDF.js rendering (fallback)
 *
 * When pageCount is provided but no thumbnails yet (right after upload), shows an instant
 * multi-page placeholder grid so customers get immediate visual feedback on page count.
 */
export function ArtworkPreview({
  fileUrl,
  thumbnailUrl,
  thumbnails,
  pageNumber = 1,
  pageCount,
  isGeneratingThumbnails,
  className = "",
  onPageCountChange,
  rejectionNotes,
}: ArtworkPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const effectivePageCount = pageCount ?? totalPages ?? null;

  // Determine the best image source for the current page
  const pageThumbnail = thumbnails?.[pageNumber];
  const effectiveThumbnail =
    pageThumbnail || (pageNumber === 1 ? thumbnailUrl : null);

  // If parent already knows pageCount (from upload), surface it immediately
  useEffect(() => {
    if (pageCount && onPageCountChange) {
      onPageCountChange(pageCount);
    }
  }, [pageCount, onPageCountChange]);

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

        const pageCountFromPdf = pdf.numPages;
        setTotalPages(pageCountFromPdf);
        onPageCountChange?.(pageCountFromPdf);

        const page = await pdf.getPage(Math.min(pageNumber, pageCountFromPdf));

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
  }, [fileUrl, pageNumber, effectiveThumbnail, onPageCountChange, pageCount]);

  // Early feedback: show placeholder grid right after upload (before server thumbnails arrive)
  const showEarlyGrid = isGeneratingThumbnails || (!effectiveThumbnail && effectivePageCount && effectivePageCount > 0 && !thumbnails);

  if (showEarlyGrid && effectivePageCount) {
    const pages = Array.from({ length: effectivePageCount }, (_, i) => i + 1);
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{effectivePageCount} page{effectivePageCount > 1 ? "s" : ""} detected</span>
          {isGeneratingThumbnails && <span className="text-amber-600">Generating previews…</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {pages.map((p) => (
            <div
              key={p}
              className="aspect-[1.3] rounded border bg-white flex flex-col items-center justify-center text-center p-2"
            >
              <div className="text-[10px] text-gray-400 mb-1">Page {p}</div>
              <div className="text-xs text-gray-400">Generating…</div>
            </div>
          ))}
        </div>
        {rejectionNotes && (
          <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            <strong>Review notes:</strong> {rejectionNotes}
          </div>
        )}
      </div>
    );
  }

  // Use pre-generated thumbnail if available for this page (preferred fast path)
  if (effectiveThumbnail) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img
          src={effectiveThumbnail}
          alt={`Artwork page ${pageNumber}`}
          className="mx-auto max-h-[min(280px,50vh)] w-full rounded border bg-white object-contain"
        />
        {rejectionNotes && (
          <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            <strong>Review notes:</strong> {rejectionNotes}
          </div>
        )}
      </div>
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

      {(totalPages || effectivePageCount) && (totalPages || effectivePageCount)! > 1 && (
        <div className="absolute bottom-2 right-2 text-[10px] bg-white/90 px-1.5 py-0.5 rounded text-gray-600">
          Page {Math.min(pageNumber, (totalPages || effectivePageCount)!)} / {(totalPages || effectivePageCount)}
        </div>
      )}

      {rejectionNotes && (
        <div className="absolute bottom-2 left-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
          Rejected — see notes
        </div>
      )}
    </div>
  );
}
