"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  buildCampaignDraftHref,
  resolveProductFromCampaign,
  type PostcardSize,
} from "@/lib/products";
import { ArtworkPreview } from "@/components/ArtworkPreview";
import { ArtworkUpload } from "@/components/ArtworkUpload";
import { ProductionTimeline } from "@/components/ProductionTimeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadDemoDataButton } from "@/components/account/LoadDemoDataButton";
import { AuthRequiredCard } from "@/components/account/AuthRequiredCard";

export default function MyCampaignsPage() {
  const { data: campaigns, isLoading, isError, error, refetch } = trpc.campaign.getMine.useQuery();

  const createCheckout = trpc.campaign.createCheckoutSession.useMutation({
    onSuccess: (res) => {
      if (res?.url) window.location.href = res.url;
    },
    onError: (e) => alert(e.message),
  });

  const [generatingFor, setGeneratingFor] = useState<Record<string, boolean>>({});
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});

  const handleUploadComplete = (campaignId: string) => {
    setGeneratingFor((prev) => ({ ...prev, [campaignId]: true }));
    setTimeout(() => {
      refetch();
      setGeneratingFor((prev) => ({ ...prev, [campaignId]: false }));
    }, 1200);
  };

  const handlePageCount = (campaignId: string, count: number) => {
    setPageCounts((prev) => ({ ...prev, [campaignId]: count }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="container max-w-5xl py-10 space-y-6">
          <div className="h-10 w-64 bg-[var(--color-border)] rounded-xl animate-pulse" />
          <div className="h-48 bg-[var(--color-border)] rounded-2xl animate-pulse" />
          <div className="h-48 bg-[var(--color-border)] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="container max-w-5xl py-10">
          <AuthRequiredCard message={error.message} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container max-w-5xl py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="heading-md">My Campaigns</h1>
            <p className="text-small text-[var(--color-text-muted)] mt-1">
              Create campaigns, upload artwork, and pay. After payment, track production under{" "}
              <Link href="/account/orders" className="text-[var(--color-accent)] hover:underline">
                Your orders
              </Link>
              .
            </p>
          </div>
          <Link href="/campaigns/new">
            <Button>+ New Campaign</Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-5xl py-8">
        {!campaigns || campaigns.length === 0 ? (
          <EmptyCampaignsState />
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign) => {
              const artwork = campaign.artwork;
              const job = campaign.productionJobs?.[0];
              const isGenerating = generatingFor[campaign.id] ?? false;
              const knownPageCount = pageCounts[campaign.id] ?? artwork?.pageCount ?? undefined;

              const thumbnailsMap = artwork?.thumbnails?.reduce(
                (acc: Record<number, string>, t) => {
                  acc[t.page] = t.url;
                  return acc;
                },
                {} as Record<number, string>
              );

              const canPay =
                artwork?.status === "APPROVED" && campaign.status !== "PAID" && !job;
              const isRejected = artwork?.status === "REJECTED";
              const isDraft = campaign.status === "DRAFT";
              const resumeHref = buildCampaignDraftHref(
                campaign.id,
                resolveProductFromCampaign({
                  productSlug: campaign.productSlug,
                  productType: campaign.productType,
                  size: campaign.size,
                }),
                campaign.size as PostcardSize
              );

              return (
                <Card key={campaign.id} className="p-6 hover:translate-y-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h2 className="text-xl font-semibold">{campaign.name}</h2>
                        <Badge>
                          {campaign.size} · {campaign.quantity.toLocaleString()}
                        </Badge>
                        <Badge variant="accent">{campaign.status.replace(/_/g, " ")}</Badge>
                      </div>
                      {campaign.dropDate && (
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">
                          Target drop:{" "}
                          {new Date(campaign.dropDate).toLocaleDateString()}
                        </p>
                      )}
                      <TargetingSummary campaign={campaign} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isDraft && (
                        <Link href={resumeHref}>
                          <Button variant="secondary">Continue setup →</Button>
                        </Link>
                      )}
                      {canPay && (
                        <Button
                          onClick={() => createCheckout.mutate({ campaignId: campaign.id })}
                          disabled={createCheckout.isPending}
                          className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90"
                        >
                          {createCheckout.isPending ? "Redirecting…" : "Pay & Send to Production"}
                        </Button>
                      )}
                      {(campaign.status === "PAID" ||
                        campaign.status === "IN_PRODUCTION" ||
                        campaign.status === "COMPLETED") && (
                        <Link
                          href={`/account/orders/${campaign.id}`}
                          className="text-sm text-[var(--color-accent)] hover:underline px-3 py-2"
                        >
                          Track order →
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">Artwork</div>
                      {artwork && (
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {artwork.fileName}{" "}
                          {knownPageCount
                            ? `· ${knownPageCount} page${knownPageCount > 1 ? "s" : ""}`
                            : ""}
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
                          isGeneratingThumbnails={
                            isGenerating ||
                            (!artwork.thumbnails?.length && !!artwork.fileUrl)
                          }
                          rejectionNotes={isRejected ? artwork.notes : null}
                          className="max-h-[320px] w-full"
                          onPageCountChange={(c) => handlePageCount(campaign.id, c)}
                        />

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <Badge variant={artwork.status === "APPROVED" ? "accent" : undefined}>
                            {artwork.status}
                          </Badge>
                          {isRejected && (
                            <span className="text-red-600 text-xs">
                              Re-upload corrected artwork below
                            </span>
                          )}
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
                          <div className="text-xs bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-secondary)]">
                            Ops notes: {artwork.notes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center bg-[var(--color-bg-alt)]/40">
                        <p className="text-sm text-[var(--color-text-muted)] mb-3">
                          No artwork uploaded yet.
                        </p>
                        <ArtworkUpload
                          campaignId={campaign.id}
                          onUploadComplete={() => {
                            handleUploadComplete(campaign.id);
                            refetch();
                          }}
                        />
                        <p className="mt-2 text-micro text-[var(--color-text-muted)]">
                          PDF · max 4MB · reviewed within a few hours
                        </p>
                      </div>
                    )}
                  </div>

                  {(campaign.status === "PAID" ||
                    campaign.status === "IN_PRODUCTION" ||
                    job) && (
                    <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                      <div className="text-sm font-medium mb-3">Production Timeline</div>
                      <ProductionTimeline campaign={campaign} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-micro text-[var(--color-text-muted)]">
          Tip: Upload your PDF and we&apos;ll generate fast per-page previews. You&apos;ll be
          notified by email when artwork is approved or needs changes.
        </p>
      </main>
    </div>
  );
}

function EmptyCampaignsState() {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-white p-10 sm:p-14 text-center max-w-lg mx-auto">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-[var(--color-accent-subtle)] flex items-center justify-center text-[var(--color-accent)] mb-5">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
          />
        </svg>
      </div>
      <h2 className="heading-sm mb-2">No campaigns yet</h2>
      <p className="text-[var(--color-text-secondary)] mb-6">
        Create your first targeted postcard campaign, or load sample data to preview orders and
        tracking.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <LoadDemoDataButton redirectToOrders={false} />
        <Link href="/campaigns/new">
          <Button size="lg" variant="secondary">
            Create your first campaign
          </Button>
        </Link>
      </div>
    </div>
  );
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
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
      {meta.zctas?.slice(0, 5).map((z) => (
        <Badge key={z} variant="accent">
          {z}
        </Badge>
      ))}
      {(meta.zctas?.length ?? 0) > 5 && (
        <span>+{meta.zctas!.length - 5} more</span>
      )}
      {meta.estimate?.reach != null && (
        <span>· ~{meta.estimate.reach.toLocaleString()} households</span>
      )}
      {campaign.totalPriceCents != null && (
        <span>
          · Est. $
          {(campaign.totalPriceCents / 100).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </span>
      )}
    </div>
  );
}
