{artwork?.fileUrl && (
  <div className="mt-3">
    <div className="text-xs text-gray-500 mb-1">Preview</div>
    <ArtworkPreview
      fileUrl={artwork.fileUrl}
      thumbnailUrl={artwork.thumbnailUrl}
      thumbnails={artwork.thumbnails?.reduce((acc, t) => {
        acc[t.page] = t.url;
        return acc;
      }, {} as Record<number, string>)}
      className="h-28 w-full object-contain border rounded bg-white"
    />
  </div>
)}
