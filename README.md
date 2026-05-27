# Postcard Platform

**Online postcards** — A modern platform for local businesses to design, target, and send postcards at scale.

## Current Status (as of latest push)

**Core foundation in place:**
- Prisma schema + client
- Clerk authentication + organization sync via webhooks
- tRPC with protected procedures
- Working routers for Campaigns and Saved Maps (EDDM targeting)
- xAI client ready for all generative features
- Production Partner data models ready

## Tech Stack
- Next.js 15 (App Router)
- Prisma + PostgreSQL
- Clerk (Auth + Organizations)
- tRPC
- xAI (all AI features)
- MapLibre GL JS (planned for interactive map)

## Getting Started (Local)

1. Clone the repo
2. `cp .env.example .env.local`
3. Add your keys (Clerk, xAI, Database, etc.)
4. `npm install`
5. `npm run db:push`
6. `npm run dev`

## Next Priorities
- Production Partner REST API endpoints
- Interactive EDDM map tool
- AI-assisted design & copy (via xAI)
- Job routing to print partners

