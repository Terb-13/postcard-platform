"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { WizardFeedback } from "./WizardFeedback";

type Props = {
  stepIndex: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  isBackDisabled?: boolean;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onDismissError?: () => void;
  className?: string;
};

export function WizardStep({
  stepIndex,
  totalSteps,
  title,
  description,
  children,
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Continue",
  showBack = true,
  showNext = true,
  isBackDisabled = false,
  isNextDisabled = false,
  isLoading = false,
  error,
  onDismissError,
  className,
}: Props) {
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className={cn("flex flex-col gap-6 sm:gap-8", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
          <span>
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <span className="font-medium text-[var(--color-text-secondary)]">
            {Math.round(progress)}% complete
          </span>
        </div>
        <Progress value={progress} />
        <div>
          <h2 className="heading-sm">{title}</h2>
          {description && (
            <p className="text-small text-[var(--color-text-muted)] mt-1">{description}</p>
          )}
        </div>
      </div>

      {error && (
        <WizardFeedback
          message={error}
          variant="error"
          onDismiss={onDismissError}
        />
      )}

      <div className="min-h-0">{children}</div>

      {(showBack || showNext) && (
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between pt-2 border-t border-[var(--color-border-subtle)]">
          {showBack ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              disabled={isBackDisabled || isLoading}
            >
              {backLabel}
            </Button>
          ) : (
            <span />
          )}
          {showNext && (
            <Button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              className="sm:ml-auto"
            >
              {isLoading ? "Please wait…" : nextLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
