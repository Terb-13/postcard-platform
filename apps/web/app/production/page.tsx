{artwork?.fileUrl && (
  <div className="mt-3">
    <div className="text-xs text-gray-500 mb-1 flex items-center justify-between">
      <span>Artwork Preview</span>
      {artwork.thumbnails && artwork.thumbnails.length > 1 && (
        <span className="text-gray-400">Multi-page file</span>
      )}
    </div>
    <ArtworkPreview
      fileUrl={artwork.fileUrl}
      thumbnailUrl={artwork.thumbnailUrl}
      thumbnails={artwork.thumbnails?.reduce((acc, t) => {
        acc[t.page] = t.url;
        return acc;
      }, {} as Record<number, string>)}
      className="h-36 w-full object-contain border rounded bg-white"
    />
  </div>
)}
