                    <div>
                      Artwork: {artwork ? (
                        <>
                          <span className={`font-medium ${artwork.status === "APPROVED" ? "text-green-600" : artwork.status === "REJECTED" ? "text-red-600" : "text-orange-600"}`}>
                            {artwork.status}
                          </span>
                          {artwork.status === "REJECTED" && artwork.notes && (
                            <div className="text-xs text-red-600 mt-0.5">Reason: {artwork.notes}</div>
                          )}
                        </>
                      ) : "Not uploaded"}
                    </div>