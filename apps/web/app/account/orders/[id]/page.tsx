"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { resolveProductFromCampaign } from "@/lib/products";
import { OrderTrackingPanel } from "@/components/orders/OrderTrackingPanel";
import { OrderArtworkPreview } from "@/components/orders/OrderArtworkPreview";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const POLL_MS = 20_000;

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
    {
      enabled: Boolean(id),
      refetchInterval: POLL_MS,
    }
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
          ← Back to orders
        </Link>
      </div>
    );
  }

  const product = resolveProductFromCampaign({
    productSlug: order.productSlug,
    productType: order.productType,
    size: order.size,
  });
  const amountCents = order.amountPaidCents ?? order.totalPriceCents;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container max-w-5xl py-6">
          <Link
            href="/account/orders"
            className="text-sm text-[var(--color-accent)] hover:underline mb-3 inline-block"
          >
            ← All orders
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="heading-md">{order.name}</h1>
            <Badge variant="accent">{order.tracking.headline}</Badge>
          </div>
          <p className="text-small text-[var(--color-text-muted)] mt-1">
            Order #{order.id.slice(-8).toUpperCase()} · {product?.title ?? order.productType} ·{" "}
            {order.size} · {order.quantity.toLocaleString()} pieces
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            Updates automatically every 20 seconds
          </p>
        </div>
      </header>

      <main className="container max-w-5xl py-8 space-y-6">
        {order.artwork && (
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-4">
              Postcard artwork
            </h2>
            <OrderArtworkPreview
              size={order.size}
              thumbnailUrl={order.artwork.thumbnailUrl}
              thumbnails={order.artwork.thumbnails}
            />
          </Card>
        )}

        <Card className="p-6">
          <OrderTrackingPanel tracking={order.tracking} />
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-4">
            Order summary
          </h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--color-text-muted)]">Paid</dt>
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
            {order.artwork && (
              <div>
                <dt className="text-[var(--color-text-muted)]">Artwork</dt>
                <dd className="font-medium">{order.artwork.status}</dd>
              </div>
            )}
          </dl>
        </Card>

        {order.mailingJob && (
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
              Mail list & routes
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Fulfillment status: <Badge>{order.mailingJob.status}</Badge>
              <span className="ml-2 text-[var(--color-text-muted)]">{order.mailingJob.type}</span>
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
