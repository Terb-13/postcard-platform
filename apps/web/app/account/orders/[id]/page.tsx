"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { resolveProductFromCampaign } from "@/lib/products";
import { ProductionTimeline } from "@/components/ProductionTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function formatCurrency(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: order, isLoading, error } = trpc.campaign.getOrderDetail.useQuery(
    { id },
    { enabled: Boolean(id) }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="container max-w-5xl py-10">
          <div className="h-8 w-48 bg-[var(--color-border)] rounded animate-pulse mb-6" />
          <div className="h-64 bg-[var(--color-border)] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] container max-w-5xl py-10">
        <p className="text-[var(--color-text-secondary)]">Order not found.</p>
        <Link href="/account/orders" className="text-[var(--color-accent)] mt-4 inline-block">
          ← Back to order history
        </Link>
      </div>
    );
  }

  const product = resolveProductFromCampaign({
    productSlug: order.productSlug,
    productType: order.productType,
    size: order.size,
  });
  const job = order.productionJobs[0];
  const amountCents = order.amountPaidCents ?? order.totalPriceCents;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container max-w-5xl py-6">
          <Link
            href="/account/orders"
            className="text-sm text-[var(--color-accent)] hover:underline mb-3 inline-block"
          >
            ← Order history
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="heading-md">{order.name}</h1>
            <Badge variant="accent">{order.status.replace(/_/g, " ")}</Badge>
          </div>
          <p className="text-small text-[var(--color-text-muted)] mt-1">
            {product?.title ?? order.productType} · {order.size} ·{" "}
            {order.quantity.toLocaleString()} pieces
          </p>
        </div>
      </header>

      <main className="container max-w-5xl py-8 space-y-6">
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-4">
            Payment
          </h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--color-text-muted)]">Paid at</dt>
              <dd className="font-medium">{formatDateTime(order.paidAt)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">Amount</dt>
              <dd className="font-medium">{formatCurrency(amountCents)}</dd>
            </div>
            {order.purchaserEmail && (
              <div>
                <dt className="text-[var(--color-text-muted)]">Receipt email</dt>
                <dd className="font-medium">{order.purchaserEmail}</dd>
              </div>
            )}
            {order.dropDate && (
              <div>
                <dt className="text-[var(--color-text-muted)]">Target drop</dt>
                <dd className="font-medium">{formatDateTime(order.dropDate)}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-4">
            Production & shipping
          </h2>

          {job?.productionPartner?.name && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Print partner: <strong>{job.productionPartner.name}</strong>
            </p>
          )}

          <ProductionTimeline campaign={order} />

          {job?.trackingNumber && (
            <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-alt)] p-4">
              <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Tracking number</p>
              <p className="font-mono text-sm text-[var(--color-text-primary)]">{job.trackingNumber}</p>
              {job.shippedAt && (
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  Shipped {formatDateTime(job.shippedAt)}
                </p>
              )}
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(job.trackingNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-[var(--color-accent)] hover:underline"
              >
                Track shipment →
              </a>
            </div>
          )}

          {job?.events && job.events.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Activity log</h3>
              <ul className="space-y-2">
                {job.events.map((event) => (
                  <li
                    key={event.id}
                    className="text-sm border-l-2 border-[var(--color-border)] pl-3 py-1"
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
        </Card>

        {order.mailingJob && (
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
              Fulfillment (routes / list)
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Status: <Badge>{order.mailingJob.status}</Badge>
              {order.mailingJob.type && (
                <span className="ml-2 text-[var(--color-text-muted)]">{order.mailingJob.type}</span>
              )}
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
