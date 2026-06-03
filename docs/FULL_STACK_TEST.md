# Full stack test (Clerk + Supabase + Prisma + Vercel)

Use this checklist for **lupylloyd@gmail.com** (or any test user).

## Current status (linked Supabase `onrvdowfqexfchjhysbm`)

| Layer | Status |
|-------|--------|
| Clerk | User `user_3EP9VyVe7h4zDnfXY7BXKWNPoju` · `lupylloyd@gmail.com` |
| Supabase | User + org `org_lupylloyd_demo` · 3 campaigns seeded |
| Local `.env.local` | Clerk keys only — add `DATABASE_URL` for local Prisma |
| Vercel CLI | Linked `terb-13s-projects/postcard-platform-web` · prod `https://postcard-platform-web.vercel.app` |
| Vercel DB env | `POSTGRES_PRISMA_URL` set; `DATABASE_URL` not required if `packages/db/client.ts` maps it at runtime |

---

## Phase 1 — CLI / database (terminal)

### 1. Clerk

```bash
clerk --mode agent users list </dev/null | grep lupylloyd
```

Expect: `lupylloyd@gmail.com` and `user_3EP9VyVe7h4zDnfXY7BXKWNPoju`.

### 2. Supabase

```bash
cd postcard-platform
supabase db query --linked "
SELECT u.email, u.\"clerkId\", o.name
FROM \"User\" u JOIN \"Organization\" o ON o.id = u.\"organizationId\"
WHERE u.email = 'lupylloyd@gmail.com';
"
```

Expect: one row; `clerkId` matches Clerk.

### 3. Prisma (needs `DATABASE_URL`)

Add Supabase **direct** URI (port 5432) to `packages/db/.env` (see `packages/db/.env.example`), then:

```bash
DATABASE_URL='your-uri' node scripts/verify-stack.mjs lupylloyd@gmail.com
```

Expect: all ✓ checks.

### 4. Vercel env (dashboard or CLI)

```bash
vercel link          # once, in repo root
vercel env ls        # production + preview
```

Confirm these exist for **Production** and **Preview**:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `POSTGRES_PRISMA_URL` (Vercel Supabase integration) — app maps this to Prisma `DATABASE_URL` in `packages/db/client.ts`

Pull locally (optional; **secrets are blank** in the file — use for key names only):

```bash
cd apps/web && vercel env pull .env.vercel.production --environment=production --yes
```

Prisma verify locally needs a real URI:

```bash
SUPABASE_DB_PASSWORD='…' npm run db:env:sync   # writes packages/db/.env
node scripts/verify-stack.mjs lupylloyd@gmail.com
```

Or rely on Supabase CLI (no password in shell):

```bash
supabase db query --linked "SELECT …"
```

---

## Phase 2 — Clerk webhook (production sync)

In [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks → Add endpoint:

| Field | Value |
|-------|--------|
| URL | `https://<your-vercel-domain>/api/webhooks/clerk` |
| Events | `user.created` (add `user.updated` later) |
| Signing secret | Copy to Vercel as `CLERK_WEBHOOK_SECRET` |

Test: Clerk → send test `user.created` → should return 200.

New signups then create `User` + `Organization` without manual SQL.

---

## Phase 3 — Browser test (production)

Use your **live Vercel URL** (not localhost unless local has full `.env`).

1. **Sign in** — `/sign-in` with Google / `lupylloyd@gmail.com`
2. **My campaigns** — `/campaigns`  
   - Expect: **Spring EDDM — Draft** (if same DB as seeded)
3. **Your orders** — `/account/orders`  
   - Expect: 2 orders + timelines  
   - Or click **Load sample data for my account**
4. **Track order** — open shipped campaign  
   - Expect: tracking `1Z999AA10123456784`, activity log
5. **Guest flow (optional)** — sign out → `/campaigns/new` → start wizard (guest session header)

### If production is empty but Supabase CLI shows data

Vercel `DATABASE_URL` is pointing at a **different** database. Fix in Vercel → Settings → Environment Variables, redeploy, reload.

### If Supabase is empty but you’re signed in on production

Webhook never ran; app should still create user on first visit. Check Vercel **Functions** logs for `/api/trpc` and `getCurrentUser` errors.

---

## Phase 4 — Local test

```bash
# Clerk keys (done)
cd apps/web && clerk --mode agent env pull --file .env.local

# Add DATABASE_URL to packages/db/.env (Supabase URI, not REPLACE_ME)

npm run dev
```

1. http://localhost:3000/sign-in — Clerk form loads (no yellow “not configured” box)
2. Sign in → **Your orders** — same data as Supabase query above

---

## Phase 5 — Ops (internal, optional)

1. Supabase: set your `User.role` to `OPERATIONS` or `ADMIN`
2. Visit `/ops` → update a job to **SHIPPED** with a tracking number
3. Refresh **Your orders** detail — timeline + tracking update within ~20s

---

## Quick pass/fail matrix

| Test | Pass means |
|------|------------|
| Clerk user exists | CLI or Dashboard shows your email |
| Supabase `User.clerkId` | Matches Clerk user id |
| Prisma verify script | Exits 0 |
| Live sign-in | No ClerkProvider errors |
| Live orders page | Lists paid campaigns or seed button works |
| Webhook test | 200 from Clerk test event |
| Vercel `DATABASE_URL` | Same project as `supabase link` |

---

## One-liner health check

```bash
DATABASE_URL='postgresql://...' node scripts/verify-stack.mjs lupylloyd@gmail.com
```
