# Panelo

React components, charts and full dashboard pages built on Vercel's UI SDK, so AI agents can operate the dashboards they render. Source-owned: copy them in and change anything.

## Run it

```bash
npm install
cp .env.example .env.local   # optional: ANTHROPIC_API_KEY powers the live agent demo
npm run dev
```

Without a key everything works except the agent demo's free-text replies.

## What's inside

| Path | What |
| --- | --- |
| `components/panelo/ui` | shadcn-compatible parts built on the UI SDK: button, dialog, select, sheet, chart and more |
| `components/panelo/blocks` | Free blocks: sidebars, a login page, a dashboard header, elements and charts |
| `components/application` | The site itself: landing page, component catalogue and docs |
| `app/` | `/` landing, `/components` catalogue, `/preview/[slug]` live previews, `/api/agent` agent demo |
| `AGENTS.md`, `.cursor/rules/panelo.mdc` | Design rules for coding agents |

## Free and Pro

Everything in this repository is free and MIT licensed.

Panelo Pro adds full dashboard pages and calendars. They appear in the catalogue with a Pro tag but their source is not in this repository. In a checkout that has them, they live in `components/panelo/pro/` (gitignored), and the site reaches them only through the `@pro` alias. Without that folder `@pro` resolves to `components/panelo/pro-fallback.ts`, so a fresh clone builds and shows the free catalogue.

## License

The code in this repository is [MIT](LICENSE). Pro components are sold separately under their own license and are not part of this repository.
