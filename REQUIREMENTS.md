# Postcard Platform - Requirements & Setup Checklist

This document lists everything needed to run the full platform in development and production.

## 1. Required Third-Party Services

| Service          | Purpose                              | Development          | Production                          | Notes |
|------------------|--------------------------------------|----------------------|-------------------------------------|-------|
| **PostgreSQL**   | Primary database                     | Local or cloud       | Cloud (Supabase, Neon, Railway)     | Required |
| **Clerk**        | Authentication + Organizations       | Free tier            | Paid tier recommended               | Organizations must be enabled |
| **Stripe**       | Payments & Checkout                  | Test mode            | Live mode                           | Webhook signing secret required |
| **Resend**       | Transactional emails                 | Free tier            | Paid tier for higher volume         | Domain verification required in prod |
| **UploadThing**  | Customer artwork PDF uploads         | Free tier            | Scale as needed                     | Used for direct customer uploads |
| **Cloudflare R2**| Artwork thumbnails + file storage    | Free tier            | Pay-as-you-go                       | Or any S3-compatible storage |
| **Inngest**      | Background jobs (thumbnail gen)      | Free / local dev     | Cloud or self-hosted                | Powers `artwork/uploaded` event |
| **xAI**          | AI design/copy generation (future)   | API key              | API key                             | Currently stubbed but architected |

## 2. Environment Variables

Copy `.env.example` to `.env.local` (or your platform's equivalent) and fill in:

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="Your Company <notifications@yourdomain.com>"

# File Uploads
UPLOADTHING_TOKEN=...

# Object Storage (Cloudflare R2 recommended)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=your-bucket
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Background Jobs
INNGEST_SIGNING_KEY=...

# AI (xAI)
XAI_API_KEY=xai-...

# Geo-targeting (US Census ACS + Mapbox)
CENSUS_API_KEY=...          # https://api.census.gov/data/key_signup.html (optional but recommended)
NEXT_PUBLIC_MAPBOX_TOKEN=pk....  # Interactive map + zip search
MAPBOX_ACCESS_TOKEN=pk....       # Server-side geocoding (can match public token)

# Pricing (optional)
POSTCARD_BASE_RATE_CENTS=12

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production Notes
- All keys should be **production/live** versions.
- `NEXT_PUBLIC_APP_URL` must be your real domain with HTTPS.
- Stripe webhook must point to `https://yourdomain.com/api/stripe/webhook`.

## 3. Domain & DNS Requirements (Production)

- **App domain**: Point your domain (e.g. `app.postcards.yourcompany.com`) to your hosting platform (Vercel, Railway, Fly.io, etc.).
- **Email domain** (strongly recommended):
  - Verify a domain in Resend (e.g. `yourcompany.com` or `mail.yourcompany.com`).
  - Add the required DNS records (DKIM, SPF, DMARC).
- **Stripe Webhook**: Create a webhook endpoint in Stripe dashboard pointing to your production `/api/stripe/webhook` URL.

## 4. Initial Data / Seeding

After first deploy you will need at least one active Production Partner:

- Use the database directly, or
- Build a simple admin UI (recommended later), or
- Run a seed script.

Example SQL to create a test partner:

```sql
INSERT INTO "ProductionPartner" (id, name, "apiKey", "isActive", "createdAt")
VALUES (gen_random_uuid(), 'Internal Print Shop', 'test_partner_key_123', true, NOW());
```

## 5. Webhook Endpoints That Must Be Public

These endpoints need to be reachable from external services:

| Endpoint                              | Called By     | Required |
|---------------------------------------|---------------|----------|
| `/api/stripe/webhook`                 | Stripe        | Yes |
| `/api/inngest`                        | Inngest       | Yes (for background jobs) |
| `/api/webhooks/clerk`                 | Clerk         | Yes |
| `/api/production/jobs` + status routes| Print Partners| Yes (once you have real partners) |

## 6. Recommended Hosting Stack (Production)

- **Frontend + API**: Vercel or Railway
- **Database**: Supabase or Neon
- **Storage**: Cloudflare R2
- **Background Jobs**: Inngest Cloud
- **Emails**: Resend

## 7. Future / Nice-to-Have

- Custom domain for customer-facing site
- Analytics (PostHog, Plausible, or internal)
- Error monitoring (Sentry)
- Logging aggregation
- Rate limiting on public endpoints
- Production Partner self-service portal

## 8. Vercel Deployment (Recommended)

This project is designed to deploy easily to Vercel.

### Recommended Vercel Settings

1. Connect the GitHub repo in Vercel.
2. Use these settings:
   - **Framework Preset**: Next.js (auto-detected via Turborepo)
   - **Root Directory**: `.` (monorepo root — leave empty)
   - **Build / Install / Dev commands**: defined in root `vercel.json` (`turbo run build --filter=web`)
   - **Output Directory**: leave blank (do not override — Vercel/Turbo resolve `.next` under `apps/web`)

3. **Important**: You must set **all** the environment variables from section 2 above in Vercel (under Project Settings → Environment Variables).

### Database for Vercel

You cannot use a local Postgres. Use one of these:
- **Neon** (recommended – generous free tier + Vercel integration)
- **Supabase**
- **Railway**

After creating the database, copy the connection string into `DATABASE_URL`.

### After Deploy

- You will need to configure the following webhooks with your production domain:
  - Stripe Webhook → `https://yourdomain.com/api/stripe/webhook`
  - Clerk Webhook → `https://yourdomain.com/api/webhooks/clerk`
  - Inngest → `https://yourdomain.com/api/inngest`

- Run database migrations: `npx prisma db push` (or use a migration script in CI).

- For production, strongly consider setting up a custom domain and verifying it in Resend for emails.

---

**Current Status (as of latest build)**

- Customer artwork upload + multi-page preview + rejection flow: **Functional**
- Payment → ProductionJob creation + email: **Functional**
- Ops dashboard (Jobs list, drawer, actions): **Functional** with analytics
- Production Partner self-service portal: **Functional** with real file uploads
- xAI integration: Basic concept generation live in campaign creation

Run `npm install` after pulling, then `npx prisma generate`.