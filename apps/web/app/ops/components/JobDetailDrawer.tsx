              {/* Artwork Section - New */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Artwork</div>
                {job.campaign.artwork ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm">Status: </span>
                      <span className={`text-sm font-medium ${job.campaign.artwork.status === "APPROVED" ? "text-green-600" : job.campaign.artwork.status === "REJECTED" ? "text-red-600" : "text-orange-600"}`}>
                        {job.campaign.artwork.status}
                      </span>
                    </div>
                    {job.campaign.artwork.fileUrl && (
                      <a
                        href={job.campaign.artwork.fileUrl}
                        target="_blank"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View Uploaded Artwork →
                      </a>
                    )}
                    {job.campaign.artwork.notes && (
                      <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                        Ops note: {job.campaign.artwork.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No artwork uploaded yet.</div>
                )}
              </div>
