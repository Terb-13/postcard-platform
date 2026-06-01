"use client";

import { useCallback, useMemo, useState } from "react";
import type { TargetingSelection } from "@/components/targeting";
import {
  parseCampaignWizardParams,
  resolveSizeForProduct,
  type PostcardSize,
  type Product,
} from "@/lib/products";
import {
  WIZARD_STEPS,
  campaignBasicsSchema,
  type WizardStepId,
} from "./schema";

export type ArtworkFile = {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  pageCount?: number;
  thumbnailUrl?: string | null;
  thumbnails?: Record<number, string>;
};

export type CampaignPricing = {
  quantity: number;
  totalPriceCents: number;
  unitPriceCents: number;
};

export type CampaignWizardState = {
  name: string;
  description: string;
  size: PostcardSize;
  product: Product | null;
  /** Size from URL — used to highlight pre-selection in BasicsStep */
  preselectedSize: PostcardSize | null;
  targeting: TargetingSelection;
  artwork: ArtworkFile | null;
  dropDate: string;
  notes: string;
  pricing: CampaignPricing | null;
};

export type CampaignWizardSubmitPayload = CampaignWizardState & {
  stepId: WizardStepId;
};

const STEP_IDS = WIZARD_STEPS.map((step) => step.id);

const DEFAULT_STATE: CampaignWizardState = {
  name: "",
  description: "",
  size: "6x11",
  product: null,
  preselectedSize: null,
  targeting: { zctas: [] },
  artwork: null,
  dropDate: "",
  notes: "",
  pricing: null,
};

function buildInitialState(
  initialState?: Partial<CampaignWizardState>,
  searchParams?: URLSearchParams | { get: (key: string) => string | null }
): CampaignWizardState {
  const base = { ...DEFAULT_STATE, ...initialState };

  if (!searchParams) return base;

  const { product, size } = parseCampaignWizardParams(searchParams);
  if (!product) {
    return {
      ...base,
      size: size ?? base.size,
      preselectedSize: size,
    };
  }

  const resolvedSize = resolveSizeForProduct(product, size ?? base.size);
  return {
    ...base,
    product,
    size: resolvedSize,
    preselectedSize: size ?? resolvedSize,
  };
}

type UseCampaignWizardOptions = {
  initialStep?: number;
  initialState?: Partial<CampaignWizardState>;
  /** When set, ?product= & ?size= are applied on top of initialState */
  searchParams?: URLSearchParams | { get: (key: string) => string | null };
  onSubmit?: (payload: CampaignWizardSubmitPayload) => void | Promise<void>;
};

export function useCampaignWizard(options: UseCampaignWizardOptions = {}) {
  const { initialStep = 0, initialState, searchParams, onSubmit } = options;

  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(Math.max(0, initialStep), STEP_IDS.length - 1)
  );
  const [state, setState] = useState<CampaignWizardState>(() =>
    buildInitialState(initialState, searchParams)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const currentStepId = STEP_IDS[stepIndex] as WizardStepId;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEP_IDS.length - 1;
  const progressPercent = ((stepIndex + 1) / STEP_IDS.length) * 100;

  const updateState = useCallback((partial: Partial<CampaignWizardState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setStepError(null);
  }, []);

  const validateStep = useCallback(
    (stepId: WizardStepId): boolean => {
      clearErrors();

      if (stepId === "basics") {
        const parsed = campaignBasicsSchema.safeParse({
          name: state.name,
          description: state.description || undefined,
          size: state.size,
        });

        if (!parsed.success) {
          const nameError = parsed.error.flatten().fieldErrors.name?.[0];
          if (nameError) setFieldErrors({ name: nameError });
          setStepError(nameError ?? "Please fix the errors below.");
          return false;
        }
        return true;
      }

      if (stepId === "targeting") {
        if (state.targeting.zctas.length === 0) {
          setStepError("Select at least one ZIP code to continue.");
          return false;
        }
        return true;
      }

      if (stepId === "creative") {
        if (!state.artwork?.fileUrl) {
          setStepError("Upload your postcard PDF before continuing.");
          return false;
        }
        return true;
      }

      return true;
    },
    [clearErrors, state.artwork?.fileUrl, state.description, state.name, state.size, state.targeting.zctas.length]
  );

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), STEP_IDS.length - 1);
      setStepIndex(clamped);
      clearErrors();
    },
    [clearErrors]
  );

  const goBack = useCallback(() => {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  }, [goToStep, stepIndex]);

  const goNext = useCallback(async () => {
    if (!validateStep(currentStepId)) return false;

    if (isLastStep) {
      if (!onSubmit) {
        setStepError("Campaign submission is not wired yet.");
        return false;
      }

      setIsSubmitting(true);
      setStepError(null);
      try {
        await onSubmit({ ...state, stepId: currentStepId });
        return true;
      } catch (error) {
        setStepError(
          error instanceof Error ? error.message : "Could not create campaign."
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }

    setIsNavigating(true);
    setStepIndex((prev) => Math.min(prev + 1, STEP_IDS.length - 1));
    setIsNavigating(false);
    return true;
  }, [currentStepId, isLastStep, onSubmit, state, validateStep]);

  const serializedState = useMemo(
    () => ({
      ...state,
      targeting: {
        ...state.targeting,
        zctas: state.targeting.zctas.map((z) => ({ ...z })),
      },
    }),
    [state]
  );

  return {
    steps: WIZARD_STEPS,
    stepIndex,
    currentStepId,
    isFirstStep,
    isLastStep,
    progressPercent,
    state,
    serializedState,
    setState,
    updateState,
    fieldErrors,
    stepError,
    setStepError,
    clearErrors,
    validateStep,
    goToStep,
    goBack,
    goNext,
    isSubmitting,
    isNavigating,
    isBusy: isSubmitting || isNavigating,
  };
}

export type UseCampaignWizardReturn = ReturnType<typeof useCampaignWizard>;
