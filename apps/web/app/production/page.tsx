"use client";

// Force dynamic to avoid requiring Clerk keys during next build prerender without .env
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ArtworkPreview } from "@/components/ArtworkPreview";
import { ProductionTimeline } from "@/components/ProductionTimeline";

export default function ProductionPage() {
  const searchParams = useSearchParams();
  const highlightCampaign = searchParams.get("campaign");

  const { data: campaigns, isLoading, refetch } = trpc.campaign.getMine.useQuery();

  if (isLoading) {
    return <div className="max-w-5xl mx-auto p-8">Loading production status...</div>;
  }

  const readyToSend = (campaigns || []).filter(
    (c) => c.status === "PAID" && (!c.productionJobs || c.productionJobs.length === 0)
  );

  const inProduction = (campaigns || []).filter(
    (c) => c.status === "IN_PRODUCTION" || (c.productionJobs && c.productionJobs.length > 0)
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Production</h1>
        <p className="text-gray-600 mt-1">Track your postcards through print and delivery.</p>
      </div>

      {/* Ready to Send (paid but not yet assigned / in production) */}
      {readyToSend.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Ready to Send</h2>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Paid — awaiting production start</span>
          </div>
          <div className="space-y-4">
            {readyToSend.map((campaign) => {
              const artwork = campaign.artwork;
              const thumbnailsMap = artwork?.thumbnails?.reduce((acc: Record<number, string>, t) => {
                acc[t.page] = t.url; return acc;
              }, {} as Record<number, string>);

              return (
                <div key={campaign.id} className={`rounded-xl border bg-white p-6 ${highlightCampaign === campaign.id ? "ring-2 ring-emerald-500" : ""}`}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">{campaign.size} × {campaign.quantity.toLocaleString()}</p>
                    </div>
                    <Link href="/campaigns" className="text-sm text-blue-600">Edit campaign →</Link>
                  </div>

                  {artwork?.fileUrl && (
                    <div className="mt-4">
                      <ArtworkPreview
                        fileUrl={artwork.fileUrl}
                        thumbnailUrl={artwork.thumbnailUrl}
                        thumbnails={thumbnailsMap}
                        pageCount={artwork.pageCount ?? undefined}
                        className="max-h-56"
                      />
                    </div>
                  )}

                  <div className="mt-4 text-sm text-gray-600">
                    Your artwork is approved and payment received. Our team will assign a production partner shortly.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* In Production + Delivered */}
      <div>
        <h2 className="text-lg font-semibold mb-4">In Production &amp; Shipped</h2>

        {inProduction.length === 0 && readyToSend.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-600">
            No active production jobs. <Link href="/campaigns" className="text-blue-600 underline">Start a campaign</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {inProduction.map((campaign) => {
              const artwork = campaign.artwork;
              const job = campaign.productionJobs?.[0];
              const thumbnailsMap = artwork?.thumbnails?.reduce((acc: Record<number, string>, t) => {
                acc[t.page] = t.url; return acc;
              }, {} as Record<number, string>);

              return (
                <div key={campaign.id} className={`rounded-xl border bg-white p-6 ${highlightCampaign === campaign.id ? "ring-2 ring-blue-500" : ""}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <span className="text-xs text-gray-500">{campaign.size} • Qty {campaign.quantity}</span>
                    </div>
                    {job && (
                      <div className="text-sm">
                        Status: <span className="font-medium">{job.status.replace(/_/g, " ")}</span>
                        {job.trackingNumber && <span className="ml-2 font-mono text-blue-600">{job.trackingNumber}</span>}
                      </div>
                    )}
                  </div>

                  {/* Multi-page preview */}
                  {artwork?.fileUrl && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1.5">Approved Artwork</div>
                      <ArtworkPreview
                        fileUrl={artwork.fileUrl}
                        thumbnailUrl={artwork.thumbnailUrl}
                        thumbnails={thumbnailsMap}
                        pageCount={artwork.pageCount ?? undefined}
                        className="max-h-64"
                      />
                    </div>
                  )}

                  {/* The timeline component (customer facing stages) */}
                  <ProductionTimeline campaign={campaign as any} />

                  {job?.status === "SHIPPED" && job.trackingNumber && (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(job.trackingNumber)}`}
                      target="_blank"
                      className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                    >
                      Track shipment →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link href="/campaigns" className="text-sm text-gray-600 hover:text-gray-900 underline">
          ← Back to all campaigns
        </Link>
      </div>
    </div>
  );
}
