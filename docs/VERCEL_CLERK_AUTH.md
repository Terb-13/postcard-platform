# Vercel + Clerk auth (root cause)

## Symptom

- Browser: signed in (Clerk UI, profile icon).
- API: `401` on `/api/trpc/*`, logs: `Bearer token present but CLERK_SECRET_KEY missing on server`.
- Health: `hasPublishableKey: true`, `hasSecretKey: false`, `dbOk: true`.

## What that means

| Layer | Status |
|-------|--------|
| Clerk client | OK — publishable key is baked into the client bundle at build time |
| Clerk server | **Broken** — `CLERK_SECRET_KEY` is not available inside Node serverless functions at runtime |
| Supabase / Prisma | OK — `POSTGRES_*` env vars reach lambdas |

Auth is not “going in circles” on logic — **the secret key never reaches API route handlers**, so Bearer verification cannot run.

## Project layout issue

`vercel project inspect postcard-platform-web` shows:

- **Root Directory: `.`** (repo root)
- Build uses `vercel.json` → `outputDirectory: apps/web/.next`

That monorepo layout often causes env vars to attach incorrectly to serverless functions. The app code lives under `apps/web`, but Vercel treats the repo root as the project root.

**Recommended fix (dashboard):**

1. Vercel → **postcard-platform-web** → Settings → General  
2. **Root Directory** → `apps/web`  
3. Redeploy with **Clear build cache**

`apps/web/vercel.json` is set up for that layout (install/build from repo root via `cd ../..`).

## Verify after redeploy

```bash
curl -s https://postcard-platform-web.vercel.app/api/health/db | jq '.clerkEnv'
```

Expect:

```json
{
  "hasSecretKey": true,
  "hasPublishableKey": true,
  "keysPresent": ["CLERK_SECRET_KEY", "CLERK_WEBHOOK_SECRET", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", ...]
}
```

Then tRPC should return **200** when signed in.

## Env checklist (Production)

- `CLERK_SECRET_KEY` — must be non-empty (`sk_live_…` for production Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — `pk_live_…` from the **same** Clerk app
- `NEXT_PUBLIC_CLERK_PROXY_URL` — production FAPI proxy, required on `*.vercel.app` (Vercel owns the TLD, so there is no `clerk.*` CNAME). Expected value:
  `https://postcard-platform-web.vercel.app/__clerk`
  Do **not** set this on a Clerk development instance (proxying is production-only). After setting it on Vercel Production, redeploy with **Clear build cache** so the client bundle inlines the URL.
- `turbo.json` lists the Clerk public keys in `globalEnv` and `build.env` (so builds see them)

If `CLERK_SECRET_KEY` was added in the dashboard with an empty value, re-add it:

```bash
cd apps/web
vercel env rm CLERK_SECRET_KEY production --yes
# paste sk_live_... when prompted:
vercel env add CLERK_SECRET_KEY production
```

## Code path (for reference)

1. Client: `getToken()` → `Authorization: Bearer …` on `/api/trpc`  
2. Server: `verifyToken(token, { secretKey })` in `lib/clerk-request-auth.ts`  
3. Server: `resolvePrismaUserForClerkId` → Supabase user row  

No secret → step 2 never succeeds → `401`.

## Production `*.vercel.app` FAPI proxy

Hobby production on `postcard-platform-web.vercel.app` cannot CNAME `clerk.postcard-platform-web.vercel.app`. Clerk routes Frontend API traffic through the app:

- Proxy URL (Clerk Dashboard → Domains): `https://postcard-platform-web.vercel.app/__clerk`
- App route: `apps/web/app/%5F%5Fclerk/[[...path]]/route.ts` forwards `/__clerk/:path*` to `https://frontend-api.clerk.dev/:path*` with `Clerk-Proxy-Url`, `Clerk-Secret-Key`, and `X-Forwarded-For` (see [Clerk proxy docs](https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi)).
- `clerkMiddleware` matcher includes `/__clerk/:path*` and skips auth on that path. `GET /mcp` stays excluded from the matcher.
- `ClerkProvider` reads `NEXT_PUBLIC_CLERK_PROXY_URL` so clerk-js does not load from `clerk.postcard-platform-web.vercel.app`.

After deploy, **Verify proxy** in the Clerk Dashboard should succeed. Then set `NEXT_PUBLIC_CLERK_PROXY_URL` on Vercel Production and redeploy so `/sign-in` leaves the white “Loading…” state.

Do not commit `sk_live_` values.
