# Postcard Platform

**Online postcards** — A modern platform for local businesses to design, target, and send postcards at scale.

## Artwork & Design Previews
- Client-side PDF preview using PDF.js (instant feedback)
- Server-side thumbnail generation via Inngest (background job)
- `thumbnailUrl` support in database
- Full artwork review workflow (upload → review → approve/reject)

Inngest is used for reliable background processing of thumbnails after upload.

## Getting Started with Inngest
Run `npx inngest-cli@latest dev -u http://localhost:3000/api/inngest` to develop functions locally.

