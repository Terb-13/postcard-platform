#!/usr/bin/env bash
# Apply Prisma schema to linked Supabase without a local DATABASE_URL password.
# Requires: supabase login && supabase link --project-ref onrvdowfqexfchjhysbm
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TMP="$(mktemp /tmp/postcard_schema.XXXXXX.sql)"
trap 'rm -f "$TMP"' EXIT

# Prisma reads .env; invalid URL breaks migrate diff — use example only
if [[ -f packages/db/.env ]] && grep -q 'REPLACE_ME\|\[YOUR' packages/db/.env 2>/dev/null; then
  mv packages/db/.env packages/db/.env.bak
  RESTORE_ENV=1
fi

npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel packages/db/prisma/schema.prisma \
  --script -o "$TMP"

if [[ "${RESTORE_ENV:-}" == 1 ]]; then
  mv packages/db/.env.bak packages/db/.env
fi

echo "Applying schema to linked Supabase project..."
supabase db query --linked -f "$TMP"
echo "Done. Verify in Supabase Table Editor."
