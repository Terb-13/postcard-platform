"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { resolveProductFromCampaign } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreateTestOrderButton } from "@/components/account/CreateTestOrderButton";

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
  const { data: orders, isLoading } = trpc.campaign.getOrderHistory.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <AccountHeader />
        <div className="container max-w-5xl py-8 space-y-4">
          <div className="h-32 bg-[var(--color-border)] rounded-2xl animate-pulse" />
          <div className="h-32 bg-[var(--color-border)] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <AccountHeader />

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
              const job = order.productionJobs[0];

              return (
                <Card key={order.id} className="p-6 hover:translate-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                          {order.name}
                        </h2>
                        <Badge variant="accent">{order.status.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {productLabel} · {order.size} · {order.quantity.toLocaleString()} pieces
                      </p>
                      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm mt-3">
                        <div>
                          <dt className="text-[var(--color-text-muted)]">Paid</dt>
                          <dd className="font-medium">{formatDate(order.paidAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-[var(--color-text-muted)]">Amount</dt>
                          <dd className="font-medium">{formatCurrency(amountCents)}</dd>
                        </div>
                        {order.dropDate && (
                          <div>
                            <dt className="text-[var(--color-text-muted)]">Drop date</dt>
                            <dd className="font-medium">{formatDate(order.dropDate)}</dd>
                          </div>
                        )}
                        {job?.productionPartner?.name && (
                          <div>
                            <dt className="text-[var(--color-text-muted)]">Partner</dt>
                            <dd className="font-medium">{job.productionPartner.name}</dd>
                          </div>
                        )}
                        {job?.trackingNumber && (
                          <div className="sm:col-span-2">
                            <dt className="text-[var(--color-text-muted)]">Tracking</dt>
                            <dd className="font-medium font-mono text-sm">{job.trackingNumber}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Link href={`/account/orders/${order.id}`}>
                        <Button>Order details</Button>
                      </Link>
                      <Link href={`/production?campaign=${order.id}`}>
                        <Button variant="secondary">Track production</Button>
                      </Link>
                      <Link href="/campaigns">
                        <Button variant="ghost">View in campaigns</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function AccountHeader() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container max-w-5xl py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)] mb-1">
            Account
          </p>
          <h1 className="heading-md">Order history</h1>
          <p className="text-small text-[var(--color-text-muted)] mt-1">
            Paid campaigns and production status.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/campaigns">
            <Button variant="secondary">My campaigns</Button>
          </Link>
          <Link href="/campaigns/new">
            <Button>New campaign</Button>
          </Link>
        </div>
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
