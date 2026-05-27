"use client";

import { trpc } from "@/lib/trpc/client";
import { ArtworkUpload } from "../ops/components/ArtworkUpload";

export default function MyProductionPage() {
  const { data: campaigns, isLoading, refetch } = trpc.campaign.getMine.useQuery();

  const sendToProduction = trpc.campaign.sendToProduction.useMutation({
    onSuccess: () => {
      alert("Campaign sent to production!");
      refetch();
    },
    onError: (err) => alert("Error: " + err.message),
  });

  if (isLoading) {
    return <div className="max-w-5xl mx-auto px-6 py-8">Loading...</div>;
  }

  const inProduction = campaigns?.filter(
    (c) => c.status === "IN_PRODUCTION" || (c.productionJobs && c.productionJobs.length > 0)
  ) ?? [];

  const ready = campaigns?.filter((c) => c.status === "DRAFT" || c.status === "PAID") ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">My Production</h1>
          <p className="text-gray-600">Track your postcards through printing and mailing.</p>
        </div>
        <a href="/campaigns" className="text-sm text-blue-600 hover:underline">
          Back to My Campaigns →
        </a>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">In Production</h2>
        {inProduction.length === 0 ? (
          <p className="text-gray-500">No active production jobs.</p>
        ) : (
          <div className="space-y-4">
            {inProduction.map((campaign) => {
              const job = campaign.productionJobs?.[0];
              const artwork = campaign.artwork;
              return (
                <div key={campaign.id} className="border rounded-lg p-5 bg-white">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.size} × {campaign.quantity}</div>
                    </div>
                    {job && <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">{job.status}</span>}
                  </div>

                  <div className="mt-3 text-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>Partner: <span className="font-medium">{job?.productionPartner?.name || "Being assigned"}</span></div>
                    <div>Tracking: <span className="font-mono">{job?.trackingNumber || "Pending"}</span></div>
                    <div>
                      Artwork: {artwork ? (
                        <span className={`font-medium ${artwork.status === "APPROVED" ? "text-green-600" : artwork.status === "REJECTED" ? "text-red-600" : ""}`}>
                          {artwork.status}
                        </span>
                      ) : "Not uploaded"}
                    </div>
                  </div>

                  {!artwork && (
                    <div className="mt-4">
                      <ArtworkUpload campaignId={campaign.id} onUploadComplete={refetch} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Ready to Send to Production</h2>
        {ready.length === 0 ? (
          <p className="text-gray-500">No campaigns ready to send.</p>
        ) : (
          <div className="space-y-3">
            {ready.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between border rounded-lg p-4 bg-white">
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-sm text-gray-500">{campaign.size} × {campaign.quantity}</div>
                </div>
                <div className="flex items-center gap-3">
                  {!campaign.artwork && (
                    <ArtworkUpload campaignId={campaign.id} onUploadComplete={refetch} />
                  )}
                  <button
                    onClick={() => sendToProduction.mutate({ campaignId: campaign.id })}
                    disabled={sendToProduction.isPending}
                    className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-60"
                  >
                    Send to Production
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
