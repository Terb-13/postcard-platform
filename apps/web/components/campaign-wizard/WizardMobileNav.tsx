"use client";

import { Progress } from "@/components/ui/progress";
import type { WizardStep } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

type Props = {
  steps: readonly WizardStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
};

export function WizardMobileNav({ steps, currentStep, onStepClick, className }: Props) {
  const activeStep = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <nav aria-label="Campaign wizard progress" className={cn("space-y-3 md:hidden", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Step {currentStep + 1} of {steps.length}
          </p>
          <p className="mt-0.5 truncate text-base font-semibold tracking-tight text-[var(--color-text)]">
            {activeStep?.label}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-bg-alt)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
          {Math.round(progress)}%
        </span>
      </div>

      <Progress value={progress} />

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isComplete && onStepClick;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              aria-current={isCurrent ? "step" : undefined}
              onClick={() => isClickable && onStepClick(index)}
              className={cn(
                "min-h-[36px] shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
                isCurrent && "bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)]",
                isComplete &&
                  "bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/15",
                !isComplete &&
                  !isCurrent &&
                  "bg-[var(--color-bg-alt)] text-[var(--color-text-muted)]",
                isClickable ? "cursor-pointer" : "cursor-default"
              )}
            >
              {step.shortLabel ?? step.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
