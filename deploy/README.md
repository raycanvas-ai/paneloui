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
| `DATABASE_URL` | Supabase pooler URL for `panelo_app`, ending `?sslmode=require` |
| `AUTH_SECRET`, `AUTH_URL=https://www.paneloui.com`, `AUTH_TRUST_HOST=true` | Auth.js |
| `AUTH_GITHUB_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET` | Production OAuth apps; callbacks at `https://www.paneloui.com/api/auth/callback/{github,google}` |
| `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_ENVIRONMENT`, `DODO_WEBHOOK_SECRET` | Checkout and licences. `live_mode` only when named; anything else is test mode |
| `GROQ_API_KEY` | Typed requests in the agent demo (free tier) |

## Everyday

```bash
docker compose logs -f app      # app logs
docker compose ps               # what's running
docker compose restart app      # restart without a rebuild
```

Roll back: `git -C /srv/panelo/app checkout <commit> && docker compose up -d --build`.

## Database changes

Migrations live in `drizzle/`. Apply them from a machine with the env loaded, over the session pooler
(port 5432): `DATABASE_URL=<…:5432…> npx drizzle-kit migrate`. `0001` keeps every table out of
Supabase's public REST API; keep that true for new tables.
