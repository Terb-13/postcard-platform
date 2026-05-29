"use client";

// Force dynamic to avoid requiring Clerk keys (and other envs) during next build prerender
 export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ArtworkPreview } from "@/components/ArtworkPreview";
import { ArtworkUpload } from "@/components/ArtworkUpload";
import { ProductionTimeline } from "@/components/ProductionTimeline";

export default function MyCampaignsPage() {
  const utils = trpc.useUtils();
  const { data: campaigns, isLoading, refetch } = trpc.campaign.getMine.useQuery();

  const createCheckout = trpc.campaign.createCheckoutSession.useMutation({
    onSuccess: (res) => {
      if (res?.url) window.location.href = res.url;
    },
    onError: (e) => alert(e.message),
  });

  // Track local generating state per campaign for instant grid feedback
  const [generatingFor, setGeneratingFor] = useState<Record<string, boolean>>({});
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});

  const handleUploadComplete = (campaignId: string) => {
    // Immediately show "generating" state + wait for thumbnails
    setGeneratingFor((prev) => ({ ...prev, [campaignId]: true }));
    // Refetch will bring the new artwork + later the thumbnails from Inngest
    setTimeout(() => {
      refetch();
      setGeneratingFor((prev) => ({ ...prev, [campaignId]: false }));
    }, 1200);
  };

  const handlePageCount = (campaignId: string, count: number) => {
    setPageCounts((prev) => ({ ...prev, [campaignId]: count }));
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto p-8">Loading your campaigns...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">My Campaigns</h1>
          <p className="text-gray-600 mt-1">Upload artwork, get it reviewed, pay, and track production.</p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white text-sm font-medium hover:bg-gray-800"
        >
          + New Campaign
        </Link>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <p className="text-gray-600 mb-4">No campaigns yet.</p>
          <Link href="/campaigns/new" className="text-blue-600 underline">Create your first postcard campaign →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {campaigns.map((campaign) => {
            const artwork = campaign.artwork;
            const job = campaign.productionJobs?.[0];
            const isGenerating = generatingFor[campaign.id] ?? false;
            const knownPageCount = pageCounts[campaign.id] ?? artwork?.pageCount ?? undefined;

            const thumbnailsMap = artwork?.thumbnails?.reduce((acc: Record<number, string>, t) => {
              acc[t.page] = t.url;
              return acc;
            }, {} as Record<number, string>);

            const canPay = artwork?.status === "APPROVED" && campaign.status !== "PAID" && !job;
            const isRejected = artwork?.status === "REJECTED";

            return (
              <div key={campaign.id} className="rounded-xl border bg-white p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">{campaign.name}</h2>
                      <span className="text-xs rounded-full border px-2 py-0.5 text-gray-600">
                        {campaign.size} • {campaign.quantity.toLocaleString()}
                      </span>
                      <span className={`text-xs rounded px-2 py-0.5 ${getStatusBadge(campaign.status)}`}>
                        {campaign.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    {campaign.dropDate && (
                      <p className="text-sm text-gray-500 mt-1">Target drop: {new Date(campaign.dropDate).toLocaleDateString()}</p>
                    )}
                    <TargetingSummary campaign={campaign} />
                  </div>

                  <div className="flex items-center gap-2">
                    {canPay && (
                      <button
                        onClick={() => createCheckout.mutate({ campaignId: campaign.id })}
                        disabled={createCheckout.isPending}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {createCheckout.isPending ? "Redirecting..." : "Pay & Send to Production"}
                      </button>
                    )}
                    <Link href={`/production?campaign=${campaign.id}`} className="text-sm text-blue-600 hover:underline px-3 py-2">
                      View in Production →
                    </Link>
                  </div>
                </div>

                {/* Artwork Section - The polished preview experience */}
                <div className="mt-5 border-t pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">Artwork</div>
                    {artwork && (
                      <div className="text-xs text-gray-500">
                        {artwork.fileName} {knownPageCount ? `• ${knownPageCount} page${knownPageCount > 1 ? "s" : ""}` : ""}
                      </div>
                    )}
                  </div>

                  {artwork ? (
                    <div className="space-y-3">
                      <ArtworkPreview
                        fileUrl={artwork.fileUrl!}
                        thumbnailUrl={artwork.thumbnailUrl}
                        thumbnails={thumbnailsMap}
                        pageCount={knownPageCount}
                        isGeneratingThumbnails={isGenerating || (!artwork.thumbnails?.length && !!artwork.fileUrl)}
                        rejectionNotes={isRejected ? artwork.notes : null}
                        className="max-h-[320px] w-full"
                        onPageCountChange={(c) => handlePageCount(campaign.id, c)}
                      />

                      {/* Status + actions */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className={`rounded px-2 py-0.5 text-xs ${getArtworkStatusBadge(artwork.status)}`}>
                          {artwork.status}
                        </span>

                        {isRejected && (
                          <span className="text-red-600 text-xs">Re-upload corrected artwork below</span>
                        )}

                        {/* Re-upload always available for rejected or to replace */}
                        <div className="ml-auto">
                          <ArtworkUpload
                            campaignId={campaign.id}
                            onUploadComplete={() => {
                              handleUploadComplete(campaign.id);
                              refetch();
                            }}
                          />
                        </div>
                      </div>

                      {artwork.notes && !isRejected && (
                        <div className="text-xs bg-gray-50 border rounded p-2 text-gray-600">
                          Ops notes: {artwork.notes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded border border-dashed p-6 text-center">
                      <p className="text-sm text-gray-600 mb-3">No artwork uploaded yet.</p>
                      <ArtworkUpload
                        campaignId={campaign.id}
                        onUploadComplete={() => {
                          handleUploadComplete(campaign.id);
                          refetch();
                        }}
                      />
                      <p className="mt-2 text-[10px] text-gray-400">PDF • max 4MB • we will review within a few hours</p>
                    </div>
                  )}
                </div>

                {/* Timeline when paid or in production */}
                {(campaign.status === "PAID" || campaign.status === "IN_PRODUCTION" || job) && (
                  <div className="mt-5 border-t pt-5">
                    <div className="text-sm font-medium text-gray-700 mb-3">Production Timeline</div>
                    <ProductionTimeline campaign={campaign as any} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 text-xs text-gray-500">
        Tip: Upload your PDF. We generate fast per-page previews. You will be notified by email when artwork is approved or needs changes.
      </div>
    </div>
  );
}

function getStatusBadge(status: string) {
  if (status === "PAID" || status === "IN_PRODUCTION") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "COMPLETED") return "bg-green-100 text-green-700 border-green-200";
  if (status === "READY_FOR_PAYMENT") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function TargetingSummary({
  campaign,
}: {
  campaign: {
    targetingMetadata?: unknown;
    savedMap?: { metadata?: unknown } | null;
    quantity?: number;
    totalPriceCents?: number | null;
  };
}) {
  const meta = (campaign.targetingMetadata ?? campaign.savedMap?.metadata) as {
    zctas?: string[];
    estimate?: { reach?: number; avgMedianIncome?: number; zctaCount?: number };
  } | null;

  if (!meta?.zctas?.length && !meta?.estimate) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
      {meta.zctas?.slice(0, 5).map((z) => (
        <span key={z} className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 border border-blue-100">
          {z}
        </span>
      ))}
      {(meta.zctas?.length ?? 0) > 5 && (
        <span className="text-gray-400">+{meta.zctas!.length - 5} more</span>
      )}
      {meta.estimate?.reach != null && (
        <span className="text-gray-500">
          · ~{meta.estimate.reach.toLocaleString()} households
        </span>
      )}
      {campaign.totalPriceCents != null && (
        <span className="text-gray-500">
          · Est. ${(campaign.totalPriceCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      )}
    </div>
  );
}

function getArtworkStatusBadge(status: string) {
  if (status === "APPROVED") return "bg-green-100 text-green-700 border-green-200";
  if (status === "REJECTED") return "bg-red-100 text-red-700 border-red-200";
  if (status === "UNDER_REVIEW") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}
