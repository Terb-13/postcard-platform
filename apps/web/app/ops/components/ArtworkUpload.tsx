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

  return (
    <div>
      <UploadButton
        endpoint="artworkUploader"
        onClientUploadComplete={(res) => {
          if (res?.[0]) {
            uploadArtwork.mutate({
              campaignId,
              fileUrl: res[0].url,
              fileName: res[0].name,
              fileSize: res[0].size,
            });
          }
        }}
        onUploadError={(error: Error) => {
          alert(`Upload failed: ${error.message}`);
        }}
      />
      <p className="text-xs text-gray-500 mt-1">PDF only, max 4MB</p>
    </div>
  );
}
