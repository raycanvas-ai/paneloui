---
title: "shadcn Charts vs Recharts: Same Engine, Different Job"
description: "shadcn/ui charts are Recharts plus a thin theming layer. What ChartContainer and ChartConfig add, when to use plain Recharts, and when to skip both."
slug: shadcn-charts-vs-recharts
primaryKeyword: shadcn charts vs recharts
secondaryKeywords:
  - recharts vs shadcn charts
  - shadcn chart library
  - shadcn charts recharts
  - shadcn chartcontainer
  - recharts v3 shadcn
intent: comparison
cluster: shadcn charts
date: 2026-11-24
status: draft
author: Raycanvas
cta:
  free: [revenue-chart]
  pro: [dashboard-pages-3]
wordCount: 1942
---

# shadcn Charts vs Recharts: Same Engine, Different Job

shadcn/ui charts are not a separate chart library. They are Recharts components wrapped in a small layer from shadcn/ui: `ChartContainer` for sizing and colour variables, `ChartConfig` for labels and colours, and styled tooltip and legend content. You still write Recharts. Choose shadcn charts for theming; choose plain Recharts when you don't use shadcn/ui.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) is a free, MIT-licensed shadcn/ui block that draws a revenue line against a dashed last-period line in plain SVG, with no Recharts at all. Its colours come from your theme tokens (`--chart-1` included), the pointer or arrow keys move a crosshair, and the tooltip shows both values and the change. Add it with `npx shadcn@latest add @panelo/revenue-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Is shadcn/ui's chart component built on Recharts?

Yes. The shadcn/ui chart docs say the charts are built on Recharts, and that the chart component now uses Recharts v3. They also say: "We do not wrap Recharts." In practice that means you import `BarChart`, `Bar`, `XAxis` and friends from `recharts` directly. shadcn/ui adds a few pieces around them:

| Piece | What it does |
|---|---|
| `ChartContainer` | Wraps the chart, makes it responsive, and turns your config into CSS variables |
| `ChartConfig` | A typed object of labels, icons and colours, kept separate from the data |
| `ChartTooltip` + `ChartTooltipContent` | A tooltip styled to match your shadcn/ui theme |
| `ChartLegend` + `ChartLegendContent` | A legend that reads labels and colours from the config |

You install it with `npx shadcn@latest add chart`. Like every shadcn/ui component, the code is copied into your project, so you can read and change it.

## What is the actual difference between shadcn charts and Recharts?

| | Recharts | shadcn/ui charts |
|---|---|---|
| What it is | A chart library on npm | Recharts plus a small copied-in layer |
| How you get it | `npm install recharts` | `npx shadcn@latest add chart` (also installs Recharts) |
| Chart types | Everything Recharts exports | The same; nothing extra |
| Colours | Props per series (`fill`, `stroke`) | `ChartConfig` → `var(--color-KEY)`, theme tokens `--chart-1` to `--chart-5` |
| Dark mode | You wire it | Comes from your CSS variables, or `theme: { light, dark }` in the config |
| Tooltip and legend | Recharts defaults, restyled by you | Pre-styled to match shadcn/ui |
| Licence | MIT | MIT |
| Who maintains it | The Recharts team | shadcn/ui (the layer), Recharts team (the engine) |

The short version: shadcn/ui saves you the styling and theming work. It does not add chart types, change rendering, or replace the Recharts API.

## What does the same chart look like in each?

Plain Recharts. You choose the colours inline and size the chart with `ResponsiveContainer`:

```tsx
"use client"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts"

const data = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
]

export function PlainBars() {
  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="desktop" fill="#2563eb" radius={4} />
          <Bar dataKey="mobile" fill="#60a5fa" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

shadcn/ui. The colours move into a config, and the bars point at CSS variables that `ChartContainer` creates:

```tsx
"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const data = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
]

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

export function ThemedBars() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

Two things to notice. The JSX inside is still Recharts. And the tooltip now shows "Desktop" and "Mobile" from the config, in your theme's colours, without any custom tooltip code.

## What changed with Recharts v3?

shadcn/ui's chart component moved to Recharts v3. If you copied chart code from an older project, check these:

- **Colour references.** Use `var(--chart-1)`, not `hsl(var(--chart-1))`. shadcn/ui's tokens are no longer HSL triplets.
- **A size on `ChartContainer`.** Keep a height, `min-h-*` or `aspect-*` class on it. The docs say `min-h` is required for the chart to be responsive, because the container needs a size to measure on first render.
- **Accessibility on by default.** Recharts' 3.0 migration guide says the `accessibilityLayer` prop was false by default in 2.x and is true by default in 3.0. It adds keyboard access and screen reader support to supported charts.
- **Internal state.** Recharts 3 rewrote its internal state and removed `CategoricalChartState` in favour of hooks. Custom components that read internal props need updating.

For the dark-mode side of this, see [Recharts dark mode with Tailwind CSS](/blog/recharts-dark-mode-tailwind).

## How do I convert an existing Recharts chart to a shadcn chart?

Take the plain Recharts example above and change it in five steps:

1. **Install the layer.** Run `npx shadcn@latest add chart`. Your existing Recharts import keeps working.
2. **Write the config.** One key per series, matching the `dataKey`, with a `label` and a `color`.
3. **Swap the wrapper.** Replace `ResponsiveContainer` and its sized `div` with `ChartContainer` and a `min-h-*` class. `ChartContainer` already renders a `ResponsiveContainer` inside it, so do not keep both.
4. **Point colours at variables.** Change `fill="#2563eb"` to `fill="var(--color-desktop)"`. The variable name is `--color-` plus the config key.
5. **Swap the tooltip.** Replace `<Tooltip />` with `<ChartTooltip content={<ChartTooltipContent />} />`. Add `ChartLegend` the same way if you had a `Legend`.

Do one chart first, check it in light and dark mode, then repeat for the rest. If one of them is a revenue line compared with last period, you can install [Revenue Lines](https://www.paneloui.com/components/revenue-chart) instead of converting it: it already reads `--chart-1` and follows `.dark`.

## What mistakes are common with shadcn charts?

- **Config keys that don't match `dataKey`.** The tooltip and legend can't find the label, and `var(--color-KEY)` points at a variable that was never created.
- **Keys with spaces or dots.** The key becomes part of a CSS variable name, so use simple keys like `newUsers` and put the readable text in `label`.
- **Hex colours in `fill`.** They work, but they skip the theme, so dark mode stops following your tokens.
- **A nested `ResponsiveContainer`.** It is already inside `ChartContainer`, so a second one only adds another layer that has to measure itself.
- **No height.** Covered above: give the container a size.

## When should I use plain Recharts instead of shadcn charts?

Use plain Recharts when:

- **You don't use shadcn/ui.** `ChartContainer` expects shadcn/ui's tokens and Tailwind CSS. Without them, it is overhead.
- **You already have a design system** with its own tooltip and legend. The shadcn/ui pieces would be one more style to override.
- **You build a charting product,** where every chart is custom and the default styling is never used.

Use shadcn/ui charts when you already use shadcn/ui. The config pattern keeps colours in one place, the tooltip matches your theme, and dark mode follows your CSS variables. It is a small amount of code that you would otherwise write yourself.

There is no performance difference to speak of. Both render the same Recharts SVG. The layer adds a context provider and a `<style>` block of CSS variables.

## When should I skip both?

Because shadcn/ui charts are Recharts, they share Recharts' limits. The shadcn/ui charts gallery covers area, bar, line, pie, radar and radial charts, plus tooltip examples. Recharts 3 also exports scatter, composed, funnel, treemap, sankey and sunburst charts. It has no heatmap, calendar heatmap or contribution graph.

So for these shapes you need something else:

- **Heatmaps and calendar heatmaps.** A CSS grid or a short SVG is often simpler than bending a scatter chart. See [shadcn heatmap chart](/blog/shadcn-heatmap-chart).
- **Pixel or tile charts, isometric views, custom morphs.** These are drawing problems, not axis-and-series problems.
- **Very large datasets.** Recharts draws SVG elements. With tens of thousands of points, a canvas-based library is usually a better fit.

This is where Panelo UI comes in, as one option among several. Panelo UI's free charts, from Raycanvas, are hand-written React with no chart library: the revenue, trends and contribution charts draw their own SVG, and the activity heatmap is a CSS grid. They install with the same shadcn CLI:

```bash
npx shadcn@latest add @panelo/activity-heatmap
npx shadcn@latest add @panelo/contribution-chart
```

You need the `@panelo` registry in `components.json` first: `"@panelo": "https://www.paneloui.com/r/{name}.json"` under `registries`. The trade-off is plain: each Panelo UI chart does one job well, but it is not a general charting API. For a standard bar or line chart, shadcn/ui charts are the better default. For a wider survey, read [React chart libraries for dashboards](/blog/react-chart-libraries-for-dashboards) or browse the [Panelo UI components](/components).

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the chart:

```bash
npx shadcn@latest add @panelo/revenue-chart
```

It lands in `components/panelo-ui/blocks/charts/revenue-chart.tsx` with a sample 28-day series. Replace `revenueSeries` in that file with your data; the `days` prop sets how many recent days show, and `showPrevious={false}` hides the dashed line.

- **See it live:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart), next to the other free charts on the [components page](https://www.paneloui.com/components).
- **A whole overview page, in Panelo Pro:** [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) puts revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart on one page. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Are shadcn charts the same as Recharts?

They use Recharts as the engine. shadcn/ui adds `ChartContainer`, `ChartConfig`, and styled tooltip and legend components. Your chart code is still written with Recharts components.

### Do I need to install Recharts separately for shadcn charts?

No. Running `npx shadcn@latest add chart` adds the chart component to your project and installs Recharts as a dependency.

### Which Recharts version do shadcn charts use?

The shadcn/ui docs say the chart component now uses Recharts v3. Older snippets that use `hsl(var(--chart-1))` should switch to `var(--chart-1)`.

### Why is my shadcn chart not showing?

The most common cause is a missing size. Give `ChartContainer` a height, `min-h-*` or `aspect-*` class so the responsive container can measure itself.

### Do shadcn charts support heatmaps?

No. Recharts has no heatmap component, so shadcn/ui charts do not either. Use a CSS grid, a calendar heatmap package, or a block such as Panelo UI's free Activity Heatmap.

### Are shadcn charts accessible?

Recharts 3 turns on `accessibilityLayer` by default, which adds keyboard access and screen reader support. You should still add a text summary or a table for charts that carry important numbers.

## Sources

- shadcn/ui chart docs (built on Recharts, Recharts v3, "We do not wrap Recharts", ChartConfig, `var(--chart-1)`, `min-h` note, `accessibilityLayer`): https://ui.shadcn.com/docs/components/chart
- shadcn/ui charts gallery (chart types): https://ui.shadcn.com/charts
- shadcn/ui chart registry item (dependencies incl. recharts, ChartStyle/ChartContext source, `ResponsiveContainer` inside `ChartContainer`, `--color-${key}` variables): https://ui.shadcn.com/r/styles/new-york-v4/chart.json
- Recharts 3.0 migration guide (`accessibilityLayer` default, `CategoricalChartState` removed): https://github.com/recharts/recharts/wiki/3.0-migration-guide
- Recharts repository and README (React and D3, native SVG, MIT): https://github.com/recharts/recharts
- Recharts on npm (version 3.11.1): https://www.npmjs.com/package/recharts
- Recharts type exports, 3.11.1 (chart components exported): https://unpkg.com/recharts@3.11.1/types/index.d.ts
