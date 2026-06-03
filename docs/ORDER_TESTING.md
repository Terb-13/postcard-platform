# Customer order tracking (proof without Stripe)

## Customer URLs

| URL | Purpose |
|-----|---------|
| `/account/orders` | All paid orders + live status summary |
| `/account/orders/[id]` | Full tracking: timeline, carrier link, activity log |
| `/production?campaign=…` | Redirects to order detail (legacy) |

## API (tRPC — signed in)

- `campaign.getOrderHistory` — list with `tracking` (headline, progress, carrier URL)
- `campaign.getOrderDetail` — full order + `tracking` + artwork + mailing job
- `campaign.getOrderTracking` — lightweight poll payload (same `tracking` shape)
- `campaign.createTestOrder` — dev/demo order without Stripe

Tracking is computed server-side in `packages/api/lib/order-tracking.ts` from campaign status, artwork review, and `ProductionJob` (status, tracking number, events).

## Proof flow (no Stripe)

1. Vercel: `ALLOW_TEST_ORDERS=true` (Preview + local; omit on public production).
2. Sign in → **Your orders** (`/account/orders`).
3. **Create test order** or **Test order + tracking**.
4. Open **Track order** — timeline updates; shipped test uses UPS-style sample tracking.
5. In **Ops** (`/ops`), move job status and add a real tracking number — customer page refreshes within ~20s.

## Ops updates → customer view

When ops uses **Update status** with `SHIPPED` + tracking number (or partner API posts status), customers see:

- New timeline step (Shipped / Delivered)
- Carrier-specific tracking link (UPS / USPS / FedEx when pattern matches)
- Activity log entries from `JobEvent`

## Recommended next (after proof)

1. **Stripe** — real checkout; webhook already shares `activateOrderForProduction`.
2. **Email** — Resend on status changes (shipped template exists in admin router).
3. **Stripe Customer Portal** — optional receipts/refunds.
4. **Public track-by-email** — lookup without account (later).
