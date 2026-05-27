"use client";

import { trpc } from "@/lib/trpc/client";

export default function MyCampaignsPage() {
  const { data: campaigns, isLoading, refetch } = trpc.campaign.getMine.useQuery();

  const sendToProduction = trpc.campaign.sendToProduction.useMutation({
    onSuccess: () => {
      alert("Campaign sent to production!");
      refetch();
    },
    onError: (err) => alert("Error: " + err.message),
  });

  if (isLoading) {
    return <div className="max-w-5xl mx-auto px-6 py-8">Loading your campaigns...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">My Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage your postcard campaigns and track them through production.</p>
        </div>
        <a
          href="/campaigns/new"
          className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
        >
          + New Campaign
        </a>
      </div>

      {campaigns?.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-gray-600">You haven’t created any campaigns yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {campaigns?.map((campaign) => {
          const latestJob = campaign.productionJobs?.[0];
          const isInProduction = campaign.status === "IN_PRODUCTION" || !!latestJob;

          return (
            <div key={campaign.id} className="border rounded-xl p-5 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="font-semibold text-lg">{campaign.name}</div>
                <div className="text-sm text-gray-500">
                  {campaign.size} × {campaign.quantity} • Created {new Date(campaign.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
                {/* Status */}
                <div className="text-sm">
                  {isInProduction ? (
                    <>
                      <span className="font-medium">Production Status:</span> {latestJob?.status ?? "In Progress"}
                      {latestJob?.trackingNumber && (
                        <span className="ml-2 text-gray-500 font-mono">{latestJob.trackingNumber}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500">Draft / Ready</span>
                  )}
                </div>

                {/* Action */}
                {!isInProduction && (
                  <button
                    onClick={() => sendToProduction.mutate({ campaignId: campaign.id })}
                    disabled={sendToProduction.isPending}
                    className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-60"
                  >
                    Send to Production
                  </button>
                )}

                {isInProduction && (
                  <a
                    href="/production"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View in Production →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
