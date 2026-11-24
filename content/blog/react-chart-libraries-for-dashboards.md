---
title: "Recharts vs Chart.js vs Nivo vs visx for Dashboards"
description: "Recharts vs Chart.js vs Nivo vs visx vs ECharts for React dashboards in 2026: releases, licenses, React 19 support, rendering and accessibility, checked on npm."
slug: react-chart-libraries-for-dashboards
primaryKeyword: recharts vs chart.js vs nivo vs visx
secondaryKeywords:
  - recharts vs chart.js
  - recharts vs nivo
  - recharts vs visx
  - nivo vs visx
  - react chart library for dashboards
intent: comparison
cluster: Comparisons
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1666
cta:
  free: [revenue-chart, pie-chart]
  pro: [dashboard-pages-3]
---

# Recharts vs Chart.js vs Nivo vs visx for React dashboards (2026)

For most React dashboards, Recharts is the default: SVG, declarative, MIT, React 19 support and keyboard access on by default. Pick Chart.js or ECharts for large datasets on canvas, visx when you want D3-level control and will build the chart yourself, and Nivo for its wide range of ready-made chart types, noting it has not released since May 2025.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) and [Rounded Pie](https://www.paneloui.com/components/pie-chart) are free, MIT-licensed shadcn/ui blocks for two everyday dashboard charts, drawn in plain SVG with no chart library: a this-period-against-last revenue line with arrow-key navigation, and a part-to-whole pie with a linked legend that takes your numbers through a `data` prop. Add them with `npx shadcn@latest add @panelo/revenue-chart @panelo/pie-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Which React chart library should you use for a dashboard?

Short version, by job:

| If you need... | Use |
|---|---|
| Standard dashboard charts in a React and Tailwind app | Recharts (or shadcn/ui charts, which wrap it) |
| Thousands of points, fast redraws | Chart.js or ECharts on canvas |
| Unusual or fully custom visualisations | visx |
| Many chart types with good defaults, including Sankey, chord and calendar | Nivo |
| A big all-in-one charting toolkit with maps and large-data modes | ECharts |

## How do they compare on releases, license and React 19?

All data from the npm registry and GitHub on 24 November 2026.

| Library | Latest version | Published | License | React 19 in peer range | Renders to |
|---|---|---|---|---|---|
| Recharts | 3.11.1 | 2026-11-23 | MIT | Yes | SVG |
| Chart.js (+ react-chartjs-2) | 4.6.2 (wrapper 5.3.1) | 2026-11-23 (wrapper 2025-10-27) | MIT | Yes (wrapper) | Canvas |
| Nivo (`@nivo/core`) | 0.99.0 | 2025-05-23 | MIT | Yes | SVG, with canvas variants for some charts |
| visx (`@visx/visx`) | 4.0.0 | 2026-06-11 | MIT | Yes (`^18 \|\| ^19`) | SVG (you compose it) |
| Apache ECharts (+ echarts-for-react) | 6.1.0 (wrapper 3.1.0) | 2026-05-19 (wrapper 2026-11-17) | Apache-2.0 (wrapper MIT) | Wrapper accepts React 16+ | Canvas by default, SVG optional |

A few notes on maintenance:

- **Recharts** and **Chart.js** both shipped the day before this was written, and their repos had commits today.
- **Nivo** has had no npm release in 18 months. The repo was last pushed in July 2026, so it is quiet rather than abandoned.
- **visx** shipped a 4.0 major in June 2026.
- **ECharts** 6.1 shipped in May 2026. `echarts-for-react` is a community wrapper, not part of the Apache project.

## Recharts: the default for React dashboards

Recharts describes itself as a chart library built with React and D3, with native SVG output. You compose charts from components:

```tsx
"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { month: "Jan", users: 1200 },
  { month: "Feb", users: 1540 },
  { month: "Mar", users: 1710 },
];

export function UsersChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="users" stroke="var(--chart-1)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

Why it wins for most dashboards: it is the engine under shadcn/ui charts and Mantine Charts, SVG styles cleanly with CSS variables, and since 3.0 its `accessibilityLayer` is on by default for cartesian and polar charts, so users can tab in and move with arrow keys.

Where it is weaker: SVG means one DOM node per mark, so very dense charts get slow before a canvas library would. For theming help see [Recharts dark mode with Tailwind CSS v4](/blog/recharts-dark-mode-tailwind).

## Chart.js: canvas speed, framework-agnostic

Chart.js draws on a `<canvas>`. Its performance docs say canvas rendering is "quite fast" and recommend decimating data and setting `parsing: false` for large sets. In React you use `react-chartjs-2` and register the pieces you need:

```tsx
"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export function UsersChart() {
  return (
    <Line
      aria-label="Monthly users, January to March"
      role="img"
      data={{
        labels: ["Jan", "Feb", "Mar"],
        datasets: [{ label: "Users", data: [1200, 1540, 1710] }],
      }}
    />
  );
}
```

Where it is better: big datasets, live-updating charts, and teams that use the same charts outside React.

Where it is weaker: the canvas is opaque to screen readers. Chart.js's accessibility docs say it is up to you to give the canvas a `role` and `aria-label` or fallback content. Styling also happens in JavaScript options, not CSS, so Tailwind tokens have to be read and passed in.

## Nivo: many chart types, good defaults

Nivo offers a wide catalogue (bar, line, pie, heatmap, calendar, Sankey, chord and more), many with both SVG and canvas versions. Theming goes through a `theme` prop object that is merged with the defaults. Its bar chart types include accessibility props such as `role`, `ariaLabel`, `barAriaLabel` and `isFocusable`.

Where it is better: the quickest route to unusual chart types with polished defaults.

Where it is weaker: the release gap. Version 0.99.0 from May 2025 is the latest, and the library is still pre-1.0.

## visx: low-level primitives from Airbnb

visx calls itself "a collection of reusable low-level visualization components" that combine D3 with React, and says it is "largely unopinionated." You get scales, shapes, axes and gradients, and you assemble the chart. Its README notes that animation is not baked in on purpose.

Where it is better: custom visualisations, full control of markup, and split packages so you install only what you use (the README's own advice for keeping bundles down).

Where it is weaker: you write much more code, and accessibility, tooltips and keyboard handling are your job. For the keyboard part, the source of the free [Revenue Lines](https://www.paneloui.com/components/revenue-chart) chart shows one way to do it: the plot is a focusable slider that the arrow keys, Home and End move through, with the date and amounts in its `aria-valuetext` for screen readers.

## ECharts: the big toolkit

Apache ECharts is a full charting platform with Canvas and SVG renderers. Its docs recommend the canvas renderer for more than about 1,000 data points. It has an `aria` option that generates a chart description and adds decal patterns for color-blind users, but the docs say it is off by default.

Where it is better: large data, maps, many chart types, one config object per chart.

Where it is weaker: a large option-object API that feels less like React, and styling lives in JavaScript rather than your CSS.

## Which one is most accessible out of the box?

| Library | Keyboard focus by default | Screen reader text |
|---|---|---|
| Recharts 3 | Yes (`accessibilityLayer` on by default) | Arrow keys move the active point and its tooltip |
| Chart.js | No | You add `role`, `aria-label` or fallback content to the canvas |
| Nivo | Opt-in (`isFocusable` on supported charts) | `ariaLabel` and per-bar label props |
| visx | No, you build it | You build it |
| ECharts | No | `aria` option, off by default |

None of them gives you a data-table fallback automatically. That is still worth adding for any chart a user has to read precisely. We cover the patterns in [accessible charts in React](/blog/accessible-charts-react).

## Do you need a chart library at all?

For a handful of fixed dashboard charts, maybe not. A line or bar chart is a few SVG paths plus scaling math, and writing it yourself means no dependency to upgrade.

This is how Panelo UI's free charts are built: hand-built React (SVG or CSS) with no chart library, styled with Tailwind CSS v4 tokens, and installed as source with the shadcn CLI. The trade-off is real: they are fixed designs, not a charting API, so for many chart types use one of the libraries above. See the [Panelo UI charts](/components) for what that approach looks like.

## Get this working in your app

If two fixed charts are all you need, add the Panelo namespace to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install them:

```bash
npx shadcn@latest add @panelo/revenue-chart @panelo/pie-chart
```

Each needs only `clsx` and `tailwind-merge`. The pie takes `data` and `title` props; the revenue chart keeps its sample series in the file for you to replace. See them live: [Revenue Lines](https://www.paneloui.com/components/revenue-chart) and [Rounded Pie](https://www.paneloui.com/components/pie-chart).

For a whole overview page instead of single charts, the Pro [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) is an overview dashboard with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Is Recharts better than Chart.js?

For typical React dashboards, Recharts fits better: it is declarative, SVG and easy to theme with CSS. Chart.js is better for large or fast-changing datasets because it draws on canvas.

### Is Nivo still maintained?

Nivo's repository was last pushed in July 2026, but its latest npm release, 0.99.0, dates from May 2025. Check the repo before committing to it for a long-lived project.

### Is visx a chart library?

Not in the usual sense. visx is a set of low-level React and D3 primitives, so you build each chart yourself.

### Which React chart library supports React 19?

Recharts, react-chartjs-2, Nivo 0.99 and visx 4 all list React 19 in their peer dependency ranges, and echarts-for-react accepts React 16 and newer.

### What does shadcn/ui use for charts?

Recharts. shadcn/ui's chart component is a themed wrapper around Recharts v3. See [shadcn/ui charts vs Recharts](/blog/shadcn-charts-vs-recharts).

## Sources

- https://www.npmjs.com/package/recharts
- https://github.com/recharts/recharts
- https://github.com/recharts/recharts/releases/tag/v3.0.0
- https://www.npmjs.com/package/chart.js
- https://www.npmjs.com/package/react-chartjs-2
- https://www.chartjs.org/docs/latest/general/accessibility.html
- https://www.chartjs.org/docs/latest/general/performance.html
- https://www.npmjs.com/package/@nivo/core
- https://github.com/plouc/nivo
- https://github.com/plouc/nivo/blob/master/packages/bar/src/types.ts
- https://nivo.rocks/bar/
- https://nivo.rocks/guides/theming/
- https://www.npmjs.com/package/@visx/visx
- https://github.com/airbnb/visx
- https://www.npmjs.com/package/echarts
- https://www.npmjs.com/package/echarts-for-react
- https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/
- https://echarts.apache.org/handbook/en/best-practices/aria/
- https://echarts.apache.org/en/feature.html
- https://ui.shadcn.com/docs/components/chart
- https://www.npmjs.com/package/@mantine/charts
