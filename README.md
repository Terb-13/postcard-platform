# Postcard Platform

**Online postcards** — A modern platform for local businesses to design, target, and send postcards at scale.

## Current Status

**Strong foundation in place (May 2026):**

**Core**
- Full Prisma schema with production tracking models
- Clerk auth + organization support
- tRPC with protected procedures
- xAI integration ready

**Production & Operations (ERP-like layer)**
- Production Partner REST API (jobs, status updates with tracking, proof upload)
- Powerful internal `admin` tRPC router for operations team
- Cursor-based pagination, search, filtering by partner/status/org
- Job re-assignment to different print partners
- Recent activity feed across all jobs
- Full event history + tracking number support

## Key Internal Capabilities (for your team)

- See every order across all customers
- Real-time view of which partner each job is with and current status
- Filter, search, and paginate production jobs
- Manually update status and attach tracking numbers
- Re-assign jobs between partners
- Recent activity feed (great for monitoring)

## Tech Stack
- Next.js 15 + tRPC
- Prisma + PostgreSQL
- Clerk (Auth + Roles)
- xAI (all generative AI)

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run dev
```

## Next Priorities
- Internal operations dashboard UI (`/ops`)
- Connect campaign creation to actual job routing
- AI design/copy features
- Better partner onboarding

