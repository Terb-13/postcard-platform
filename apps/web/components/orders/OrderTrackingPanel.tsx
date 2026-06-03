"use client";

import type { RouterOutputs } from "@/lib/trpc/client";
import { OrderTrackingTimeline } from "./OrderTrackingTimeline";
import { Badge } from "@/components/ui/badge";

type Tracking = RouterOutputs["campaign"]["getOrderDetail"]["tracking"];

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Props = {
  tracking: Tracking;
};

export function OrderTrackingPanel({ tracking }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">{tracking.stepLabel}</Badge>
        {tracking.partnerName && (
          <span className="text-sm text-[var(--color-text-muted)]">
            via {tracking.partnerName}
          </span>
        )}
      </div>

      <OrderTrackingTimeline tracking={tracking} />

      {tracking.trackingNumber && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)] mb-1">
            {tracking.carrier ?? "Shipment"} tracking
          </p>
          <p className="font-mono text-sm text-[var(--color-text-primary)] break-all">
            {tracking.trackingNumber}
          </p>
          {tracking.shippedAt && (
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Shipped {formatDateTime(tracking.shippedAt)}
            </p>
          )}
          {tracking.trackingUrl && (
            <a
              href={tracking.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Track on {tracking.carrier ?? "carrier"} →
            </a>
          )}
        </div>
      )}

      {tracking.activity.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Recent updates</h3>
          <ul className="space-y-2">
            {tracking.activity.map((event) => (
              <li
                key={event.id}
                className="text-sm border-l-2 border-[var(--color-accent)]/40 pl-3 py-1"
              >
                <span className="font-medium">{event.status.replace(/_/g, " ")}</span>
                {event.note && (
                  <span className="text-[var(--color-text-muted)]"> — {event.note}</span>
                )}
                <span className="block text-xs text-[var(--color-text-muted)]">
                  {formatDateTime(event.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
