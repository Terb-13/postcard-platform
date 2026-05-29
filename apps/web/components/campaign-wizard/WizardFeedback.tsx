"use client";

import { cn } from "@/lib/utils";

export type FeedbackVariant = "success" | "error" | "info" | "warning";

type Props = {
  message: string;
  variant?: FeedbackVariant;
  className?: string;
  onDismiss?: () => void;
};

const VARIANT_STYLES: Record<FeedbackVariant, string> = {
  success: "bg-[var(--color-success-light)] border-[var(--color-success)]/20 text-[var(--color-success)]",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/20 text-[var(--color-text)]",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
};

export function WizardFeedback({
  message,
  variant = "info",
  className,
  onDismiss,
}: Props) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200",
        VARIANT_STYLES[variant],
        className
      )}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
