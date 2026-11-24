---
title: "shadcn KPI Cards: 8 Design Rules and Working Code"
description: "How to design KPI and stat cards in shadcn/ui: value, change, comparison period, sparkline, loading and empty states, with Tailwind CSS v4 code you can paste."
slug: shadcn-kpi-cards
primaryKeyword: shadcn kpi cards
secondaryKeywords:
  - shadcn stat cards
  - shadcn statistics card
  - kpi card design
  - react kpi cards
  - dashboard stat card design
intent: commercial
cluster: shadcn blocks
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 2253
cta:
  free: [sales-trend]
  pro: [dashboard-pages-3, dashboard-pages-12, dashboard-pages-9]
---

# shadcn KPI Cards: 8 Design Rules and Working Code

A good shadcn/ui KPI card shows one number, its change against a named period, and whether that change is good or bad, using `Card`, `CardAction` and a `Badge`. Format values with `Intl.NumberFormat`, line digits up with `tabular-nums`, and design the loading, empty and zero states before the happy one.

> **Skip the build:** Panelo UI has no free KPI card, so build the cards with the code below. For the chart that goes with them, [Sales Trend](https://www.paneloui.com/components/sales-trend) is a free, MIT-licensed shadcn/ui block: a card with one headline total, a weekly, monthly or yearly toggle, and a pixel chart of new and existing users with a hover readout. Add it with `npx shadcn@latest add @panelo/sales-trend` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What should a KPI card show?

A KPI card answers one question at a glance: "Is this number where it should be?" Everything on the card should help answer that, and nothing else.

| Part | Example | Required? |
|---|---|---|
| Label | Monthly recurring revenue | Yes |
| Value | $48.2K | Yes |
| Change | +12.4% | Usually |
| Comparison period | vs last month ($42.9K) | Yes, if there is a change |
| Direction meaning | Up is good here; for churn, up is bad | Yes, if colour is used |
| Trend | A small sparkline of the last 12 periods | Optional |
| Link | Opens the report behind the number | Optional |

shadcn/ui's own `dashboard-01` block follows this shape. Its `SectionCards` component renders four cards, each with a description label, a large `tabular-nums` value, an outline `Badge` with a trend icon and percentage in `CardAction`, and a footer with a one-line trend message. It is a good starting point: `npx shadcn@latest add dashboard-01`.

## What are the rules for good KPI card design?

1. **One number per card.** If a card needs two big numbers, it is two cards or a small table.
2. **Always name the comparison.** "+12%" means nothing on its own. "+12% vs last month" does. Put the previous value in the footer so people can check the math.
3. **Know which direction is good.** Revenue up is good; churn, latency and cost up are bad. Store that per metric instead of colouring every increase green.
4. **Never rely on colour alone.** Pair colour with a sign and an arrow icon, and give screen readers a sentence: "up 12.4% from last month".
5. **Format with `Intl.NumberFormat`.** Compact notation for headlines ($48.2K, 1.2M), full precision in tooltips and footers. Never build "$" + number by hand.
6. **Use tabular figures.** `tabular-nums` gives every digit the same width, so values do not jitter when they update and cards line up across a row.
7. **Design the edge states.** Loading (a skeleton the same size as the real card), no data yet ("—" plus a reason), and a previous value of zero (no percentage; you cannot divide by zero).
8. **Let the card size itself.** Use a container query so the value grows when the card is wide, not when the window is.

## How do you build a KPI card in shadcn/ui?

Add the parts with `npx shadcn@latest add card badge skeleton`. The icons come from `lucide-react`, which shadcn/ui projects usually already have.

```tsx
import { TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KpiProps = {
  label: string
  value: number | null
  previous: number | null
  period: string // "last month"
  format: Intl.NumberFormat
  goodWhen?: "up" | "down"
}

const pct = new Intl.NumberFormat("en-US", { style: "percent", signDisplay: "exceptZero", maximumFractionDigits: 1 })

export function KpiCard({ label, value, previous, period, format, goodWhen = "up" }: KpiProps) {
  const change = value !== null && previous ? (value - previous) / Math.abs(previous) : null
  const rising = (change ?? 0) > 0
  const bad = change !== null && change !== 0 && rising !== (goodWhen === "up")
  const Icon = rising ? TrendingUp : TrendingDown

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value === null ? "—" : format.format(value)}
        </CardTitle>
        {change !== null && change !== 0 ? (
          <CardAction>
            <Badge variant="outline" className={cn("tabular-nums", bad && "text-destructive")}>
              <Icon aria-hidden />
              {pct.format(change)}
              <span className="sr-only">
                {" "}
                {rising ? "up" : "down"} from {period}
              </span>
            </Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardFooter className="text-sm text-muted-foreground">
        {value === null
          ? "No data yet for this period"
          : previous === null
            ? `No data for ${period}`
            : `vs ${period}: ${format.format(previous)}`}
      </CardFooter>
    </Card>
  )
}
```

Use it in a responsive row:

```tsx
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 })
const count = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
const rate = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 })

export function KpiRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Revenue" value={48200} previous={42900} period="last month" format={usd} />
      <KpiCard label="Active users" value={1234567} previous={1190000} period="last month" format={count} />
      <KpiCard label="Churn" value={0.031} previous={0.026} period="last month" format={rate} goodWhen="down" />
      <KpiCard label="Refunds" value={null} previous={null} period="last month" format={usd} />
    </div>
  )
}
```

Notes on the choices:

- **Only bad changes get colour.** shadcn/ui's default theme has a `destructive` token but no "success" token, so a good change stays in the normal text colour. That keeps the row calm and makes problems stand out. If your theme adds a success token, use it the same way.
- **The churn card is red when churn rises**, because `goodWhen="down"` flips the meaning.
- **A previous value of zero or null shows no percentage.** "+∞%" helps nobody.
- **The `@container/card` class** makes the value grow at a card width of 250px, using Tailwind CSS v4's built-in container queries, which is the same approach shadcn/ui's `SectionCards` uses.

## How do you add a sparkline to a KPI card?

A sparkline shows the shape of a trend without axes. You do not need a chart library for one; a single SVG polyline does it.

```tsx
export function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const y = (p: number) => (max === min ? 50 : 100 - ((p - min) / (max - min)) * 100)
  const line = points.map((p, i) => `${(i / (points.length - 1)) * 100},${y(p)}`).join(" ")

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="h-10 w-full overflow-visible text-primary">
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
```

Put it in the card footer. `vectorEffect="non-scaling-stroke"` keeps the line 2px thick even though the SVG stretches to the card width. It is `aria-hidden` because the value and change already say what the sparkline shows; if the trend matters on its own, add a sentence such as "Rising for 5 months".

When a sparkline is not enough and people need to switch periods and read exact values, a full chart under the KPI row does that job; Panelo UI's free [Sales Trend](https://www.paneloui.com/components/sales-trend) is one, with a period toggle and a readout on hover or focus.

## How do you show a loading state?

Render a skeleton with the same structure, so nothing jumps when data arrives:

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function KpiCardSkeleton() {
  return (
    <Card aria-busy="true">
      <CardHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-32" />
      </CardHeader>
      <CardFooter>
        <Skeleton className="h-4 w-40" />
      </CardFooter>
    </Card>
  )
}
```

## What are the common KPI card mistakes?

Most KPI card bugs are not layout bugs. The card renders fine and says something misleading.

- **Relative change on a rate.** In the row above, churn moved from 2.6% to 3.1%. The card shows +19.2%, the relative change. Many readers will take that to mean churn is now about 22%. For metrics that are already percentages, show the difference in percentage points instead ("+0.5 pts"), or label the relative figure clearly. Pick one rule and apply it to every rate on the page.
- **Comparing a partial period with a full one.** On the 10th of the month, month-to-date revenue will almost always be "down" against the whole of last month. Compare like with like: the first 10 days of last month, or the last 30 days against the 30 before.
- **Different periods in one row.** If one card compares with last week and the next with last month, people read them as the same. Use one period per row, or state it on every card, which the footer in the code above already does.
- **Too many cards.** A row of eight cards gets scanned, not read. shadcn/ui's `SectionCards` stops at four; move the rest into a table or a second section.
- **Rounding that hides the change.** Compact notation can show "$48.2K" for both this month and last month while the badge says "+0.1%". That is correct, but it looks like a bug. Put the full previous value in a tooltip or footer so people can check.
- **Announcing every update.** If values refresh live, do not wrap the card in an `aria-live` region. A screen reader would read every tick. Announce only meaningful events, such as a threshold being crossed.

A quick check before you ship: cover the colours and icons, read each card aloud, and ask whether someone new to the dashboard would know what changed, against what, and whether it is good.

## Where can you get ready-made shadcn/ui KPI cards?

| Source | What you get | Price |
|---|---|---|
| [shadcn/ui `dashboard-01`](https://ui.shadcn.com/blocks) | `SectionCards`: four KPI cards with trend badges, inside a full dashboard block | Free, MIT |
| [ReUI Stats blocks](https://reui.io/blocks/application/stats) | KPI grids, balance cards, lead summaries | Stats 1 needs a ReUI Pro or Ultimate licence; Pro is a one-time payment (list $249) |
| [HeroUI Pro](https://www.heroui.com/docs/react/components) | `KPI` and `KPIGroup` components (not shadcn/ui; HeroUI's own system) | Pro licence |
| Panelo UI Pro pages | Stat cards inside full dashboards | One-time Pro purchase |

Panelo UI does not have a free standalone KPI card. Its stat cards live inside Pro dashboard pages: the [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) (revenue, orders and new-customer stat cards with bar sparklines), the [Marketing Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-12) (a KPI strip above a three-series trend chart) and the [Task Board Dashboard](https://www.paneloui.com/components/dashboard-pages-9) (four stat cards above a kanban). The free [Balance Chart](https://www.paneloui.com/components/balance-chart) includes a row of balance figures over its chart, if that is all you need. For most teams, the code above plus shadcn/ui's `SectionCards` is enough, and you only need a paid page if you want the whole dashboard around the cards.

## Get this working in your app

Build the cards with the `KpiCard` code above. For the trend chart under them, add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install it:

```bash
npx shadcn@latest add @panelo/sales-trend
```

It lands in `components/panelo-ui`, next to your `components/ui`. The headline total and the three series are demo values: change the total in `sales-chart.tsx` and the series in `sales-data.ts`, and apply the same rules as your cards (name the period, use one period per row).

See it live: [Sales Trend](https://www.paneloui.com/components/sales-trend).

If you want the cards and the page around them, two Panelo Pro pages fit. The [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) has revenue, orders and new-customer stat cards, bar sparklines, and an interactive pixel-mosaic sales-trend chart. The [Marketing Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-12) has a KPI strip, a three-series trend chart, a tabbed lead inbox with AI score, and channel panels. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Does shadcn/ui have a KPI card component?

Not as a separate component. The `dashboard-01` block includes `SectionCards`, four KPI cards built from `Card`, `CardAction` and `Badge`, which you can copy and adapt.

### How do I show percentage change in a KPI card?

Compute `(current - previous) / Math.abs(previous)` and format it with `Intl.NumberFormat` using `style: "percent"` and `signDisplay: "exceptZero"`. Skip the percentage when the previous value is zero or missing.

### Should increases always be green?

No. Whether up is good depends on the metric: revenue up is good, churn or cost up is bad. Store the good direction per metric and never use colour as the only signal.

### What is tabular-nums for in KPI cards?

It makes every digit the same width, so numbers do not shift as they update and values line up across cards. In Tailwind CSS it maps to `font-variant-numeric: tabular-nums`.

### Should a rate like churn show percent change or percentage points?

Percentage points are usually clearer: 2.6% to 3.1% is "+0.5 pts". A relative "+19.2%" is also correct but is easy to misread as the new rate.

### Do I need a chart library for a sparkline?

No. A single SVG `polyline` scaled to the card is enough for a sparkline. Use a chart library when you need axes, tooltips or interaction.

---

Building the full page? Read [shadcn finance dashboard](/blog/shadcn-finance-dashboard) and [shadcn dashboard with Next.js 16](/blog/shadcn-dashboard-nextjs-16), or see Panelo UI's free charts in the [catalogue](https://www.paneloui.com/components).

## Sources

- shadcn/ui blocks (`dashboard-01` with `SectionCards`): https://ui.shadcn.com/blocks
- shadcn/ui `section-cards.tsx` source (Card, CardAction, Badge, `tabular-nums`, `@container/card`): https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/dashboard-01/components/section-cards.tsx
- MDN, `Intl.NumberFormat()` options: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
- Tailwind CSS `font-variant-numeric` (`tabular-nums`): https://tailwindcss.com/docs/font-variant-numeric
- Tailwind CSS container query variants: https://tailwindcss.com/docs/hover-focus-and-other-states
- ReUI Stats blocks: https://reui.io/blocks/application/stats
- ReUI pricing (one-time licences): https://reui.io/pricing
- HeroUI components (KPI and KPIGroup marked Pro): https://www.heroui.com/docs/react/components
