---
title: "tailwind-merge Custom Classes: Stop Losing text-* Styles"
description: "Why tailwind-merge drops custom text-* font sizes and @utility classes in Tailwind v4, and how to fix it with extendTailwindMerge, theme keys or classGroups."
slug: tailwind-merge-custom-classes
primaryKeyword: tailwind merge custom classes
secondaryKeywords:
  - twmerge custom classes
  - extend tailwind merge
  - tailwind merge custom font size
  - twmerge text color conflict
  - cn function tailwind
intent: informational
cluster: Tailwind v4
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 2252
cta:
  free: [panelo-theme, revenue-chart]
  pro: [dashboard-pages-3]
---

# tailwind-merge custom classes: why your text-* styles disappear

tailwind-merge does not read your Tailwind CSS v4 theme. It only knows the default scales, so a custom font size like `text-body-medium` looks like a text color and gets removed when a real color follows it. Fix it by registering your custom values with `extendTailwindMerge`, under `theme.text` or `classGroups`, in the one file that exports your `cn` helper.

> **Skip the build:** [`panelo-theme`](https://www.paneloui.com/r/panelo-theme.json) is a free, MIT-licensed shadcn/ui theme item, not a component. It adds custom tokens that stay clear of this bug: status colours, tonal pill colours and a hairline, all in the `--color-*` namespace, so a stock `cn("bg-tone-green-bg bg-card")` returns `bg-card` with no tailwind-merge config. Add it with `npx shadcn@latest add @panelo/panelo-theme` ([registry setup](#get-this-working-in-your-app)), then change anything: the values land in your CSS.

## What is the bug, exactly?

You define a composite text style in CSS, use it next to a color, and the style is gone from the rendered `class` attribute. No warning, no error.

```css
@theme {
  --text-body-medium: 0.875rem;
  --text-body-medium--line-height: 1.25rem;
  --text-body-medium--font-weight: 500;
}
```

```ts
import { twMerge } from "tailwind-merge";

twMerge("text-body-medium text-text-primary");
// → "text-text-primary"   (the font size is gone)
```

We ran that exact call against tailwind-merge 3.7.0. Here is what the default `twMerge` does with a few common pairs:

| Input | Default `twMerge` output | What went wrong |
|---|---|---|
| `text-body-medium text-text-primary` | `text-text-primary` | Font size dropped, read as a color |
| `text-text-primary text-body-medium` | `text-body-medium` | Color dropped |
| `text-sm text-body-medium` | `text-sm text-body-medium` | Two font sizes kept; CSS order decides |
| `hover:text-body-medium hover:text-text-primary` | `hover:text-text-primary` | Same bug with a variant |
| `bg-button-primary bg-background-primary-default` | `bg-background-primary-default` | A custom `@utility` read as a color |

The third row is the quiet one. Nothing is deleted, but the override you meant to apply may not win.

## Why does tailwind-merge get it wrong?

It runs in the browser and cannot see your CSS. The tailwind-merge docs say the default `twMerge` "only knows the default Tailwind theme", and that its config "is expected to be shipped and run in the browser as opposed to the Tailwind config which is meant to run at build-time."

So it guesses from the class name. After `text-`, the default config has a text-color validator that accepts any value. `text-sm` and `text-2xl` match the built-in font-size list first, so they work. `text-body-medium` matches nothing in the font-size list, falls through to the color validator, and becomes a color. Two colors conflict, and the earlier one loses.

The same logic catches anything you define under a namespace that shares a prefix with colors: `text-*`, `bg-*`, `border-*`, `shadow-*`. In our test, `shadow-card shadow-red-500` came back as `shadow-red-500`, because `card` was read as a shadow color.

Tailwind CSS v4 itself has no problem with any of these. It generates both rules and the class names in your markup decide. The bug is only in the merge step.

## How do I fix it with extendTailwindMerge?

Replace the plain `twMerge` inside your `cn` helper with a configured one. In older shadcn/ui projects, that helper lives in `lib/utils.ts` (newer projects use the `cn` package; see the next section).

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // Values only, without the "text-" prefix
      text: ["body-medium", "title-1-medium", "caption-1-semibold"],
      shadow: ["card"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

With that config, the same inputs behave:

```ts
cn("text-body-medium text-text-primary");  // → "text-body-medium text-text-primary"
cn("text-sm text-body-medium");            // → "text-body-medium"
cn("shadow-card shadow-lg");               // → "shadow-lg"
```

The tailwind-merge theme keys follow Tailwind's namespaces one to one: `--text-*` maps to `text`, `--color-*` to `color`, `--shadow-*` to `shadow`, `--radius-*` to `radius`, and so on. If you added variables to one of those namespaces, list the new names under the matching key.

Custom colors usually need nothing. The color validator already accepts any value, so `text-text-secondary text-text-primary` merges correctly out of the box.

## What if my shadcn/ui components import cn from the cn package?

Check this first, because it changes where the fix goes. Since September 2026, shadcn/ui components "import `cn` from the `cn` package" instead of `@/lib/utils`, per the shadcn changelog. `cn` is a separate package by shadcn and Aiden Bai that replaces `clsx` plus `tailwind-merge` and says it produces the same output as tailwind-merge for every input. New projects get a one-line `lib/utils.ts`: `export { cn } from "cn"`.

That has two consequences for custom classes:

1. The default `cn` has the same blind spot. Its README says classes that look like Tailwind utilities are treated as Tailwind utilities, with "same behavior and guidance as tailwind-merge's docs."
2. A configured helper in `lib/utils.ts` no longer reaches components that import from `"cn"` directly. Passing `className="text-body-medium"` to a Button whose base classes include a text color can still drop that color.

Registry blocks can bring a third helper. Panelo UI's free charts and pages, such as [Revenue Lines](https://www.paneloui.com/components/revenue-chart), each ship their own plain `cn` in `components/panelo-ui/lib/utils.ts`, so if you pass custom `text-*` styles into a block's `className`, put your config in that file too.

The `cn` package takes the same config shape from `cn/config`:

```ts
// lib/utils.ts
import { createCn } from "cn/config";

export const cn = createCn({
  extend: { theme: { text: ["body-medium", "title-1-medium"] } },
});
```

Then point the installed components at `@/lib/utils` again. You own their source, so it is a one-line import change per file. Alternatively, `cn build` (a Next.js and Vite build step in the same package) reads the scales declared in `@theme` and bakes them into generated tables, so `text-display` conflicts with `text-sm` "exactly as if the names had been registered by hand." Its docs say `--color-*` and `--font-*` are skipped because `cn` already accepts any name there, and that you usually don't need the build step at all.

## When should I use classGroups instead of theme?

Use `theme` when your class lives in a Tailwind namespace that tailwind-merge already models. Use `classGroups` when it does not, which is the case for most `@utility` definitions.

Say you wrote a gradient button utility with `@utility bg-button-primary { background-image: ...; }`. It sets `background-image`, not `background-color`, so it should not conflict with `bg-background-primary-default`. tailwind-merge can't know that. Give it its own group with a static key:

```ts
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "bg-button": [{ "bg-button": ["primary", "danger"] }],
    },
  },
});

twMerge("bg-button-primary bg-background-primary-default");
// → "bg-button-primary bg-background-primary-default"
twMerge("bg-button-primary bg-button-danger");
// → "bg-button-danger"
```

Two rules from the tailwind-merge configuration docs matter here:

1. **Strings win over validators.** Listing `"primary"` and `"danger"` as strings means no catch-all color validator can steal them.
2. **Keep the prefix static.** The docs warn against a validator that tests the whole class, like `/^text-label-/`. That validator sits at the top level, the color validator under `text` matches first, and your class is still read as a color. Put the fixed part in the object key and validate only what varies.

The docs also note that a new class group "can't claim classes under a key where the default config already accepts any value", which is every color prefix. Either use a longer, specific key as above, or extend the existing group (`font-size` for text styles). `font-size` is defined before `text-color` in the default config, so values added there are checked first.

## How does Panelo UI handle this in production?

Panelo UI's codebase defines a full type ramp in `styles/typography.css`: 13 families (from `large-title` to `caption-2`) times four weights, each a single `text-*` utility that sets size, line height, letter spacing and weight together. Its project rules forbid stacking `text-sm font-medium leading-5`, so these composite classes show up next to color tokens on almost every element.

That made the bug unavoidable, so `utils/cx.ts` generates the list instead of hand-maintaining it:

```ts
const TEXT_STYLE_SUFFIXES = TEXT_FAMILIES.flatMap((family) =>
  TEXT_WEIGHTS.map((weight) => `${family}-${weight}`),
);

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...TEXT_STYLE_SUFFIXES, ...SITE_TEXT_STYLES] }],
    },
  },
});
```

The comment above it explains the failure in one line: tailwind-merge "treats them as text-color utilities and silently drops them when they appear in the same className as a real color", and it asks anyone who renames a text style in `typography.css` to mirror the change in `cx.ts`. That sync step is the real cost of this approach. A test that runs `cx("text-body-medium text-text-primary")` and checks both classes survive is cheap insurance.

The project's AGENTS.md also tells every contributor, human or coding agent, to merge classes with `cx()` from `@/utils/cx` and never with plain `clsx` or string concatenation, so the config reaches every component. Panelo uses `classGroups` with the full `font-size` group; `theme.text` gives the same result for this case. Pick one and keep the list next to the CSS it mirrors.

## Can tailwind-merge read my CSS automatically?

Not in a stable release yet. The tailwind-merge repository now contains `@tailwind-merge/next`, a Next.js plugin that generates the merge config from the theme Tailwind resolves at build time, plus a Vite version and a standalone configurator. Its README example is this exact bug: with `--text-huge` in `@theme`, `twMerge('text-huge text-sm')` returns `text-sm`, where plain tailwind-merge "would keep both, misreading text-huge as a color."

The README also says it is "pre-release, pre-1.0" and asks you to treat it as not production-ready until 1.0.0. Until then, a hand-written `extendTailwindMerge` config is the safe choice.

## What else changed in recent tailwind-merge releases?

- tailwind-merge 3.x supports Tailwind CSS v4.0 to v4.3; Tailwind v3 projects should use v2.6.0.
- In 3.7.1 (2026-11-19), `twMerge('leading-6 text-lg')` keeps both classes, because in Tailwind CSS v4 a font size without a modifier no longer overrides an earlier `leading-*`. `text-lg/7` still removes it.

## Should I avoid custom text-* names instead?

It is a valid option. The tailwind-merge limitations page suggests prefixes that don't match Tailwind patterns, such as `typography-*`, for classes you plan to merge. But `--text-*` is the documented way to get one class that sets size, line height, tracking and weight, so if you already use it, keep it and register the names.

For the bigger picture of how text styles, colors and radii fit together as tokens, see [Design tokens in Tailwind CSS v4](/blog/design-tokens-tailwind-v4) and [Tailwind v4 type scales](/blog/tailwind-v4-type-scale).

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the theme tokens, or a block that brings them with it:

```bash
npx shadcn@latest add @panelo/panelo-theme
npx shadcn@latest add @panelo/revenue-chart
```

`panelo-theme` only adds colours, so it needs no merge config. Revenue Lines lands in `components/panelo-ui`, next to your `components/ui`, with its own `components/panelo-ui/lib/utils.ts`. That helper is `twMerge(clsx(inputs))` with no `extendTailwindMerge` config. It doesn't need one as shipped, because Panelo's free blocks use stock sizes like `text-xs` plus colour tokens. It is also separate from your `lib/utils.ts`: your config doesn't reach it, and it doesn't touch yours. The composite type ramp described above lives in Panelo's own site code, not in the installable blocks.

See it live: [Revenue Lines](https://www.paneloui.com/components/revenue-chart).

For a full page, the [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) in Panelo Pro has revenue, orders and new-customer stat cards, bar sparklines, and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Why does twMerge remove my custom font size class?
tailwind-merge only knows Tailwind's default theme. A custom `text-*` value that isn't in its font-size list is matched by the catch-all text-color validator, so it conflicts with your real color class and the earlier one is removed.

### Do I need to configure tailwind-merge for custom colors?
Usually not. Color classes like `bg-*` and `text-*` already accept any value, so `text-brand text-text-primary` merges correctly. You only need config when a custom class is not a color but shares a color prefix.

### What's the difference between theme and classGroups in extendTailwindMerge?
`theme` adds values to a Tailwind namespace tailwind-merge already models, like `text` or `shadow`, without the prefix. `classGroups` defines or extends a group with full class names, which you need for custom `@utility` classes.

### Does tailwind-merge read my Tailwind config or @theme?
No. Its config ships to the browser, so it can't read build-time CSS. A plugin that generates the config from your CSS, `@tailwind-merge/next`, exists but is pre-1.0.

### Which tailwind-merge version works with Tailwind CSS v4?
tailwind-merge v3 supports Tailwind CSS v4.0 through v4.3. Use tailwind-merge v2.6.0 for Tailwind v3 projects.

### Is cn() the same as twMerge?
In older shadcn/ui projects, `cn()` is `twMerge(clsx(inputs))` in `lib/utils.ts`. Since September 2026, shadcn components import `cn` from the `cn` package, which matches tailwind-merge's output; configure it with `createCn` from `cn/config` and make sure components import your configured version.

Building a dashboard on shadcn/ui? [Panelo UI](/components) ships charts, login pages and full dashboard pages that install with the shadcn CLI, with light and dark themes driven by tokens. See them on [the components page](/components).

## Sources

- tailwind-merge configuration docs: https://github.com/dcastil/tailwind-merge/blob/main/packages/tailwind-merge/docs/configuration.md
- tailwind-merge recipes: https://github.com/dcastil/tailwind-merge/blob/main/packages/tailwind-merge/docs/recipes.md
- tailwind-merge limitations: https://github.com/dcastil/tailwind-merge/blob/main/packages/tailwind-merge/docs/limitations.md
- tailwind-merge README (supported Tailwind versions): https://github.com/dcastil/tailwind-merge/blob/main/packages/tailwind-merge/README.md
- tailwind-merge 3.7.1 release notes: https://github.com/dcastil/tailwind-merge/releases/tag/tailwind-merge%403.7.1
- @tailwind-merge/next README: https://github.com/dcastil/tailwind-merge/blob/main/packages/next/README.md
- Tailwind CSS font-size docs (`--text-*` with line height, tracking, weight): https://tailwindcss.com/docs/font-size
- Tailwind CSS theme variables docs: https://tailwindcss.com/docs/theme
- Tailwind CSS discussion #19260, custom font-size and color conflict: https://github.com/tailwindlabs/tailwindcss/discussions/19260
- shadcn/ui changelog, September 2026 (cn package): https://ui.shadcn.com/docs/changelog/2026-09-cn
- shadcn/ui CLI docs, migrate cn: https://ui.shadcn.com/docs/cli#migrate-cn
- cn package README: https://github.com/shadcn-ui/cn
- cn build docs (custom themes): https://github.com/shadcn-ui/cn/blob/main/docs/build-setup.md
