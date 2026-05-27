              <td className="px-4 py-3">
                <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {job.campaign.stripePaymentIntentId || job.campaign.paidAt ? (
                  <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800">
                    Not Paid
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm font-mono text-gray-600">
                {job.trackingNumber || "—"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(job.createdAt).toLocaleDateString()}
              </td>