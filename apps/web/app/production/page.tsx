"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export default function MyProductionPage() {
  const { data: campaigns, isLoading, refetch } = trpc.campaign.getMine.useQuery();

  const sendToProduction = trpc.campaign.sendToProduction.useMutation({
    onSuccess: () => {
      alert("Campaign sent to production! Our team will begin processing it shortly.");
      refetch();
    },
    onError: (err) => {
      alert("Error: " + err.message);
    },
  });

  if (isLoading) {
    return <div className="max-w-5xl mx-auto px-6 py-8">Loading your campaigns...</div>;
  }

  const campaignsInProduction = campaigns?.filter(
    (c) => c.status === "IN_PRODUCTION" || (c.productionJobs && c.productionJobs.length > 0)
  ) ?? [];

  const readyCampaigns = campaigns?.filter(
    (c) => c.status === "DRAFT" || c.status === "PAID"
  ) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">My Production Jobs</h1>
        <p className="text-gray-600 mt-1">
          Track the status of your postcards as they go through printing and delivery. You can also send ready campaigns to production below.
        </p>
      </div>

      {/* Currently in Production */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Currently in Production</h2>

        {campaignsInProduction.length === 0 && (
          <p className="text-gray-500">You have no campaigns currently in production.</p>
        )}

        <div className="space-y-4">
          {campaignsInProduction.map((campaign) => {
            const job = campaign.productionJobs?.[0];
            return (
              <div key={campaign.id} className="border rounded-lg p-5 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">{campaign.name}</div>
                    <div className="text-sm text-gray-500">
                      {campaign.size} × {campaign.quantity}
                    </div>
                  </div>

                  {job && (
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 self-start">
                      {job.status}
                    </span>
                  )}
                </div>

                {job && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Partner:</span><br />
                      <span className="font-medium">{job.productionPartner?.name ?? "Being assigned by our team"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tracking:</span><br />
                      <span className="font-mono">{job.trackingNumber || "Not yet shipped"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span><br />
                      <span className="font-medium">{job.status}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Ready to Send to Production */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Ready to Send to Production</h2>

        {readyCampaigns.length === 0 && (
          <p className="text-gray-500">No campaigns ready to send right now. Create a new campaign from the dashboard.</p>
        )}

        <div className="space-y-3">
          {readyCampaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between border rounded-lg p-4 bg-white">
              <div>
                <div className="font-medium">{campaign.name}</div>
                <div className="text-sm text-gray-500">
                  {campaign.size} × {campaign.quantity}
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm(`Send "${campaign.name}" to production?`)) {
                    sendToProduction.mutate({ campaignId: campaign.id });
                  }
                }}
                disabled={sendToProduction.isPending}
                className="px-5 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-60 font-medium"
              >
                {sendToProduction.isPending ? "Sending to Production..." : "Send to Production"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
