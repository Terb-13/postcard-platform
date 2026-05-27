            {/* Artwork with Preview */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Artwork</div>
              {artwork ? (
                <div className="space-y-3">
                  <div>
                    Status: <span className={`font-medium ${artwork.status === "APPROVED" ? "text-green-600" : artwork.status === "REJECTED" ? "text-red-600" : "text-orange-600"}`}>{artwork.status}</span>
                  </div>

                  {artwork.fileUrl && (
                    <ArtworkPreview
                      fileUrl={artwork.fileUrl}
                      thumbnailUrl={artwork.thumbnailUrl}
                      className="h-48 w-full object-contain border rounded bg-white"
                    />
                  )}

                  {artwork.notes && (
                    <div className="text-sm bg-white p-2 rounded border">
                      <strong>Review notes:</strong> {artwork.notes}
                    </div>
                  )}

                  {artwork.status !== "APPROVED" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleArtworkReview("APPROVED")} className="text-sm px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                      <button onClick={() => handleArtworkReview("REJECTED")} className="text-sm px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No artwork uploaded yet.</div>
              )}
            </div>
