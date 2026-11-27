---
title: "Tailwind Plus and Catalyst Alternatives After the Closure"
description: "Tailwind Plus closed to new customers in September 2026. Here are Catalyst alternatives for React app and dashboard UI, compared fairly, with sources."
slug: tailwind-plus-catalyst-alternative
primaryKeyword: tailwind plus alternative
secondaryKeywords:
  - catalyst ui alternative
  - tailwind ui alternative
  - catalyst vs shadcn
  - tailwind plus closed
  - tailwind plus free alternative
intent: comparison
cluster: Comparisons
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1860
cta:
  free: [login-pages-1, revenue-chart]
  pro: [dashboard-pages-5, sidebars-1]
---

# Tailwind Plus and Catalyst alternatives after the closure

Tailwind Plus, which includes the Catalyst UI kit, closed to new customers on 9 September 2026 when Tailwind Labs joined Shopify. Existing customers keep access. For Catalyst-style app UI in React, the closest alternative is shadcn/ui (free, MIT, source you own); paid options include Untitled UI React, shadcnblocks and shadcn/studio.

> **Skip the build:** [Split Login Page](https://www.paneloui.com/components/login-pages-1) is a free, MIT-licensed shadcn/ui block that stands in for Catalyst's auth layout: a split-screen sign-in with email and password, a show-password toggle, remember me, Google, Apple and Microsoft buttons, and an orbit of app logos beside it. For the dashboard side, [Revenue Lines](https://www.paneloui.com/components/revenue-chart) is a free revenue chart (this period against last, with arrow-key navigation). Add them with `npx shadcn@latest add @panelo/login-pages-1 @panelo/revenue-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

This guide is for people who wanted Catalyst, or Tailwind Plus application UI, and can no longer buy it. It covers what changed, what Catalyst was, the alternatives with their real prices, and how to map Catalyst's components onto shadcn/ui.

## What happened to Tailwind Plus?

On 9 September 2026 Tailwind Labs announced it was joining Shopify. The post said: "we're closing sign ups for new customers to focus on Tailwind CSS at Shopify." It also said "all existing customers will of course maintain their access to products like Tailwind Plus and ui.sh."

Two things did not change:

- **Tailwind CSS is still MIT.** The post: "Nothing changes with Tailwind CSS or any of our other open-source projects. Everything will always be MIT-licensed."
- **If you bought Tailwind Plus, your account still works.** You can log in and download what you own.

What is not answered publicly is how long existing products will get content updates. Plan as if what you have today is what you will have.

Before the closure, a Tailwind Plus personal licence cost $299 one-time and a team licence $979, according to a third-party roundup written after the change. The official pricing pages now show a login form, so we could not confirm those figures on Tailwind's own site.

## What was Catalyst?

Catalyst is the Tailwind team's React application UI kit, introduced in December 2023. In Adam Wathan's words, it is a "disappearing UI kit": "six months after you've installed it, you should almost forget it wasn't you who built the original components."

From the current Catalyst docs:

- **Distribution:** a zip from your Tailwind Plus account. You copy the JavaScript or TypeScript files into your project. It is not an npm package.
- **Stack:** React, Tailwind CSS v4, Headless UI (`@headlessui/react`), `motion` and `clsx`.
- **Frameworks:** any React project; the docs show Next.js, Remix and Inertia.js.
- **Contents:** three layouts (sidebar, stacked, auth) and components such as Alert, Avatar, Badge, Button, Checkbox, Combobox, Description list, Dialog, Dropdown, Fieldset, Listbox, Navbar, Pagination, Select, Sidebar, Switch and Table.

So the thing to replace is a copy-in, own-the-source React kit with a strong default look. That narrows the field a lot.

## Which alternatives are closest to Catalyst?

| Option | Model | Price | Built on | Closest to Catalyst in |
|---|---|---|---|---|
| shadcn/ui | Copy source in with a CLI | Free, MIT | Base UI (default) or Radix, Tailwind CSS v4 | Philosophy: you own the code |
| Headless UI | npm package | Free, MIT | Its own primitives | Same primitives Catalyst uses; you write the styles |
| Untitled UI React | CLI install; Figma library | Free core; PRO Solo $349, Studio $999 (8 users), one-time | React Aria, Tailwind CSS v4 | A polished, opinionated app design |
| shadcnblocks | shadcn registry | 115+ free blocks; $149 to $399 list, one-time | shadcn/ui | Breadth, plus a Next.js 16 Admin Kit |
| shadcn/studio | shadcn registry | Free tier; one-time paid tiers from $219 list (on sale now) | shadcn/ui | Blocks, templates, theme generator |
| daisyUI | Tailwind plugin (CSS) | Free, MIT | CSS classes, any framework | Not React-specific; good for non-React stacks |
| Panelo UI | shadcn registry | 15 free MIT items; Pro from $99 at launch, one-time | shadcn/ui, Vercel's UI SDK (beta) | Dashboards and charts only |

### shadcn/ui: the default answer

shadcn/ui shares Catalyst's core idea: the components are copied into your repo and become yours. It is free and MIT, it uses Tailwind CSS v4, and the CLI installs components one at a time. Since July 2026 new projects use Base UI for primitives; Radix is still supported with `-b radix`. It has a larger set than Catalyst, including charts, a sidebar, a data table pattern and form fields. The trade-off is the look: shadcn/ui's default style is plainer than Catalyst's, so expect to spend time on theme tokens.

### Headless UI: keep the same foundation

Catalyst's interactivity comes from Headless UI, which is still a free MIT project from Tailwind Labs. If you liked how Catalyst behaves and want to write your own styles, you can build directly on it. You get the dialogs, menus and listboxes; you do not get Catalyst's design.

### Untitled UI React: the most polished paid design

Untitled UI React is a full design system on React Aria and Tailwind CSS v4, with a free core that its pricing page calls "free to use in commercial projects for one user." Paid tiers add thousands of components and page examples with Figma sync, priced by team size. If what you liked about Tailwind Plus was a finished, consistent design, this is the closest match.

### shadcnblocks and shadcn/studio: breadth on top of shadcn/ui

Both sell large block libraries on top of shadcn/ui, with one-time pricing and free tiers. shadcnblocks is the largest and includes an Admin Kit its homepage describes as "a 219-page Next.js 16 admin dashboard." shadcn/studio adds a theme generator and a 15-seat Team plan. Compare them in [shadcnblocks alternatives](/blog/shadcnblocks-alternative).

### daisyUI: if you are not on React

daisyUI is a Tailwind plugin that adds component classes. It is MIT and works with any framework, which makes it the better fit for Vue, Svelte, server-rendered templates or plain HTML. It does not give you React components with behaviour built in.

### Panelo UI: if your app is a dashboard

We build Panelo UI, so treat this as one option among several. It is narrow: dashboard pages, charts, calendars and login pages, 32 items in total and 15 free. Its charts are hand-built (SVG or CSS, no chart library) and cover types Recharts lacks, such as an activity heatmap and a contribution graph. Its components are built on Vercel's UI SDK, in beta, so an AI agent can read the dashboard as named controls and operate it through the same component API a click uses. It does not replace Catalyst's general components; pair it with shadcn/ui. See the [components page](/components).

## How do Catalyst components map to shadcn/ui?

If you are moving a Catalyst app, most components have a direct counterpart in the official shadcn/ui registry:

| Catalyst | shadcn/ui |
|---|---|
| Alert, Avatar, Badge, Button, Checkbox | `alert`, `avatar`, `badge`, `button`, `checkbox` |
| Combobox | `combobox` |
| Dialog | `dialog` (or `alert-dialog` for confirmations) |
| Divider | `separator` |
| Dropdown | `dropdown-menu` |
| Fieldset | `field` |
| Input, Textarea, Switch | `input`, `textarea`, `switch` |
| Listbox, Select | `select`, `native-select` |
| Navbar | `navigation-menu` |
| Pagination, Table | `pagination`, `table` |
| Radio button | `radio-group` |
| Sidebar, Sidebar layout | `sidebar` |
| Description list, Heading, Text | No direct component; plain elements with Tailwind classes |

Install several at once:

```bash
npx shadcn@latest add button dialog dropdown-menu field select sidebar table
```

The props will differ, so migrate page by page rather than all at once. Catalyst's auth layout has no shadcn/ui counterpart in the table; the free [Split Login Page](https://www.paneloui.com/components/login-pages-1) is a finished sign-in screen you can wire to your own auth instead of rebuilding that page. Catalyst's look comes mostly from its classes; you can copy those choices into your shadcn/ui theme variables so the app keeps its feel while the components change underneath. If you are building a new dashboard from scratch, [our Next.js 16 dashboard tutorial](/blog/shadcn-dashboard-nextjs-16) walks through the setup.

## Should existing Tailwind Plus customers switch?

Not yet, if what you have works. Your code is already in your repo and your account still has the downloads. The reasons to plan a move are practical: new team members cannot buy their own licence, and future updates are not promised. Start new projects on something you can keep buying or that is free, and leave working Catalyst code alone until you have a reason to touch it.

## Get this working in your app

Add the Panelo namespace to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the login page and the chart:

```bash
npx shadcn@latest add @panelo/login-pages-1 @panelo/revenue-chart
```

Both land in `components/panelo-ui`, so they sit beside your shadcn/ui components without replacing them. The login form is UI only: connect its submit and social buttons to your auth provider. See them live: [Split Login Page](https://www.paneloui.com/components/login-pages-1) and [Revenue Lines](https://www.paneloui.com/components/revenue-chart).

For Catalyst's sidebar layout, two Pro items extend this setup:

- [Project Overview Dashboard](https://www.paneloui.com/components/dashboard-pages-5): a project dashboard with a collapsible sidebar, breadcrumb bar, project hero, section tabs and a two-column overview.
- [App Sidebar](https://www.paneloui.com/components/sidebars-1): an icon rail and panel in five layouts (rail with panel, panel alone, rail with icons, rail alone, icons alone), with a command menu, collapsible sections and projects.

Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Can I still buy Tailwind Plus or Catalyst?

No. Tailwind Labs closed sign-ups for new customers on 9 September 2026 when it joined Shopify. Existing customers keep access.

### Is Tailwind CSS still free?

Yes. Tailwind Labs said nothing changes with Tailwind CSS or its other open-source projects, and they stay MIT-licensed.

### What is the best free alternative to Catalyst?

shadcn/ui. It is free and MIT, uses Tailwind CSS v4, and like Catalyst it puts the component source in your repo.

### Is Catalyst built on shadcn/ui?

No. Catalyst is built on Headless UI and Tailwind CSS. shadcn/ui is built on Base UI or Radix. Both copy source into your project.

### What should I use for a dashboard instead of Catalyst?

Start with shadcn/ui for layout and forms. Add shadcnblocks' Admin Kit if you want many finished pages, or Panelo UI for dashboard pages and charts an AI agent can operate.

## Sources

- Tailwind CSS blog, Tailwind Labs is joining Shopify (2026-09-09): https://tailwindcss.com/blog/tailwind-is-joining-shopify
- AlternativeTo news, Tailwind Labs joins Shopify and keeps Tailwind CSS MIT-licensed: https://alternativeto.net/news/2026/9/tailwind-labs-joins-shopify-and-keeps-tailwind-css-mit-licensed/
- DevToolPicks, Tailwind Plus alternatives (pre-closure prices, secondary): https://devtoolpicks.com/blog/best-tailwind-plus-alternatives-indie-hackers-2026
- Tailwind CSS blog, Introducing Catalyst (2023-12-20): https://tailwindcss.com/blog/introducing-catalyst
- Catalyst docs: https://catalyst.tailwindui.com/docs
- Headless UI repo (MIT): https://github.com/tailwindlabs/headlessui
- shadcn/ui repo (MIT): https://github.com/shadcn-ui/ui
- shadcn/ui changelog, Base UI as the default: https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- Untitled UI pricing: https://www.untitledui.com/pricing
- shadcnblocks pricing: https://www.shadcnblocks.com/pricing
- shadcnblocks homepage: https://www.shadcnblocks.com/
- shadcn/studio pricing: https://shadcnstudio.com/pricing
- daisyUI repo (MIT): https://github.com/saadeghi/daisyui
