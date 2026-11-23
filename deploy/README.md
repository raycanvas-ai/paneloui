# Deploying Panelo

One small Linux server runs everything: the Next.js app in Docker, and Caddy in front of it for HTTPS.
No platform in between, so nothing behaves differently in production than on a laptop.

## Layout

| What | Where |
| --- | --- |
| Server | Hetzner Cloud, Ubuntu 24.04, first boot from [`cloud-init.yaml`](cloud-init.yaml) |
| SSH | `ssh -i ~/.ssh/panelo_prod panelo@<ip>` (keys only; root and passwords are off) |
| Firewall | 22, 80, 443 only |
| App checkout | `/srv/panelo/app`: [paneloui](https://github.com/raycanvas-ai/paneloui), with the private [paneloui-pro](https://github.com/raycanvas-ai/paneloui-pro) cloned into `components/panelo/pro` |
| Secrets | `/srv/panelo/.env` (mode 600), read by [`compose.yaml`](../compose.yaml). Never in git |
| Database | Supabase Postgres, through the transaction pooler, as the app's own `panelo_app` role |
| Certificates | Caddy, automatic (Let's Encrypt). Cloudflare DNS records point at the server, proxy off |

## Ship a change

Push to GitHub, then:

```bash
deploy/deploy.sh   # panelo@2.31.188.249 by default; PANELO_HOST overrides
```

It pulls both repos, rebuilds the image (registry first, then `next build`) and restarts the app.
Caddy keeps serving the old container until the new one is up.

## Environment (`/srv/panelo/.env`)

| Variable | What |
| --- | --- |
| `SITE_URL` | `https://www.paneloui.com`: redirects, Dodo's return URL and Auth.js callbacks use it, since the app sits behind Caddy |
| `DATABASE_URL` | Supabase pooler URL for `panelo_app` (Frankfurt, port 6543), ending `?sslmode=require` |
| `AUTH_SECRET` | Auth.js session signing |
| `AUTH_GITHUB_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET` | Production OAuth apps; callbacks at `https://www.paneloui.com/api/auth/callback/{github,google}` |
| `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_ENVIRONMENT` | Checkout and licences. `live_mode` only when named; anything else is test mode |
| `DODO_WEBHOOK_SECRET` | The test and live endpoints' signing secrets, comma-separated |
| `GROQ_API_KEY` | Typed requests in the agent demo (free tier) |

## Everyday

```bash
docker compose logs -f app      # app logs
docker compose ps               # what's running
docker compose restart app      # restart without a rebuild
```

Roll back: `git -C /srv/panelo/app checkout <commit> && docker compose up -d --build`.

## Backups

`deploy/backup.sh` runs nightly from the deploy user's crontab (03:17 UTC) and keeps 14 days of
`pg_dump`s in `/srv/panelo/backups`; its log is `backups/backup.log`. Restore into a database with
`gunzip -c backups/panelo-<date>.sql.gz | psql "<session-pooler URL, port 5432>"`.

The dumps sit on the same server: copy one off now and then (`scp panelo@<server>:/srv/panelo/backups/<file> .`),
or upgrade Supabase to Pro for its own daily backups.

## Monitoring

`.github/workflows/uptime.yml` checks the site, `/api/health` (app and database), both demos, the webhook
and the Pro gate every 15 minutes, plus the certificate's expiry. A failure emails whoever last changed
that file. GitHub pauses scheduled workflows after 60 days without a commit; re-enable it from the Actions tab.

## Templates

Sources: `templates/<slug>` (free) and `components/panelo/pro/templates/<slug>` (Pro). The demos run as
the `demo-*` services. Downloads open when `TEMPLATES_LAUNCH.open` in `components/application/site/templates.ts`
is `true`; until then the build packs nothing and `/t/pro` answers 404.

## Database changes

Migrations live in `drizzle/`. Apply them from a machine with the env loaded, over the session pooler
(port 5432): `DATABASE_URL=<…:5432…> npx drizzle-kit migrate`. `0001` keeps every table out of
Supabase's public REST API; keep that true for new tables.
