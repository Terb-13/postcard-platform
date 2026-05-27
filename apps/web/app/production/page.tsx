import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { trpc } from "@/lib/trpc/server"; // server caller if needed, or use client

// For now we'll use client components for interactivity
// This is a server page that can fetch initial data

export default async function MyProductionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">My Production Jobs</h1>
        <p className="text-gray-600 mt-1">
          Track the status of your postcards as they go through printing and delivery.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-8">
        <CustomerProductionList />
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Need help? Contact our operations team or check your campaign details.
      </div>
    </div>
  );
}

// Client component for the actual list (uses tRPC)
'use client';

function CustomerProductionList() {
  const { data: campaigns, isLoading } = trpc.campaign.getMine.useQuery();

  if (isLoading) {
    return <div className="text-gray-500">Loading your production jobs...</div>;
  }

  const productionCampaigns = campaigns?.filter(
    (c) => c.status === "IN_PRODUCTION" || c.productionJobs?.length > 0
  ) ?? [];

  if (productionCampaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You don’t have any campaigns currently in production.</p>
        <p className="mt-2">
          <a href="/campaigns" className="text-blue-600 hover:underline">
            Go to My Campaigns
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {productionCampaigns.map((campaign) => {
        const latestJob = campaign.productionJobs?.[0];

        return (
          <div key={campaign.id} className="border rounded-lg p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-lg">{campaign.name}</div>
                <div className="text-sm text-gray-500">
                  {campaign.size} × {campaign.quantity} • Created {new Date(campaign.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                {latestJob ? (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                    {latestJob.status}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Pending assignment</span>
                )}
              </div>
            </div>

            {latestJob && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Partner:</span><br />
                  <span className="font-medium">
                    {latestJob.productionPartner?.name ?? "Being assigned"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Tracking:</span><br />
                  <span className="font-mono">
                    {latestJob.trackingNumber || "Not yet shipped"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span><br />
                  <span className="font-medium">{latestJob.status}</span>
                </div>
              </div>
            )}

            {!latestJob && campaign.status !== "IN_PRODUCTION" && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    // TODO: Wire this to call sendToProduction
                    alert("This will call sendToProduction in the next update");
                  }}
                  className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
                >
                  Send to Production
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
