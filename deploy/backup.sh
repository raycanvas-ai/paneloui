#!/usr/bin/env bash
# Nightly database backup, run by cron on the server (see deploy/README.md): a plain-SQL pg_dump of
# Panelo's tables, gzipped, 14 days kept. Supabase's free plan has no backups of its own, and this daily
# connection also keeps the free project from being paused for inactivity.
set -euo pipefail
cd /srv/panelo
mkdir -p backups
# The session pooler (5432): pg_dump needs a session, which the transaction pooler (6543) doesn't give.
url=$(grep '^DATABASE_URL=' .env | cut -d= -f2- | sed 's|:6543/|:5432/|')
out="backups/panelo-$(date -u +%F).sql.gz"
# Same major version as the database (17); written to a temp name so a failed run never looks like a backup.
docker run --rm postgres:17 pg_dump --no-owner --no-privileges --schema=public "$url" | gzip > "$out.part"
mv "$out.part" "$out"
find backups -name 'panelo-*.sql.gz' -mtime +14 -delete
echo "$(date -u +%FT%TZ) backed up $(du -h "$out" | cut -f1) to $out"
