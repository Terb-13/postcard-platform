            {/* Payment Status */}
            <div className="rounded-lg border p-3 bg-gray-50">
              <div className="text-sm font-medium text-gray-700 mb-1">Payment Status</div>
              {job.campaign.stripePaymentIntentId || job.campaign.paidAt ? (
                <div className="text-sm">
                  <span className="text-green-600 font-medium">Paid</span>
                  {job.campaign.amountPaid && (
                    <span className="ml-2 text-gray-600">
                      ${(job.campaign.amountPaid).toFixed(2)}
                    </span>
                  )}
                  {job.campaign.paidAt && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Paid on {new Date(job.campaign.paidAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-orange-600 font-medium">Not Paid</div>
              )}
            </div>
