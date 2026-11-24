---
title: "shadcn Heatmap Chart: Options for shadcn/ui in 2026"
description: "shadcn/ui has no heatmap chart and Recharts has no heatmap either. Here are the real options, a 40-line build, and a free MIT heatmap you install with the CLI."
slug: shadcn-heatmap-chart
primaryKeyword: shadcn heatmap
secondaryKeywords:
  - shadcn heatmap chart
  - shadcn calendar heatmap
  - heatmap shadcn ui
  - react heatmap shadcn
  - activity heatmap react
intent: commercial
cluster: shadcn charts
date: 2026-11-24
status: draft
author: Raycanvas
cta:
  free: [activity-heatmap]
  pro: [dashboard-pages-3]
wordCount: 1773
---

# shadcn Heatmap Chart: Options for shadcn/ui in 2026

shadcn/ui does not ship a heatmap. Its charts are built on Recharts, and Recharts has no heatmap component. To get one in a shadcn/ui project you can build a small CSS grid yourself, use a calendar heatmap package, or install a ready-made block such as Panelo UI's free Activity Heatmap with the shadcn CLI.

> **Skip the build:** [Activity Heatmap](https://www.paneloui.com/components/activity-heatmap) is a free, MIT-licensed shadcn/ui block that draws a matrix heatmap as a CSS grid: hour by day, with day, week, month and year views, forecast cells in grey, arrow-key navigation and a table view, and no chart library. Add it with `npx shadcn@latest add @panelo/activity-heatmap` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Does shadcn/ui have a heatmap chart?

No. The official charts gallery at ui.shadcn.com/charts lists area, bar, line, pie, radar, radial and tooltip examples. There is no heatmap, calendar heatmap or contribution graph among them.

The reason is the engine underneath. shadcn/ui's chart component is built on Recharts, and the docs say plainly: "We do not wrap Recharts." You compose Recharts components and add shadcn's `ChartContainer`, `ChartTooltip` and `ChartLegend` around them. So shadcn/ui can only offer chart types that Recharts has.

## Why doesn't Recharts have a heatmap?

Recharts 3 exports line, bar, area, pie, radar, radial bar, scatter, composed, funnel, treemap, sankey and sunburst charts. We checked the type exports of the current release (3.11.1) and none of them is a heatmap.

You can fake one with a `ScatterChart` and a custom square shape, but you fight the library the whole way: category axes, cell gaps, colour scales and keyboard focus all become custom code. At that point the chart library is adding weight, not saving work.

A heatmap is mostly a grid of coloured boxes. That is something HTML and CSS already do well.

## What are the options for a heatmap in a shadcn/ui project?

| Option | What it draws | Install | Notes |
|---|---|---|---|
| Build it (below) | Any rows × columns grid | Nothing | About 40 lines with CSS grid and your theme tokens |
| Panelo UI Activity Heatmap | Hour-by-day grid, plus day, month and year views | `npx shadcn@latest add @panelo/activity-heatmap` | Free, MIT; keyboard navigation and a spreadsheet view |
| Panelo UI Contribution Chart | Year calendar (GitHub style) and a 3D view | `npx shadcn@latest add @panelo/contribution-chart` | Free, MIT; takes your `{ date, count }` data |
| react-activity-calendar | Year calendar | `npm i react-activity-calendar` | MIT, SVG, you pass a `level` per day |
| Mantine Heatmap | Year calendar | `@mantine/charts` | Good if you already use Mantine, not shadcn/ui |

Two shapes hide under the word "heatmap". A **calendar heatmap** shows one cell per day over a year, like GitHub's contribution graph. A **matrix heatmap** shows two categories against each other, such as weekday by hour of day. Pick the tool that matches the shape you need. For the calendar kind, see our [GitHub contribution graph for shadcn/ui](/blog/shadcn-github-contribution-graph) guide.

## How do I build a simple heatmap with CSS grid?

This component takes a matrix of numbers and colours each cell by mixing your theme's `--primary` token into `--card`. Because it uses CSS variables, dark mode works with no extra code.

```tsx
// components/heatmap.tsx
"use client"

type HeatmapProps = {
  rows: string[]          // e.g. ["Mon", "Tue", ...]
  cols: string[]          // e.g. ["0", "1", ... "23"]
  values: number[][]      // values[row][col]
  unit?: string
}

export function Heatmap({ rows, cols, values, unit = "events" }: HeatmapProps) {
  const max = Math.max(1, ...values.flat())

  return (
    <div
      role="table"
      aria-label={`Heatmap of ${unit}`}
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `auto repeat(${cols.length}, minmax(0, 1fr))` }}
    >
      {values.map((row, r) => (
        <div role="row" key={rows[r]} className="contents">
          <div role="rowheader" className="pe-2 text-xs text-muted-foreground">
            {rows[r]}
          </div>
          {row.map((value, c) => (
            <div
              role="cell"
              key={cols[c]}
              title={`${rows[r]} ${cols[c]}: ${value} ${unit}`}
              aria-label={`${rows[r]} ${cols[c]}: ${value} ${unit}`}
              className="aspect-square rounded-[3px]"
              style={{
                background: `color-mix(in oklab, var(--primary) ${Math.round(
                  8 + 92 * (value / max)
                )}%, var(--card))`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
```

Use it like this:

```tsx
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const hours = Array.from({ length: 24 }, (_, h) => String(h))
const values = days.map((_, d) => hours.map((_, h) => (d * 7 + h * 3) % 20))

<Heatmap rows={days} cols={hours} values={values} unit="visits" />
```

A few choices in that code are deliberate:

- **One hue, light to dark.** Heatmaps read best with a single sequential colour ramp. A rainbow scale makes people compare hues instead of amounts.
- **A floor of 8%.** Zero cells still show a faint tint, so the grid shape stays visible.
- **`color-mix` instead of a palette.** You get a smooth ramp from one token, and it flips with `.dark` automatically.
- **Text labels per cell.** A screen reader can read each value. Colour alone never carries the data.

This is a good start. It does not yet have keyboard navigation, a table view or tooltips. Our [punch card chart guide](/blog/react-punch-card-chart) adds roving focus and a table fallback to the same idea. If you would rather not write those two parts, the [Activity Heatmap](https://www.paneloui.com/components/activity-heatmap) below already ships both.

## How do I install the Panelo UI Activity Heatmap?

Panelo UI is a library of dashboard components for shadcn/ui, built by Raycanvas. Its free charts are hand-written React with no chart library. The Activity Heatmap is a CSS grid of cells, not Recharts.

1. Add the registry to `components.json`:

```json
{
  "registries": {
    "@panelo": "https://www.paneloui.com/r/{name}.json"
  }
}
```

2. Install the block:

```bash
npx shadcn@latest add @panelo/activity-heatmap
```

3. Render it:

```tsx
import { ActivityHeatmap } from "@/components/panelo-ui/blocks/charts/activity-heatmap"

export default function Page() {
  return <ActivityHeatmap className="max-w-3xl" />
}
```

The files land in `components/panelo-ui`, next to your `components/ui`, so nothing collides. The CLI also pulls in the `panelo-theme` tokens it depends on. You can see it running on the [Activity Heatmap page](/components/activity-heatmap).

## What does the Panelo UI Activity Heatmap actually do?

From the source, so you know what you are getting:

- **Four views.** Day (hours by ten-minute slots), Week (8 am to 7 pm by fourteen days, the default), Month (a calendar, one row per week) and Year (weekdays by weeks). A dropdown on the active period picks the range.
- **A forecast in grey.** Cells after a "now" time use a grey ramp on the same scale, so past and predicted values never look alike.
- **Keyboard navigation.** The grid uses `role="grid"` with roving focus. Arrow keys move between cells; Home and End jump to the start or end of a row. Each cell has a label like "Wed 11 Dec, 2 pm: 410 visits".
- **A spreadsheet view.** One button swaps the grid for a real `<table>` with row and column headers. Forecast values are shown in italics.
- **Container-sized cells.** Row height is computed from the container width with container query units, so it fits a phone or a wide panel. The year view scrolls sideways on narrow screens.
- **One colour prop.** `accent` takes any CSS colour; the ramp is mixed from it with `color-mix`.

One honest limit: the component ships with generated demo data. It has no `data` prop. To show your numbers, you edit the `visits()` function and the `NOW` constant in the copied file. Since the source is in your repo, that is a short change, but it is a change. If you want a prop-driven year calendar today, the [Contribution Chart](/components/contribution-chart) takes a `days` array.

## How should a heatmap handle accessibility?

A heatmap fails users in three ways: it hides values behind hover, it relies on colour alone, and it traps keyboard users. Each has a plain fix.

1. **Give every cell a text label** with the row, column and value.
2. **Offer a table view.** A table is the most reliable way for screen reader users to compare values. It also helps anyone who wants exact numbers.
3. **Use one focusable cell at a time.** A grid with hundreds of tab stops is unusable. Make one cell `tabIndex={0}`, the rest `-1`, and move focus with arrow keys.
4. **Check contrast in both themes.** A ramp that looks fine on white can vanish on a dark card. Mixing from the surface token, as above, keeps the low end visible.

We cover these patterns across chart types in [accessible charts in React](/blog/accessible-charts-react).

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the heatmap:

```bash
npx shadcn@latest add @panelo/activity-heatmap
```

To show your own numbers, edit `visits()` and `NOW` in `components/panelo-ui/blocks/charts/activity-heatmap.tsx`, as described above.

- **See it live:** [Activity Heatmap](https://www.paneloui.com/components/activity-heatmap), and the prop-driven year calendar on the [Contribution Chart](https://www.paneloui.com/components/contribution-chart) page.
- **The page around it, in Panelo Pro:** if the heatmap is going on an analytics overview, [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) is that page: revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Does shadcn/ui have a heatmap component?

No. The official charts gallery has area, bar, line, pie, radar, radial and tooltip examples, all built on Recharts. Recharts has no heatmap, so shadcn/ui does not either.

### Can I make a heatmap with Recharts?

Not with a built-in component. You can approximate one with a scatter chart and custom square shapes, but a CSS grid is simpler and easier to make accessible.

### Is the Panelo UI Activity Heatmap free?

Yes. It is one of Panelo UI's free, MIT-licensed charts. You install it with `npx shadcn@latest add @panelo/activity-heatmap` after adding the `@panelo` registry to `components.json`.

### Does it use a chart library?

No. The Activity Heatmap is React and a CSS grid with `color-mix` colours. It does not import Recharts, D3 or any other chart library.

### How do I use my own data with it?

Edit the `visits()` function and the `NOW` constant in the copied source file. The component has no `data` prop yet. The Contribution Chart does accept a `days` prop if you need a year calendar.

### Does the heatmap work in dark mode?

Yes. The colours are mixed from CSS variables, so they flip with your theme's `.dark` class.

## Sources

- shadcn/ui chart docs (built on Recharts, "We do not wrap Recharts", Recharts v3): https://ui.shadcn.com/docs/components/chart
- shadcn/ui charts gallery (chart types listed): https://ui.shadcn.com/charts
- Recharts type exports, version 3.11.1 (no heatmap export): https://unpkg.com/recharts@3.11.1/types/index.d.ts
- Recharts on npm: https://www.npmjs.com/package/recharts
- react-activity-calendar (MIT, data shape, `level` prop): https://github.com/grubersjoe/react-activity-calendar
- react-activity-calendar type definitions: https://unpkg.com/react-activity-calendar@3.2.1/build/index.d.ts
- Mantine Heatmap (`@mantine/charts`, date-keyed data): https://mantine.dev/charts/heatmap/
