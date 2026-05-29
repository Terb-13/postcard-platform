"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/client";
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
import { TargetingStep } from "./steps/TargetingStep";
import { ReviewStep } from "./steps/ReviewStep";
import { CheckoutStep } from "./steps/CheckoutStep";
import { WizardFeedback } from "./WizardFeedback";

const STEP_IDS = WIZARD_STEPS.map((s) => s.id);

type SaveStatus = "idle" | "saving" | "saved" | "error";
type StepError = { step: WizardStepId; message: string } | null;

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
  const [targeting, setTargeting] = useState<TargetingSelection>({ zctas: [] });
  const [dropDate, setDropDate] = useState("");
  const [notes, setNotes] = useState("");
  const [artworkRefetchKey, setArtworkRefetchKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [stepError, setStepError] = useState<StepError>(null);
  const [targetingValidationError, setTargetingValidationError] = useState<string | null>(null);

  const basicsForm = useForm<CampaignBasics>({
    resolver: zodResolver(campaignBasicsSchema),
    defaultValues: {
      name: "",
      size: "6x11",
    },
  });

  const size = basicsForm.watch("size");

  const { data: campaign, refetch: refetchCampaign, isLoading: campaignLoading } =
    trpc.campaign.getById.useQuery({ id: campaignId! }, { enabled: !!campaignId });

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
    { enabled: targeting.zctas.length > 0, staleTime: 30_000, placeholderData: (prev) => prev }
  );

  const currentStepId = STEP_IDS[stepIndex] as WizardStepId;

  useEffect(() => {
    if (saveStatus !== "saved") return;
    const t = setTimeout(() => setSaveStatus("idle"), 3000);
    return () => clearTimeout(t);
  }, [saveStatus]);

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, STEP_IDS.length - 1));
      setStepIndex(clamped);
      setStepError(null);
      setTargetingValidationError(null);
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
    const params = new URLSearchParams(searchParams.toString());
    params.set("campaignId", created.id);
    params.set("step", String(stepIndex));
    router.replace(`/campaigns/new?${params.toString()}`, { scroll: false });
    return created.id;
  }, [
    basicsForm,
    campaignId,
    createCampaign,
    dropDate,
    notes,
    refetchCampaign,
    router,
    searchParams,
    stepIndex,
    targeting,
    updateDraft,
  ]);

  const handleSaveDraft = async () => {
    setSaveStatus("saving");
    setStepError(null);
    try {
      if (stepIndex >= 1 || basicsForm.getValues("name").length >= 2) {
        await ensureCampaignDraft();
      }
      setSaveStatus("saved");
    } catch (e) {
      setSaveStatus("error");
      setStepError({
        step: currentStepId,
        message: e instanceof Error ? e.message : "Could not save draft",
      });
    }
  };

  const handleNext = async () => {
    setStepError(null);
    setTargetingValidationError(null);

    if (currentStepId === "basics") {
      const valid = await basicsForm.trigger();
      if (!valid) return;
      goToStep(stepIndex + 1);
      return;
    }

    if (currentStepId === "targeting") {
      if (targeting.zctas.length === 0) {
        setTargetingValidationError("Select at least one ZIP code to continue.");
        return;
      }
      if (estimateQuery.isError) {
        setStepError({
          step: "targeting",
          message: "Census estimate unavailable. Check your connection and try again.",
        });
        return;
      }
      try {
        setSaveStatus("saving");
        await ensureCampaignDraft();
        setSaveStatus("saved");
        goToStep(stepIndex + 1);
      } catch (e) {
        setSaveStatus("error");
        setStepError({
          step: "targeting",
          message: e instanceof Error ? e.message : "Could not save campaign",
        });
      }
      return;
    }

    if (currentStepId === "creative") {
      if (!campaign?.artwork?.fileUrl) {
        setStepError({
          step: "creative",
          message: "Upload your postcard PDF before continuing.",
        });
        return;
      }
      try {
        setSaveStatus("saving");
        await updateDraft.mutateAsync({
          id: campaignId!,
          dropDate: dropDate || null,
          notes: notes || null,
        });
        setSaveStatus("saved");
        goToStep(stepIndex + 1);
      } catch (e) {
        setSaveStatus("error");
        setStepError({
          step: "creative",
          message: e instanceof Error ? e.message : "Could not save",
        });
      }
      return;
    }

    if (currentStepId === "review") {
      if (!campaignId) return;
      try {
        setSaveStatus("saving");
        await updateDraft.mutateAsync({
          id: campaignId,
          dropDate: dropDate || null,
          notes: notes || null,
        });
        setSaveStatus("saved");
        goToStep(stepIndex + 1);
      } catch (e) {
        setSaveStatus("error");
        setStepError({
          step: "review",
          message: e instanceof Error ? e.message : "Could not save",
        });
      }
      return;
    }

    goToStep(stepIndex + 1);
  };

  const handleBack = () => goToStep(stepIndex - 1);

  const handleStepClick = (index: number) => {
    if (index < stepIndex) goToStep(index);
  };

  const targetingSummary = useMemo(() => {
    const meta = campaign?.targetingMetadata as {
      estimate?: { reach?: number; avgMedianIncome?: number; zctaCount?: number };
      zctas?: string[];
    } | null;
    return meta ?? null;
  }, [campaign?.targetingMetadata]);

  const isSaving = createCampaign.isPending || updateDraft.isPending || saveStatus === "saving";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-24 lg:pb-0">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur sticky top-0 z-40">
        <div className="container max-w-5xl py-4 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/campaigns"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              ← Campaigns
            </Link>
            <h1 className="heading-md mt-1">New campaign</h1>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === "saved" && (
              <span className="text-xs font-medium text-[var(--color-success)] animate-in fade-in">
                Draft saved
              </span>
            )}
            {saveStatus === "saving" && (
              <span className="text-xs text-[var(--color-text-muted)]">Saving…</span>
            )}
            {campaignId && saveStatus === "idle" && (
              <span className="text-micro text-[var(--color-text-muted)] hidden sm:inline">
                Draft · {basicsForm.watch("name") || "Untitled"}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-6 sm:py-10">
        <Stepper
          steps={[...WIZARD_STEPS]}
          currentStep={stepIndex}
          onStepClick={handleStepClick}
          className="mb-8 sm:mb-10"
        />

        {stepError && stepError.step === currentStepId && (
          <WizardFeedback
            message={stepError.message}
            variant="error"
            className="mb-4"
            onDismiss={() => setStepError(null)}
          />
        )}

        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-4 sm:p-8">
            <div
              key={currentStepId}
              className="animate-in fade-in slide-in-from-right-2 duration-300"
            >
              {currentStepId === "basics" && <BasicsStep form={basicsForm} />}

              {currentStepId === "targeting" && (
                <TargetingStep
                  size={size}
                  targeting={targeting}
                  onTargetingChange={setTargeting}
                  validationError={targetingValidationError}
                />
              )}

              {currentStepId === "creative" && campaignId && (
                <CreativeStep
                  size={size}
                  campaignId={campaignId}
                  campaign={campaign}
                  campaignLoading={campaignLoading}
                  artworkRefetchKey={artworkRefetchKey}
                  onUploadComplete={() => {
                    refetchCampaign();
                    setArtworkRefetchKey((k) => k + 1);
                  }}
                />
              )}

              {currentStepId === "creative" && !campaignId && (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center">
                  <p className="text-[var(--color-text-muted)]">
                    Complete targeting first to create your campaign draft.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => goToStep(1)}
                  >
                    Go to targeting
                  </Button>
                </div>
              )}

              {currentStepId === "review" && (
                <ReviewStep
                  basics={basicsForm.getValues()}
                  targeting={targeting}
                  estimate={estimateQuery.data}
                  isEstimateLoading={estimateQuery.isFetching}
                  isEstimateError={estimateQuery.isError}
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
            </div>
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
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                {saveStatus === "saving" ? "Saving…" : "Save draft"}
              </Button>
            )}
            {currentStepId !== "checkout" && (
              <Button type="button" onClick={handleNext} disabled={isSaving}>
                {isSaving ? "Saving…" : "Continue"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CreativeStep({
  size,
  campaignId,
  campaign,
  campaignLoading,
  artworkRefetchKey,
  onUploadComplete,
}: {
  size: string;
  campaignId: string;
  campaign?: RouterOutputs["campaign"]["getById"];
  campaignLoading: boolean;
  artworkRefetchKey: number;
  onUploadComplete: () => void;
}) {
  if (campaignLoading && !campaign) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-[var(--color-border)] rounded" />
        <div className="h-40 bg-[var(--color-border)] rounded-2xl" />
        <div className="h-24 bg-[var(--color-border)] rounded-2xl" />
      </div>
    );
  }

  return (
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
              (acc, t) => {
                if (t.page != null && t.url) acc[t.page] = t.url;
                return acc;
              },
              {} as Record<number, string>
            )}
            pageCount={campaign.artwork.pageCount ?? undefined}
            className="max-h-[400px] w-full"
          />
          <ArtworkUpload campaignId={campaignId} onUploadComplete={onUploadComplete} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center bg-[var(--color-bg-alt)]/50">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="text-sm font-medium mb-1">Drop your PDF here</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">Max 4MB · print-ready artwork</p>
          <ArtworkUpload campaignId={campaignId} onUploadComplete={onUploadComplete} />
        </div>
      )}
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
