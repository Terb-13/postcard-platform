              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
                <div className="text-sm space-y-0.5">
                  {isInProduction ? (
                    <>
                      <div>
                        <span className="font-medium">Production:</span> {latestJob?.status ?? "In Progress"}
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="text-gray-500">Status:</span> {campaign.stripePaymentIntentId ? "Paid" : "Ready for Payment"}
                    </div>
                  )}
                </div>

                {!isInProduction && (
                  <>
                    {!campaign.artwork && (
                      <div>
                        <ArtworkUpload campaignId={campaign.id} onUploadComplete={refetch} />
                      </div>
                    )}
                    <button
                      onClick={() => createCheckout.mutate({ campaignId: campaign.id })}
                      disabled={createCheckout.isPending}
                      className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-60"
                    >
                      {campaign.stripePaymentIntentId ? "Send to Production" : "Pay & Send to Production"}
                    </button>
                  </>
                )}

                {isInProduction && (
                  <a href="/production" className="text-sm text-blue-600 hover:underline">
                    View in Production →
                  </a>
                )}
              </div>