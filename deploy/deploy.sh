#!/usr/bin/env bash
# Ships what's pushed to GitHub to production: pull both repos on the server, rebuild, restart.
#   deploy/deploy.sh
set -euo pipefail
HOST="${PANELO_HOST:-panelo@2.31.188.249}"  # Hetzner panelo-prod (CX23, nbg1)
ssh -i ~/.ssh/panelo_prod -o StrictHostKeyChecking=accept-new "$HOST" '
  set -e
  cd /srv/panelo/app
  git pull --ff-only
  git -C components/panelo/pro pull --ff-only
  docker compose up -d --build
  docker image prune -f >/dev/null
  docker compose ps
'
