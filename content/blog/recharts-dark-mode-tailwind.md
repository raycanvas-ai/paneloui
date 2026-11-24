---
title: "Recharts Dark Mode with Tailwind CSS v4 (CSS Variables)"
description: "Make Recharts follow dark mode in Tailwind CSS v4: tokens in :root and .dark, var() in chart props, a dark tooltip, and fixes for the #ccc and #666 defaults."
slug: recharts-dark-mode-tailwind
primaryKeyword: recharts dark mode
secondaryKeywords:
  - recharts dark theme
  - recharts tailwind
  - recharts tailwind colors
  - dark mode chart colors
  - recharts css variables
intent: informational
cluster: Charts
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1895
cta:
  free: [panelo-theme, revenue-chart]
  pro: [dashboard-pages-3]
---

# Recharts dark mode with Tailwind CSS v4 and CSS variables

Recharts has no dark mode switch. It hardcodes light defaults: `#ccc` grid lines, `#666` axis text and a white tooltip. To theme it, define color tokens as CSS variables under `:root` and `.dark`, then pass `var(--token)` to Recharts props like `stroke`, `fill`, `tick` and `contentStyle`. The chart then flips with your Tailwind CSS v4 theme, with no re-render.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) is a free, MIT-licensed shadcn/ui block that already follows light and dark mode: every colour is a token class such as `text-chart-1`, `bg-popover` or `text-muted-foreground`, with no `dark:` classes and no hex values. It is hand-written SVG, not Recharts. Add it with `npx shadcn@latest add @panelo/revenue-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Why doesn't Recharts follow dark mode?

Recharts draws SVG and sets colors as attributes. With no props, a chart renders with these defaults (checked by rendering Recharts 3.11.1):

| Part | Default |
|---|---|
| `CartesianGrid` lines | `stroke="#ccc"` |
| Axis line and tick text | `stroke="#666"`, `fill="#666"` |
| Tooltip box | `backgroundColor: '#fff'`, `border: '1px solid #ccc'` |
| Series | whatever you pass |

Your Tailwind `dark:` classes never reach those attributes. So in dark mode you get a white tooltip and gray text on a near-black card.

The fix is to stop passing literal colors and pass CSS variables instead. An SVG attribute like `stroke="var(--chart-1)"` resolves against the CSS variables in scope, so when `.dark` changes the variable, the chart repaints with no JavaScript. shadcn/ui charts use the same idea: their docs recommend CSS variables, with `--chart-1` defined under both `:root` and `.dark`.

## Step 1: How do you set up dark mode tokens in Tailwind CSS v4?

By default, Tailwind CSS v4's `dark:` variant follows the operating system through `prefers-color-scheme`. Most apps want a toggle, so override the variant to use a `.dark` class, as the Tailwind docs show. Then define your tokens.

```css
/* app/globals.css */
@import "tailwindcss";

/* Toggle dark mode with a .dark class on <html> instead of the OS setting */
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: oklch(0.985 0 0);
  --foreground: oklch(0.21 0.006 286);
  --card: oklch(1 0 0);
  --muted-foreground: oklch(0.55 0.016 286);
  --border: oklch(0.92 0.004 286);
  --chart-1: oklch(0.52 0.19 268);
  --chart-2: oklch(0.6 0.13 165);
}

.dark {
  --background: oklch(0.15 0.004 286);
  --foreground: oklch(0.96 0 0);
  --card: oklch(0.2 0.006 286);
  --muted-foreground: oklch(0.7 0.015 286);
  --border: oklch(1 0 0 / 12%);
  --chart-1: oklch(0.7 0.16 268);
  --chart-2: oklch(0.76 0.13 165);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
}
```

Why `@theme inline`? The Tailwind docs say to use the `inline` option when a theme variable references another variable. It makes `bg-card` compile to `background-color: var(--card)`, so the value resolves where the class is used, including inside `.dark`.

If you already use shadcn/ui, you have most of these tokens. Note the shadcn/ui docs for Recharts v3: use `var(--chart-1)` directly, not `hsl(var(--chart-1))`.

Charts often need up and down colours that stock shadcn/ui lacks; Panelo UI's free [`panelo-theme`](https://www.paneloui.com/r/panelo-theme.json) adds `--success`, `--warning` and `--info` with light and dark values in this same `:root`, `.dark` and `@theme inline` layout.

## Step 2: How do you pass CSS variables to Recharts?

Every color prop takes a string, so pass `var(...)`. This component is complete and type-checks against Recharts 3.11.1 and React 19:

```tsx
// components/revenue-chart.tsx
"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", revenue: 18200, costs: 11800 },
  { month: "Feb", revenue: 21400, costs: 12600 },
  { month: "Mar", revenue: 19800, costs: 13100 },
  { month: "Apr", revenue: 24600, costs: 13900 },
  { month: "May", revenue: 27300, costs: 14800 },
  { month: "Jun", revenue: 26100, costs: 15200 },
];

const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };

export function RevenueChart() {
  // Unique gradient id, so two charts on one page never share a fill.
  const fillId = useId();

  return (
    <div className="h-72 w-full rounded-xl border border-border bg-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
          <YAxis
            width={48}
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            tickFormatter={(v: number) => `$${v / 1000}k`}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill={`url(#${fillId})`}
          />
          <Area
            type="monotone"
            dataKey="costs"
            stroke="var(--chart-2)"
            strokeWidth={2}
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

What each part does:

- **`CartesianGrid stroke`** replaces the `#ccc` default.
- **`tick={{ fill }}`** on each axis replaces the `#666` tick text. Hiding `tickLine` and `axisLine` avoids two more `#666` strokes.
- **`Tooltip contentStyle`** replaces the white box. The tooltip is an HTML `div`, so it takes a style object, not SVG attributes. `labelStyle` styles the title row. `cursor` styles the hover line.
- **`stopColor="var(--chart-1)"`** keeps the gradient on theme. `useId()` avoids duplicate gradient ids when the chart renders twice.

## Step 3: How do you add the toggle?

Any toggle that adds or removes `dark` on `<html>` works:

```tsx
// components/theme-toggle.tsx
"use client";

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => {
        const dark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", dark ? "dark" : "light");
      }}
      className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground"
    >
      Toggle theme
    </button>
  );
}
```

To avoid a flash of the wrong theme on load, set the class before paint. The Tailwind dark mode docs suggest an inline script in `<head>` along these lines:

```js
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
);
```

Its comment says to inline it in `head` to avoid a flash of unstyled content.

## Can you style Recharts with Tailwind classes instead?

Yes. Recharts puts stable class names on its SVG, such as `recharts-cartesian-grid`, `recharts-cartesian-axis-tick` and `recharts-tooltip-cursor`. CSS beats SVG presentation attributes, so Tailwind arbitrary variants on a wrapper override the defaults:

```tsx
<div className="h-72 w-full [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-tooltip-cursor]:stroke-border">
  {/* <ResponsiveContainer> ... */}
</div>
```

This compiles in Tailwind CSS v4 to rules like `.recharts-cartesian-grid line { stroke: var(--border) }`. shadcn/ui's `chart.tsx` uses the same kind of selectors (for example `[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground`), and it keeps the chart JSX free of color props. The cost: you depend on Recharts' internal class names, which can change between majors.

## Why is my Recharts chart still light after toggling dark mode?

Work through these in order:

1. **The class never lands.** Without the `@custom-variant dark` line, Tailwind CSS v4 follows the OS setting, so a `.dark` class on `<html>` changes nothing for `dark:` utilities. Check the element in dev tools.
2. **A literal color is still in the JSX.** Search for `#` and `rgb(` in your chart files. One hardcoded `fill="#8884d8"` will stay the same in both themes.
3. **A default is still showing.** Any part you did not pass a color to keeps Recharts' `#ccc` or `#666`. Axis lines and tick lines are easy to miss; pass `stroke` or hide them.
4. **The variable is wrapped twice.** With oklch tokens, `hsl(var(--chart-1))` is invalid and the browser drops it. The shadcn/ui docs call this out for Recharts v3: use `var(--chart-1)`.
5. **The tooltip is still white.** The tooltip is HTML, not SVG. It needs `contentStyle`, or a custom `content` component that uses your Tailwind classes.
6. **The token is defined only in `:root`.** Every token a chart reads needs a value under `.dark` too, or it keeps its light value.

## How do you choose dark mode chart colors?

- **Lift lightness in dark mode.** A mid-blue that reads well on white looks dim on a dark card. In the tokens above, `--chart-1` goes from oklch lightness 0.52 to 0.70. By our calculation, the light value on the dark card is only about 3.1:1, while the lifted value is about 6.6:1.
- **Keep series at 3:1 or more against the card.** WCAG 1.4.11 asks for 3:1 contrast for graphical objects needed to understand the content, such as each line in a graph. All four series tokens above clear it in their own theme (3.7:1 to 8.9:1 by our calculation).
- **Keep axis text at 4.5:1.** It is text, so normal text contrast applies. The `--muted-foreground` values above come to about 4.9:1 and 6.8:1.
- **Use translucent borders in dark mode.** `oklch(1 0 0 / 12%)` sits gently on any dark surface. A solid gray often looks heavier than intended.
- **Avoid pure black.** A dark gray card (`oklch(0.2 …)`) keeps shadows and gridlines visible.

More on naming and structuring these tokens in [semantic color tokens in Tailwind](/blog/tailwind-semantic-color-tokens). If `dark:` classes are not applying at all, see [Tailwind v4 dark mode not working](/blog/tailwind-v4-dark-mode-not-working).

## What if you don't use Recharts?

The same token approach works for any SVG chart. Panelo UI's free charts use no chart library, and its SVG ones theme this way: the revenue chart's line uses `stroke="currentColor"` with a `text-chart-1` class, so the light and dark values of `--chart-1` apply automatically. You can see it switch themes on the [revenue chart](/components/revenue-chart) page.

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the chart, or only the theme tokens:

```bash
npx shadcn@latest add @panelo/revenue-chart
npx shadcn@latest add @panelo/panelo-theme
```

The chart lands in `components/panelo-ui`, next to your `components/ui`, and pulls in `panelo-theme` for the green it uses on a rising change. It draws a 28-day demo series; replace `revenueSeries` in the copied file with your own. `panelo-theme` is not a component: it writes status colours (success, warning, info), six tonal pill colours, a hairline and two AI gradient stops into your CSS, light values under `:root`, dark ones under `.dark`, and `--color-*` pointers in `@theme inline`.

See it live: [Revenue Lines](https://www.paneloui.com/components/revenue-chart). Switch the site theme to watch it flip.

For a whole page built the same way, the [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) in Panelo Pro has revenue, orders and new-customer stat cards, bar sparklines, and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Does Recharts have a dark theme?

No built-in one. Recharts uses light defaults (`#ccc` grid, `#666` axis text, white tooltip). You theme it by passing colors, ideally CSS variables, to its props.

### Can I use CSS variables in Recharts props?

Yes. Props such as `stroke`, `fill`, `stopColor` and `tick.fill` become SVG attributes, and `var(--name)` in them resolves against the current theme. shadcn/ui charts rely on the same thing.

### How do I make the Recharts tooltip dark?

Pass `contentStyle` with `background`, `border` and `color` set to CSS variables, and `labelStyle` for the title. Or use shadcn/ui's `ChartTooltipContent`, which is already themed.

### Why do I need `@theme inline` in Tailwind CSS v4?

When a theme variable points to another variable, such as `--color-card: var(--card)`, `inline` makes the utility use the referenced value where it is applied. Without it, values can resolve against the wrong scope.

### Do I need to re-render the chart when the theme changes?

No. With CSS variables the browser repaints the SVG when `.dark` changes. You only need a re-render if you read colors in JavaScript.

## Sources

- https://github.com/recharts/recharts/blob/main/src/cartesian/CartesianGrid.tsx
- https://github.com/recharts/recharts/blob/main/src/component/DefaultTooltipContent.tsx
- https://recharts.github.io/en-US/api/Tooltip/
- https://www.npmjs.com/package/recharts
- https://ui.shadcn.com/docs/components/chart
- https://tailwindcss.com/docs/dark-mode
- https://tailwindcss.com/docs/theme
- https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/chart.tsx
