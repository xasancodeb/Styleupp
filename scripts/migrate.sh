#!/usr/bin/env bash
# Applies the SQL migrations in supabase/migrations in order using psql.
# Requires SUPABASE_DB_URL (Project Settings → Database → Connection string).
#
# Usage:  SUPABASE_DB_URL=postgres://... ./scripts/migrate.sh
set -euo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  # Fall back to .env.local / .env if present.
  if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi
  if [ -z "${SUPABASE_DB_URL:-}" ] && [ -f .env ]; then set -a; . ./.env; set +a; fi
fi

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "✗ SUPABASE_DB_URL is not set. See .env.example." >&2
  exit 1
fi

MIGRATIONS_DIR="$(dirname "$0")/../supabase/migrations"

echo "→ Applying migrations from ${MIGRATIONS_DIR}"
for file in $(ls "${MIGRATIONS_DIR}"/*.sql | sort); do
  echo "  • $(basename "$file")"
  psql "${SUPABASE_DB_URL}" -v ON_ERROR_STOP=1 -f "$file"
done
echo "✓ Migrations applied."
