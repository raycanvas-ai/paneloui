---
title: "Accessible Charts in React: Keyboard, Tables, Screen Readers"
description: "Build accessible charts in React: text alternatives, table views, keyboard navigation, screen reader values and contrast, plus what each chart library ships."
slug: accessible-charts-react
primaryKeyword: accessible charts react
secondaryKeywords:
  - keyboard accessible chart
  - accessible charts and graphs
  - wcag accessible charts
  - screen reader charts
  - chart data table fallback
intent: informational
cluster: Charts
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 2088
cta:
  free: [balance-chart, activity-heatmap]
  pro: [dashboard-pages-3]
---

# Accessible charts in React: keyboard navigation, table views and screen readers

An accessible React chart has: a text summary, the underlying data in a table, keyboard access to each data point, values announced to screen readers as focus moves, and colors with enough contrast that are not the only cue. Recharts 3 and MUI X Charts add keyboard access by default. The table and summary are usually yours to add.

> **Skip the build:** [Balance Chart](https://www.paneloui.com/components/balance-chart) is a free, MIT-licensed shadcn/ui block that ships the patterns in this post: a slider crosshair moved with Left, Right, Home and End, `aria-valuetext` that reads each category's amount, and a table view with a caption and header scopes. Add it with `npx shadcn@latest add @panelo/balance-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What makes a chart accessible?

A chart is an image of data. Anyone who cannot see it, or cannot use a mouse to hover it, needs another route to the same numbers. In practice:

| Need | Who it helps | How |
|---|---|---|
| Short text alternative | Screen reader users | `aria-label` or `alt` that names the chart and its main finding |
| Long description or data table | Screen reader users, anyone who wants exact values | A table view or a `<figcaption>` with the key numbers |
| Keyboard access to points | Keyboard and switch users | A focusable chart where arrow keys move between points |
| Announced values | Screen reader users | `aria-valuetext`, labelled cells or a polite live region |
| Contrast, not color alone | Low-vision and color-blind users | 3:1 contrast for lines and bars, labels or patterns besides color |
| Reduced motion | Users with vestibular disorders | Respect `prefers-reduced-motion` |

## What does WCAG say about charts?

Three parts of WCAG come up most for charts:

- **Complex images.** The W3C images tutorial says charts and graphs need "a two-part text alternative": a short description that identifies the chart, and a long description that gives the essential information. Its example wraps the long description, including a table, in `<figcaption>`.
- **Non-text contrast (1.4.11).** Graphical objects needed to understand the content need a 3:1 contrast ratio against adjacent colors. The W3C's guidance names "each line in a graph" as an example. A chart whose labels and values already convey the same information is exempt.
- **Use of color (1.4.1).** Color must not be the only visual means of conveying information or distinguishing a visual element. Legends with labels, direct labels on lines, or patterns all help.

Any text inside the chart, such as axis labels, still needs normal text contrast.

## How do you add a text alternative?

Give the chart container a name that says what it shows, and hide the decorative SVG from assistive tech so it is not read shape by shape:

```tsx
<figure>
  <svg role="img" aria-label="Revenue, Jan to Jun 2026: up 43%, peak in May" viewBox="0 0 320 120">
    {/* paths */}
  </svg>
  <figcaption>Revenue rose from $18.2k in January to $27.3k in May, then dipped in June.</figcaption>
</figure>
```

Keep the label short. Put the detail in the caption or a table. For canvas libraries such as Chart.js, the docs say the canvas content is not accessible to screen readers, so you must add the `role` and `aria-label` (or fallback content) yourself.

## How do you add a data table view?

A table is the most reliable long description. It is exact, it is navigable with screen reader table commands, and sighted users like it too. A toggle keeps it out of the way:

```tsx
"use client";

import { useState, type KeyboardEvent } from "react";

type Point = { label: string; value: number };

export function AccessibleLineChart({ title, data }: { title: string; data: Point[] }) {
  const [index, setIndex] = useState(data.length - 1);
  const [showTable, setShowTable] = useState(false);
  const last = data.length - 1;
  const point = data[index];

  const w = 320;
  const h = 120;
  const max = Math.max(...data.map((p) => p.value), 1);
  const x = (i: number) => (i * w) / Math.max(last, 1);
  const y = (v: number) => h - (v / max) * h;
  const path = data.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");

  function onKeyDown(event: KeyboardEvent) {
    const next = (
      {
        ArrowLeft: index - 1,
        ArrowDown: index - 1,
        ArrowRight: index + 1,
        ArrowUp: index + 1,
        Home: 0,
        End: last,
      } as Record<string, number>
    )[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setIndex(Math.min(Math.max(next, 0), last));
  }

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex items-center justify-between gap-4">
        <span>{title}</span>
        <button type="button" aria-pressed={showTable} onClick={() => setShowTable((v) => !v)}>
          Table view
        </button>
      </figcaption>

      {showTable ? (
        <table>
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.label}>
                <th scope="row">{p.label}</th>
                <td>{p.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div
          role="slider"
          tabIndex={0}
          aria-label={title}
          aria-valuemin={0}
          aria-valuemax={last}
          aria-valuenow={index}
          aria-valuetext={`${point.label}: ${point.value}`}
          onKeyDown={onKeyDown}
          className="relative rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="h-auto w-full overflow-visible text-chart-1">
            <path d={path} fill="none" stroke="currentColor" strokeWidth={2} />
            <circle cx={x(index)} cy={y(point.value)} r={4} fill="currentColor" />
          </svg>
        </div>
      )}
    </figure>
  );
}
```

The table uses `<caption>`, `scope="col"` and `scope="row"` so screen readers announce headers with each cell. The toggle is a real `<button>` with `aria-pressed`.

## How should keyboard navigation work in a chart?

Core ARIA has no "chart" role, so you borrow an existing pattern. Two work well.

**A slider for line and bar charts.** The chart above treats the crosshair as a slider. The WAI-ARIA slider pattern uses Left and Down to decrease, Right and Up to increase, and Home and End for the first and last values. `aria-valuetext` gives the readable value; the APG describes it for cases where the raw number is not meaningful, which fits a point index perfectly. The user hears "Mar: 19800" instead of "2".

**A grid for heatmaps.** A heatmap is a table of cells, so the WAI-ARIA grid pattern fits: the user tabs in once, arrow keys move one cell at a time, Home and End go to the start and end of the row. The APG says only one focusable element in the grid should be in the tab sequence, so give the active cell `tabIndex={0}` and the rest `tabIndex={-1}`, and label each cell with its row, column and value.

The grid is the harder of the two to get right, so test against a working one: Panelo UI's free [Activity Heatmap](https://www.paneloui.com/components/activity-heatmap) uses this pattern with one tab stop and a label on every cell.

Either way, show a visible focus ring, for example `focus-visible:ring-2`, and move the visual highlight with the keyboard focus.

## How do you announce values to screen readers?

Three options, from simplest:

1. **`aria-valuetext` on a slider.** Screen readers read it when the value changes. No live region needed.
2. **`aria-label` on each focusable cell or bar.** Focus moves, the label is read.
3. **A polite live region.** For custom widgets that keep focus on one element, write the current readout into `<p aria-live="polite" className="sr-only">`. Keep it short, and only update it on user action, not on a timer.

## What do React chart libraries give you?

Checked against each library's docs and source on 24 November 2026:

| Library | Keyboard by default | Screen reader support | Table view |
|---|---|---|---|
| Recharts 3 | Yes: `accessibilityLayer` is on by default for cartesian and polar charts; tab in, arrow keys move | Through the accessibility layer | No |
| shadcn/ui charts | Yes (Recharts v3 underneath; docs show the `accessibilityLayer` prop) | Same as Recharts | No |
| MUI X Charts | Yes, on all charts; `disableKeyboardNavigation` to turn off | Focused item description announced; localizable | No |
| Nivo | Opt-in: `isFocusable` defaults to `false` on bar charts | `role` (default `img`), `ariaLabel`, `barAriaLabel` | No |
| Chart.js | No | You add `role` and `aria-label` or fallback content to the canvas | No |
| Apache ECharts | No | `aria` option generates a description and decal patterns; off by default | No |
| visx | No | You build it | No |

MUI X's docs also say chart animations respect `prefers-reduced-motion` by default, and that keyboard support is still being developed. Recharts has an open GitHub discussion on what chart accessibility should do, which is a good read if you are designing your own.

The pattern is consistent: libraries are getting better at keyboard access, but none of them adds a table view or a written summary for you.

## What does this look like in a component kit?

Panelo UI's free charts, which use no chart library, follow the patterns above. Here is what each one ships, checked in the source:

| Chart | Keyboard | Screen reader | Table view |
|---|---|---|---|
| Revenue Lines, Trends | Slider crosshair: Left, Right, Home, End | `aria-valuetext` with the date and every series value | No |
| Balance Chart | Slider: Left, Right, Home, End | `aria-valuetext` with each category's amount | Yes, with caption and header scopes |
| Activity Heatmap | Grid with one tab stop; arrows, Home, End | `aria-label` per cell, forecast cells marked | Yes ("Spreadsheet") |
| Contribution Chart | Arrow keys move by day and week, Home, End | Polite live region with the focused day; respects reduced motion | No |
| Sales Trend | Tab to each period | `aria-label` per period with both series | No |
| Rounded Pie | Tab through the legend | `role="img"` with every slice and share in its label | No |

Gaps worth knowing: the crosshair sliders handle Left and Right but not Up and Down, and only two charts have a table view. Try the keyboard on the [activity heatmap](/components/activity-heatmap) or the [balance chart](/components/balance-chart).

## How do you test chart accessibility?

1. **Unplug the mouse.** Tab to the chart, move through every point, reach the table toggle.
2. **Turn on a screen reader** (VoiceOver, NVDA). Does the chart name make sense? Does each step read a label and value?
3. **Check contrast** for every series against its background in light and dark mode. Aim for 3:1 for lines and bars, 4.5:1 for axis text. For dark themes, see [Recharts dark mode with Tailwind CSS v4](/blog/recharts-dark-mode-tailwind).
4. **Remove color.** View in grayscale. Can you still tell series apart?
5. **Turn on reduced motion** in the OS and reload. Animations should stop or shorten.
6. **Zoom to 200%.** Labels should not overlap or clip.

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the two charts with table views:

```bash
npx shadcn@latest add @panelo/balance-chart
npx shadcn@latest add @panelo/activity-heatmap
```

They land in `components/panelo-ui`, next to your `components/ui`. Both ship with demo data: the balance figures live in `finance-data.ts`, and the heatmap's in `visits()` inside its file. Swap in your numbers, then run the six tests above, since your labels and colours will differ from ours.

See it live: [Balance Chart](https://www.paneloui.com/components/balance-chart) and [Activity Heatmap](https://www.paneloui.com/components/activity-heatmap).

For a full dashboard, the [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) in Panelo Pro has revenue, orders and new-customer stat cards, bar sparklines, and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Are Recharts charts accessible?

Partly. Recharts 3 turns on its `accessibilityLayer` by default, so users can tab into cartesian and polar charts and move with arrow keys. You still need to add a text summary and a table view yourself.

### What ARIA role should a chart use?

Core ARIA has no chart role. Use `role="img"` with an `aria-label` for a static chart, and borrow the slider or grid pattern when users need to move between data points.

### Does a chart need a data table?

WCAG requires a text alternative that conveys the same information, and the W3C tutorial shows a table as one form of the long description. A table is not mandatory, but it is the most precise option.

### What contrast do chart lines need?

WCAG 1.4.11 asks for at least 3:1 against adjacent colors for graphical objects needed to understand the chart, such as each line in a graph. Text labels need normal text contrast.

### Are canvas charts accessible?

Not by default. Chart.js's docs say canvas content is not accessible to screen readers, so you must add a role, a label or fallback content, and ideally a table.

## Sources

- https://www.w3.org/WAI/tutorials/images/complex/
- https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- https://www.w3.org/WAI/ARIA/apg/patterns/slider/
- https://www.w3.org/WAI/ARIA/apg/patterns/grid/
- https://github.com/recharts/recharts/releases/tag/v3.0.0
- https://github.com/recharts/recharts/discussions/4484
- https://ui.shadcn.com/docs/components/chart
- https://mui.com/x/react-charts/accessibility/
- https://github.com/plouc/nivo/blob/master/packages/bar/src/types.ts
- https://github.com/plouc/nivo/blob/master/packages/bar/src/defaults.ts
- https://www.chartjs.org/docs/latest/general/accessibility.html
- https://echarts.apache.org/handbook/en/best-practices/aria/
- https://github.com/airbnb/visx
