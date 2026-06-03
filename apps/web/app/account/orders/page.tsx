"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { resolveProductFromCampaign } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreateTestOrderButton } from "@/components/account/CreateTestOrderButton";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";

function formatCurrency(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OrderHistoryPage() {
  const { data: orders, isLoading } = trpc.campaign.getOrderHistory.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <OrdersPageHeader />
        <div className="container max-w-5xl py-8 space-y-4">
          <div className="h-32 bg-[var(--color-border)] rounded-2xl animate-pulse" />
          <div className="h-32 bg-[var(--color-border)] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <OrdersPageHeader />

      <main className="container max-w-5xl py-8">
        {!orders || orders.length === 0 ? (
          <EmptyOrdersState />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const product = resolveProductFromCampaign({
                productSlug: order.productSlug,
                productType: order.productType,
                size: order.size,
              });
              const productLabel = product?.title ?? order.productType;

              const amountCents = order.amountPaidCents ?? order.totalPriceCents;
              const { tracking } = order;

              return (
                <Card key={order.id} className="p-6 hover:translate-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                          {order.name}
                        </h2>
                        <Badge variant="accent">{tracking.headline}</Badge>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)]">{tracking.detail}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {productLabel} · {order.size} · {order.quantity.toLocaleString()} · Paid{" "}
                        {formatDate(order.paidAt)} · {formatCurrency(amountCents)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Link href={`/account/orders/${order.id}`}>
                        <Button>Track order</Button>
                      </Link>
                    </div>
                  </div>

                  <OrderTrackingTimeline tracking={tracking} compact />
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function OrdersPageHeader() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container max-w-5xl py-6">
        <h1 className="heading-md">Your orders</h1>
        <p className="text-small text-[var(--color-text-muted)] mt-1">
          Track production, shipping, and delivery for paid campaigns.
        </p>
      </div>
    </header>
  );
}

function EmptyOrdersState() {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-white p-10 sm:p-14 text-center max-w-lg mx-auto">
      <h2 className="heading-sm mb-2">No orders yet</h2>
      <p className="text-[var(--color-text-secondary)] mb-6">
        When you pay for a campaign, it will show up here with payment details and production
        tracking. No Stripe yet? Create a test order to preview the flow.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <CreateTestOrderButton variant="primary" />
        <CreateTestOrderButton simulateShipped label="Test order + tracking" />
      </div>
      <Link href="/campaigns/new" className="inline-block mt-6">
        <Button variant="secondary" size="lg">
          Start a campaign
        </Button>
      </Link>
    </div>
  );
}
