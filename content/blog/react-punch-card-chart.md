---
title: "React Punch Card Chart: Hour-by-Day Activity Heatmap"
description: "Build an hour-by-day activity heatmap (punch card chart) in React: bucket timestamps by time zone, colour a 7×24 grid, add keyboard navigation and a table view."
slug: react-punch-card-chart
primaryKeyword: react activity heatmap hour by day
secondaryKeywords:
  - punch card chart react
  - hour by day heatmap
  - day of week hour heatmap
  - react heatmap grid
  - user activity heatmap
intent: informational
cluster: Charts
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 2466
cta:
  free: [activity-heatmap]
  pro: [dashboard-pages-12]
---

# React Punch Card Chart: Hour-by-Day Activity Heatmap

A punch card chart is a 7 × 24 grid: weekdays down the side, hours across the top, each cell coloured or sized by how much happened then. In React: bucket timestamps by weekday and hour in the right time zone, render a CSS grid with one colour ramp, then add arrow-key navigation and a table view.

> **Skip the build:** [Activity Heatmap](https://www.paneloui.com/components/activity-heatmap) is a free, MIT-licensed shadcn/ui block that draws an hour-by-day heatmap as a CSS grid with one colour ramp, arrow-key navigation and a spreadsheet view. It ships with demo data that you swap for your own counts. Add it with `npx shadcn@latest add @panelo/activity-heatmap` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What is a punch card chart?

It answers one question: when does activity happen? Support tickets, deploys, logins, orders, commits. You count events by day of the week and hour of the day, and the busy hours stand out at a glance.

There are two common ways to draw it:

| Style | Encodes value by | Good for |
|---|---|---|
| Heatmap cells | Colour, light to dark | Dense data, reading patterns across the week |
| Punch card dots | Circle size | Sparse data, a lighter look |

Both use the same 7 × 24 matrix. The component below supports both with one prop.

Most chart libraries make you fake this with a scatter chart. Recharts, which shadcn/ui charts are built on, has no heatmap component. A CSS grid is the simpler tool, and it gives you real DOM cells you can focus and label.

## How do I group timestamps by weekday and hour?

The trap here is the time zone. `date.getHours()` uses the time zone of whatever machine runs the code. On a server that is often UTC; in a browser it is the viewer's zone. Decide which one you want and say it in the chart title.

`Intl.DateTimeFormat` can read the weekday and hour in any IANA time zone:

```ts
// lib/punch-card.ts
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function punchCard(times: Date[], timeZone = "UTC"): number[][] {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  })
  const grid = WEEKDAYS.map(() => Array<number>(24).fill(0))

  for (const t of times) {
    const parts = fmt.formatToParts(t)
    const day = WEEKDAYS.indexOf(parts.find((p) => p.type === "weekday")!.value)
    const hour = Number(parts.find((p) => p.type === "hour")!.value)
    grid[day][hour] += 1
  }
  return grid
}
```

Two details. `hourCycle: "h23"` gives hours 0 to 23 rather than 1 to 12. And the formatter is created once, outside the loop, because creating it is the slow part.

For large tables, group in the database instead and send only the 168 counts. In PostgreSQL that is a `GROUP BY` on `extract(isodow from created_at at time zone 'Europe/Berlin')` and `extract(hour from ...)`.

## What about daylight saving time and uneven weeks?

Two quieter problems show up once real data arrives.

**Daylight saving time.** In the United States, clocks jump from 2 a.m. to 3 a.m. on the second Sunday in March and fall back at 2 a.m. on the first Sunday in November. In a zone like `America/New_York`, the Sunday 2 am cell loses one hour of the year and the Sunday 1 am cell gains one. We checked this by bucketing every hour of 2026 with the function above: Sunday 1 am got 53 hours, Sunday 2 am got 51, and Sunday 3 am got 52. Over a full year the difference is small. Over a two-week range that crosses a change, one cell can look empty or doubled for no business reason. If your audience spans several zones, consider bucketing in UTC and saying so in the title.

**Uneven weekday counts.** A 30-day range holds four of some weekdays and five of others. If you show raw totals, the weekdays that occur five times look busier than they are. Two fixes:

1. Show averages. Count how many times each weekday occurs in the range and divide that row by it.
2. Pick ranges that are whole weeks: 28, 56 or 91 days.

Say which one you chose in the title or a caption, for example "Average orders per hour, last 8 weeks".

**Week start.** The `WEEKDAYS` array starts on Monday, which matches ISO weeks and PostgreSQL's `isodow` (Monday is 1, Sunday is 7). If your readers expect Sunday first, reorder the array. The lookup by name keeps working.

## How do I render the grid?

Use CSS grid with 25 columns: one for the weekday labels and 24 for hours. Colour each cell by mixing an accent into the card colour, so zero is a faint tint and the busiest hour is the full accent.

```tsx
// components/punch-card-chart.tsx
"use client"

import { useRef, useState, type KeyboardEvent } from "react"
import { WEEKDAYS } from "@/lib/punch-card"

const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`

type Props = {
  grid: number[][]                // 7 rows × 24 columns
  unit?: string
  variant?: "heat" | "dots"
  title: string
}

export function PunchCardChart({ grid, unit = "events", variant = "heat", title }: Props) {
  const [active, setActive] = useState<[number, number]>([0, 0])
  const [showTable, setShowTable] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const max = Math.max(1, ...grid.flat())

  const moves: Record<string, [number, number]> = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  }

  function onKeyDown(e: KeyboardEvent, r: number, c: number) {
    let next: [number, number] | null = moves[e.key] ? [r + moves[e.key][0], c + moves[e.key][1]] : null
    if (e.key === "Home") next = [r, 0]
    if (e.key === "End") next = [r, 23]
    if (!next) return
    e.preventDefault()
    const nr = Math.min(6, Math.max(0, next[0]))
    const nc = Math.min(23, Math.max(0, next[1]))
    setActive([nr, nc])
    gridRef.current?.querySelector<HTMLElement>(`[data-cell="${nr}-${nc}"]`)?.focus()
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{title}</h2>
        <button
          type="button"
          aria-pressed={showTable}
          onClick={() => setShowTable((v) => !v)}
          className="rounded-md border px-2 py-1 text-xs"
        >
          Table view
        </button>
      </div>

      {showTable ? (
        <div className="overflow-auto">
          <table className="w-full text-xs tabular-nums">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Day</span></th>
                {grid[0].map((_, h) => (
                  <th key={h} scope="col" className="px-1 text-end font-medium">{hourLabel(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, d) => (
                <tr key={WEEKDAYS[d]}>
                  <th scope="row" className="pe-2 text-start font-medium">{WEEKDAYS[d]}</th>
                  {row.map((v, h) => (
                    <td key={h} className="px-1 text-end">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          ref={gridRef}
          role="grid"
          aria-label={`${title}. Use arrow keys to move between hours.`}
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: "2.5rem repeat(24, minmax(0, 1fr))" }}
        >
          {grid.map((row, d) => (
            <div role="row" key={WEEKDAYS[d]} className="contents">
              <div role="rowheader" className="self-center text-xs text-muted-foreground">
                {WEEKDAYS[d]}
              </div>
              {row.map((v, h) => {
                const share = v / max
                const isActive = active[0] === d && active[1] === h
                return (
                  <div
                    key={h}
                    role="gridcell"
                    data-cell={`${d}-${h}`}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={`${WEEKDAYS[d]} ${hourLabel(h)}: ${v} ${unit}`}
                    title={`${WEEKDAYS[d]} ${hourLabel(h)}: ${v} ${unit}`}
                    onFocus={() => setActive([d, h])}
                    onKeyDown={(e) => onKeyDown(e, d, h)}
                    className="grid aspect-square place-items-center rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={
                      variant === "heat"
                        ? { background: `color-mix(in oklab, var(--primary) ${Math.round(8 + 92 * share)}%, var(--card))` }
                        : undefined
                    }
                  >
                    {variant === "dots" && v > 0 ? (
                      <span
                        aria-hidden
                        className="rounded-full bg-primary"
                        style={{ width: `${Math.sqrt(share) * 100}%`, height: `${Math.sqrt(share) * 100}%` }}
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
          <div aria-hidden />
          {grid[0].map((_, h) => (
            <div key={h} aria-hidden className="text-center text-[10px] text-muted-foreground">
              {h % 3 === 0 ? hourLabel(h) : ""}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
```

Use it:

```tsx
import { punchCard } from "@/lib/punch-card"
import { PunchCardChart } from "@/components/punch-card-chart"

const grid = punchCard(orders.map((o) => o.createdAt), "America/New_York")

<PunchCardChart grid={grid} unit="orders" title="Orders by hour, New York time" />
```

The class names use shadcn/ui's theme variables (`--primary`, `--card`, `text-muted-foreground`), so the chart follows light and dark mode. Swap them for your own tokens if you use another system.

## Why these design choices?

- **One colour ramp.** Amount maps to lightness of one hue. Several hues force readers to learn a legend for what should be obvious.
- **A floor of 8%.** Empty hours still show as faint cells, so the 7 × 24 shape is always readable.
- **Square-root dot sizes.** In the dots variant, the circle's width grows with the square root of the value. That makes its area, which is what eyes compare, proportional to the count.
- **Labels every three hours.** Twenty-four labels collide on a phone. Every cell still has a full label for screen readers and a tooltip on hover.

## How do I make it keyboard and screen reader friendly?

The component uses the roving-tabindex pattern. Only one cell has `tabIndex={0}`, so the grid is a single tab stop. Arrow keys move between cells, and Home and End jump to the start and end of a row. Every cell's `aria-label` states the day, hour and value, so colour never carries the data alone.

Getting the roving focus and the table toggle right is the slowest part of this build; Panelo UI's [Activity Heatmap](https://www.paneloui.com/components/activity-heatmap) is a finished version you can tab into and compare against.

The table view matters as much as the keyboard. A real `<table>` with row and column headers is the easiest way for screen reader users to compare values, and it helps anyone who wants exact numbers. Read more in [accessible charts in React](/blog/accessible-charts-react).

Colour contrast needs a note too. WCAG 2.2 asks for a 3:1 contrast ratio for "parts of graphics required to understand the content" (success criterion 1.4.11), and says colour must not be "the only visual means of conveying information" (1.4.1). A light-to-dark ramp cannot give every neighbouring cell 3:1, and it shouldn't try. That is why the design here does not lean on colour alone: each cell has a text label and a tooltip, and the table view gives the exact numbers. Two cheap checks still help. Make sure the darkest cell stands out clearly against the card in both light and dark themes. And check that the 8% floor cell is still visible as a cell, so the grid's shape survives on a dim screen.

## How do I check the numbers are right?

Before you ship the chart, run through this list with a small, known dataset:

1. **Totals match.** The sum of all 168 cells should equal the number of events you passed in. If they differ, the input query or the bucketing is wrong. Note that `formatToParts` throws a `RangeError` on an invalid date, so filter those out first.
2. **One known event lands where you expect.** Pick an event from a known time, for example Tuesday at 9:15 local time, and confirm it shows up in the Tuesday 9 am cell, not 8 am or 10 am.
3. **The server and browser agree.** Render on the server and in the browser and compare. A mismatch means one side is still using its own time zone.
4. **The busiest cell is plausible.** If peak support tickets appear at 3 am, check the time zone before you check the support team.
5. **Empty data renders.** With no events, `max` falls back to 1, every cell shows the floor colour, and nothing divides by zero.

## Is there a ready-made hour-by-day heatmap for shadcn/ui?

Panelo UI, built by Raycanvas, ships a free, MIT-licensed Activity Heatmap with the same building blocks: a CSS grid with `color-mix` colours, `role="grid"` with roving focus, arrow keys plus Home and End, and a spreadsheet button that swaps in a real table. It installs with the shadcn CLI; the two setup steps are in [Get this working in your app](#get-this-working-in-your-app) below.

Be clear on how it differs from the punch card above. Its default Week view is hours (8 am to 7 pm) by fourteen calendar dates, not 7 weekdays averaged together. It also has Day, Month and Year views, and draws a forecast in grey after a "now" time. It ships with generated demo data and has no `data` prop, so you edit the `visits()` function and `NOW` constant in the copied file to show your own numbers. See it on the [Activity Heatmap page](/components/activity-heatmap), or compare other routes in [shadcn heatmap chart](/blog/shadcn-heatmap-chart).

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

It lands in `components/panelo-ui`, next to your `components/ui`. To show your own numbers, edit `visits()` and `NOW` in the copied file, and keep the time zone rules from earlier in this post.

See it live: [Activity Heatmap](https://www.paneloui.com/components/activity-heatmap).

If the heatmap is one panel of a larger report, the [Marketing Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-12) in Panelo Pro is a full page with a KPI strip, a three-series trend chart, a tabbed lead inbox with AI score, and channel panels. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### What is a punch card chart?

A grid of weekdays by hours of the day, where each cell shows how much activity happened in that slot. Values are shown by colour (a heatmap) or by circle size (a punch card).

### How do I group events by hour in a specific time zone?

Use `Intl.DateTimeFormat` with a `timeZone` option and `formatToParts` to read the weekday and hour. Do not rely on `getHours()`, which uses the time zone of the machine running the code.

### Do I need a chart library for an hour-by-day heatmap?

No. It is a 7 × 24 grid of coloured boxes, which a CSS grid handles well. Recharts, the library under shadcn/ui charts, has no heatmap component anyway.

### Should a punch card use colour or circle size?

Colour suits dense data and makes weekly patterns easy to scan. Circle size suits sparse data. If you use circles, scale the radius by the square root of the value so area tracks the count.

### How do I make a heatmap accessible?

Give every cell a text label with its day, hour and value, use one tab stop with arrow-key movement, and offer a table view with the same numbers.

### Should a punch card show totals or averages?

For ranges that are not whole weeks, show averages per weekday, because some weekdays occur more often than others in the range. For whole-week ranges, totals and averages give the same pattern.

## Sources

- MDN, `Intl.DateTimeFormat` (`timeZone`, `hourCycle`, `formatToParts`): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
- PostgreSQL date/time functions (`extract`, `isodow`, `AT TIME ZONE`): https://www.postgresql.org/docs/current/functions-datetime.html
- W3C WAI-ARIA Authoring Practices, Grid pattern (roving tabindex, arrow keys, Home/End): https://www.w3.org/WAI/ARIA/apg/patterns/grid/
- NIST, Daylight Saving Time rules (second Sunday in March to first Sunday in November, 2 a.m. local): https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst
- W3C, WCAG 2.2 (1.4.1 Use of Color, 1.4.11 Non-text Contrast): https://www.w3.org/TR/WCAG22/
- shadcn/ui chart docs (built on Recharts): https://ui.shadcn.com/docs/components/chart
- Recharts type exports, 3.11.1 (no heatmap component): https://unpkg.com/recharts@3.11.1/types/index.d.ts
- shadcn/ui theming variables (`--primary`, `--card`, `--muted-foreground`): https://ui.shadcn.com/docs/theming
