"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import { TargetingMap } from "@/components/targeting";
import type { TargetingSelection } from "@/components/targeting";
import { ArtworkUpload } from "@/components/ArtworkUpload";
import { ArtworkPreview } from "@/components/ArtworkPreview";
import {
  WIZARD_STEPS,
  campaignBasicsSchema,
  type CampaignBasics,
  type WizardStepId,
} from "./schema";
import { BasicsStep } from "./steps/BasicsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { CheckoutStep } from "./steps/CheckoutStep";

const STEP_IDS = WIZARD_STEPS.map((s) => s.id);

export function CampaignWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = Math.min(
    Math.max(0, parseInt(searchParams.get("step") ?? "0", 10) || 0),
    STEP_IDS.length - 1
  );

  const [stepIndex, setStepIndex] = useState(initialStep);
  const [campaignId, setCampaignId] = useState<string | null>(
    searchParams.get("campaignId")
  );
  const [targeting, setTargeting] = useState<TargetingSelection>({
    zctas: [],
  });
  const [dropDate, setDropDate] = useState("");
  const [notes, setNotes] = useState("");
  const [artworkRefetchKey, setArtworkRefetchKey] = useState(0);

  const basicsForm = useForm<CampaignBasics>({
    resolver: zodResolver(campaignBasicsSchema),
    defaultValues: {
      name: "",
      size: "6x11",
    },
  });

  const size = basicsForm.watch("size");

  const utils = trpc.useUtils();
  const { data: campaign, refetch: refetchCampaign } = trpc.campaign.getById.useQuery(
    { id: campaignId! },
    { enabled: !!campaignId }
  );

  const createCampaign = trpc.campaign.create.useMutation();
  const updateDraft = trpc.campaign.updateDraft.useMutation();
  const createCheckout = trpc.campaign.createCheckoutSession.useMutation({
    onSuccess: (res) => {
      if (res?.url) window.location.href = res.url;
    },
  });

  const estimateQuery = trpc.targeting.estimateAudience.useQuery(
    {
      zctas: targeting.zctas.map((z) => z.zcta),
      size,
      quantityOverride: targeting.quantityOverride,
    },
    { enabled: targeting.zctas.length > 0, staleTime: 30_000 }
  );

  const currentStepId = STEP_IDS[stepIndex] as WizardStepId;

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, STEP_IDS.length - 1));
      setStepIndex(clamped);
      const params = new URLSearchParams();
      params.set("step", String(clamped));
      if (campaignId) params.set("campaignId", campaignId);
      router.replace(`/campaigns/new?${params.toString()}`, { scroll: false });
    },
    [campaignId, router]
  );

  const ensureCampaignDraft = useCallback(async () => {
    const basics = basicsForm.getValues();
    const zctaList = targeting.zctas.map((z) => z.zcta);

    if (campaignId) {
      await updateDraft.mutateAsync({
        id: campaignId,
        name: basics.name,
        size: basics.size,
        targeting:
          zctaList.length > 0
            ? {
                zctas: zctaList,
                geoJson: targeting.geoJson,
                quantityOverride: targeting.quantityOverride,
              }
            : undefined,
        dropDate: dropDate || null,
        notes: notes || null,
      });
      await refetchCampaign();
      return campaignId;
    }

    const created = await createCampaign.mutateAsync({
      name: basics.name,
      size: basics.size,
      dropDate: dropDate || undefined,
      notes: notes || undefined,
      targeting:
        zctaList.length > 0
          ? {
              zctas: zctaList,
              geoJson: targeting.geoJson,
              quantityOverride: targeting.quantityOverride,
            }
          : undefined,
    });
    setCampaignId(created.id);
    return created.id;
  }, [
    basicsForm,
    campaignId,
    createCampaign,
    dropDate,
    notes,
    refetchCampaign,
    targeting,
    updateDraft,
  ]);

  const handleNext = async () => {
    if (currentStepId === "basics") {
      const valid = await basicsForm.trigger();
      if (!valid) return;
      goToStep(stepIndex + 1);
      return;
    }

    if (currentStepId === "targeting") {
      if (targeting.zctas.length === 0) {
        alert("Select at least one ZIP code to continue.");
        return;
      }
      try {
        await ensureCampaignDraft();
        goToStep(stepIndex + 1);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Could not save campaign");
      }
      return;
    }

    if (currentStepId === "creative") {
      if (!campaign?.artwork?.fileUrl) {
        alert("Upload your postcard PDF before continuing.");
        return;
      }
      try {
        await updateDraft.mutateAsync({
          id: campaignId!,
          dropDate: dropDate || null,
          notes: notes || null,
        });
        goToStep(stepIndex + 1);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Could not save");
      }
      return;
    }

    if (currentStepId === "review") {
      if (!campaignId) return;
      try {
        await updateDraft.mutateAsync({
          id: campaignId,
          dropDate: dropDate || null,
          notes: notes || null,
        });
        goToStep(stepIndex + 1);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Could not save");
      }
      return;
    }

    goToStep(stepIndex + 1);
  };

  const handleBack = () => goToStep(stepIndex - 1);

  const targetingSummary = useMemo(() => {
    const meta = campaign?.targetingMetadata as {
      estimate?: { reach?: number; avgMedianIncome?: number; zctaCount?: number };
      zctas?: string[];
    } | null;
    return meta ?? null;
  }, [campaign?.targetingMetadata]);

  const isSaving = createCampaign.isPending || updateDraft.isPending;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur sticky top-0 z-40">
        <div className="container max-w-5xl py-4 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/campaigns"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              ← Campaigns
            </Link>
            <h1 className="heading-md mt-1">New campaign</h1>
          </div>
          {campaignId && (
            <span className="text-micro text-[var(--color-text-muted)] hidden sm:inline">
              Draft saved
            </span>
          )}
        </div>
      </header>

      <main className="container max-w-5xl py-6 sm:py-10">
        <Stepper steps={[...WIZARD_STEPS]} currentStep={stepIndex} className="mb-8 sm:mb-10" />

        <Card className="mb-6">
          <CardContent className="p-4 sm:p-8">
            {currentStepId === "basics" && <BasicsStep form={basicsForm} />}

            {currentStepId === "targeting" && (
              <div className="space-y-4">
                <div>
                  <h2 className="heading-sm">Who should receive your postcards?</h2>
                  <p className="text-small text-[var(--color-text-muted)] mt-1">
                    Search ZIP codes powered by real US Census data. Watch reach and cost update
                    live.
                  </p>
                </div>
                <TargetingMap
                  size={size}
                  selection={targeting}
                  onSelectionChange={setTargeting}
                />
              </div>
            )}

            {currentStepId === "creative" && campaignId && (
              <div className="space-y-6">
                <div>
                  <h2 className="heading-sm">Upload your postcard design</h2>
                  <p className="text-small text-[var(--color-text-muted)] mt-1">
                    PDF only. Our team reviews within a few hours before you can pay.
                  </p>
                </div>

                <PostcardMockup size={size} />

                {campaign?.artwork?.fileUrl ? (
                  <div className="space-y-4">
                    <ArtworkPreview
                      key={artworkRefetchKey}
                      fileUrl={campaign.artwork.fileUrl}
                      thumbnailUrl={campaign.artwork.thumbnailUrl}
                      thumbnails={campaign.artwork.thumbnails?.reduce(
                        (acc, t) => ({ ...acc, [t.page]: t.url }),
                        {} as Record<number, string>
                      )}
                      pageCount={campaign.artwork.pageCount ?? undefined}
                      className="max-h-[400px] w-full"
                    />
                    <ArtworkUpload
                      campaignId={campaignId}
                      onUploadComplete={() => {
                        refetchCampaign();
                        setArtworkRefetchKey((k) => k + 1);
                      }}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center">
                    <ArtworkUpload
                      campaignId={campaignId}
                      onUploadComplete={() => {
                        refetchCampaign();
                        setArtworkRefetchKey((k) => k + 1);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {currentStepId === "creative" && !campaignId && (
              <p className="text-[var(--color-text-muted)]">
                Complete targeting first to create your campaign draft.
              </p>
            )}

            {currentStepId === "review" && (
              <ReviewStep
                basics={basicsForm.getValues()}
                targeting={targeting}
                estimate={estimateQuery.data}
                dropDate={dropDate}
                onDropDateChange={setDropDate}
                notes={notes}
                onNotesChange={setNotes}
                campaign={campaign}
                targetingSummary={targetingSummary}
              />
            )}

            {currentStepId === "checkout" && campaignId && (
              <CheckoutStep
                campaign={campaign}
                onPay={() => createCheckout.mutate({ campaignId })}
                isPaying={createCheckout.isPending}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={stepIndex === 0 || isSaving}
          >
            Back
          </Button>
          <div className="flex gap-3">
            {currentStepId !== "checkout" && (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    if (stepIndex >= 1) await ensureCampaignDraft();
                    router.push("/campaigns");
                  } catch {
                    router.push("/campaigns");
                  }
                }}
              >
                Save draft
              </Button>
            )}
            {currentStepId !== "checkout" ? (
              <Button type="button" onClick={handleNext} disabled={isSaving}>
                {isSaving ? "Saving…" : "Continue"}
              </Button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

function PostcardMockup({ size }: { size: string }) {
  const aspect =
    size === "4x6" ? "aspect-[3/2]" : size === "6x11" ? "aspect-[11/6]" : "aspect-[7/5]";
  return (
    <div className="flex justify-center">
      <div
        className={`${aspect} w-full max-w-xs rounded-lg shadow-lg border-2 border-white bg-gradient-to-br from-[var(--color-bg-dark)] to-[#1e3a5f] flex items-center justify-center`}
      >
        <div className="text-center text-white/90 p-4">
          <p className="text-xs uppercase tracking-widest opacity-70">Preview</p>
          <p className="font-semibold mt-1">{size.replace("x", "×")}&quot;</p>
        </div>
      </div>
    </div>
  );
}
