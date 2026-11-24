---
title: "GitHub Contribution Graph in React: 7 Options Compared"
description: "Compare react-activity-calendar, react-github-calendar, react-calendar-heatmap, @uiw/react-heat-map, Nivo, Kibo UI and Panelo UI for a GitHub-style graph."
slug: github-contribution-graph-react
primaryKeyword: github contribution graph react
secondaryKeywords:
  - react github calendar
  - react calendar heatmap
  - github style heatmap react
  - contribution graph react component
  - react-activity-calendar vs react-calendar-heatmap
intent: comparison
cluster: Charts
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1967
cta:
  free: [contribution-chart]
  pro: [dashboard-pages-12]
---

# GitHub Contribution Graph in React: 7 Options Compared

For a GitHub-style contribution graph in React, react-activity-calendar is the most complete general package, and react-github-calendar wraps it to show a GitHub user in one line. react-calendar-heatmap and @uiw/react-heat-map are lighter SVG options. Nivo adds canvas rendering. In shadcn/ui projects, Kibo UI and Panelo UI install as source through the CLI.

> **Skip the build:** [Contribution Chart](https://www.paneloui.com/components/contribution-chart) is a free, MIT-licensed shadcn/ui block that draws a GitHub-style contribution graph from your own `{ date, count }` days, works out the colour levels itself, and adds streak stats and a 3D view. Add it with `npx shadcn@latest add @panelo/contribution-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What are the options for a GitHub contribution graph in React?

All facts below were checked on npm and in each project's docs on 2026-11-24.

| Option | Latest / released | Licence | Renders | Data you pass | Colour levels |
|---|---|---|---|---|---|
| react-activity-calendar | 3.2.1 / 2026-07-07 | MIT | SVG | `{ date: "yyyy-MM-dd", count, level }` | You set `level` (default range 0–4) |
| react-github-calendar | 5.0.9 / 2026-08-27 | MIT | SVG (via react-activity-calendar) | A GitHub `username` | Fetched with the data |
| react-calendar-heatmap | 1.10.0 / 2025-02-23 | MIT | SVG | `{ date, count }` | You return a CSS class from `classForValue` |
| @uiw/react-heat-map | 2.3.5 / 2026-11-19 | MIT | SVG | `{ date: "2016/01/11", count }` | `panelColors` map or array |
| @nivo/calendar | 0.99.0 / 2025-05-23 | MIT | SVG or canvas | `{ day: "YYYY-MM-DD", value }` plus `from`, `to` | Nivo colour scale |
| Kibo UI Contribution Graph | shadcn CLI | see project | see project | Your contributions array | see project |
| Panelo UI Contribution Chart | shadcn CLI | MIT | SVG | `{ date: <UTC ms>, count }` | Computed: zero, then quartiles |

A few notes on reading this table:

- **Who computes the levels** matters more than it looks. If the library expects you to pass a level, you must decide the thresholds. GitHub's own GraphQL schema describes its levels as quartiles of the days with contributions, with a separate level for zero.
- **Release dates are not quality scores.** A small, finished component can go a year without a release and still work. Check React 19 support in its peer dependencies: react-activity-calendar and react-github-calendar list `^18.0.0 || ^19.0.0`; react-calendar-heatmap lists `>=0.14.0`.

## Which one should I pick?

| If you want to… | Pick |
|---|---|
| Show a GitHub user's real graph with the least code | react-github-calendar |
| Show your own data with themes, tooltips and SSR | react-activity-calendar |
| A small, CSS-class-styled SVG calendar | react-calendar-heatmap |
| Canvas rendering, or you already use Nivo | @nivo/calendar |
| Source code in a shadcn/ui project, with stats and a 3D view | Panelo UI Contribution Chart |
| Source code in a shadcn/ui project, using Kibo UI's patterns | Kibo UI Contribution Graph |

Each one is better than the others at something. The rest of this post shows each in code.

## How do I show a GitHub user's graph with react-github-calendar?

This is the shortest path to a real GitHub graph:

```tsx
import { GitHubCalendar } from "react-github-calendar"

export function Profile() {
  return <GitHubCalendar username="octocat" />
}
```

It is built on react-activity-calendar and fetches from Jonathan Gruber's github-contributions-api. The README notes that this component fetches data on the client, so it does not render on the server. For server rendering, the README suggests fetching from the API yourself and passing the data to react-activity-calendar.

## How do I use react-activity-calendar with my own data?

You pass one entry per day with a date string, a count and a level. The component does not decide the level for you: its docs say how you classify your data is up to you. Here is a helper that assigns quartile levels the way GitHub describes them:

```tsx
import { ActivityCalendar, type Activity } from "react-activity-calendar"

function withLevels(days: { date: string; count: number }[]): Activity[] {
  const active = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b)
  const q = (p: number) => active[Math.min(active.length - 1, Math.floor(p * active.length))] ?? 1
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)]
  return days.map((d) => ({
    ...d,
    level: d.count === 0 ? 0 : d.count <= q1 ? 1 : d.count <= q2 ? 2 : d.count <= q3 ? 3 : 4,
  }))
}

export function ActivityGraph({ days }: { days: { date: string; count: number }[] }) {
  return (
    <ActivityCalendar
      data={withLevels(days)}
      blockSize={12}
      blockMargin={4}
      theme={{ light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"] }}
      labels={{ totalCount: "{{count}} actions in {{year}}" }}
    />
  )
}
```

Other props worth knowing: `colorScheme` forces light or dark, `weekStart` sets the first weekday, `renderBlock` lets you wrap each block (for links or handlers), and `tooltips` configures tooltips built on Floating UI. Its README says server rendering is supported. Days missing from `data` are treated as no activity.

If you would rather not own the level maths, Panelo UI's [Contribution Chart](https://www.paneloui.com/components/contribution-chart) takes raw counts and assigns the same zero-plus-quartiles levels inside the component.

## How do I use react-calendar-heatmap?

It is a smaller component that styles cells with CSS classes. You import its stylesheet and map each value to a class:

```tsx
import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"

export function Heatmap({ values }: { values: { date: string; count: number }[] }) {
  return (
    <CalendarHeatmap
      startDate={new Date("2025-11-24")}
      endDate={new Date("2026-11-24")}
      values={values}
      classForValue={(v) => (!v || v.count === 0 ? "color-empty" : `color-scale-${Math.min(v.count, 4)}`)}
      titleForValue={(v) => (v ? `${v.count} on ${v.date}` : "No activity")}
    />
  )
}
```

You write the `color-scale-*` classes yourself, which fits well if you want CSS-only theming. Its README describes it as an SVG calendar heatmap that expands to the size of its container.

## What about @uiw/react-heat-map and Nivo?

**@uiw/react-heat-map** is another light SVG calendar heatmap. Its README calls it a customisable version of GitHub's contribution graph. You pass `value` as `{ date, count }` with slash-separated dates, and set colours with `panelColors`, either as a threshold map or an array. It was the most recently published package in this list when we checked.

**@nivo/calendar** is part of the Nivo chart family. Its data uses `day` and `value` fields, with `from` and `to` bounds, and it ships both SVG (`Calendar`, `ResponsiveCalendar`) and canvas (`CalendarCanvas`) versions. It also exports a `TimeRange` chart. It makes the most sense if your app already uses Nivo. Its last npm release was in May 2025.

## What about shadcn/ui projects?

shadcn/ui itself has no contribution graph. Its charts are built on Recharts, which has no calendar heatmap. Two registries fill the gap by copying source into your project, which means you own and can change every line.

**Kibo UI Contribution Graph** installs with `npx kibo-ui add contribution-graph`. Its docs show fetching data from the same GitHub contributions API and caching it in Next.js. Check the project page for its current licence and API.

**Panelo UI Contribution Chart** is free and MIT-licensed, built by Raycanvas. Add the registry and install it (both steps are in [Get this working in your app](#get-this-working-in-your-app) below), then pass your days:

```tsx
import { ContributionChart } from "@/components/panelo-ui/blocks/charts/contribution-chart"

export function Activity({ rows }: { rows: { day: string; count: number }[] }) {
  const days = rows.map((r) => ({ date: Date.parse(r.day), count: r.count }))
  return <ContributionChart days={days} />
}
```

What it does, from the source: it computes quartile levels itself, shows the total, busiest day, longest streak and current streak, and has a Calendar / 3D toggle that morphs the tiles into an isometric city of bars in the same SVG. Arrow keys move between days, and the focused day is announced in a live region.

Where it is weaker: it is newer and has had far less real-world use than react-activity-calendar. It has fewer layout options (no `blockSize`, `weekStart` or localisation props). Dates must be UTC millisecond timestamps for contiguous days, and there is no built-in table view. Try it on the [Contribution Chart page](/components/contribution-chart), or follow the full setup in [shadcn contribution graph](/blog/shadcn-github-contribution-graph).

## How do I convert between these data shapes?

Most of these components want a list of days, but each spells it differently. Start from one shape and map:

```ts
type Row = { day: string; count: number } // "2026-11-24"

const forActivityCalendar = (rows: Row[]) => rows.map((r) => ({ date: r.day, count: r.count })) // then add levels
const forCalendarHeatmap = (rows: Row[]) => rows.map((r) => ({ date: r.day, count: r.count }))
const forUiwHeatMap = (rows: Row[]) => rows.map((r) => ({ date: r.day.replaceAll("-", "/"), count: r.count }))
const forNivo = (rows: Row[]) => rows.map((r) => ({ day: r.day, value: r.count }))
const forPanelo = (rows: Row[]) => rows.map((r) => ({ date: Date.parse(r.day), count: r.count }))
```

If your data comes from GitHub, its GraphQL API returns `contributionCalendar.weeks[].contributionDays[]` with `date` and `contributionCount`. GitHub timestamps contributions in UTC, so group your own events by UTC day too if you want the two to match.

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the chart:

```bash
npx shadcn@latest add @panelo/contribution-chart
```

The source lands in `components/panelo-ui`, next to your `components/ui`. Feed it with the `forPanelo` mapper above. Without a `days` prop it renders a sample year, so you can check the install before wiring data.

See it live: [Contribution Chart](https://www.paneloui.com/components/contribution-chart).

When the graph needs a whole analytics page around it, the [Marketing Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-12) in Panelo Pro has a KPI strip, a three-series trend chart, a tabbed lead inbox with AI score, and channel panels. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### What is the best React library for a GitHub contribution graph?

For your own data, react-activity-calendar is the most complete package: themes, tooltips, SSR and React 19 support. To show a GitHub user's graph in one line, use react-github-calendar, which is built on it.

### Is react-calendar-heatmap still maintained?

Its latest npm release, 1.10.0, was published on 2025-02-23. It still lists a broad React peer range, so test it in your app before relying on it.

### How does GitHub decide the colour of each square?

GitHub's GraphQL schema describes five levels: none, then four quartiles of the days with contributions. The busiest 25% of active days get the darkest colour.

### Can I show a contribution graph without calling GitHub?

Yes. Every option except react-github-calendar takes your own array of days. Count your app's events per day and pass the result.

### Is there a shadcn/ui contribution graph?

Not in shadcn/ui itself. Kibo UI and Panelo UI both offer one that installs through a CLI as source code in your project.

### Which option has a 3D view?

Of the options compared here, only Panelo UI's Contribution Chart has a built-in 3D view. See our [3D isometric contribution graph guide](/blog/3d-isometric-contribution-graph-react) for how it works.

## Sources

- react-activity-calendar repository (MIT, levels up to you, SSR): https://github.com/grubersjoe/react-activity-calendar
- react-activity-calendar 3.2.1 type definitions (props, data shape, SVG rect blocks): https://unpkg.com/react-activity-calendar@3.2.1/build/index.d.ts
- react-activity-calendar on npm: https://www.npmjs.com/package/react-activity-calendar
- react-github-calendar (README, client-side fetch, built on react-activity-calendar): https://github.com/grubersjoe/react-github-calendar
- react-github-calendar on npm: https://www.npmjs.com/package/react-github-calendar
- github-contributions-api: https://github.com/grubersjoe/github-contributions-api
- react-calendar-heatmap (README, props, SVG): https://github.com/kevinsqi/react-calendar-heatmap
- react-calendar-heatmap on npm (1.10.0, 2025-02-23): https://www.npmjs.com/package/react-calendar-heatmap
- @uiw/react-heat-map (README, `panelColors`): https://github.com/uiwjs/react-heat-map
- @uiw/react-heat-map on npm (2.3.5): https://www.npmjs.com/package/@uiw/react-heat-map
- @nivo/calendar 0.99.0 types (day/value, from/to, CalendarCanvas): https://unpkg.com/@nivo/calendar@0.99.0/dist/types/types.d.ts
- Nivo calendar: https://nivo.rocks/calendar/
- Kibo UI Contribution Graph: https://www.kibo-ui.com/components/contribution-graph
- shadcn/ui chart docs (built on Recharts): https://ui.shadcn.com/docs/components/chart
- GitHub GraphQL schema (ContributionLevel quartiles, ContributionCalendarDay): https://docs.github.com/public/fpt/schema.docs.graphql
- GitHub docs, contributions on your profile (UTC): https://docs.github.com/en/account-and-profile/concepts/contributions-on-your-profile
