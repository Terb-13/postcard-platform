# Postcard Platform

**Online postcards** — A modern platform for local businesses to design, target, and send postcards at scale.

## Current Capabilities (as of latest push)

**Customer Flow**
- Create campaigns
- Upload artwork (PDF)
- Send to production via **Stripe Checkout**
- Track production status and tracking numbers on `/production`

**Operations / ERP**
- Powerful internal dashboard at `/ops`
- Full job tracking, status updates, re-assignment
- Artwork review & approval
- Internal notes on jobs
- Activity feed

**Backend**
- Full tRPC API
- Production Partner REST API
- Stripe payment integration + webhooks
- xAI for future AI features

## Tech Stack
- Next.js 15 + tRPC
- Prisma + PostgreSQL
- Clerk (Auth + Roles)
- Stripe
- UploadThing (artwork)
- xAI

## Environment Variables
See `.env.example` for required keys (especially Stripe and UploadThing).

## Next Priorities
- Improve customer notifications (when artwork reviewed / job shipped)
- Better design preview tools
- Partner portal improvements

