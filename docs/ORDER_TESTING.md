# Order & production testing (without Stripe)

## Customer test orders

When `NODE_ENV=development` or `ALLOW_TEST_ORDERS=true` on Vercel:

1. Sign in with Clerk.
2. Open **Order history** (`/account/orders`).
3. Click **Create test order** (or **Test order + tracking** for a shipped sample with tracking `1Z999AA10123456784`).
4. Open **Order details** for timeline, activity log, and tracking.

Production status updates also flow through:

- **Ops** (`/ops`) — `admin.jobs.updateStatus` with tracking number (requires OWNER/ADMIN/OPERATIONS role).
- **Partner API** — `POST /api/production/jobs/[jobId]/status` with `x-production-key` header.

## Ops checklist

1. Ensure a **Production Partner** exists (seeded as `Default Print Partner` on new Supabase DBs).
2. Assign your user `OPERATIONS` or `ADMIN` in the `User` table if `/ops` returns forbidden.
3. Use the job drawer to move status: RECEIVED → SENT_TO_PROVIDER → SHIPPED (add tracking) → DELIVERED.

## Stripe (later)

Set `STRIPE_*` keys and webhook URL; checkout uses the same `activateOrderForProduction` path as test orders.
