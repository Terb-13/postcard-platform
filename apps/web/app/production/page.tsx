import { ArtworkPreview } from "@/components/ArtworkPreview";

// Inside the production job card, after the basic info

{artwork?.fileUrl && (
  <div className="mt-3">
    <div className="text-xs text-gray-500 mb-1">Artwork Preview</div>
    <ArtworkPreview
      fileUrl={artwork.fileUrl}
      thumbnailUrl={artwork.thumbnailUrl}
      className="h-36 w-full object-contain border rounded bg-white"
    />
  </div>
)}
