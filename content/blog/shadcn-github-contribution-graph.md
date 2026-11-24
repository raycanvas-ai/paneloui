---
title: "shadcn Contribution Graph: Add a GitHub-Style Calendar"
description: "Add a GitHub-style contribution graph to a shadcn/ui app: install with the shadcn CLI, feed it GitHub or your own data, and get streaks and quartile colours."
slug: shadcn-github-contribution-graph
primaryKeyword: shadcn contribution graph
secondaryKeywords:
  - shadcn github contribution graph
  - shadcn github heatmap
  - shadcn calendar heatmap
  - github contribution graph nextjs
intent: informational
cluster: shadcn charts
date: 2026-11-24
status: draft
author: Raycanvas
cta:
  free: [contribution-chart]
  pro: [dashboard-pages-12]
wordCount: 1999
---

# shadcn Contribution Graph: Add a GitHub-Style Calendar

shadcn/ui has no contribution graph, but you can add one with the shadcn CLI. Add the `@panelo` registry to `components.json`, run `npx shadcn@latest add @panelo/contribution-chart`, and pass an array of `{ date, count }` days. The data can come from GitHub's GraphQL API or from your own database.

> **Skip the build:** [Contribution Chart](https://www.paneloui.com/components/contribution-chart) is a free, MIT-licensed shadcn/ui block that draws a year of `{ date, count }` days as a GitHub-style calendar with quartile colours, or as a 3D isometric view, and works out the total, busiest day, longest streak and current streak for you. Add it with `npx shadcn@latest add @panelo/contribution-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Does shadcn/ui have a GitHub contribution graph?

No. shadcn/ui's charts are built on Recharts, and its charts gallery covers area, bar, line, pie, radar and radial charts. A contribution graph is a calendar heatmap, and Recharts has no heatmap component.

So the component has to come from somewhere else: a community registry, an npm package, or your own code. This guide uses Panelo UI's free Contribution Chart, because it installs through the same shadcn CLI you already use and lands as source in your repo. If you would rather compare packages first, read [GitHub contribution graph in React: options compared](/blog/github-contribution-graph-react).

## How do I install the contribution graph with the shadcn CLI?

1. Open `components.json` and add the registry:

```json
{
  "registries": {
    "@panelo": "https://www.paneloui.com/r/{name}.json"
  }
}
```

2. Install the block:

```bash
npx shadcn@latest add @panelo/contribution-chart
```

3. Render it with sample data to check the install:

```tsx
// app/page.tsx
import { ContributionChart } from "@/components/panelo-ui/blocks/charts/contribution-chart"

export default function Page() {
  return <ContributionChart className="max-w-4xl" />
}
```

With no `days` prop, the component draws a generated sample year from its own `sampleYear()` function. The files go to `components/panelo-ui`, beside your `components/ui`. The CLI also installs the `panelo-theme` tokens and a toggle group the block uses. You can try the result on the [Contribution Chart page](/components/contribution-chart).

## What data shape does the contribution graph expect?

One entry per day, in order, with the date as a UTC timestamp in milliseconds:

```ts
type Day = { date: number; count: number }
```

The type is exported from the component file, so you can import it. Three rules keep the output correct:

- **Contiguous days.** Include days with zero contributions. Streaks are counted across consecutive entries, so a gap would join two separate runs.
- **Sorted oldest to newest.** The last entry is "today" for the current streak.
- **UTC midnight dates.** The component reads weekdays with `getUTCDay()`. `Date.parse("2026-11-20")` gives UTC midnight, which is what you want.

The first day can fall on any weekday. The chart offsets the first column so Sunday stays in the top row, like GitHub.

## How do I show my real GitHub contributions?

GitHub's GraphQL API exposes the same calendar GitHub draws. `user.contributionsCollection.contributionCalendar` returns `weeks`, each with `contributionDays` that have a `date` and a `contributionCount`. By default the collection covers the past year. You authenticate to the GraphQL API with a personal access token, a GitHub App or an OAuth app, so make the call on the server and keep the token there.

```ts
// lib/github-contributions.ts
import type { Day } from "@/components/panelo-ui/blocks/charts/contribution-chart"

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays { date contributionCount }
          }
        }
      }
    }
  }
`

type Week = { contributionDays: { date: string; contributionCount: number }[] }

export async function getGitHubDays(login: string): Promise<Day[]> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)

  const json = await res.json()
  const weeks: Week[] = json.data?.user?.contributionsCollection.contributionCalendar.weeks ?? []

  return weeks
    .flatMap((week) => week.contributionDays)
    .map((day) => ({ date: Date.parse(day.date), count: day.contributionCount }))
}
```

Then render it from a server component. The chart itself is a client component, and the plain array passes across the boundary without trouble.

```tsx
// app/profile/page.tsx
import { ContributionChart } from "@/components/panelo-ui/blocks/charts/contribution-chart"
import { getGitHubDays } from "@/lib/github-contributions"

export default async function ProfilePage() {
  const days = await getGitHubDays("octocat")
  if (days.length === 0) return <p>No contribution data.</p>

  return <ContributionChart days={days} />
}
```

The empty check matters: the component reads the first and last day, so pass at least one entry.

Note that GitHub timestamps contributions in UTC, not in the user's local time zone, according to its own docs. A commit late in the evening can land on the next day's square.

## How do I use my own app's data instead of GitHub?

Most products want "activity in this workspace", not GitHub commits. Count your events per UTC day and fill the empty days with zeros:

```ts
// lib/to-days.ts
import type { Day } from "@/components/panelo-ui/blocks/charts/contribution-chart"

const DAY = 86_400_000

export function toDays(timestamps: Date[], end = new Date()): Day[] {
  const last = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())
  const first = last - 364 * DAY
  const counts = new Map<number, number>()

  for (const t of timestamps) {
    const day = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())
    if (day >= first && day <= last) counts.set(day, (counts.get(day) ?? 0) + 1)
  }

  return Array.from({ length: 365 }, (_, i) => {
    const date = first + i * DAY
    return { date, count: counts.get(date) ?? 0 }
  })
}
```

Pass `toDays(rows.map((r) => r.createdAt))` as `days`. If you have millions of rows, do the grouping in SQL instead and only fill the gaps in JavaScript.

## How are the colours and streaks calculated?

**Colours.** The chart uses five levels. Zero is level 0. Non-zero days are split into quartiles: the lowest 25% of active days get level 1, and the busiest 25% get level 4. That matches how GitHub's own GraphQL schema describes its `ContributionLevel` values (`NONE`, `FIRST_QUARTILE` through `FOURTH_QUARTILE`). Quartiles keep one huge day from washing every other square out to the palest shade.

The five colours come from one sequential ramp mixed from the `accent` prop with `color-mix`. The default is a green that leans slightly yellow. Pass any CSS colour to change it:

```tsx
<ContributionChart days={days} accent="var(--primary)" />
```

**Stats.** Above the grid, the component shows four numbers it computes from your data: the one-year total, the busiest day, the longest streak and the current streak, each with its date range. A streak is a run of consecutive days with a count above zero. The current streak counts back from the last entry, so it is zero if the last day is empty.

## Is the contribution graph accessible?

From the source:

- The chart is one focusable region. Arrow keys move the active day: up and down step one day, left and right step one week. Home and End jump to the first and last day.
- The active day is announced through a polite live region, for example "12 contributions on Wed, Nov 18, 2026".
- Hover and keyboard focus show the same tooltip.
- The stats are a definition list (`<dl>`), so the totals are readable without the chart.
- The morph between views respects `prefers-reduced-motion` and jumps straight to the end state.

One gap to know about: unlike Panelo UI's Activity Heatmap, the Contribution Chart has no table view. If your users need to compare many exact values, add a table of the same `days` array below it. Our [accessible charts guide](/blog/accessible-charts-react) covers that pattern.

The footer has a "How contributions are counted" link that points at `#how-contributions-count`. Point it at your own help text, or delete it.

## What goes wrong most often, and how do you fix it?

Most bugs with a contribution graph are data bugs, not drawing bugs.

| Symptom | Likely cause | Fix |
|---|---|---|
| Every square sits one weekday off on some machines | Dates built at local midnight, e.g. `new Date(2026, 10, 20).getTime()`, which east of UTC falls on the previous UTC day | Build them with `Date.UTC(...)` or `Date.parse("YYYY-MM-DD")` |
| The longest streak looks too long | Days with no activity were left out, so two runs touch | Fill every day in the range, with `count: 0` for quiet days |
| The current streak is always zero | The last entry is today, and nothing has happened yet today | Expected behaviour; end the range at yesterday if you prefer |
| The total is bigger than the label suggests | More than a year of days was passed in | Trim the array to the last 365 days; the header says "in the last year" and the total sums every entry |
| The page crashes on a new account | An empty array was passed | Render a fallback when there are no days, as in the profile example above |
| The token shows up in the browser bundle | The variable was named `NEXT_PUBLIC_GITHUB_TOKEN` or the fetch runs in a client component | Keep the fetch on the server; Next.js only exposes `NEXT_PUBLIC_` variables to the browser |

Two more habits help. Cache the GitHub response for a while, because the calendar changes slowly and every uncached page view is one more API call. And test with a profile that has a gap of several weeks, since that is where streak and weekday bugs show up first.

## What is the 3D button?

The chart has a Calendar / 3D toggle. In 3D, the same tiles slide into an isometric plane and rise into bars whose height is the day's count. It is drawn in the same SVG, with no WebGL or Three.js. We explain the maths in [3D isometric contribution graph in React](/blog/3d-isometric-contribution-graph-react).

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the chart and pass it your days, from `getGitHubDays()` or `toDays()` above:

```bash
npx shadcn@latest add @panelo/contribution-chart
```

- **See it live:** [Contribution Chart](https://www.paneloui.com/components/contribution-chart), including the Calendar / 3D toggle.
- **The page around it, in Panelo Pro:** if the graph belongs on a growth or marketing page, [Marketing Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-12) is a full dashboard with a KPI strip, a three-series trend chart, a tabbed lead inbox with AI score, and channel panels. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Is there an official shadcn/ui contribution graph?

No. shadcn/ui's charts are built on Recharts and do not include a calendar heatmap. You add one from a registry, an npm package, or your own code.

### Is the Panelo UI Contribution Chart free?

Yes. It is one of Panelo UI's free, MIT-licensed charts. Install it with `npx shadcn@latest add @panelo/contribution-chart` after adding the `@panelo` registry.

### Do I need a GitHub token?

Only to show GitHub data. You authenticate to GitHub's GraphQL API with a token, so fetch on the server and keep it in an environment variable. Your own app's data needs no token.

### What format should the dates be in?

A UTC timestamp in milliseconds for each day, such as `Date.parse("2026-11-20")`. Include every day in the range, including zero days, sorted oldest first.

### Does it use Recharts?

No. The Contribution Chart is hand-written React and SVG. It does not import Recharts or any other chart library.

### Does it work in dark mode?

Yes. The colours are mixed from CSS variables, so they follow your theme's light and dark tokens.

## Sources

- shadcn/ui chart docs (built on Recharts): https://ui.shadcn.com/docs/components/chart
- shadcn/ui charts gallery: https://ui.shadcn.com/charts
- GitHub GraphQL schema (ContributionCalendar, ContributionCalendarDay, ContributionLevel quartiles, contributionsCollection defaults to a year ago): https://docs.github.com/public/fpt/schema.docs.graphql
- GitHub GraphQL objects reference: https://docs.github.com/en/graphql/reference/objects
- GitHub GraphQL enums reference (ContributionLevel): https://docs.github.com/en/graphql/reference/enums
- GitHub docs, forming calls with GraphQL (authentication options): https://docs.github.com/en/graphql/guides/forming-calls-with-graphql
- GitHub docs, contributions on your profile (UTC timestamps, past year): https://docs.github.com/en/account-and-profile/concepts/contributions-on-your-profile
- Recharts type exports, 3.11.1: https://unpkg.com/recharts@3.11.1/types/index.d.ts
- Next.js docs, environment variables (only `NEXT_PUBLIC_` variables reach the browser): https://nextjs.org/docs/app/guides/environment-variables
