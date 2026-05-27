# Postcard Platform

**Online postcards** — A modern platform for local businesses to design, target, and send postcards at scale.

## Key Features (Current)

**Customer Experience**
- Create campaigns + upload artwork
- Pay via Stripe Checkout to send to production
- Dedicated `/production` page to track status and tracking
- Dedicated success page after payment

**Operations Dashboard (`/ops`)**
- Full visibility into all orders, partners, and statuses
- Payment status clearly shown in tables and drawers
- Internal notes, re-assignment, quick status updates
- Artwork review & approval
- Activity feed

**Notifications**
- Payment confirmation email sent automatically
- Shipping notification email with tracking when job is marked SHIPPED

**Backend**
- Full Stripe integration (Checkout + Webhooks)
- Production Partner REST API
- Auto job creation after payment

## Tech Stack
- Next.js 15 + tRPC
- Prisma + PostgreSQL
- Clerk
- Stripe
- UploadThing
- Resend (emails)
- xAI

