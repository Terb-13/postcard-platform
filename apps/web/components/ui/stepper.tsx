"use client";

import { cn } from "@/lib/utils";

export type WizardStep = {
  id: string;
  label: string;
  shortLabel?: string;
};

export function Stepper({
  steps,
  currentStep,
  className,
}: {
  steps: WizardStep[];
  currentStep: number;
  className?: string;
}) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <li key={step.id} className="flex-1 min-w-0">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isComplete && "bg-[var(--color-success)] text-white",
                    isCurrent && "bg-[var(--color-bg-dark)] text-white ring-4 ring-[var(--color-accent-light)]",
                    !isComplete && !isCurrent && "bg-[var(--color-bg-alt)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                  )}
                >
                  {isComplete ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "hidden sm:block text-xs font-medium text-center truncate w-full",
                    isCurrent ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"
                  )}
                >
                  {step.shortLabel ?? step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block absolute h-0.5 -z-10",
                    isComplete ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="sm:hidden text-center text-sm font-medium text-[var(--color-text)] mt-3">
        {steps[currentStep]?.label}
      </p>
    </nav>
  );
}
