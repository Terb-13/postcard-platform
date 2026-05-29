"use client";

import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { ArtworkPreview } from "@/components/ArtworkPreview";
import type { ArtworkFile } from "../useCampaignWizard";

type Props = {
  size: string;
  artwork: ArtworkFile | null;
  onArtworkChange: (artwork: ArtworkFile | null) => void;
};

async function detectPageCount(fileUrl: string): Promise<number | undefined> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    // @ts-ignore — pdfjs worker URL
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const pdf = await pdfjsLib.getDocument(fileUrl).promise;
    return pdf.numPages;
  } catch {
    return undefined;
  }
}

export function CreativeStep({ size, artwork, onArtworkChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadComplete = async (res: { url: string; name: string; size: number }[]) => {
    const file = res?.[0];
    if (!file) return;

    setUploadError(null);
    const pageCount = await detectPageCount(file.url);

    onArtworkChange({
      fileUrl: file.url,
      fileName: file.name,
      fileSize: file.size,
      pageCount,
    });
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <PostcardMockup size={size} />

      {artwork?.fileUrl ? (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Front
              </p>
              <ArtworkPreview
                fileUrl={artwork.fileUrl}
                thumbnailUrl={artwork.thumbnailUrl}
                thumbnails={artwork.thumbnails}
                pageNumber={1}
                pageCount={artwork.pageCount}
                className="max-h-[280px] w-full"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Back
              </p>
              {(artwork.pageCount ?? 0) >= 2 ? (
                <ArtworkPreview
                  fileUrl={artwork.fileUrl}
                  thumbnails={artwork.thumbnails}
                  pageNumber={2}
                  pageCount={artwork.pageCount}
                  className="max-h-[280px] w-full"
                />
              ) : (
                <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-alt)]/50 px-4 text-center text-sm text-[var(--color-text-muted)]">
                  Upload a 2-page PDF to preview the back side.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)]/40 px-4 py-3 text-sm">
            <p className="font-medium">{artwork.fileName}</p>
            {artwork.pageCount != null && (
              <p className="text-[var(--color-text-muted)] mt-0.5">
                {artwork.pageCount} page{artwork.pageCount === 1 ? "" : "s"} detected
              </p>
            )}
          </div>

          <UploadButton
            endpoint="artworkUploader"
            onUploadBegin={() => {
              setIsUploading(true);
              setUploadError(null);
            }}
            onClientUploadComplete={handleUploadComplete}
            onUploadError={(error: Error) => {
              setIsUploading(false);
              setUploadError(error.message);
            }}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center bg-[var(--color-bg-alt)]/50">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-text-muted)]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium">Upload your postcard PDF</p>
          <p className="mb-4 text-xs text-[var(--color-text-muted)]">
            Max 4MB · include front and back as separate pages
          </p>
          <UploadButton
            endpoint="artworkUploader"
            onUploadBegin={() => {
              setIsUploading(true);
              setUploadError(null);
            }}
            onClientUploadComplete={handleUploadComplete}
            onUploadError={(error: Error) => {
              setIsUploading(false);
              setUploadError(error.message);
            }}
          />
        </div>
      )}

      {isUploading && (
        <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          Uploading artwork…
        </p>
      )}

      {uploadError && (
        <p className="text-sm text-red-600" role="alert">
          Upload failed: {uploadError}
        </p>
      )}

      <p className="text-xs text-[var(--color-text-muted)]">PDF only, max 4MB.</p>
    </div>
  );
}

function PostcardMockup({ size }: { size: string }) {
  const aspect =
    size === "4x6" ? "aspect-[3/2]" : size === "6x11" ? "aspect-[11/6]" : "aspect-[7/5]";

  return (
    <div className="flex justify-center">
      <div
        className={`${aspect} flex w-full max-w-xs items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br from-[var(--color-bg-dark)] to-[#1e3a5f] shadow-lg`}
      >
        <div className="p-4 text-center text-white/90">
          <p className="text-xs uppercase tracking-widest opacity-70">Preview size</p>
          <p className="mt-1 font-semibold">{size.replace("x", "×")}&quot;</p>
        </div>
      </div>
    </div>
  );
}
