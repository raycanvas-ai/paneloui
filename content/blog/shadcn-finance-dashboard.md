---
title: "shadcn Finance Dashboard: Components and Code"
description: "What a shadcn/ui finance dashboard needs: balance chart, KPI row, transactions table and money formatting, with working Tailwind CSS v4 code and free options."
slug: shadcn-finance-dashboard
primaryKeyword: shadcn finance dashboard
secondaryKeywords:
  - shadcn fintech dashboard
  - react finance dashboard template
  - finance dashboard ui design
  - shadcn stacked bar chart
intent: commercial
cluster: shadcn blocks
date: 2026-11-24
status: draft
author: Raycanvas
cta:
  free: [balance-chart]
  pro: [dashboard-pages-8]
wordCount: 1923
---

# shadcn Finance Dashboard: Components and Code

A shadcn/ui finance dashboard is usually four parts: a row of balance figures, a stacked chart of money over time, a transactions table and a few action widgets such as transfers or budgets. shadcn/ui gives you the chart (Recharts), the table (TanStack Table) and the cards. Formatting money correctly is the part you write yourself.

> **Skip the build:** [Balance Chart](https://www.paneloui.com/components/balance-chart) is a free, MIT-licensed shadcn/ui block that is the stacked monthly balance chart from a finance dashboard, built with no chart library: a row of totals by category, a breakdown for the active month, arrow keys to move between months, `Intl.NumberFormat` money and a Chart / Table toggle. Add it with `npx shadcn@latest add @panelo/balance-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What goes on a finance dashboard?

Finance screens are read more carefully than most dashboards. People compare numbers, look for one wrong charge and make decisions about real money. That shapes the layout.

| Block | What it answers | shadcn/ui building blocks |
|---|---|---|
| Balance row | "How much do I have, split how?" | `Card`, plain `<dl>` markup |
| Balance over time | "Is it growing? Where did it go?" | `Chart` (Recharts) stacked bars or area |
| Transactions | "What exactly happened?" | `Table` or the TanStack-based data table |
| Budget split | "What share goes where?" | Pie or bar chart, or a progress list |
| Actions | "Send, pay, top up" | `Button`, `Dialog`, `Field` forms |

Start with the balance row and the transactions table. Those two carry most of the value. Charts help people see a trend, but the table is where they check it.

## How do you format money in a React dashboard?

Use `Intl.NumberFormat` and never build currency strings by hand. It handles the symbol, grouping, decimals and sign for each locale.

```ts
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const usdShort = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})
const change = new Intl.NumberFormat("en-US", {
  style: "percent",
  signDisplay: "exceptZero",
  maximumFractionDigits: 1,
})

usd.format(150800) // "$150,800.00"
usdShort.format(150800) // "$150.8K"
change.format(0.124) // "+12.4%"
change.format(0) // "0%"
```

A few rules that save support tickets:

- **Store integers.** Keep amounts in cents (or the currency's minor unit) and divide only when formatting. Floating-point sums drift.
- **Show the sign on changes, not on balances.** `signDisplay: "exceptZero"` gives "+12.4%" and "-3.1%" but plain "0%".
- **Use full values in tables, compact values in cards.** "$150.8K" reads well in a headline; a statement needs "$150,800.00".
- **Line up digits.** Add Tailwind's `tabular-nums` to any column or figure that changes, so digits keep the same width and columns align.

## How do you build a stacked balance chart with shadcn/ui?

shadcn/ui charts use Recharts v3 under a thin layer that handles colours and tooltips. Add it with `npx shadcn@latest add chart`, then stack bars by giving each series the same `stackId`.

```tsx
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const data = [
  { month: "Jan", savings: 42000, recurring: 18000, merchandise: 31000 },
  { month: "Feb", savings: 45500, recurring: 18200, merchandise: 28400 },
  { month: "Mar", savings: 47100, recurring: 19000, merchandise: 33900 },
]

const chartConfig = {
  savings: { label: "Savings", color: "var(--chart-1)" },
  recurring: { label: "Recurring", color: "var(--chart-2)" },
  merchandise: { label: "Merchandise", color: "var(--chart-3)" },
} satisfies ChartConfig

export function BalanceChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="savings" stackId="balance" fill="var(--color-savings)" />
        <Bar dataKey="recurring" stackId="balance" fill="var(--color-recurring)" />
        <Bar dataKey="merchandise" stackId="balance" fill="var(--color-merchandise)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
```

The `--chart-1` to `--chart-5` tokens live in your `globals.css` with separate values under `:root` and `.dark`, so the chart follows dark mode without extra code. Only the top series gets a rounded radius, otherwise each stacked segment would round its own corners.

## How do you make the transactions table readable?

Most finance dashboards fail here, not in the chart. A plain shadcn/ui `Table` is enough for a recent-transactions card. Move to the [data table recipe](https://ui.shadcn.com/docs/components/data-table), which is built on TanStack Table, once you need sorting, filtering or pagination.

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Txn = { id: string; date: string; party: string; category: string; cents: number }

const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", signDisplay: "always" })
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

export function Transactions({ rows }: { rows: Txn[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Paid to / from</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="text-muted-foreground">{day.format(new Date(t.date))}</TableCell>
            <TableCell className="font-medium">{t.party}</TableCell>
            <TableCell>{t.category}</TableCell>
            <TableCell className="text-end tabular-nums">{amount.format(t.cents / 100)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

Right-align amounts, keep the sign visible on every row and resist colouring every number red or green. Colour can support the sign, but it should never be the only signal: some readers cannot tell the two apart.

## Which money edge cases break finance dashboards?

The code above assumes US dollars and one time zone. Real accounts break both assumptions. Check these before you ship:

1. **Not every currency has two decimals.** MDN notes that currency formatting defaults to the number of minor-unit digits in the ISO 4217 list. Yen has none and Bahraini dinar has three, so `cents / 100` is wrong for both. Read the digit count from the formatter instead of hard-coding 100.
2. **Never add amounts in different currencies.** A total across a USD and a EUR account needs an exchange rate and a date for that rate. Show one total per currency, or show the converted total with the rate and its date next to it.
3. **Sum first, format last.** Add the integer minor units, then format the result once. Formatting each row and then adding the rounded values makes the total differ from the rows by a cent.
4. **Pick the time zone for dates on purpose.** A card payment at 02:00 UTC on 1 March is still 28 February in Los Angeles. Format transaction dates in the account's time zone with the `timeZone` option, not in whatever zone the server runs in.
5. **Separate pending from posted.** A pending charge can change or disappear. Label it, and say whether the balance figure includes it.
6. **Follow the reader's convention for negatives.** Some readers expect a minus sign, accountants expect parentheses. `currencySign: "accounting"` gives "($42.50)" in en-US.

```ts
const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "JPY" })
const digits = fmt.resolvedOptions().maximumFractionDigits // 0 for JPY, 2 for USD, 3 for BHD
const display = (minor: number) => fmt.format(minor / 10 ** digits)

display(1234) // "¥1,234"
```

## What about accessibility in finance charts?

A chart is a picture of a table. Give people the table too. A small "Chart / Table" toggle above the chart costs little and helps screen-reader users, keyboard users and anyone who wants to copy a figure.

For the chart itself:

- Keep keyboard focus on the chart and let arrow keys move between months, with a readout of every value for the focused month.
- Do not rely on colour alone to tell series apart; the legend and the tooltip should name each one.
- Check contrast for every series colour in both light and dark themes.

Recharts' `accessibilityLayer` prop lets the left and right arrow keys move the tooltip from point to point. For more, see our guide to [accessible charts in React](/blog/accessible-charts-react).

## Is there a free shadcn/ui finance chart you can install?

Panelo UI's free [Balance Chart](https://www.paneloui.com/components/balance-chart) is the stacked monthly balance from a finance dashboard, extracted as one component. It is hand-built React and CSS with no chart library. One month at a time takes its category colours and shows a breakdown; you hover to preview, and click or use the arrow keys (plus Home and End) to pin a month. A toggle switches to a table view of the same numbers. It is MIT-licensed and installs into `components/panelo-ui`:

```bash
npx shadcn@latest add @panelo/balance-chart
```

Its design is fixed: three categories, monthly bars, sample data you replace. If you want any chart type and full control of the API, use the Recharts version above. For a comparison of the two approaches, see [shadcn charts vs Recharts](/blog/shadcn-charts-vs-recharts).

## Should you build or buy a finance dashboard?

Build it if your data model is unusual or you only need two or three widgets. The code in this post covers the hard parts: money formatting, a themed stacked chart and an aligned table.

Buy or install a page if you want a finished layout to edit, and spend your time on the data instead. Whichever source you pick, check three things before you commit: that it uses `Intl` (or equivalent) for money, that numbers line up with tabular figures, and that every chart has a table or text alternative.

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the chart:

```bash
npx shadcn@latest add @panelo/balance-chart
```

Its sample months live in `components/panelo-ui/blocks/charts/finance-data.ts`. Replace the `months` array with your own totals, and edit `categories` if yours are not merchandise, recurrings and savings.

- **See it live:** [Balance Chart](https://www.paneloui.com/components/balance-chart).
- **The full page, in Panelo Pro:** the page it comes from is the [Custom Finance Dashboard](https://www.paneloui.com/components/dashboard-pages-8): the balance chart plus a payment card with Quick Send, client news, suggestions, plans, weekly limits, budget split and recent transactions. Built on Vercel's UI SDK (in beta), its controls can also be read and operated by an AI agent through the same component API a click uses. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Does shadcn/ui have a finance dashboard?

Not a finance-specific one. shadcn/ui ships a general dashboard block plus the pieces you need (Chart, Table, Card), and you compose the finance layout yourself or install one from a third-party registry.

### Which chart library do shadcn/ui charts use?

Recharts. The shadcn/ui Chart component wraps Recharts v3 and adds theming through CSS variables such as `--chart-1`, plus ready-made tooltip and legend components.

### How should I format currency in React?

Use `Intl.NumberFormat` with `style: "currency"` and a currency code. Store amounts as integers in minor units and format only for display.

### How do I stack bars in a shadcn/ui chart?

Give every `<Bar>` the same `stackId`. Round only the top series, and set each bar's `fill` to the matching `var(--color-key)` from your chart config.

### Is Panelo UI's Balance Chart built on Recharts?

No. It is hand-built React and CSS with no chart library, with keyboard navigation and a table view. It is free under the MIT licence.

---

Need headline numbers above the chart? Read [shadcn KPI cards](/blog/shadcn-kpi-cards), then browse the free charts in the [Panelo UI catalogue](https://www.paneloui.com/components).

## Sources

- shadcn/ui Chart (Recharts v3, `--chart-*` tokens, ChartConfig): https://ui.shadcn.com/docs/components/chart
- shadcn/ui Data Table (built on TanStack Table): https://ui.shadcn.com/docs/components/data-table
- MDN, `Intl.NumberFormat()` constructor options (`notation`, `signDisplay`, `style`, `currencySign`, ISO 4217 fraction digits): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
- MDN, `Intl.DateTimeFormat()` constructor (`timeZone` option): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
- Tailwind CSS `tabular-nums`: https://tailwindcss.com/docs/font-variant-numeric
- Recharts accessibility discussion (arrow-key navigation via the accessibility layer): https://github.com/recharts/recharts/discussions/4484
- shadcn/ui blocks (dashboard-01: sidebar, charts and data table): https://ui.shadcn.com/blocks
