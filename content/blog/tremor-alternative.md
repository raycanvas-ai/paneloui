---
title: "Tremor Alternative: Is Tremor Still Maintained in 2026?"
description: "Is Tremor still maintained? The npm package last shipped in January 2025 and targets React 18. Here are the Tremor alternatives worth using in 2026, compared."
slug: tremor-alternative
primaryKeyword: tremor ui alternative
secondaryKeywords:
  - tremor react alternative
  - is tremor still maintained
  - tremor react 19
  - tremor tailwind v4
  - tremor alternatives
intent: comparison
cluster: Comparisons
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1735
cta:
  free: [revenue-chart, balance-chart]
  pro: [dashboard-pages-3]
---

# Tremor alternatives in 2026: is Tremor still maintained?

Tremor is not deprecated, but `@tremor/react` last shipped on 13 January 2025, still declares React 18 as its peer, and depends on Recharts 2. The copy-paste version moved to Tailwind CSS v4 but pins React 18. For React 19, the usual alternatives are shadcn/ui charts, Recharts directly, Mantine Charts, MUI X Charts, or charts built with no chart library.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) and [Balance Chart](https://www.paneloui.com/components/balance-chart) are free, MIT-licensed shadcn/ui blocks that cover two common dashboard charts with no chart library underneath: a this-period-against-last revenue line with a hover readout, and stacked monthly bars with a hover breakdown and a table view. Add them with `npx shadcn@latest add @panelo/revenue-chart @panelo/balance-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What happened to Tremor?

Vercel acquired Tremor in January 2025. The announcement said the two co-founders would join Vercel's Design Engineering team to work on the Vercel dashboard, v0 and other UI, and that Tremor Blocks, the paid product, would become free and open source under an MIT license.

That part happened. The Tremor Blocks site now says "Blocks & Templates are now free and open-source." The tremor.so homepage still carries a "Tremor is joining Vercel" banner.

What slowed down is the component library itself. Tremor ships in two forms:

| Form | What it is | Last activity we found |
|---|---|---|
| `@tremor/react` (npm) | Importable package, the original Tremor | Version 3.18.7, published 2025-01-13. No release since. |
| Copy-paste components (tremorlabs/tremor) | Source you paste into your project, built on Tailwind CSS and Radix UI | Last code change: the Tailwind CSS v4 update in April 2025. Last commit October 2025 (CI cleanup). |

Both repositories are Apache-2.0. Neither is archived.

## Does Tremor support React 19?

Not officially, as of 24 November 2026.

- The npm package's `peerDependencies` say `react: ^18.0.0`, and it depends on `recharts ^2.13.3`. Installing it in a React 19 app gives a peer dependency warning or error, depending on your package manager.
- The copy-paste repo's own `package.json` pins `react ^18.3.1` and `recharts ^2.15.2`, with `tailwindcss ^4.1.3`.
- A pull request titled "Upgrade to React 19 (recharts 3, react-day-picker 10, Storybook 10, Vite 8, TS 6)" has been open on tremorlabs/tremor since 11 June 2026. It is not merged.
- On the npm repo, an older pull request for React 19 fixes to the date pickers has been open since February 2025.

Copy-paste code is yours, so you can upgrade it yourself. Many teams do. But you then own the Recharts 2 to 3 migration for every chart, and you will not get upstream fixes.

## Should you still use Tremor?

Sometimes, yes. Be fair to it:

- If your app is on React 18 and Tremor works, there is no emergency. Nothing is deprecated or archived.
- Tremor has a broader kit than most chart-only options. Its README lists 35+ components, including KPI-style cards, bar lists and trackers, not only charts.
- The free Blocks (300+ by the site's count) are still a fast way to lay out a dashboard.

Plan a move when you upgrade to React 19, want Recharts 3, or need a library with releases you can track.

## What are the best Tremor alternatives?

Here is the shortlist, with facts checked against npm and each project's docs on 24 November 2026.

| Option | Engine | License | React 19 | Install model | Best for |
|---|---|---|---|---|---|
| shadcn/ui charts | Recharts v3 | MIT | Yes | Copy-paste via `shadcn` CLI | Teams already on shadcn/ui and Tailwind |
| Recharts (direct) | Own SVG + D3 | MIT | Yes (peer `^19.0.0`) | npm package | Full control, any chart Recharts supports |
| Mantine Charts | Recharts (peer `>=3.2.1`) | MIT | Yes (peer `^19.2.0`) | npm package | Teams using Mantine's component library |
| MUI X Charts | Own SVG | MIT (community) | Yes | npm package | Teams using Material UI |
| Panelo UI charts | Hand-built React (SVG or CSS), no chart library | MIT (free charts) | Built on React 19 | Copy-paste via `shadcn` CLI | A few specific dashboard charts, keyboard and table views included |

### shadcn/ui charts: the closest swap

shadcn/ui charts are the most direct replacement for Tremor's copy-paste model. You run `npx shadcn@latest add chart`, get a `ChartContainer`, `ChartTooltip` and `ChartLegend` wrapper, and write normal Recharts inside it. The docs say the chart component now uses Recharts v3, and colors come from CSS variables like `--chart-1`, with separate values under `.dark`.

The trade-off: shadcn/ui charts are a thin layer. You write `<AreaChart>`, `<XAxis>` and `<Area>` yourself, where Tremor gave you one `<AreaChart>` with props. We compare the two in detail in [Tremor vs shadcn/ui charts](/blog/tremor-vs-shadcn-charts).

### Recharts directly

Tremor and shadcn/ui charts are both Recharts underneath. If you want no wrapper at all, use Recharts itself. Version 3.11.1 shipped on 23 November 2026, the peer range includes React 19, and Recharts 3 turned on its keyboard accessibility layer by default for cartesian and polar charts. You will do the Tailwind theming yourself; see [Recharts dark mode with Tailwind CSS v4](/blog/recharts-dark-mode-tailwind).

### Mantine Charts

If you use Mantine, `@mantine/charts` wraps Recharts with Mantine's theming. Version 9.8.2 shipped on 20 November 2026 and requires React 19.2. It is not a fit for a Tailwind and shadcn/ui codebase, since it brings Mantine's styling system.

### MUI X Charts

MUI X Charts has an MIT community tier (version 9.18.1, 16 November 2026) and its own SVG renderer. Its docs say keyboard navigation is enabled by default on all charts. Choose it if you are on Material UI. It depends on `@mui/material` and Emotion, which is a lot to add to a Tailwind app.

### Panelo UI charts

Panelo UI is a small React and Tailwind CSS v4 library for shadcn/ui, built by Raycanvas. Its eight free charts (revenue lines, sales trend, trends, balance, rounded pie, activity heatmap, contribution graph, link graph) are hand-built in React (SVG for the line, pie, contribution and link charts; HTML and CSS for the balance, sales trend and heatmap) with no chart library underneath, so there is no Recharts version to track.

Be clear about the limits. Panelo UI is not a general charting API. Each chart is a fixed design: the revenue, trends and balance charts ship with sample data inside the file, and you edit the source to feed your own. The pie, contribution and link graph take data props. If you need twenty chart types with a declarative API, use Recharts or shadcn/ui charts.

Where it does help: the revenue, trends and balance charts move with arrow keys, Home and End, the heatmap and contribution graph move cell by cell with arrow keys, and the balance chart and activity heatmap include a table view. Browse them at [/components](/components).

## How do you migrate off Tremor?

A short checklist that works for most dashboards:

1. **List what you use.** Search for `@tremor/react` imports. Most apps use five or six components: `Card`, `AreaChart`, `BarChart`, `DonutChart`, `BarList`, `Metric`.
2. **Replace layout first.** `Card`, `Metric` and `Text` map to your own Tailwind components or shadcn/ui's `Card`. This removes most imports with no chart changes.
3. **Port charts one at a time.** Tremor's `<AreaChart data categories index />` becomes a Recharts `<AreaChart>` with an `<Area>` per category. With shadcn/ui, put the series colors in a `ChartConfig`. If a chart is a period-over-period revenue line, you can skip porting it: the free [Revenue Lines](https://www.paneloui.com/components/revenue-chart) block draws that chart with arrow-key navigation, and you swap its sample series for your data.
4. **Move colors to CSS variables.** Tremor used its own color names per chart. Define `--chart-1` to `--chart-5` in `:root` and `.dark` so every chart flips with your theme.
5. **Check keyboard access.** Recharts 3 adds keyboard focus by default. Tab into each chart and confirm the tooltip follows the arrow keys.
6. **Remove the package last.** Once no imports remain, uninstall `@tremor/react` and drop the Tremor entries from your Tailwind config.

## Get this working in your app

If you want a few dashboard charts with keyboard support built in, and table views on some of them, add the Panelo namespace to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the two charts:

```bash
npx shadcn@latest add @panelo/revenue-chart @panelo/balance-chart
```

They install with the shadcn CLI into `components/panelo-ui`, and the source is yours. Revenue Lines needs only `clsx` and `tailwind-merge`; Balance Chart also adds `lucide-react` and Vercel's UI SDK (beta) for its chart and table buttons. Both keep sample data in the source for you to replace.

See them live: [Revenue Lines](https://www.paneloui.com/components/revenue-chart), [Balance Chart](https://www.paneloui.com/components/balance-chart), or browse all the free [Panelo UI charts](https://www.paneloui.com/components).

If you are rebuilding a whole Tremor dashboard rather than one chart, the Pro [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) is an overview dashboard with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Is Tremor deprecated?

No. Neither Tremor repository is archived or marked deprecated. But `@tremor/react` has had no npm release since 13 January 2025, and the copy-paste repo has had no code changes since April 2025.

### Does Tremor work with React 19?

Not officially. The npm package's peer dependency is React 18, and the copy-paste repo pins React 18.3 and Recharts 2. A React 19 upgrade pull request has been open since June 2026.

### Does Tremor work with Tailwind CSS v4?

The copy-paste components do: they were updated to Tailwind CSS v4 in April 2025. The `@tremor/react` npm package predates that update.

### Is Tremor free?

Yes. The components are Apache-2.0, and after Vercel's acquisition Tremor Blocks and templates became free and open source.

### What is the closest Tremor alternative?

shadcn/ui charts. Both use Recharts, both are copy-paste, and shadcn/ui has moved to Recharts v3 with React 19 support.

### Are Panelo UI charts built on Recharts?

No. Panelo UI's free charts are built in React with plain SVG or CSS and no chart library. They are fixed designs rather than a general charting API.

## Sources

- https://vercel.com/blog/vercel-acquires-tremor
- https://blocks.tremor.so/
- https://www.tremor.so/
- https://www.npmjs.com/package/@tremor/react
- https://github.com/tremorlabs/tremor
- https://github.com/tremorlabs/tremor/blob/main/package.json
- https://github.com/tremorlabs/tremor/pull/166
- https://github.com/tremorlabs/tremor-npm
- https://github.com/tremorlabs/tremor-npm/pull/1151
- https://ui.shadcn.com/docs/components/chart
- https://www.npmjs.com/package/recharts
- https://github.com/recharts/recharts/releases/tag/v3.0.0
- https://www.npmjs.com/package/@mantine/charts
- https://www.npmjs.com/package/@mui/x-charts
- https://mui.com/x/react-charts/accessibility/
