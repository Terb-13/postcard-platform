            {/* Artwork Section - Enhanced */}
            <div className={artwork?.status === "REJECTED" ? "rounded-lg border border-red-200 bg-red-50 p-3" : ""}>
              <div className="text-sm font-medium text-gray-700 mb-2">Artwork</div>
              {artwork ? (
                <div className="space-y-2">
                  <div>
                    Status: <span className={`font-medium ${artwork.status === "APPROVED" ? "text-green-600" : artwork.status === "REJECTED" ? "text-red-600" : "text-orange-600"}`}>{artwork.status}</span>
                  </div>
                  {artwork.fileUrl && (
                    <a href={artwork.fileUrl} target="_blank" className="text-blue-600 hover:underline text-sm">View Uploaded File →</a>
                  )}
                  {artwork.notes && (
                    <div className="text-sm bg-white p-2 rounded border border-red-200">
                      <strong>Rejection reason:</strong> {artwork.notes}
                    </div>
                  )}

                  {artwork.status !== "APPROVED" && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleArtworkReview("APPROVED")}
                        className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve Artwork
                      </button>
                      <button
                        onClick={() => handleArtworkReview("REJECTED")}
                        className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject / Request Changes
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No artwork uploaded yet by customer.</div>
              )}
            </div>
