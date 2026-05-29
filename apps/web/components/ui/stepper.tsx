"use client";

import { cn } from "@/lib/utils";

export type WizardStep = {
  id: string;
  label: string;
  shortLabel?: string;
};

type Props = {
  steps: WizardStep[];
  currentStep: number;
  className?: string;
  /** Allow clicking completed steps to navigate back */
  onStepClick?: (index: number) => void;
};

export function Stepper({ steps, currentStep, className, onStepClick }: Props) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isComplete && onStepClick;

          return (
            <li
              key={step.id}
              className={cn("flex flex-1 min-w-0 items-start", index < steps.length - 1 && "pr-1")}
            >
              <div className="flex flex-col items-center w-full min-w-0">
                <div className="flex items-center w-full">
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onStepClick(index)}
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
                      isComplete && "bg-[var(--color-success)] text-white",
                      isCurrent &&
                        "bg-[var(--color-bg-dark)] text-white ring-4 ring-[var(--color-accent-light)] scale-105",
                      !isComplete &&
                        !isCurrent &&
                        "bg-[var(--color-bg-alt)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
                      isClickable &&
                        "cursor-pointer hover:ring-2 hover:ring-[var(--color-success)]/30 hover:scale-105",
                      !isClickable && !isCurrent && "cursor-default"
                    )}
                  >
                    {isComplete ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </button>

                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 sm:mx-2 h-0.5 flex-1 rounded-full transition-colors duration-300 mt-[18px]",
                        isComplete ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"
                      )}
                      aria-hidden
                    />
                  )}
                </div>

                <span
                  className={cn(
                    "mt-2 text-[10px] sm:text-xs font-medium text-center truncate w-full px-0.5",
                    isCurrent ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]",
                    isComplete && "text-[var(--color-success)]"
                  )}
                >
                  <span className="sm:hidden">{step.shortLabel ?? step.label}</span>
                  <span className="hidden sm:inline">{step.label}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
