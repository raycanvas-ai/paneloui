---
title: "Build a shadcn Dashboard in Next.js 16, Step by Step"
description: "Build a shadcn/ui dashboard in Next.js 16 with Tailwind CSS v4: create-next-app, shadcn init, KPI cards, a Recharts bar chart and free SVG charts. Tested."
slug: shadcn-dashboard-nextjs-16
primaryKeyword: shadcn dashboard next.js 16
secondaryKeywords:
  - next js 16 shadcn
  - shadcn ui next js 16
  - shadcn tailwind v4
  - shadcn chart
  - shadcn nextjs dashboard tutorial
intent: informational
cluster: shadcn
date: 2026-11-24
status: draft
author: Raycanvas
cta:
  free: [revenue-chart, pie-chart, balance-chart]
  pro: [dashboard-pages-3]
wordCount: 2158
---

# Build a shadcn dashboard in Next.js 16, step by step

To build a shadcn/ui dashboard in Next.js 16, create the app with `npx create-next-app@latest my-dashboard --yes`, run `npx shadcn@latest init -d`, add `card` and `chart`, and compose a page from KPI cards and charts. Tailwind CSS v4 comes configured. Every command below was run on 24 November 2026 and the result built cleanly.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart), [Rounded Pie](https://www.paneloui.com/components/pie-chart) and [Balance Chart](https://www.paneloui.com/components/balance-chart) are free, MIT-licensed shadcn/ui blocks that fill a dashboard's chart slots with no chart library: a revenue line against last period with a keyboard-driven crosshair, a part-to-whole pie that takes a `data` prop, and stacked monthly balance bars with a table view. Add them with `npx shadcn@latest add @panelo/revenue-chart @panelo/pie-chart @panelo/balance-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

We will end up with one page: three KPI cards, a Recharts bar chart from shadcn/ui, and two free charts from a third-party registry. Each step says what it changes, so you can stop at any point with a working app.

## What do you need before you start?

- Node.js and npm. The commands use `npx`; swap in `pnpm dlx` or `bunx` if you prefer.
- About ten minutes.
- No accounts or API keys.

When we ran these steps, `create-next-app` installed Next.js 16.4.6, React 19.3.0 and Tailwind CSS 4.3.3, and the shadcn CLI was 4.23.0. Newer patch versions should behave the same.

## Step 1: How do you create a Next.js 16 app with Tailwind CSS v4?

```bash
npx create-next-app@latest my-dashboard --yes
cd my-dashboard
```

`--yes` skips the prompts and uses the defaults. Per the Next.js docs, those are TypeScript, Tailwind CSS, ESLint, the App Router and Turbopack, with the `@/*` import alias, plus an `AGENTS.md` file to guide coding agents. Tailwind CSS v4 is configured through `app/globals.css`; there is no `tailwind.config.js`.

## Step 2: How do you add shadcn/ui to the project?

```bash
npx shadcn@latest init -d
```

`-d` means "use defaults" (the `nova` preset), so there are no prompts. The CLI detects Next.js and Tailwind CSS v4, writes `components.json`, adds `lib/utils.ts` and a `button` component, and adds the theme variables to `app/globals.css`.

One thing to know: new shadcn/ui projects have used **Base UI** for primitives since July 2026, so our `components.json` came out with `"style": "base-nova"` and `@base-ui/react` in `package.json`. If you want Radix instead, say so at init:

```bash
npx shadcn@latest init -b radix
```

Pick one now. Switching later means reinstalling components.

## Step 3: How do you add cards and charts?

```bash
npx shadcn@latest add card chart -y
```

This writes `components/ui/card.tsx` and `components/ui/chart.tsx`, and installs Recharts. shadcn/ui charts are built on Recharts, and the docs say the chart component now uses Recharts v3. You do not import a chart library from shadcn; you compose Recharts components inside the `ChartContainer` wrapper, which handles theming and tooltips.

## Step 4: How do you build a chart with shadcn/ui?

Create `components/dashboard/visitors-chart.tsx`:

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
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

export function VisitorsChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

Three details from the shadcn chart docs that save time:

- **Give `ChartContainer` a height.** The docs say a `min-h-[VALUE]` is "required for the chart to be responsive." Without it the chart renders at zero height.
- **Use `var(--chart-1)`, not `hsl(var(--chart-1))`.** The theme tokens are full colour values (OKLCH), and the docs call this out for Recharts v3. The config then exposes each series as `var(--color-desktop)` and so on.
- **Turn on `accessibilityLayer`.** It adds keyboard access and screen reader support to the Recharts chart.

The file starts with `"use client"` because Recharts runs in the browser. The page that uses it can stay a Server Component.

## Step 5: How do you add more chart types from a registry?

shadcn/ui's chart set covers area, bar, line, pie, radar and radial charts. For other shapes, or to skip building a chart from scratch, you can install from a third-party registry. As an example, Panelo UI's free charts are MIT-licensed, hand-built React (SVG or CSS) with no chart library, and install into `components/panelo-ui` so they never collide with your `components/ui` files.

Register the namespace once, then add two charts:

```bash
npx shadcn@latest registry add @panelo=https://www.paneloui.com/r/{name}.json
npx shadcn@latest add @panelo/revenue-chart @panelo/pie-chart -y
```

The CLI wrote `components/panelo-ui/blocks/charts/revenue-chart.tsx`, `pie-chart.tsx` and a small `lib/utils.ts`, and merged a few extra colour tokens into `app/globals.css`. To see what else is available:

```bash
npx shadcn@latest search @panelo
```

Other options include the heatmap, contribution graph and [balance chart](https://www.paneloui.com/components/balance-chart) on the [components page](/components). If you are choosing between approaches, [shadcn charts vs Recharts](/blog/shadcn-charts-vs-recharts) covers the trade-offs.

## Step 6: How do you lay out the dashboard page?

Replace `app/page.tsx`:

```tsx
import { VisitorsChart } from "@/components/dashboard/visitors-chart"
import { PieChart } from "@/components/panelo-ui/blocks/charts/pie-chart"
import { RevenueChart } from "@/components/panelo-ui/blocks/charts/revenue-chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const stats = [
  { label: "Revenue", value: "$48,210", change: "+12.4%" },
  { label: "Orders", value: "1,284", change: "+3.1%" },
  { label: "New customers", value: "312", change: "-1.8%" },
]

export default function DashboardPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Overview</h1>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {stat.change} vs last month
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitors</CardTitle>
            <CardDescription>Desktop and mobile, last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <VisitorsChart />
          </CardContent>
        </Card>
        <PieChart title="Traffic sources" />
      </section>

      <RevenueChart />
    </main>
  )
}
```

The sample numbers are placeholders. In a real app, fetch them in this Server Component and pass them down as props.

## Step 7: How do you run and build it?

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
```

Our build compiled, passed TypeScript and prerendered `/` as static content with no changes beyond the files above.

## How do you load real data into the dashboard?

Make the page an `async` Server Component and fetch there. The Next.js docs say a Server Component can use any async I/O, such as `fetch` or a database client, and that credentials and query logic stay out of the client bundle. Pass plain values down to the chart as props.

```tsx
// app/page.tsx
import { Suspense } from "react"

import { VisitorsChart } from "@/components/dashboard/visitors-chart"
import { getVisitors } from "@/lib/data"

async function Visitors() {
  const data = await getVisitors() // [{ month: "Jan", desktop: 186, mobile: 80 }, ...]
  return <VisitorsChart data={data} />
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-[240px]" />}>
      <Visitors />
    </Suspense>
  )
}
```

Change `VisitorsChart` to accept a `data` prop instead of the hard-coded array. Two rules from the Next.js docs matter here. Props passed to a Client Component must be serializable, so send numbers, strings and plain objects, not class instances or functions. And `fetch` is not cached by default, so a slow request blocks the page unless you wrap the slow part in `<Suspense>`, as above, or add a `loading.tsx` file next to the page. Give the fallback the same height as the chart so the layout does not jump.

The two registry charts differ here: the [Rounded Pie](https://www.paneloui.com/components/pie-chart) already takes a `data` prop of `{ label, value }` items, while Revenue Lines reads a `revenueSeries` array at the top of its file, so turn that array into a prop before you pass it fetched data.

## What are the common mistakes, and how do you fix them?

| Symptom | Cause | Fix |
|---|---|---|
| A build error saying a hook only works in a Client Component | A file with hooks or Recharts is missing `"use client"` | Add the directive to the chart file only, not to `page.tsx` |
| Hydration mismatch warning on a date or number | The server and browser formatted it differently, for example with `toLocaleDateString()` and no fixed locale or time zone | Format on the server and pass the string down, or pass an explicit locale and `timeZone` |
| The whole page ships as client JavaScript | `"use client"` was put on the page or a layout | Per the Next.js docs, every import of a `"use client"` file joins the client bundle; push the directive down to the leaf components |
| Secrets show up as empty strings | A data helper using `process.env` was imported into a Client Component | Only `NEXT_PUBLIC_` variables reach the browser; import `server-only` in data files so this fails at build time |

React's docs list "rendering different data on the server and the client" as a common cause of hydration errors. Dates are the usual culprit on dashboards, because the server often runs in UTC while the reader does not.

## Why are my chart colours grey?

The default `neutral` base colour sets `--chart-1` to `--chart-5` to shades of grey. That is deliberate, not a bug. Open `app/globals.css` and change those five variables under `:root` and `.dark`. Keep the values in OKLCH so they match the rest of the theme, and check both modes: a colour that reads well on white can disappear on a dark card.

## What should you add next?

- **Navigation.** `npx shadcn@latest add sidebar` gives you a collapsible app sidebar to wrap the page in.
- **A data table.** Add `table` and build on it, or use a registry block for sorting and filtering.
- **Real data.** Fetch in the Server Component and keep only the interactive charts client-side.
- **Dark mode.** The tokens already have `.dark` values; add a theme toggle that sets the class on `<html>`.
- **An agent that can operate the page.** Most Panelo UI components are built on Vercel's UI SDK, which is in beta, so an AI agent can read them as named controls (the revenue and pie charts above are plain React and SVG). The [agent demo](/agent-demo) shows what that looks like.

## Get this working in your app

If you skipped Step 5, add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the three charts:

```bash
npx shadcn@latest add @panelo/revenue-chart @panelo/pie-chart @panelo/balance-chart
```

`BalanceChart` comes from `components/panelo-ui/blocks/charts/balance-chart.tsx` and drops into the grid next to the others; pass `compact` for a smaller card without the view switch. Its sample months live in `finance-data.ts` beside it.

- **See it live:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart), [Rounded Pie](https://www.paneloui.com/components/pie-chart) and [Balance Chart](https://www.paneloui.com/components/balance-chart).
- **A designed Overview page, in Panelo Pro:** [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) is a designed take on the page this tutorial builds, with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Does shadcn/ui work with Next.js 16?

Yes. We created a Next.js 16.4.6 app with `create-next-app`, ran `shadcn init`, added cards and charts, and the production build passed without changes.

### Do I need a tailwind.config.js for Tailwind CSS v4?

No. `create-next-app` sets up Tailwind CSS v4 through `app/globals.css`, and the shadcn CLI writes its theme variables there. `components.json` leaves the config path empty.

### Should I choose Base UI or Radix when I run shadcn init?

New projects default to Base UI. Choose Radix with `-b radix` if you depend on registries or code written for Radix. Decide at the start, because components are generated for one or the other.

### Why does my shadcn chart not show up?

Usually the `ChartContainer` has no height. Add `min-h-[200px]` or similar, as the shadcn docs require for responsive charts.

### Can I use charts that are not built on Recharts?

Yes. Any React chart works inside a shadcn/ui project. Registry charts install as source, so you can read and change them like your own code.

## Sources

- Next.js docs, create-next-app CLI: https://nextjs.org/docs/app/api-reference/cli/create-next-app
- Next.js docs, Fetching Data (async Server Components, `fetch` not cached by default, `loading.js`, `<Suspense>`): https://nextjs.org/docs/app/getting-started/fetching-data
- Next.js docs, Server and Client Components (serializable props, `"use client"` boundary, `NEXT_PUBLIC_`, `server-only`): https://nextjs.org/docs/app/getting-started/server-and-client-components
- React docs, `hydrateRoot` (common causes of hydration errors): https://react.dev/reference/react-dom/client/hydrateRoot
- shadcn/ui, Next.js installation: https://ui.shadcn.com/docs/installation/next
- shadcn/ui, CLI reference: https://ui.shadcn.com/docs/cli
- shadcn/ui, Chart: https://ui.shadcn.com/docs/components/chart
- shadcn/ui changelog, Base UI as the default (July 2026): https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- shadcn/ui, Namespaces: https://ui.shadcn.com/docs/registry/namespace
- npm, next: https://www.npmjs.com/package/next
- npm, shadcn: https://www.npmjs.com/package/shadcn
