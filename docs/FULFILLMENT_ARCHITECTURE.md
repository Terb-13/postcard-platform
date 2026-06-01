# Fulfillment architecture (backend extension)

This document maps the proposed fulfillment stack onto the **existing** postcard-platform codebase. The marketing map, Census targeting UI, campaign wizard, and checkout flows stay as-is; we add a production-grade layer underneath for real counts, final pricing, and Drummond handoff.

## What stays unchanged (frontend)

| Area | Location | Role |
|------|----------|------|
| Homepage map + Census demo | `apps/web/components/marketing/*`, `TargetingMap` | Pre-checkout **estimates** only |
| Campaign wizard | `apps/web/components/campaign-wizard/*` | Create campaign, artwork, pay |
| Secondary marketing pages | `/every-door-direct-mail`, `/targeted-direct-mail`, etc. | Acquisition; `?product=eddm` seeds wizard |
| tRPC targeting | `targeting.getCensusStatsForZctas` | ZIP-level demographics + estimate pricing |

## What already exists (backend)

| Piece | Location | Gap |
|-------|----------|-----|
| `Campaign` | `packages/db/prisma/schema.prisma` | Has `quantity`, `targetingMetadata`, Stripe fields — **estimate** at order time |
| `ProductionJob` | Same | Partner ops (proof, ship, tracking) — payload is ZIP summary, **no manifest** |
| `calculateCampaignPricing` | `packages/api/lib/pricing.ts` | Print rate × quantity only — no postage/list split |
| Census | `packages/api/lib/census.ts` | Aggregates, not addresses |
| Stripe webhook | `apps/web/app/api/stripe/webhook/route.ts` | Creates `ProductionJob` after pay |

## New layer (this build)

```
Campaign (existing)
   └── MailingJob (new, 1:1)     ← accurate counts, cost breakdown, manifest
           └── ProductionJob (existing)  ← updated payload after handoff
```

### Services (`packages/api/services/`)

| Service | Responsibility |
|---------|----------------|
| `pricing.service` | Single source of truth: estimate vs final, `costBreakdown` JSON |
| `eddm.service` | USPS/carrier routes, min-piece rules, manifest rows (EDDM MVP) |
| `targeted.service` | Melissa/Data Axle stub (Phase 1.5) |
| `drummond-handoff.service` | CSV/JSON → S3, notify partner |
| `mailing-finalize.service` | Orchestrates finalize after payment |

### API surface

| Route | Purpose |
|-------|---------|
| `POST /api/campaigns/[id]/finalize` | Trigger list/route generation + final pricing |
| `GET /api/eddm/routes?zips=` | Selectable routes + counts (map enhancement) |
| `POST /api/pricing/calculate` | Estimate or final breakdown (checkout + review) |
| `GET /api/mailing-jobs/[id]/status` | Job status + cost breakdown (customer/ops) |
| `POST /api/mailing-jobs/[id]/handoff` | Drummond export trigger |
| `trpc.mailing.*` | Same operations for logged-in app UI |

### Light frontend additions (no redesign)

| Page | When |
|------|------|
| `/campaigns/[id]/finalize` | Post-checkout: confirm routes / see final cost |
| `/campaigns/[id]/mailing` | Job status + breakdown (+ manifest link for ops) |

Redirect Stripe `success_url` to finalize when `MailingJob.status === PENDING` (incremental).

## Data flow — EDDM (July 17 MVP)

1. User selects ZIPs on existing map → Census **estimate** (unchanged).
2. Wizard creates `Campaign` with `productType: EDDM`, estimate `quantity` / `totalPriceCents`.
3. Checkout (unchanged Stripe session).
4. Webhook: `PAID` + `MailingJob` (`PENDING`) + `ProductionJob` (`RECEIVED`).
5. Customer opens **Finalize** (or auto-job): `POST /api/campaigns/[id]/finalize`.
6. `eddm.service` resolves carrier routes → `finalQuantity`, `costBreakdown`.
7. `drummond-handoff.service` uploads manifest → `manifestUrl`, `SENT_TO_PRINTER`.
8. Optional: Stripe balance adjustment if final ≠ estimate (later).

## Data flow — Targeted (Phase 1.5)

Same steps; step 6 calls `targeted.service` (vendor list + CASS/DPV) instead of `eddm.service`. UI checkboxes already label unimplemented filters as “coming soon.”

## Implementation order

1. ✅ `MailingJob` model + migration  
2. ✅ `pricing.service` + `/api/pricing/calculate`  
3. ✅ `eddm.service` stub + `/api/eddm/routes`  
4. ✅ Finalize orchestration + webhook wiring  
5. 🔲 Real USPS EDDM route API integration  
6. 🔲 Drummond file spec + S3 upload  
7. 🔲 Finalize + mailing status pages in `apps/web`  
8. 🔲 `targeted.service` vendor integration  

## Environment

```env
# EDDM routes (no public USPS route API — use aggregator or Melissa)
EDDM_ROUTES_PROVIDER=stub          # stub | http | melissa
EDDM_ROUTES_API_URL=               # when provider=http — returns { routes: [...] }
EDDM_ROUTES_API_KEY=

# Targeted lists (Phase 1.5)
MELISSA_API_KEY=
TARGETED_LIST_PROVIDER=melissa

# Manifest upload (Drummond) — uses existing R2_* from REQUIREMENTS.md
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=

# Pricing overrides (optional)
POSTAGE_CENTS_PER_PIECE=20
LIST_CENTS_PER_PIECE_EDDM=0
LIST_CENTS_PER_PIECE_TARGETED=8
```

## Staging deploy

- Branch: `staging` → Vercel preview/staging project (configure in Vercel: Production Branch = `main`, Preview = `staging` or all branches).
- After deploy: `npx prisma db push` against staging `DATABASE_URL`.
- Set all env vars above on the **staging** Vercel environment.

## Next priority (post-staging)

1. **Drummond** — Confirm CSV column spec; adjust `buildEddmManifestCsv` + `DrummondManifestMeta`.
2. **USPS EDDM** — Wire `EDDM_ROUTES_PROVIDER=http` to your route aggregator, or Melissa carrier-route API.
