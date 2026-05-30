import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  step?: string;
  title: string;
  description?: ReactNode;
  badge?: ReactNode;
  className?: string;
};

/** Calm, consistent intro block for every CampaignWizard step. */
export function WizardStepHeader({
  step,
  title,
  description,
  badge,
  className,
}: Props) {
  return (
    <div className={cn("wizard-step-header", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          {step && <p className="wizard-step-eyebrow">{step}</p>}
          <h2 className="heading-sm text-[var(--color-text)]">{title}</h2>
          {description && (
            <p className="text-small mt-2 leading-relaxed text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>
        {badge}
      </div>
    </div>
  );
}

export function CensusLiveBadge() {
  return (
    <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-alt)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Census ACS · live
    </span>
  );
}
