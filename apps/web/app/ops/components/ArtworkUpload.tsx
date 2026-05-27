"use client";

import { UploadButton } from "@/lib/uploadthing";
import { trpc } from "@/lib/trpc/client";

interface ArtworkUploadProps {
  campaignId: string;
  onUploadComplete?: () => void;
}

export function ArtworkUpload({ campaignId, onUploadComplete }: ArtworkUploadProps) {
  const uploadArtwork = trpc.campaign.uploadArtwork.useMutation({
    onSuccess: () => {
      onUploadComplete?.();
    },
  });

  const handleUploadComplete = async (res: any[]) => {
    if (!res?.[0]) return;

    const file = res[0];
    let pageCount: number | undefined;

    // Try to detect page count client-side for immediate feedback
    try {
      const pdfjsLib = await import("pdfjs-dist");
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const loadingTask = pdfjsLib.getDocument(file.url);
      const pdf = await loadingTask.promise;
      pageCount = pdf.numPages;
    } catch (e) {
      console.warn("Could not detect PDF page count client-side", e);
    }

    uploadArtwork.mutate({
      campaignId,
      fileUrl: file.url,
      fileName: file.name,
      fileSize: file.size,
      pageCount,
    });
  };

  return (
    <div>
      <UploadButton
        endpoint="artworkUploader"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={(error: Error) => {
          alert(`Upload failed: ${error.message}`);
        }}
      />
      <p className="text-xs text-gray-500 mt-1">PDF only, max 4MB</p>
    </div>
  );
}
