# Supabase (PostgreSQL)

**Project:** [onrvdowfqexfchjhysbm](https://onrvdowfqexfchjhysbm.supabase.co)  
**Project ref:** `onrvdowfqexfchjhysbm` (use this with `supabase link`)

All app data (campaigns, users, orgs, artwork, orders) lives in this Postgres database. The backend uses **Prisma** as the query layer; `DATABASE_URL` must point at this Supabase project (same data the dashboard shows).

Clerk handles sign-in only. New users are written into Supabase via the Clerk webhook → Prisma.

---

## Install the Supabase CLI

`supabase` is **not** installed by running plain `brew install` or `brew install supabase` (that searches unrelated packages).

### Option A — Homebrew (recommended on Mac)

```bash
brew install supabase/tap/supabase
supabase --version
```

If you see **“Command Line Tools are too outdated”**:

1. Open **System Settings → General → Software Update** and install updates, **or**
2. Run `sudo xcode-select --install` and finish the installer, **then** run `brew install supabase/tap/supabase` again.

### Option B — npm (if Homebrew fails)

```bash
npm install -g supabase
supabase --version
```

### Option C — run without global install

From the repo root:

```bash
npx supabase --version
npx supabase login
npx supabase link --project-ref onrvdowfqexfchjhysbm
```

---

## Log in and link this repo

These steps open a browser; run them **in your own terminal** (not copy-paste lines that start with `#` — those are comments).

```bash
cd /path/to/postcard-platform

supabase login

supabase link --project-ref onrvdowfqexfchjhysbm
```

When prompted for the database password, use the password from **Supabase Dashboard → Project Settings → Database**.

---

## Apply schema (Prisma — source of truth today)

Prisma only reads `DATABASE_URL` from a file on disk — Vercel env vars are **not** visible to local CLI.

1. Create local `.env` (password never committed):

```bash
# From repo root — paste your Supabase DB password OR full URI from Vercel DIRECT_URL:
SUPABASE_DB_PASSWORD='your-password' npm run db:env:sync

# Or:
DATABASE_URL='postgresql://postgres.onrvdowfqexfchjhysbm:...@aws-1-us-west-2.pooler.supabase.com:5432/postgres' npm run db:env:sync
```

2. If the schema was applied via `npm run db:migrate:remote`, baseline Prisma history:

```bash
npm run db:migrate:baseline
```

3. For new schema changes later:

```bash
cd packages/db && npx prisma migrate deploy
# or, without local .env:
npm run db:migrate:remote
```

**First-time schema on an empty database** was applied with `npm run db:migrate:remote` (all tables created). You only need `db:env:sync` for local tools (`prisma studio`, `migrate deploy`, `migrate:baseline`).

If you see `Environment variable not found: DATABASE_URL`, run `npm run db:env:sync` (see step 1).

On Vercel, keep the **transaction pooler** URL (port **6543**) in `DATABASE_URL`.

---

## Run SQL via Supabase CLI

After `login` + `link`:

```bash
# Run a one-off SQL file against the linked remote database
supabase db execute -f ./path/to/script.sql --linked

# Or use the dashboard SQL Editor (same database):
# https://supabase.com/dashboard/project/onrvdowfqexfchjhysbm/sql/new
```

Do **not** maintain a second migration history in `supabase/migrations/` unless you switch fully to Supabase CLI migrations. Until then, change schema with Prisma migrations only.

---

## Environment variables (Vercel / `.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL="https://onrvdowfqexfchjhysbm.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."   # Settings → API → service_role (server only)

# Prisma — pooler on Vercel (6543), direct for local migrate (5432)
DATABASE_URL="postgresql://postgres.onrvdowfqexfchjhysbm:...@...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.onrvdowfqexfchjhysbm:...@...supabase.com:5432/postgres"
```

---

## Verify

```bash
npx prisma studio --schema=packages/db/prisma/schema.prisma
```

Or open **Table Editor** in the Supabase dashboard for project `onrvdowfqexfchjhysbm`.
