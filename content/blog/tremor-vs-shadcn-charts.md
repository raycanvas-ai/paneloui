---
title: "Tremor vs shadcn/ui Charts: Which to Use in 2026"
description: "Tremor vs shadcn/ui charts: both run on Recharts, but differ on React 19, Recharts 3, install model and theming. A fair comparison plus a migration checklist."
slug: tremor-vs-shadcn-charts
primaryKeyword: tremor vs shadcn
secondaryKeywords:
  - tremor vs shadcn charts
  - tremor vs shadcn ui
  - tremor vs recharts
  - shadcn charts alternative
intent: comparison
cluster: Comparisons
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1763
cta:
  free: [revenue-chart]
  pro: [dashboard-pages-3]
---

# Tremor vs shadcn/ui charts: which should you use in 2026?

Both Tremor and shadcn/ui charts are built on Recharts, so the charts can look almost the same. The difference is maintenance and API. shadcn/ui charts use Recharts v3 and work with React 19. Tremor's npm package still targets React 18 and Recharts 2, with no release since January 2025. For a new project, shadcn/ui charts are the safer default.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) is a free, MIT-licensed shadcn/ui block that gives you a finished revenue chart (this period as a line and area, last period dashed, a hover readout with the change, arrow-key navigation) with no chart library underneath, so neither Recharts major is involved. Add it with `npx shadcn@latest add @panelo/revenue-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What is the difference between Tremor and shadcn/ui charts?

Tremor gives you finished chart components with a prop-based API. You pass `data`, `index` and `categories`, and Tremor draws the axes, grid, legend and tooltip.

shadcn/ui charts give you a thin wrapper around Recharts. You get `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend` and a `ChartConfig` type for labels and colors. Inside the container you write Recharts components yourself.

| | Tremor | shadcn/ui charts |
|---|---|---|
| Engine | Recharts 2 (`^2.13.3` in the npm package, `^2.15.2` in the copy-paste repo) | Recharts v3 |
| React version | Peer `react ^18.0.0` (npm); repo pins `^18.3.1` | Works with React 19 |
| Tailwind CSS | Copy-paste version on Tailwind CSS v4 since April 2025 | Tailwind CSS v4 |
| Install | npm package `@tremor/react`, or copy-paste from tremor.so | `npx shadcn@latest add chart`, source copied in |
| API style | One component per chart type, props for everything | Recharts primitives inside a themed container |
| Colors | Tremor color names per chart | CSS variables (`--chart-1` to `--chart-5`), light and dark values |
| Extra components | 35+, including KPI cards, bar lists, trackers | Charts only; use other shadcn/ui components for cards |
| License | Apache-2.0 (components); Blocks free and open source | MIT |
| Last npm release | 3.18.7 on 2025-01-13 | The `shadcn` CLI: 4.23.0 on 2026-10-27 |

Facts checked on npm, GitHub and both docs sites on 24 November 2026.

## How does the code compare?

The same bar chart, both ways.

Tremor (npm package):

```tsx
import { BarChart } from "@tremor/react";

const data = [
  { month: "Jan", revenue: 18200 },
  { month: "Feb", revenue: 21400 },
  { month: "Mar", revenue: 19800 },
];

export function Revenue() {
  return (
    <BarChart
      data={data}
      index="month"
      categories={["revenue"]}
      colors={["blue"]}
      valueFormatter={(v) => `$${v.toLocaleString()}`}
    />
  );
}
```

shadcn/ui charts:

```tsx
"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const data = [
  { month: "Jan", revenue: 18200 },
  { month: "Feb", revenue: 21400 },
  { month: "Mar", revenue: 19800 },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function Revenue() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
```

Tremor is shorter. shadcn/ui is longer but every Recharts prop is in reach, and `ChartContainer` turns each config key into a CSS variable (`--color-revenue`) you can use in `fill` and `stroke`.

## Where is Tremor better?

Be fair to Tremor. It wins in a few places:

- **Less code per chart.** One component with `index` and `categories` is quicker to write than composing axes and series.
- **More dashboard pieces.** Tremor's README lists 35+ components. Bar lists, trackers, category bars and KPI cards have no direct shadcn/ui equivalent.
- **Free Blocks.** After Vercel acquired Tremor in January 2025, Tremor Blocks became free and open source. The Blocks site now says "Blocks & Templates are now free and open-source," and the homepage advertises 300+ blocks.
- **Stable on React 18.** If your app is on React 18 and it works, there is no forced move.

## Where are shadcn/ui charts better?

- **Current dependencies.** Recharts v3 and React 19, against Recharts 2 and React 18 in Tremor.
- **Active maintenance.** The shadcn/ui repo and CLI ship regularly. Tremor's npm package has not shipped since January 2025, and a React 19 upgrade pull request on the copy-paste repo has been open since June 2026.
- **Theme tokens.** Colors live in CSS variables with `:root` and `.dark` values, or in `ChartConfig` with `light` and `dark` keys. Dark mode follows your app's theme with no per-chart work.
- **Accessibility default.** Recharts 3 turns its `accessibilityLayer` on by default for cartesian and polar charts. You can tab into the chart and move through points with the arrow keys.
- **Full Recharts surface.** Anything Recharts can draw, you can draw. Tremor exposes a subset through props.

## Are Tremor and shadcn/ui charts the same as Recharts?

Underneath, yes. Both render with Recharts, so performance, SVG output and chart types are close. The real question is which layer you want on top: Tremor's opinionated props, shadcn/ui's thin themed wrapper, or plain Recharts. For the last two, see [shadcn/ui charts vs Recharts](/blog/shadcn-charts-vs-recharts).

## How do you migrate from Tremor to shadcn/ui charts?

1. **Add the chart component.** Run `npx shadcn@latest add chart`. It adds `components/ui/chart.tsx` and installs Recharts.
2. **Define tokens once.** Make sure `--chart-1` to `--chart-5` exist under `:root` and `.dark` in your global CSS. The shadcn/ui docs note that Recharts v3 uses `var(--chart-1)` directly, not `hsl(var(--chart-1))`.
3. **Map each Tremor chart.** `index` becomes `<XAxis dataKey>`. Each entry in `categories` becomes an `<Area>`, `<Bar>` or `<Line>` with `dataKey`. Each entry in `colors` becomes a `ChartConfig` key with a `color`.
4. **Replace `valueFormatter`.** Pass a `formatter` to `ChartTooltipContent`, or `tickFormatter` to the axis.
5. **Give the container a height.** `ChartContainer` needs a height, `min-h-*` or `aspect-*` class, or it renders at zero height.
6. **Swap non-chart pieces.** Replace `Card`, `Metric` and `Text` with shadcn/ui's `Card` and your own type styles. Bar lists and trackers need a small custom component.
7. **Uninstall `@tremor/react`** once no imports remain.

## Should you migrate at all?

Not always. Stay on Tremor for now if all of these are true:

- The app is on React 18 and has no plan to move to React 19 soon.
- The charts work and nobody is asking for new chart types.
- You rely on Tremor's bar lists, trackers or KPI cards across many pages.

Plan the move when any of these is true:

- You are upgrading to React 19. The npm package's peer range is `react ^18.0.0`, so expect peer warnings or a forced install.
- You need a Recharts 3 feature, or another library in your app already needs Recharts 3.
- You want chart colours on the same CSS variables as the rest of your shadcn/ui theme.

## What tends to break during the migration?

- **Two Recharts majors at once.** While both stacks are installed, `@tremor/react` pulls Recharts 2 and shadcn/ui charts use Recharts 3. Migrate one page at a time, but finish, so the old major can go.
- **Custom tooltips.** A Tremor `customTooltip` does not carry over. Rebuild it as a `content` component for `ChartTooltip`, or pass a `formatter` to `ChartTooltipContent`. If the tooltip you are rebuilding is a this-period, last-period and change readout, the free [Revenue Lines](https://www.paneloui.com/components/revenue-chart) block already has one, outside Recharts.
- **Colour names.** Tremor's named colours such as `"blue"` have no meaning in `ChartConfig`. Map each one to a `--chart-*` token, and check the dark value too.
- **Hidden layout.** Tremor charts come with a default height (`h-80` in the bar chart source). In shadcn/ui charts that height must be set on `ChartContainer`, or the chart disappears.
- **Visual drift.** Expect small changes in axis padding, tick density and legend position. Compare screenshots before and after, rather than assuming they match.

## Is there a third option?

If you need many chart types, the honest answer is Recharts, through shadcn/ui or directly. Other routes are covered in [Recharts alternatives](/blog/recharts-alternative).

Panelo UI is a narrower option. Its free charts are hand-built in React (plain SVG or CSS) with no chart library, built for React 19, Tailwind CSS v4 and shadcn/ui, with keyboard navigation and, on the balance chart and activity heatmap, a table view. They are fixed designs, not a charting API: most ship with sample data in the source that you replace. See the [balance chart](/components/balance-chart) for an example.

## Get this working in your app

Add the Panelo namespace to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the chart:

```bash
npx shadcn@latest add @panelo/revenue-chart
```

It lands in `components/panelo-ui`, needs only `clsx` and `tailwind-merge`, and keeps its sample series in the file for you to replace. See it live on the [Revenue Lines page](https://www.paneloui.com/components/revenue-chart).

Need a chart that isn't in either kit, like an hour-by-day heatmap? Panelo UI's free [activity heatmap](/components/activity-heatmap) and other [charts](/components) install with the shadcn CLI.

For a full overview page rather than single charts, the Pro [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) is an overview dashboard with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Is Tremor built on shadcn/ui?

No. Tremor's copy-paste components are built on Tailwind CSS and Radix UI, and its charts use Recharts. shadcn/ui is a separate project with its own chart wrapper.

### Do shadcn/ui charts use Recharts?

Yes. The shadcn/ui docs say the chart component uses Recharts under the hood, now Recharts v3.

### Which is easier, Tremor or shadcn/ui charts?

Tremor needs less code per chart because it hides the axes and series behind props. shadcn/ui charts take more lines but expose every Recharts option.

### Can I use Tremor and shadcn/ui together?

You can, but you would run two chart stacks and, with the npm package, two Recharts majors in one app. Most teams pick one.

### Does Tremor support dark mode?

Yes. Tremor's theming docs say light and dark mode are on by default and follow the system preference, with dark colors set in the Tailwind config. shadcn/ui charts do it through CSS variables with separate light and dark values, which also covers custom themes.

## Sources

- https://www.npmjs.com/package/@tremor/react
- https://github.com/tremorlabs/tremor
- https://github.com/tremorlabs/tremor/blob/main/package.json
- https://github.com/tremorlabs/tremor/pull/166
- https://vercel.com/blog/vercel-acquires-tremor
- https://blocks.tremor.so/
- https://www.tremor.so/
- https://tremor.so/docs/getting-started/theming
- https://ui.shadcn.com/docs/components/chart
- https://www.npmjs.com/package/shadcn
- https://github.com/recharts/recharts/releases/tag/v3.0.0
- Tremor bar chart docs (`customTooltip` prop, default `h-80` height): https://www.tremor.so/docs/visualizations/bar-chart
