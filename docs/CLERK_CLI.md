# Clerk CLI (this project)

## Install

```bash
npm install -g clerk
# or: brew install clerk/stable/clerk
```

## Non-interactive / Cursor terminal

The CLI can hang without a TTY. Append stdin redirect:

```bash
clerk --mode agent -v </dev/null
clerk --mode agent users list </dev/null
```

## Link + local env

```bash
cd postcard-platform
clerk --mode agent link --app app_3EKm1Bp9k4X8EkjEh3K874xzEh8
cd apps/web && clerk --mode agent env pull --file .env.local
```

Restart `npm run dev` — `/sign-in` and customer portal work locally.

## Re-authenticate

```bash
clerk --mode agent auth login
```

(Run in your terminal; opens browser. `whoami` may fail until token is refreshed.)

## Clerk ↔ Supabase

Clerk does **not** sync to Supabase automatically. This app writes `User` + `Organization` via:

- Webhook: `POST /api/webhooks/clerk` (`user.created`)
- Fallback: `getCurrentUser()` on first signed-in API call

Your Clerk user id must match `User.clerkId` in Supabase (e.g. `user_3EP9VyVe7h4zDnfXY7BXKWNPoju` for `lupylloyd@gmail.com`).

## Useful commands

```bash
clerk --mode agent apps list </dev/null
clerk --mode agent users list </dev/null
clerk --mode agent doctor </dev/null
```
