---
title: "3D Isometric Contribution Graph in React (No Three.js)"
description: "Build a 3D isometric contribution graph in React with plain SVG: the projection maths, draw order, face shading, a working component and a free one to install."
slug: 3d-isometric-contribution-graph-react
primaryKeyword: 3d contribution graph react
secondaryKeywords:
  - isometric contribution graph
  - github contribution graph 3d
  - 3d contribution graph
  - isometric svg react
intent: informational
cluster: Charts
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 2125
cta:
  free: [contribution-chart, link-graph]
  pro: [dashboard-pages-12]
---

# 3D Isometric Contribution Graph in React (No Three.js)

You can draw a 3D contribution graph in React with plain SVG. Project each day's grid cell with isometric maths, turn its count into a bar height, draw bars from back to front, and shade the two side faces darker than the top. No WebGL needed. Panelo UI's free Contribution Chart ships this as a 3D view.

> **Skip the build:** [Contribution Chart](https://www.paneloui.com/components/contribution-chart) is a free, MIT-licensed shadcn/ui block that draws a year of daily counts as an isometric 3D city of bars in plain SVG, with a Calendar / 3D toggle that morphs one view into the other. Add it with `npx shadcn@latest add @panelo/contribution-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What is an isometric contribution graph?

It is the familiar GitHub-style calendar, one square per day, tipped back into a 3D plane. Each square becomes a bar, and the bar's height shows that day's count. Busy weeks rise like a skyline, and quiet weekends sit flat.

The idea is not new. Two well-known takes:

- **isometric-contributions** is a browser extension for Chrome, Brave, Firefox and Edge. It adds an isometric pixel-art version of the contribution chart to GitHub profiles, drawn with the obelisk.js library. It is MIT-licensed.
- **gh-skyline** is an official GitHub CLI extension that turns your contribution graph into a 3D-printable STL file. GitHub announced it in December 2024 and noted that STL files can be previewed on GitHub in the browser.

Neither is a React component you can drop into your own dashboard with your own data. That is what this guide builds.

## Do I need Three.js for a 3D bar chart?

No, not for this. An isometric view has no perspective: parallel lines stay parallel and every bar is the same size wherever it sits. That means each 3D point maps to a 2D point with two lines of arithmetic. SVG polygons are enough.

| | Isometric SVG | Three.js / WebGL |
|---|---|---|
| Bundle | Nothing extra | A 3D engine |
| Camera | Fixed angle | Orbit, zoom, perspective |
| Server rendering | Works; it is just markup | Needs a canvas on the client |
| Hover and focus | Normal DOM events on each polygon | Raycasting |
| Theming | CSS variables in `fill` | Materials in JavaScript |
| Best for | ~370 bars at a fixed angle | Free camera, lighting, many objects |

If you want people to rotate the city, use a 3D engine. For a fixed view in a dashboard card, SVG is simpler.

## How does the isometric projection work?

Put each day on a grid: `x` is the week (0 to 52), `y` is the weekday (0 to 6), and `z` is height. Isometric projection rotates the grid 45 degrees and squashes it vertically:

```ts
const S = 12                        // one cell, in SVG units
const COS = Math.cos(Math.PI / 6)   // cos 30°, about 0.866

const iso = (x: number, y: number, z: number) =>
  [(x - y) * COS * S, (x + y) * 0.5 * S - z * S] as const
```

Read it like this. Moving one week (`x + 1`) goes right and down. Moving one weekday (`y + 1`) goes left and down. Height (`z`) goes straight up. This is the same function Panelo UI's Contribution Chart uses.

A bar is a box from `z = 0` to `z = h`. From this camera you see three faces of it: the top, the face toward `+y` (lower left), and the face toward `+x` (lower right). The faces at the back are always hidden, so you never draw them.

## In what order should the bars be drawn?

SVG has no depth buffer. Whatever you draw last covers what came before. So draw from back to front, the painter's algorithm.

For unit cells on a grid seen from this angle, depth is simply `x + y`. A cell with a smaller `x + y` is further back. Sort by it and draw in that order:

```ts
bars.sort((a, b) => a.x + a.y - (b.x + b.y))
```

Cells with the same `x + y` sit on one diagonal and never overlap each other, so their order does not matter.

## How do I shade the faces?

Real 3D engines compute lighting. Here you fake one light from the upper left by giving each face a fixed darkness: the top at full colour, the left face a little darker, the right face darker still.

The colour itself comes from the count. Use one sequential ramp, faint for small values and strong for large ones. A rainbow makes heights harder to compare.

Panelo UI's chart darkens the faces with CSS relative colour, for example `oklch(from ${color} calc(l * 0.86) c h)` for one side and `0.72` for the other. The component below uses a semi-transparent black overlay instead, which gives a similar result and works wherever SVG does.

## What does a working component look like?

This is a complete, self-contained component. Pass contiguous days with UTC timestamps, oldest first.

```tsx
// components/iso-contributions.tsx
type Day = { date: number; count: number } // date: UTC midnight, in ms

const S = 12
const COS = Math.cos(Math.PI / 6)
const TALLEST = 8   // busiest day's height, in cells
const PLATE = 0.15  // empty days are thin plates
const GAP = 0.08

const iso = (x: number, y: number, z: number) =>
  [(x - y) * COS * S, (x + y) * 0.5 * S - z * S] as const

const pts = (p: (readonly [number, number])[]) =>
  p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")

export function IsoContributions({ days }: { days: Day[] }) {
  if (days.length === 0) return null

  const offset = new Date(days[0].date).getUTCDay() // Sunday in row 0
  const weeks = Math.ceil((days.length + offset) / 7)
  const max = Math.max(1, ...days.map((d) => d.count))
  const total = days.reduce((sum, d) => sum + d.count, 0)

  const bars = days
    .map((d, i) => {
      const slot = i + offset
      return { d, x: Math.floor(slot / 7), y: slot % 7, h: PLATE + (d.count / max) * TALLEST }
    })
    .sort((a, b) => a.x + a.y - (b.x + b.y)) // back to front

  const minX = iso(0, 7, 0)[0] - 4
  const maxX = iso(weeks, 0, 0)[0] + 4
  const minY = iso(0, 0, TALLEST + PLATE)[1] - 4
  const maxY = iso(weeks, 7, 0)[1] + 4

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      role="img"
      aria-label={`${total} contributions over ${days.length} days, shown as 3D bars`}
      className="h-auto w-full"
    >
      {bars.map(({ d, x, y, h }) => {
        const [x0, x1, y0, y1] = [x + GAP, x + 1 - GAP, y + GAP, y + 1 - GAP]
        const mix = d.count === 0 ? 8 : Math.round(30 + 70 * (d.count / max))
        const color = `color-mix(in oklab, var(--primary) ${mix}%, var(--card))`
        const left = pts([iso(x0, y1, h), iso(x1, y1, h), iso(x1, y1, 0), iso(x0, y1, 0)])
        const right = pts([iso(x1, y0, h), iso(x1, y1, h), iso(x1, y1, 0), iso(x1, y0, 0)])
        const top = pts([iso(x0, y0, h), iso(x1, y0, h), iso(x1, y1, h), iso(x0, y1, h)])

        return (
          <g key={d.date}>
            <title>{`${d.count} on ${new Date(d.date).toISOString().slice(0, 10)}`}</title>
            <polygon points={left} fill={color} />
            <polygon points={left} fill="black" fillOpacity={0.14} />
            <polygon points={right} fill={color} />
            <polygon points={right} fill="black" fillOpacity={0.28} />
            <polygon points={top} fill={color} />
          </g>
        )
      })}
    </svg>
  )
}
```

It has no hooks and no browser APIs, so it renders on the server too. The colours mix from `--primary` and `--card`, the shadcn/ui theme variables, so it follows light and dark mode. Change those to any CSS colours if you don't use shadcn/ui.

To try it with fake data:

```tsx
const DAY = 86_400_000
const end = Date.UTC(2026, 10, 24)
const days = Array.from({ length: 365 }, (_, i) => ({
  date: end - (364 - i) * DAY,
  count: (i * 7919) % 13 > 7 ? (i * 31) % 17 : 0,
}))

<IsoContributions days={days} />
```

## How do I animate between the flat calendar and 3D?

Draw both views with the same polygons and interpolate each corner. Compute where a point sits in the flat calendar, where it sits in isometric space, and `lerp` between them with a progress value `t` from 0 to 1.

Panelo UI's Contribution Chart does this in two overlapping phases: the tiles slide into the isometric plane over the first 62% of the morph, and the bars start to rise at 38%. Both use a cubic ease, the whole morph takes 900 ms, and a toggle mid-flight reverses from where it is. With `prefers-reduced-motion`, it jumps straight to the end. The calendar's rounded corners also fade out as the tiles become bars.

Tuning that morph is the fiddliest part of this build; if you would rather start from a working one, flip the toggle on the [Contribution Chart page](https://www.paneloui.com/components/contribution-chart) and install it from there.

## What about accessibility?

A 3D chart is a picture of numbers, so the numbers must exist in text too. The component above gives the SVG a summary label and each bar a `<title>`. That is a minimum. Better options:

- Keep a flat calendar or table view one click away. Height is harder to read exactly than a number.
- Make the chart keyboard-reachable. Panelo UI's version is one focusable region: arrow keys move a day or a week, Home and End jump to the ends, and a polite live region announces the active day.
- Respect reduced motion for any morph.

Our [accessible charts guide](/blog/accessible-charts-react) goes deeper.

## Can I install a ready-made 3D contribution graph?

Yes. Panelo UI, built by Raycanvas, includes the 3D view in its free, MIT-licensed Contribution Chart. It is hand-written React and SVG with no chart library or 3D engine. Add the registry and install it (see [Get this working in your app](#get-this-working-in-your-app) below), then render it:

```tsx
import { ContributionChart } from "@/components/panelo-ui/blocks/charts/contribution-chart"

<ContributionChart days={days} />
```

It adds a Calendar / 3D toggle, quartile colour levels, total and streak stats, and a hover tooltip anchored to the top of each bar. The camera angle is fixed; there is no orbit. See it on the [Contribution Chart page](/components/contribution-chart), or read the [shadcn contribution graph setup guide](/blog/shadcn-github-contribution-graph) for wiring real data.

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the chart. Add Link Graph too if you want a 3D view the reader can turn:

```bash
npx shadcn@latest add @panelo/contribution-chart
npx shadcn@latest add @panelo/link-graph
```

Both land in `components/panelo-ui`, next to your `components/ui`. [Link Graph](https://www.paneloui.com/components/link-graph) is a different chart: a network of the sites that mention, link to and cite a site. Its 3D view is still SVG with the rotation and perspective written by hand, and you orbit it by dragging or with the arrow keys. It is a good reference if you outgrow the fixed camera above but don't want a 3D engine.

See it live: [Contribution Chart](https://www.paneloui.com/components/contribution-chart) and [Link Graph](https://www.paneloui.com/components/link-graph).

For a full analytics page, the [Marketing Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-12) in Panelo Pro has a KPI strip, a three-series trend chart, a tabbed lead inbox with AI score, and channel panels. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### How do I make a 3D GitHub contribution graph in React?

Map each day to a grid cell, project its corners with isometric maths, and draw three polygons per bar in SVG, back to front. No 3D library is needed for a fixed camera angle.

### What is the isometric projection formula?

For grid position `x`, `y` and height `z`: screen x is `(x − y) × cos 30° × size`, and screen y is `(x + y) × 0.5 × size − z × size`.

### Why do my bars overlap wrongly?

SVG paints in document order. Sort bars by `x + y` ascending so the ones at the back are drawn first.

### Does GitHub have a 3D contribution graph?

GitHub's gh-skyline CLI extension exports your contribution graph as a 3D-printable STL file. The isometric-contributions browser extension adds an isometric view to GitHub profiles.

### Is there a React component with a 3D contribution view?

Panelo UI's free Contribution Chart has a Calendar / 3D toggle drawn in SVG. It installs with `npx shadcn@latest add @panelo/contribution-chart`.

## Sources

- isometric-contributions browser extension (browsers, obelisk.js, MIT): https://github.com/jasonlong/isometric-contributions
- gh-skyline CLI extension (STL output): https://github.com/github/gh-skyline
- GitHub changelog, GitHub Skyline CLI extension (December 2024, STL preview on GitHub): https://github.blog/changelog/2024-12-09-github-skyline-cli-extension/
- shadcn/ui theming variables used in the sample (`--primary`, `--card`): https://ui.shadcn.com/docs/theming
