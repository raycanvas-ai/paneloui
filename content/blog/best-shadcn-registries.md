---
title: "Best shadcn Registries in 2026, by Category (Verified)"
description: "The best shadcn/ui registries by category: primitives, animation, marketing blocks, dashboards and AI. Licence, price and status for each, checked 24 Nov 2026."
slug: best-shadcn-registries
primaryKeyword: best shadcn registries
secondaryKeywords:
  - shadcn registry list
  - awesome shadcn
  - best shadcn component library
  - shadcn registry directory
  - shadcn blocks libraries
intent: commercial
cluster: shadcn registry
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1870
cta:
  free: [revenue-chart, activity-heatmap]
  pro: [dashboard-pages-3]
---

# Best shadcn registries in 2026, by category

The best shadcn registry depends on what you are building. For accessible primitives beyond the core set, look at coss ui, Dice UI, Kibo UI and ReUI. For animation, Magic UI and Aceternity UI. For marketing pages, Tailark and shadcnblocks. For AI chat, AI Elements. Every fact below was checked on 24 November 2026.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) and [Activity Heatmap](https://www.paneloui.com/components/activity-heatmap) are free, MIT-licensed shadcn/ui blocks from the `@panelo` registry: a dual-line revenue chart (this period against last, with a hover readout) and an hour-by-day heatmap, a chart type the official shadcn/ui charts do not include. Add them with `npx shadcn@latest add @panelo/revenue-chart @panelo/activity-heatmap` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

There is no single "best" list because registries do different jobs. This one groups them by job, gives the licence and price for each from the vendor's own pages, and says where each is strong. We build Panelo UI; in the comparison it appears once, in the dashboards row, where it belongs.

## What is a shadcn registry, and how do you use one?

A registry is a set of JSON files the shadcn CLI can install from. Each item carries its source code and dependencies, and the CLI copies the code into your project. Registries in the official shadcn/ui directory resolve with no setup:

```bash
npx shadcn@latest add @magicui/marquee
```

For a registry that is not listed, add its namespace once and install the same way. If you want to publish your own, see [how to create a shadcn registry](/blog/how-to-create-a-shadcn-registry).

## How did we choose and check these?

- **Listed in the official directory**, or widely used enough that leaving it out would mislead you. The directory index at `ui.shadcn.com/r/registries.json` held 593 entries when we checked.
- **Licence from the repo or vendor page**, not from other roundups. Several roundups get licences wrong.
- **Price from the vendor's pricing page today.** Late November means Black Friday sales, so we give list prices and note sales.
- **No rankings by popularity.** We did not have reliable usage data, so we did not invent any.

## Which registries are best for accessible primitives?

These extend the core shadcn/ui set with more components built on the same idea: source you own.

| Registry | Namespace | Licence | Price | Strong at |
|---|---|---|---|---|
| shadcn/ui | default | MIT | Free | The core set, charts on Recharts, blocks; Base UI default since July 2026 |
| coss ui | `@coss` | MIT | Free | Cal.com's design system on Base UI; the evolution of Origin UI |
| Dice UI | `@diceui` | MIT | Free | Accessible components that go beyond the core set |
| Kibo UI | `@kibo-ui` | MIT | Free | Composable, accessible components for shadcn/ui; acquired by shadcnblocks in Oct 2025 |
| ReUI | `@reui` | MIT (free components) | Free; Pro from $249 one-time | Data grid on TanStack Table, kanban, event calendar, filters |

coss ui's roadmap says it is "the evolution of Origin UI" and brings it onto "a stronger foundation: Base UI primitives." The original Origin UI collection stays available during the transition.

Kibo UI was created by Hayden Bleasel, who also created AI Elements. When shadcnblocks announced the acquisition, it said that "in the immediate future, nothing changes with Kibo UI," and the repo is still MIT.

ReUI is unusually generous: its site lists more than 1,200 free MIT components and puts Pro blocks, animated icons and templates behind a one-time All-Access plan.

## Which registries are best for animation and landing-page effects?

| Registry | Namespace | Licence | Price | Strong at |
|---|---|---|---|---|
| Magic UI | `@magicui` | MIT (free set) | Free; Pro $199 one-time | Animated text, backgrounds, marquees; Pro adds 50+ sections and templates |
| Aceternity UI | `@aceternity` | Free tier (100+ components) | Free; 1-year $169, lifetime $199, Team $1,590 (10 seats), one-time | Motion-heavy hero sections and effects |
| Animate UI | `@animate-ui` | MIT with Commons Clause | Free | Animated primitives, components and icons |

Read the Animate UI licence before you ship: the Commons Clause restricts selling the software itself, which is different from plain MIT. Magic UI Pro's page says re-selling the code is not allowed, which is standard for paid kits.

## Which registries are best for marketing blocks and full pages?

| Registry | Namespace | Price | Strong at |
|---|---|---|---|
| shadcnblocks | `@shadcnblocks` | 115+ free blocks; Pro $149, Premium $299, Elite $399 list, one-time (on sale for less this week) | Very large block library, a Next.js 16 Admin Kit, templates, Figma |
| shadcn/studio | `@shadcn-studio` | Free community tier (57 blocks); Basic $219, Pro $359 list, one-time (on sale now) | Blocks, templates, a theme generator, Figma |
| Tailark | `@tailark` | Free tier; Essentials $249, Complete $299, Team $499, one-time | Marketing websites: blocks, illustrations, page templates |

shadcnblocks is the largest of these by a wide margin. Its directory entry describes 1,429 blocks and 1,189 component variants, and its homepage describes the Admin Kit as "a 219-page Next.js 16 admin dashboard." If you need breadth, start there. We compare it with smaller options in [shadcnblocks alternatives](/blog/shadcnblocks-alternative).

shadcn.io is a separate case. It is a large third-party catalogue, independent of shadcn/ui, with a free account for components and a Pro subscription from $49 a month.

## Which registries are best for AI interfaces?

| Registry | Namespace | Licence | Strong at |
|---|---|---|---|
| AI Elements (Vercel) | `@ai-elements` | Apache-2.0 | Conversations, messages, prompt inputs and other chat surfaces for the AI SDK |

AI Elements is the default choice for chat UI in a shadcn/ui project. It is for building the chat, not for letting an agent operate the rest of your app. That second job is a different problem, covered in [shadcn AI agent components](/blog/shadcn-ai-agent-components).

## Which registries are best for dashboards and charts?

The official charts cover area, bar, line, pie, radar and radial charts on Recharts. Beyond that, the options thin out.

| Option | How you install | Licence | Price | Strong at |
|---|---|---|---|---|
| shadcn/ui charts and blocks | `@shadcn` (default) | MIT | Free | The standard starting point; `dashboard-01` block |
| Tremor | Copy and paste from its site (not in the directory) | Apache-2.0 | Free | Polished chart and KPI components; Vercel acquired Tremor in Jan 2025 and made Tremor Blocks free under MIT |
| shadcnblocks Admin Kit | Part of a paid plan | Commercial | Premium plan and up | A complete admin app with many pages |
| Panelo UI | `@panelo` (namespace config, not yet in the directory) | MIT (free items) | Free; Pro from $99 one-time | Heatmaps, contribution graphs and other chart types Recharts lacks; full dashboard pages |

Two honest notes. Tremor's copy-paste repo has had little activity since its last commit in October 2025, so check that it fits your React and Recharts versions. And Panelo UI is small: 32 items, 15 of them free, with charts that ship with sample data and fixed designs rather than a general charting API. What it adds is agent support: its components are built on Vercel's UI SDK, which is in beta, so an AI agent can read the dashboard as named controls and act through the same component API a click uses. See the free charts on the [components page](/components).

## How do you check a registry before you depend on it?

- **Look it up in the directory.** Each entry in `registries.json` now carries a health status from automated checks (availability, item validation, CLI dry runs). Some well-known registries show "degraded" on some days, so treat it as a prompt to test, not a verdict.
- **Run a dry run.** `npx shadcn@latest add @ns/item --dry-run` shows the files and packages before anything is written.
- **Check the primitive library.** New shadcn/ui projects default to Base UI. A registry built for Radix may pull in Radix packages; registries can ship a `registry:base` config to say which they need.
- **Read the licence.** MIT, Apache-2.0, Commons Clause and commercial licences all appear in this list.
- **Check where files land.** Registries that install into their own folder avoid overwriting your `components/ui` files. For example, a dry run of `@panelo/revenue-chart` shows two files under `components/panelo-ui` (the chart and a small `utils.ts`), two packages (`clsx` and `tailwind-merge`) and the theme variables it adds to your global CSS, and nothing in `components/ui`; see the [Revenue Lines page](https://www.paneloui.com/components/revenue-chart).

## Get this working in your app

Add the Panelo namespace to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the two charts:

```bash
npx shadcn@latest add @panelo/revenue-chart @panelo/activity-heatmap
```

Both ship with sample data: Revenue Lines keeps its series in the file, and Activity Heatmap generates demo values you replace with your own. See them live: [Revenue Lines](https://www.paneloui.com/components/revenue-chart) and [Activity Heatmap](https://www.paneloui.com/components/activity-heatmap).

If you want the whole page around the charts, the Pro [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) is an overview dashboard with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### What is the best free shadcn registry?

For general components, coss ui, Dice UI, Kibo UI and ReUI's free set are all MIT and free. For animation, Magic UI's free set is MIT. The right one depends on which components you are missing.

### How do I install from a registry that is not in the directory?

Add its namespace once with `npx shadcn@latest registry add @name=https://example.com/r/{name}.json`, then run `npx shadcn@latest add @name/item`.

### Are paid shadcn kits subscriptions?

Most are one-time payments: shadcnblocks, shadcn/studio, Tailark, Aceternity UI, Magic UI Pro, ReUI Pro and Panelo UI Pro all list one-time prices. shadcn.io Pro is the main subscription, with a lifetime option.

### Is shadcn.io the official shadcn/ui site?

No. The official site is ui.shadcn.com. shadcn.io describes itself as an independent project built on shadcn/ui.

### Does every registry work with Base UI?

Not automatically. Since July 2026 new projects default to Base UI, and registries can declare a `registry:base` config to pin a library. Run a dry run first and check which primitive packages it adds.

## Sources

- shadcn/ui registry directory index (593 entries, health data): https://ui.shadcn.com/r/registries.json
- shadcn/ui, Registry index docs: https://ui.shadcn.com/docs/registry/registry-index
- shadcn/ui changelog, Base UI as the default: https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- shadcn/ui charts gallery: https://ui.shadcn.com/charts/area
- shadcn/ui repo (MIT): https://github.com/shadcn-ui/ui
- coss ui roadmap: https://coss.com/ui/docs/roadmap
- coss ui repo (MIT): https://github.com/cosscom/ui
- Dice UI repo (MIT): https://github.com/sadmann7/diceui
- Kibo UI acquisition announcement: https://www.shadcnblocks.com/blog/announcing-kibo-ui-acquisition
- Kibo UI repo (MIT): https://github.com/shadcnblocks/kibo
- ReUI: https://reui.io/
- ReUI repo (MIT): https://github.com/keenthemes/reui
- Magic UI Pro: https://pro.magicui.design/
- Magic UI repo (MIT): https://github.com/magicuidesign/magicui
- Aceternity UI pricing: https://ui.aceternity.com/pricing
- Animate UI licence: https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md
- shadcnblocks pricing: https://www.shadcnblocks.com/pricing
- shadcnblocks homepage: https://www.shadcnblocks.com/
- shadcnblocks free blocks: https://www.shadcnblocks.com/blocks/free
- shadcn/studio pricing: https://shadcnstudio.com/pricing
- Tailark pricing: https://tailark.com/pricing
- shadcn.io pricing: https://www.shadcn.io/pricing
- AI Elements repo (Apache-2.0): https://github.com/vercel/ai-elements
- Vercel acquires Tremor: https://vercel.com/blog/vercel-acquires-tremor
- Tremor repo: https://github.com/tremorlabs/tremor
