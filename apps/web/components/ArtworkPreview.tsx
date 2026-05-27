"use client";

import { useEffect, useRef, useState } from "react";

interface ArtworkPreviewProps {
  fileUrl: string;
  thumbnailUrl?: string | null;
  className?: string;
}

/**
 * ArtworkPreview
 * Shows a thumbnail if available, otherwise renders a preview of the first page of the PDF using PDF.js in the browser.
 */
export function ArtworkPreview({ fileUrl, thumbnailUrl, className = "" }: ArtworkPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(!thumbnailUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (thumbnailUrl) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const renderPreview = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Dynamically import pdfjs-dist (avoids SSR issues)
        const pdfjsLib = await import("pdfjs-dist");
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas || !isMounted) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        if (isMounted) setIsLoading(false);
      } catch (err) {
        console.error("Failed to render PDF preview:", err);
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    renderPreview();

    return () => {
      isMounted = false;
    };
  }, [fileUrl, thumbnailUrl]);

  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt="Artwork preview"
        className={`rounded border object-contain bg-white ${className}`}
      />
    );
  }

  return (
    <div className={`relative flex items-center justify-center rounded border bg-gray-100 ${className}`} style={{ minHeight: 180 }}>
      {isLoading && (
        <div className="text-sm text-gray-500">Generating preview...</div>
      )}

      {!isLoading && !error && (
        <canvas ref={canvasRef} className="max-h-full rounded" />
      )}

      {error && (
        <div className="text-center p-4">
          <div className="text-sm text-gray-500">Preview unavailable</div>
          <a href={fileUrl} target="_blank" className="text-xs text-blue-600 hover:underline">
            View original PDF
          </a>
        </div>
      )}
    </div>
  );
}
