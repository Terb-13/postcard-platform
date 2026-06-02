#!/usr/bin/env bash
# Mark existing SQL migrations as applied (after schema was pushed via db:migrate:remote).
set -euo pipefail
cd "$(dirname "$0")/../packages/db"

if ! grep -q '^DATABASE_URL=' .env 2>/dev/null || grep -q 'REPLACE_ME' .env 2>/dev/null; then
  echo "Run npm run db:env:sync first with your Supabase password."
  exit 1
fi

for dir in prisma/migrations/*/; do
  name="$(basename "$dir")"
  echo "Resolving $name ..."
  npx prisma migrate resolve --applied "$name"
done

echo "Prisma migration history is in sync with Supabase."
