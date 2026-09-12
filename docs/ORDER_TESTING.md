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

## Preview Stripe test checkout (Melissa buyer door)

Melissa drafts persist `previewOnly` and still refuse **list buy** and **mailing finalize**. On Vercel Preview, Demo can complete Stripe **test** checkout without enabling Production `MELISSA_BUYER_DOOR` and without live charges.

### Preview env (CIO — `postcard-platform-web`)

| Variable | Required | Value |
|----------|----------|--------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Yes | `sk_test_...` (never `sk_live_`) |
| `STRIPE_WEBHOOK_SECRET` | Optional | `whsec_...` for `/api/stripe/webhook` |
| `ALLOW_TEST_ORDERS` | Optional | `true` — already implied by `VERCEL_ENV=preview` for this hatch |
| `NEXT_PUBLIC_APP_URL` | Yes | Preview URL (Stripe success/cancel redirects) |

Do **not** set Production `MELISSA_BUYER_DOOR`. Preview buyer door stays at its default (on).

The hatch is: `(VERCEL_ENV=preview` **or** `ALLOW_TEST_ORDERS=true)` **and** `STRIPE_SECRET_KEY` starts with `sk_test_` / `rk_test_`. Hard-off when `VERCEL_ENV=production`.

### Smoke (Demo + card `4242`)

1. Sign in on the Preview deploy as Demo (`lupylloyd@gmail.com` or Load sample data).
2. Plan a Melissa draft (`/campaigns/plan` or **Plan with Melissa**) or open a Demo draft with approved artwork.
3. Upload a PDF if needed. In **Ops**, approve artwork (`APPROVED`) — checkout still requires ops approval.
4. **Pay with Stripe (test)** on Review → Checkout or **My Campaigns**.
5. Use Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
6. Expect redirect to `/production/success`. Campaign becomes paid (webhook, or Preview success-page fallback if webhook secret is unset).
7. Confirm **finalize / list buy** still shows the preview-only block — no Melissa purchase.

## Recommended next (after proof)

1. **Stripe** — real checkout; webhook already shares `activateOrderForProduction`.
2. **Email** — Resend on status changes (shipped template exists in admin router).
3. **Stripe Customer Portal** — optional receipts/refunds.
4. **Public track-by-email** — lookup without account (later).
