import { ArtworkPreview } from "@/components/ArtworkPreview";
import { ProductionTimeline } from "@/components/ProductionTimeline";

// Inside the campaign card, after the artwork status section

{artwork?.fileUrl && (
  <div className="mt-3">
    <div className="text-xs text-gray-500 mb-1">Preview</div>
    <ArtworkPreview
      fileUrl={artwork.fileUrl}
      thumbnailUrl={artwork.thumbnailUrl}
      className="h-28 w-full object-contain border rounded bg-white"
    />
  </div>
)}

{isInProduction && (
  <div className="mt-4 pt-4 border-t">
    <div className="text-xs font-medium text-gray-500 mb-2">Timeline</div>
    <ProductionTimeline campaign={campaign} />
  </div>
)}
