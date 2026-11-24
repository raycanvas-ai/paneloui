---
title: "shadcn vs HeroUI (v3): Licence, Install and Dashboards"
description: "shadcn/ui vs HeroUI v3 with checked facts: MIT vs Apache-2.0, copied source vs npm package, Base UI or Radix vs React Aria, and what each offers dashboards."
slug: shadcn-vs-heroui
primaryKeyword: shadcn vs heroui
secondaryKeywords:
  - heroui vs shadcn
  - shadcn vs nextui
  - heroui v3 review
  - heroui license
intent: comparison
cluster: Comparisons
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1849
cta:
  free: [login-pages-1, revenue-chart]
  pro: [dashboard-pages-3]
---

# shadcn vs HeroUI (v3): Licence, Install and Dashboards

shadcn/ui copies component source into your project (MIT) and builds on Base UI or Radix. HeroUI v3 is an npm package (Apache-2.0, not MIT) built on React Aria Components and Tailwind CSS v4, which you update by bumping a version. Pick shadcn/ui to own and edit every line; pick HeroUI for a maintained package with polished defaults.

> **Skip the build:** if you pick shadcn/ui, [Split Login Page](https://www.paneloui.com/components/login-pages-1) and [Revenue Lines](https://www.paneloui.com/components/revenue-chart) are free, MIT-licensed shadcn/ui blocks for a login screen and a dashboard chart: a split-screen login (email and password, Google, Apple and Microsoft buttons) and a revenue chart with a hover readout and arrow-key navigation, with no chart library underneath. Add them with `npx shadcn@latest add @panelo/login-pages-1 @panelo/revenue-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What is the difference between shadcn/ui and HeroUI?

The core difference is who owns the component code after you install it.

**shadcn/ui** describes itself as "not a component library" but a way to build your own. The CLI copies each component's source into your repo. From then on it is your code: you edit it directly, and upstream changes reach you only when you pull them in.

**HeroUI** (formerly NextUI) is a classic package. You install `@heroui/react` and `@heroui/styles`, import components, and upgrade by updating the package. Its docs put it bluntly: "Copy-paste code works until it breaks." HeroUI v3 needs React 19 or later and Tailwind CSS v4, and it no longer needs a Provider wrapper.

Neither model is better in general. Owned source is easier to bend to a design system and harder to keep in sync. A package is easier to keep up to date and harder to change deeply, though HeroUI v3 lets you restyle every slot with Tailwind utilities, CSS variables or BEM modifiers.

## How do shadcn/ui and HeroUI compare side by side?

Checked on 2026-11-24 against each project's docs, GitHub and npm.

| | shadcn/ui | HeroUI v3 |
|---|---|---|
| Licence | MIT | Apache-2.0 |
| How you get it | CLI copies source into your repo | npm: `@heroui/react` + `@heroui/styles` |
| Primitives | Base UI (default for new projects since July 2026) or Radix | React Aria Components |
| Styling | Tailwind CSS, your own `globals.css` tokens | Tailwind CSS v4, `@import "@heroui/styles"`, CSS variables, BEM modifiers |
| React version | Your choice of React supported by your primitives | React 19+ (peer dependency) |
| Component API | Flat parts (`CardHeader`, `CardTitle`) | Compound parts (`Card.Header`, `Card.Title`) |
| Events | DOM events (`onClick`) | React Aria press events (`onPress`) |
| Charts | Free, built on Recharts v3 | Pro only (Area, Bar, Line, Pie, Radar, Radial, Composed) |
| Date pickers | Calendar (React DayPicker); date pickers composed from it | Free Calendar, RangeCalendar, DatePicker, DateRangePicker, DateField, TimeField |
| Tables | Table, plus a data-table recipe on TanStack Table | Free Table; DataGrid is Pro |
| Paid tier | None from shadcn/ui itself; third-party registries sell blocks | HeroUI Pro: perpetual licences with an updates window |
| Third-party ecosystem | Hundreds of registries installable with the same CLI | Smaller; mostly HeroUI's own Pro |
| GitHub stars (2026-11-24) | 128.9k | 31.3k |
| Latest release | `shadcn` CLI, active | `@heroui/react` 3.2.8 (2026-11-22) |

### Is HeroUI MIT licensed?

No. HeroUI's repository is licensed under Apache-2.0, and so is the `@heroui/react` npm package. Several comparison pages call it MIT; that is wrong. Apache-2.0 is also permissive and fine for commercial use, but it carries conditions MIT does not, such as keeping NOTICE files and stating changes when you redistribute modified source. If your company has a licence allow-list, check that Apache-2.0 is on it.

## What does the code look like in each?

A card with a button, in shadcn/ui (after `npx shadcn@latest add card button`):

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function UpgradeCard() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Upgrade your plan</CardTitle>
        <CardDescription>Get more seats and longer history.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Billed once a year.</CardContent>
      <CardFooter>
        <Button onClick={() => console.log("upgrade")}>Upgrade</Button>
      </CardFooter>
    </Card>
  )
}
```

The same in HeroUI v3 (after `npm i @heroui/styles @heroui/react` and adding `@import "tailwindcss"; @import "@heroui/styles";` to your CSS, in that order):

```tsx
"use client"

import { Button, Card } from "@heroui/react"

export function UpgradeCard() {
  return (
    <Card className="max-w-sm">
      <Card.Header>
        <Card.Title>Upgrade your plan</Card.Title>
        <Card.Description>Get more seats and longer history.</Card.Description>
      </Card.Header>
      <Card.Content className="text-sm">Billed once a year.</Card.Content>
      <Card.Footer>
        <Button variant="primary" onPress={() => console.log("upgrade")}>
          Upgrade
        </Button>
      </Card.Footer>
    </Card>
  )
}
```

The second file is shorter to write and needs no generated files in your repo. The first is code you can open and change: if you want every card in your app to have a different padding, you edit `components/ui/card.tsx` once.

## Where is HeroUI better than shadcn/ui?

Be fair to it. HeroUI v3 is ahead in a few clear areas:

- **Date and time inputs.** HeroUI ships free React Aria date fields, date pickers, range pickers and time fields with full keyboard support and internationalised dates. In shadcn/ui you compose a date picker from Calendar and Popover yourself.
- **Accessibility depth out of the box.** React Aria Components handle press events across mouse, touch and keyboard, focus management and many locale details. shadcn/ui's Base UI and Radix primitives are also accessible, but HeroUI's form and date coverage is broader.
- **Updates.** A bug fix in HeroUI reaches you with `npm update`. A bug fix in a shadcn/ui component reaches you only if you notice it and re-pull or patch your copy.
- **One consistent look.** HeroUI's defaults are polished and consistent across every component, which helps teams without a designer.

## Where is shadcn/ui better than HeroUI?

- **Ownership.** The code is in your repo. There is no package API to work around, no version to pin, and no breaking upgrade to schedule.
- **Free charts and dashboard pieces.** shadcn/ui's Recharts-based charts are free. In HeroUI, charts, KPI cards, data grid, kanban, command menu, sidebar and stepper are all Pro.
- **The registry ecosystem.** Any shadcn-compatible registry installs with the same `npx shadcn@latest add @namespace/item` command, so you can mix blocks from many sources into one codebase.
- **Licence simplicity.** MIT across the board.
- **AI coding tools.** Because the source sits in your project, an AI coding assistant can read and edit the actual component instead of guessing at a package's internals.

## Which is better for a dashboard?

It depends on how much you want to pay and how much you want to build.

With **HeroUI**, the dashboard pieces most teams need (charts, KPI cards, data grid, sidebar, app layout) are in HeroUI Pro, which is sold as perpetual licences with an updates window you can renew. HeroUI's pricing page did not show dollar amounts in the page text when we checked, so get a quote before you plan around it.

With **shadcn/ui**, the free base gives you charts, a data-table recipe, a sidebar and a dashboard example block. You then add what is missing from registries. Panelo UI is one of those, for the dashboard side specifically: free charts (a heatmap, a contribution graph, a stacked balance chart and more), login and profile pages, and full dashboard pages in Pro. Everything installs into `components/panelo-ui`, next to `components/ui`, so it does not overwrite your shadcn/ui files. Panelo UI is built on Vercel's UI SDK (in beta), which lets an AI agent read the page as named controls and act through the same component API a click uses; see the [agent demo](https://www.paneloui.com/agent-demo). If the chart you need is revenue against last period, the free [Revenue Lines](https://www.paneloui.com/components/revenue-chart) block is a finished one; it is a fixed design with sample data you replace, not a general chart API like HeroUI Pro's.

Can you mix the two? Technically yes, since both use Tailwind CSS v4. In practice you would ship two primitive layers (React Aria and Base UI or Radix) and two token systems, and your app would look like two apps. Pick one base.

## How do you choose between shadcn/ui and HeroUI?

Choose **HeroUI** if:

- You want a package you upgrade, not code you maintain.
- Your app is form-heavy, with many dates and times.
- You like its default look and will mostly theme, not restructure.

Choose **shadcn/ui** if:

- You want to own and change component code.
- You need free charts and want to pull dashboard blocks from many registries.
- You have, or plan, your own design system on top.

## Get this working in your app

On the shadcn/ui side, add the Panelo namespace to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the login page and the chart:

```bash
npx shadcn@latest add @panelo/login-pages-1 @panelo/revenue-chart
```

The login form is UI only, so connect it to your auth provider. The chart keeps its sample series in the file for you to replace. See them live: [Split Login Page](https://www.paneloui.com/components/login-pages-1) and [Revenue Lines](https://www.paneloui.com/components/revenue-chart).

If you want stat cards and charts as a finished page, the Pro [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) is an overview dashboard with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Is HeroUI the same as NextUI?

Yes. HeroUI is the new name of NextUI. Version 3 is built on React Aria Components and Tailwind CSS v4.

### What licence does HeroUI use?

Apache-2.0, for both the GitHub repository and the `@heroui/react` package. It is permissive and allows commercial use, but it is not MIT.

### Does HeroUI work with Tailwind CSS v4?

Yes, HeroUI v3 requires it. You import `tailwindcss` first and then `@heroui/styles` in your main CSS file.

### Are HeroUI charts free?

No. HeroUI's chart components (area, bar, line, pie, radar, radial and composed) are marked Pro. shadcn/ui's Recharts-based charts are free.

### Can I use shadcn/ui registries with HeroUI?

Registries install shadcn/ui-style source that expects shadcn/ui's tokens and primitives, so they fit a shadcn/ui project, not a HeroUI one.

---

Comparing more options? Read [shadcn/ui vs Mantine for dashboards](/blog/shadcn-vs-mantine-dashboards) and [the best shadcn registries](/blog/best-shadcn-registries), or browse the free items in the [Panelo UI catalogue](https://www.paneloui.com/components).

## Sources

- shadcn/ui introduction ("not a component library", open code): https://ui.shadcn.com/docs
- shadcn/ui GitHub repository (MIT, stars checked 2026-11-24): https://github.com/shadcn-ui/ui
- shadcn/ui changelog, Base UI default (July 2026): https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- shadcn/ui Chart (Recharts v3): https://ui.shadcn.com/docs/components/chart
- shadcn/ui Calendar (React DayPicker): https://ui.shadcn.com/docs/components/calendar
- shadcn/ui Data Table (TanStack Table): https://ui.shadcn.com/docs/components/data-table
- HeroUI GitHub repository (Apache-2.0, React Aria, Tailwind CSS v4, formerly NextUI): https://github.com/heroui-inc/heroui
- `@heroui/react` on npm (3.2.8, Apache-2.0, React 19 peer): https://www.npmjs.com/package/@heroui/react
- HeroUI v3 introduction (customisation, "Just update the package"): https://www.heroui.com/docs/react/getting-started
- HeroUI v3 quick start (install, CSS import order, no Provider): https://www.heroui.com/docs/react/getting-started/quick-start
- HeroUI components list (free vs Pro): https://www.heroui.com/docs/react/components
- HeroUI Button and Card docs: https://www.heroui.com/docs/react/components/button and https://www.heroui.com/docs/react/components/card
- HeroUI Pro pricing and licence model: https://www.heroui.pro/pricing
- Apache License 2.0 text: https://www.apache.org/licenses/LICENSE-2.0
