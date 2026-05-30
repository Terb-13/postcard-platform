"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import { formatTrpcError } from "@/lib/utils";
import type { RouterOutputs } from "@/lib/trpc/client";
import type { TargetingSelection } from "@/components/targeting";
import { ArtworkUpload } from "@/components/ArtworkUpload";
import { ArtworkPreview, type PostcardSide } from "@/components/campaign-wizard/ArtworkPreview";
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
import { WizardStepHeader } from "./WizardStepHeader";
import { WizardMobileNav } from "./WizardMobileNav";

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
      filters: targeting.filters,
      geoJson: targeting.geoJson,
    },
    { enabled: targeting.zctas.length > 0, staleTime: 30_000, placeholderData: (prev) => prev }
  );

  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!campaign || hydratedRef.current) return;
    hydratedRef.current = true;

    const validSizes = ["4x6", "5x7", "6x9", "6x11"] as const;
    const campaignSize = validSizes.includes(campaign.size as (typeof validSizes)[number])
      ? (campaign.size as CampaignBasics["size"])
      : "6x11";

    basicsForm.reset({
      name: campaign.name,
      size: campaignSize,
    });

    if (campaign.dropDate) {
      setDropDate(new Date(campaign.dropDate).toISOString().slice(0, 10));
    }
    if (campaign.notes) setNotes(campaign.notes);

    const meta = campaign.targetingMetadata as {
      zctas?: string[];
      filters?: TargetingSelection["filters"];
    } | null;

    const zctaList = meta?.zctas ?? [];
    if (zctaList.length > 0) {
      setTargeting({
        zctas: zctaList.map((z) => ({ zcta: z, placeName: `ZCTA ${z}` })),
        filters: meta?.filters,
        geoJson: campaign.savedMap?.geoJson
          ? (campaign.savedMap.geoJson as unknown as TargetingSelection["geoJson"])
          : undefined,
      });
    }
  }, [campaign, basicsForm]);

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
      if (estimateQuery.isFetching && !estimateQuery.data) {
        setTargetingValidationError("Please wait for Census estimates to finish loading.");
        return;
      }
      if (estimateQuery.isError) {
        setStepError({
          step: "targeting",
          message: formatTrpcError(estimateQuery.error),
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
    <div className="min-h-screen bg-[var(--color-bg)] pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-10">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
        <div className="container flex max-w-5xl items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4">
          <div className="min-w-0">
            <Link
              href="/campaigns"
              className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              ← Campaigns
            </Link>
            <h1 className="heading-md mt-0.5 truncate sm:mt-1">New campaign</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {saveStatus === "saved" && (
              <span className="animate-in fade-in text-xs font-medium text-[var(--color-success)]">
                Draft saved
              </span>
            )}
            {saveStatus === "saving" && (
              <span className="text-xs text-[var(--color-text-muted)]">Saving…</span>
            )}
            {campaignId && saveStatus === "idle" && (
              <span className="text-micro hidden max-w-[8rem] truncate text-[var(--color-text-muted)] sm:inline md:max-w-none">
                Draft · {basicsForm.watch("name") || "Untitled"}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-5 sm:py-8 md:py-10">
        <Stepper
          steps={[...WIZARD_STEPS]}
          currentStep={stepIndex}
          onStepClick={handleStepClick}
          className="mb-8 hidden md:block sm:mb-10"
        />

        <WizardMobileNav
          steps={WIZARD_STEPS}
          currentStep={stepIndex}
          onStepClick={handleStepClick}
          className="mb-5"
        />

        {stepError && stepError.step === currentStepId && (
          <WizardFeedback
            message={stepError.message}
            variant="error"
            className="mb-4"
            onDismiss={() => setStepError(null)}
          />
        )}

        <Card className="mb-5 overflow-hidden border-[var(--color-border)] shadow-[var(--shadow-md)] md:mb-6 md:shadow-[var(--shadow-lg)]">
          <CardContent className="p-5 sm:p-6 md:p-8 lg:p-10">
            <div
              key={currentStepId}
              className="animate-in wizard-step-enter"
            >
              {currentStepId === "basics" && <BasicsStep form={basicsForm} />}

              {currentStepId === "targeting" && (
                <TargetingStep
                  size={size}
                  targeting={targeting}
                  onTargetingChange={setTargeting}
                  validationError={targetingValidationError}
                  isEstimateLoading={
                    estimateQuery.isFetching && targeting.zctas.length > 0
                  }
                  censusError={
                    estimateQuery.isError && targeting.zctas.length > 0
                      ? formatTrpcError(estimateQuery.error)
                      : null
                  }
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

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 shadow-[0_-4px_24px_-4px_rgb(15_23_42_/_0.08)] backdrop-blur md:static md:z-auto md:border-0 md:bg-transparent md:shadow-none md:backdrop-blur-none">
          <div className="container flex max-w-5xl flex-col gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-between md:px-0 md:py-0">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={stepIndex === 0 || isSaving}
              className="min-h-[48px] w-full sm:w-auto"
            >
              Back
            </Button>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
              {currentStepId !== "checkout" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="min-h-[48px] w-full sm:w-auto"
                >
                  {saveStatus === "saving" ? "Saving…" : "Save draft"}
                </Button>
              )}
              {currentStepId !== "checkout" && (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSaving}
                  className="min-h-[48px] w-full sm:w-auto"
                >
                  {isSaving ? "Saving…" : "Continue"}
                </Button>
              )}
            </div>
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
  const [activeSide, setActiveSide] = useState<PostcardSide>("front");

  const artworkThumbnails = campaign?.artwork?.thumbnails?.reduce(
    (acc, t) => {
      if (t.page != null && t.url) acc[t.page] = t.url;
      return acc;
    },
    {} as Record<number, string>
  );

  const frontSrc =
    artworkThumbnails?.[1] ?? campaign?.artwork?.thumbnailUrl ?? null;
  const backSrc = artworkThumbnails?.[2] ?? null;
  const isPreviewLoading = Boolean(
    campaign?.artwork?.fileUrl && !frontSrc
  );

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
    <div className="space-y-6 md:space-y-8">
      <WizardStepHeader
        title="Upload your postcard design"
        description="PDF only — front and back as separate pages. Our team reviews within a few hours before you can pay."
      />

      <ArtworkPreview
        key={artworkRefetchKey}
        frontSrc={frontSrc}
        backSrc={backSrc}
        activeSide={activeSide}
        onActiveSideChange={setActiveSide}
        isLoading={isPreviewLoading}
        postcardSize={size}
      />

      {campaign?.artwork?.fileUrl ? (
        <div className="wizard-review-card">
          <p className="wizard-review-card-title">Replace artwork</p>
          <ArtworkUpload campaignId={campaignId} onUploadComplete={onUploadComplete} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-alt)]/50 p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-text-muted)]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium">Drop your PDF here</p>
          <p className="mb-4 text-xs text-[var(--color-text-muted)]">Max 4MB · print-ready artwork</p>
          <ArtworkUpload campaignId={campaignId} onUploadComplete={onUploadComplete} />
        </div>
      )}
    </div>
  );
}
