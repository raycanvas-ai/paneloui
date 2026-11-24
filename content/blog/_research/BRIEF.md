# Panelo UI blog: brief for research and writing agents

## The product (facts only: never invent beyond this)
Full machine-readable facts: `llms.txt` in this folder (catalogue, prices, FAQ). Key points:
- **Panelo UI** (paneloui.com) is a React + Tailwind CSS v4 library of dashboard components, charts, login/profile pages and full dashboard pages for **shadcn/ui**, built on **Vercel's UI SDK** (ui-sdk.dev, package `@ui-sdk/react`, from Vercel Labs, currently in beta: say "beta", never a version number) so **AI agents can read and operate the dashboards they render**.
- An agent reads the page as a list of named controls (`agent.snapshot()`) and acts through the same component API a click uses (e.g. `setChecked(false)`), never guessing at pixels. Destructive actions are marked; the agent must ask first. Live demo: paneloui.com/agent-demo.
- Installs with the shadcn CLI: add `"@panelo": "https://www.paneloui.com/r/{name}.json"` under `registries` in components.json, then `npx shadcn@latest add @panelo/<item>`. Lands in `components/panelo-ui` next to `components/ui`. Registry index: paneloui.com/r/registry.json. `npx shadcn@latest search @panelo` lists items.
- Free items are MIT (charts: revenue, sales trend, trends, balance, pie, activity heatmap, contribution, link graph; login pages; a profile page; elements; a home-care dispatch dashboard page; `agent-kit`; `panelo-theme`). Pro = full dashboard pages, calendars, Pro templates; one-time payment, no subscription (plans from $129 at launch; see llms.txt).
- Panelo's free charts use **no chart library** (not Recharts). Never call them Recharts-based. Most are hand-written SVG, but Activity Heatmap is a CSS grid (color-mix colours) with demo data and no `data` prop; Contribution Chart is SVG with a 3D isometric view and no table view. Say "no chart library" generally. They have keyboard navigation and table views (verify in the repo before claiming specifics: /Users/srisomanaath/Desktop/panelo/panelo-main/components/panelo/blocks/charts).
- `agent-kit`: UI SDK agent bridge, approval prompts, chat hook, `/api/agent` route using an open model on Groq's free tier. Components themselves need no AI key.
- Stack: React 19, Next.js 16, Tailwind CSS v4, light + dark themes.
- Templates: 3 whole-app Next.js templates on Dec 1 2026 (1 free, 2 Pro); 30+ more coming, no dates.
- Built by **Raycanvas** (raycanvas.ai) backed by **Shadcn Labs**. From the creators of **Ruixen UI** and **snapcn**. Source: github.com/raycanvas-ai/paneloui.
- Site pages that exist (safe to link): `/`, `/components`, `/components/<slug>` (slugs in llms.txt), `/agent-demo`, `/templates`, `/#pricing`, `/llms.txt`. Blog posts will live at `/blog/<slug>`.

## Verified third-party facts (from research, 2026-11-24; re-check anything you quote)
- **Vercel's UI SDK**: Vercel Labs, Apache-2.0, repo github.com/vercel-labs/ui (created 2026-10-26), site ui-sdk.dev. `@ui-sdk/core` + adapters for React, Vue, Svelte, Solid, Web Components; React adapter needs React 19+. Agent bridge: `createAgent()` from `@ui-sdk/react/agent` → `snapshot()`, `act({ steps })`, `query`; changes go through each component's own API and change callbacks receive `source: "agent"`; `allow` callback (can be async) approves steps; `data-agent-confirm` marks controls needing a human; `registerTools` exposes tools to browser agents via WebMCP. The repo's own benchmark (one task, React): agent tools 7 tool calls / $0.044 vs Base UI with browser tools 17 calls / $0.139. Do NOT cite "61% faster / 56% cheaper" (not on ui-sdk.dev) or npm weekly downloads. It is NOT the Vercel AI SDK (npm `ai`), AI SDK UI (`useChat`) or AI Elements. Vercel has not said whether shadcn/ui will move onto it.
- **shadcn/ui charts** are built on Recharts. New shadcn projects default to Base UI (since July 2026); Radix still supported.
- **Tremor**: acquired by Vercel Jan 2025, Tremor Blocks made MIT; the `@tremor/react` npm package's last release was 2025-01-13 and it targets React 18 / Recharts 2.
- **Tailwind Plus (incl. Catalyst)** closed to new customers 2026-09-09 when Tailwind Labs joined Shopify.
- **HeroUI** is Apache-2.0 (not MIT). Origin UI is now coss ui (Cal.com). Kibo UI was acquired by shadcnblocks (Oct 2025). shadcn.io is not affiliated with shadcn/ui.
- Research files with SERP notes, competitors and sources: `research/*.md` in this folder. Read the file for your cluster before writing.

## Hard rules
1. **No fabrication.** No invented statistics, benchmarks, user counts, quotes, testimonials, "trusted by", or GitHub star counts you didn't just check. Any fact about a third-party product (shadcn/ui, Tremor, MUI, Recharts, Tailwind, UI SDK…) must be verified with a web search in this session and listed under `## Sources` with URLs. If unsure, leave it out.
2. **Fair comparisons.** Say where competitors are better. Never disparage. Facts with sources only.
3. **Don't oversell Panelo.** It is new, small, and the UI SDK is beta. Most posts should be genuinely useful even to someone who never uses Panelo; mention Panelo where it is the honest answer, typically 1–3 times plus a closing CTA.
4. Today is 2026-11-24. Write as of now. Avoid dates/version claims you can't verify.

## AEO / GEO format (every post)
- Frontmatter (YAML): `title` (≤60 chars, keyword first), `description` (140–160 chars), `slug`, `primaryKeyword`, `secondaryKeywords` (list), `intent` (informational/commercial/comparison/transactional), `cluster`, `date: 2026-11-24`, `status: draft`, `author: Raycanvas`, `wordCount`.
- Under the H1: a **40–60 word direct answer** paragraph (the snippet AI engines and Google lift).
- H2s phrased as the questions people ask. Short paragraphs, tables for comparisons, numbered steps for how-tos, real code blocks that work.
- A `## FAQ` section with 4–6 Q&As (each answer 1–3 sentences, self-contained).
- Consistent entity names: "Panelo UI", "shadcn/ui", "Vercel's UI SDK", "Tailwind CSS v4", "Raycanvas".
- 3–6 internal links (paneloui.com pages above, and other planned posts by `/blog/<slug>`).
- `## Sources` at the end with every external fact's URL.
- 1,200–2,000 words of body. Plain, direct voice: short sentences, no hype words (revolutionary, game-changing, unlock, seamless, delve, leverage, robust), no emoji.
