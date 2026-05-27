                  {!artwork || artwork.status === "REJECTED" ? (
                    <div className="mt-4">
                      <ArtworkUpload campaignId={campaign.id} onUploadComplete={refetch} />
                    </div>
                  ) : null}