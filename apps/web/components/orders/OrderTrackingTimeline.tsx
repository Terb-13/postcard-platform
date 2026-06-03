"use client";

import type { RouterOutputs } from "@/lib/trpc/client";

type Tracking = RouterOutputs["campaign"]["getOrderDetail"]["tracking"];

type Props = {
  tracking: Tracking;
  compact?: boolean;
};

export function OrderTrackingTimeline({ tracking, compact }: Props) {
  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-4 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-4">
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">{tracking.headline}</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{tracking.detail}</p>
          <div className="mt-3 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all"
              style={{ width: `${tracking.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between relative">
        {tracking.timeline.map((step, index) => {
          const isComplete = step.state === "complete";
          const isCurrent = step.state === "current";

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative">
              {index < tracking.timeline.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 h-0.5 w-full -translate-y-1/2 ${
                    isComplete ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
                  }`}
                  style={{ width: "calc(100% - 2rem)" }}
                />
              )}

              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium
                  ${
                    isComplete || isCurrent
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-border)] bg-white text-[var(--color-text-muted)]"
                  }`}
              >
                {isComplete ? "✓" : index + 1}
              </div>

              <div
                className={`mt-2 text-center text-xs max-w-[4.5rem] ${
                  isCurrent
                    ? "font-semibold text-[var(--color-accent)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {step.label}
              </div>

              {step.key === "SHIPPED" && tracking.trackingNumber && (isComplete || isCurrent) && (
                <div className="mt-1 text-[10px] text-center text-[var(--color-accent)] font-mono truncate max-w-[5rem]">
                  {tracking.trackingNumber}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
