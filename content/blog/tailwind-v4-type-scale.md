---
title: "Tailwind v4 Type Scale: Composite Text Styles"
description: "Build a type scale in Tailwind CSS v4 with --text-* theme variables that set size, line-height, letter-spacing and weight in one utility, plus tailwind-merge."
slug: tailwind-v4-type-scale
primaryKeyword: tailwind typography scale
secondaryKeywords:
  - tailwind type scale
  - tailwind v4 font size
  - tailwind v4 custom font size
  - tailwind text styles
  - tailwind v4 line height
intent: informational
cluster: Tailwind v4
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 2033
cta:
  free: [login-pages-3]
  pro: [dashboard-pages-5]
---

# A typography scale in Tailwind CSS v4 with composite text styles

To build a type scale in Tailwind CSS v4, define each text style as a `--text-<name>` theme variable in `@theme`, with optional `--line-height`, `--letter-spacing` and `--font-weight` sub-variables. Each becomes one utility, like `text-body-medium`, that sets all four properties together, so you stop stacking `text-sm font-medium leading-5`.

> **Skip the build:** [Painted Login Page](https://www.paneloui.com/components/login-pages-3) is a free, MIT-licensed shadcn/ui block with an editorial type pairing: a Newsreader serif headline loaded through `next/font` (42px on 46px, 57px on 58.5px from `lg`, -0.015em tracking, `text-balance`) over a sans form. It doesn't ship a type scale: its sizes are stacked classes like `text-[42px] leading-[46px]`, which makes it a small, real file to turn into composite styles with this post. Add it with `npx shadcn@latest add @panelo/login-pages-3` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## How does font size work in Tailwind CSS v4?

Tailwind CSS v4 ships a default scale: `text-xs`, `text-sm`, `text-base` and up. Each size already carries a line height. `text-sm` is 14px (`0.875rem`) on a 20px line height.

You can override the line height inline with a slash: `text-sm/6`. The docs: "Use utilities like `text-sm/6` and `text-lg/7` to set the font size and line-height of an element at the same time."

That works for small projects. In a product with a designed type ramp, it breaks down. Every heading becomes four classes, and every developer picks a slightly different four.

## How do you define custom text styles in v4?

The Tailwind docs show the syntax. A `--text-*` variable creates a font size utility, and sub-variables attach defaults to it:

```css
@theme {
  --text-tiny: 0.625rem;
  --text-tiny--line-height: 1.5rem;
  --text-tiny--letter-spacing: 0.125rem;
  --text-tiny--font-weight: 500;
}
```

`text-tiny` now sets all four properties. That is the building block for a full scale.

## What does a full type scale look like?

Here is Panelo UI's ramp, from `styles/typography.css`. It was exported from Figma text styles, and every family comes in four weights.

| Family | Size / line height | Example utility |
|---|---|---|
| Large Title | 64 / 80 | `text-large-title-medium` |
| Display 1 | 56 / 72 | `text-display-1-semibold` |
| Display 2 | 48 / 64 | `text-display-2-medium` |
| Display 3 | 40 / 54 | `text-display-3-medium` |
| Display 4 | 32 / 44 | `text-display-4-semibold` |
| Title 1 | 24 / 34 | `text-title-1-medium` |
| Title 2 | 20 / 26 | `text-title-2-medium` |
| Title 3 | 18 / 24 (regular), 26 (others) | `text-title-3-semibold` |
| Headline | 16 / 22 | `text-headline-medium` |
| Body | 14 / 20 | `text-body-regular` |
| Body 2 | 13 / 18 | `text-body-2-medium` |
| Caption 1 | 12 / 16, tracking 0.15px | `text-caption-1-semibold` |
| Caption 2 | 11 / 15, tracking 0.2px | `text-caption-2-medium` |

Thirteen families times four weights (regular 400, medium 500, semibold 600, bold 700) gives 52 utilities. One entry looks like this:

```css
@theme {
  /* ===== Body — 14 / 20 ===== */
  --text-body-medium: 0.875rem;
  --text-body-medium--line-height: 1.25rem;
  --text-body-medium--letter-spacing: 0;
  --text-body-medium--font-weight: 500;
}
```

Sizes are in `rem`, so the scale follows the user's browser font size setting.

## What CSS does a composite text utility generate?

Compiled with Tailwind CSS v4, `text-body-medium` becomes:

```css
.text-body-medium {
  font-size: var(--text-body-medium);
  line-height: var(--tw-leading, var(--text-body-medium--line-height));
  letter-spacing: var(--tw-tracking, var(--text-body-medium--letter-spacing));
  font-weight: var(--tw-font-weight, var(--text-body-medium--font-weight));
}
```

Look at the fallbacks. Line height, tracking and weight each read a `--tw-*` variable first. `leading-*`, `tracking-*` and `font-*` utilities set those variables. So:

- `text-body-medium font-semibold` gives you semibold, whatever order the classes are in.
- `text-body-medium leading-6` gives you a 24px line height.

The composite style is a default, not a lock. That is the right behavior for one-off adjustments, and it is also why a review rule helps: one-offs should stay rare.

One shortcut does not behave the same way. The slash form drops the rest of the style. We compiled `text-body-medium/6` and got only two declarations: `font-size` and a 24px `line-height`. The letter spacing and the 500 weight were gone. To change only the line height, use `text-body-medium leading-6`, not the slash.

## Why does my text style set a color instead of a size?

The `text-` prefix is shared by font sizes and colors. If a name exists in both namespaces, the utility can only be one of them. We compiled `@theme { --text-body: 0.875rem; --color-body: #333; }` and asked for `text-body`. Tailwind generated `color: var(--color-body)` and no font size at all. No warning.

This bites when a palette and a type scale are built by different people. Someone adds `--color-caption` for muted text, and every `text-caption` heading silently loses its size. Two ways to avoid it:

- Keep type names and color names apart. Panelo's color tokens for text all start with `text-` inside the name (`--color-text-primary` gives `text-text-primary`), so they cannot collide with type styles like `text-body-medium`.
- When a style looks unstyled, check the Computed tab. If `font-size` is inherited and `color` is set, you have a collision.

## Why not just stack text-sm font-medium leading-5?

Four reasons, from running this in a real component library:

1. **Drift.** `text-sm font-medium leading-5` and `text-sm font-medium leading-[1.4]` look the same in review and differ on screen.
2. **Design handoff.** Designers name text styles. "Body / Medium" in Figma maps to `text-body-medium` in code with nothing to translate.
3. **Global changes.** Change `--text-body-medium--line-height` once and every use updates.
4. **Coding agents.** Agents default to stacked classes because most Tailwind code online does it. A named style plus a rule is easy for them to follow. Panelo's [AGENTS.md](/blog/agents-md-design-system) says: "Never rebuild type by stacking `text-sm font-medium leading-5`; if a style seems missing, look in `styles/typography.css` before inventing one."

## Should the weight be part of the style name?

It is a trade-off, and both choices are fine.

| Approach | Pros | Cons |
|---|---|---|
| Weight in the name (`text-body-medium`) | One class per style; matches Figma text styles exactly | 4x as many utilities; longer names |
| Size-only styles plus `font-*` (`text-body font-medium`) | Fewer utilities; flexible | Two classes per use; weight can drift |

Panelo puts the weight in the name because its Figma file does. If your design tool defines styles by size only, define `--text-body` with line height and tracking, and let `font-*` carry the weight.

## Why does tailwind-merge drop my custom text styles?

If you merge classes with `tailwind-merge` (most `cn()` and `cx()` helpers do), it needs to know your styles exist. Its docs say "the default `twMerge` only knows the default Tailwind theme." An unknown `text-body-medium` looks like a text color. Put it next to a real color like `text-text-primary` and one of them is removed.

Panelo registers every composite style as a font size:

```ts
import { extendTailwindMerge } from "tailwind-merge";

const TEXT_FAMILIES = [
  "large-title", "display-1", "display-2", "display-3", "display-4",
  "title-1", "title-2", "title-3", "headline", "body", "body-2",
  "caption-1", "caption-2",
] as const;
const TEXT_WEIGHTS = ["regular", "medium", "semibold", "bold"] as const;

const TEXT_STYLE_SUFFIXES = TEXT_FAMILIES.flatMap((family) =>
  TEXT_WEIGHTS.map((weight) => `${family}-${weight}`),
);

export const cx = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...TEXT_STYLE_SUFFIXES] }],
    },
  },
});
```

(The real file also registers a separate site ramp and says to mirror any change to `typography.css` here.) The full story is in [tailwind-merge custom classes](/blog/tailwind-merge-custom-classes).

## How do you make the scale responsive?

Two options.

**Swap styles at breakpoints.** This keeps every size on the scale:

```html
<h1 class="text-title-1-semibold md:text-display-4-semibold">Overview</h1>
```

**Fluid sizes with `clamp()`.** For marketing headlines, a theme variable can hold any valid length:

```css
@theme {
  --text-hero: clamp(2.5rem, 1.5rem + 4vw, 4rem);
  --text-hero--line-height: 1.1;
  --text-hero--letter-spacing: -0.02em;
  --text-hero--font-weight: 600;
}
```

For dashboards, prefer breakpoint swaps. Dense UI reads better when sizes are predictable.

## What accessibility rules apply to a type scale?

Two WCAG 2.2 success criteria touch the scale directly, both at level AA.

- **1.4.4 Resize Text.** Text must be resizable "up to 200 percent without loss of content or functionality." Sizes and line heights in `rem` follow the user's browser font setting, which helps. Fixed heights on containers break it, so let text boxes grow.
- **1.4.12 Text Spacing.** Users may override line height to 1.5 times the font size, letter spacing to 0.12 times and word spacing to 0.16 times, with no loss of content. Your composite styles are defaults. Test by injecting those values and checking that nothing clips, especially in table cells, badges and buttons.

Small sizes need care too. Caption styles at 11 and 12px are fine for labels and metadata, but keep running text at body size or larger.

## How do you set the font family?

Font families use the `--font-*` namespace. If you load fonts with `next/font`, it exposes a CSS variable, and you point the theme at it. The Tailwind docs show the `inline` form for variables that reference other variables:

```css
@theme inline {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
```

Panelo uses Inter for the whole ramp and JetBrains Mono for code.

## How do you roll this out in an existing project?

1. List the text styles your design actually uses, by role (title, body, caption), not by pixel size.
2. Add them to `@theme` as `--text-*` with sub-variables.
3. Register them with tailwind-merge.
4. Replace stacked classes file by file. Search for `text-(xs|sm|base|lg|xl)` near `font-` and `leading-`.
5. Add the rule to your AGENTS.md so new code uses the styles.

Step 4 is where the time goes, and arbitrary sizes slip past that search, so add `text-\[` to it. The free [Painted Login Page](https://www.paneloui.com/components/login-pages-3) is a quick file to practise on: its headline stacks `text-[42px] leading-[46px] font-normal tracking-[-0.015em]` with `lg:text-[57px] lg:leading-[58.5px]`, which becomes two `--text-*` styles swapped at `lg:` as shown above.

Panelo UI's own site uses this scale. Its installable blocks don't add type tokens (the free `panelo-theme` registry item is colors only), so the scale stays yours to define in a shadcn/ui project. Pair it with [semantic color tokens](/blog/tailwind-semantic-color-tokens) so type and color both come from the theme.

## Get this working in your app

Copy the `@theme` block above, compile, and check a heading in DevTools. The full 52-style ramp is in `styles/typography.css` in the [Panelo UI repo](https://github.com/raycanvas-ai/paneloui), and you can browse the free [Panelo UI components](/components).

To practise on the Painted Login Page, add the Panelo registry to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install it:

```bash
npx shadcn@latest add @panelo/login-pages-3
```

Define the two headline styles in `@theme`, replace the stacked classes, and compare the result in DevTools. See it live on the [Painted Login Page](https://www.paneloui.com/components/login-pages-3).

Next step: [Project Overview Dashboard](https://www.paneloui.com/components/dashboard-pages-5), a Panelo Pro page with a collapsible sidebar, breadcrumb bar, project hero, section tabs and a two-column overview. That is many text levels on one screen, which is where a named scale pays off. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

**How do I add a custom font size in Tailwind CSS v4?**
Add a `--text-<name>` variable inside `@theme`, for example `--text-tiny: 0.625rem;`. Tailwind generates a `text-tiny` utility.

**Can a Tailwind v4 font size set line height and weight too?**
Yes. Add `--text-<name>--line-height`, `--text-<name>--letter-spacing` and `--text-<name>--font-weight` next to it, and the one utility sets all four.

**Do leading-* and font-* still work with composite text styles?**
Yes. The generated CSS reads `--tw-leading`, `--tw-tracking` and `--tw-font-weight` first, so `leading-*`, `tracking-*` and `font-*` override the style's defaults regardless of class order.

**What is the default size of text-sm in Tailwind v4?**
`text-sm` is `0.875rem` (14px) with a line height that works out to 20px.

**Is @tailwindcss/typography the same as a type scale?**
No. The typography plugin gives "typographic defaults for HTML you don't control", such as Markdown output, through `prose` classes. A type scale is the set of text styles your UI uses everywhere.

## Sources

- Tailwind CSS docs, `font-size` (custom `--text-*` variables, sub-variables, `text-sm/6`, default scale): https://tailwindcss.com/docs/font-size
- Tailwind CSS docs, Theme variables (`--text-*` and `--font-*` namespaces, `@theme inline`): https://tailwindcss.com/docs/theme
- W3C, WCAG 2.2 (1.4.4 Resize Text, 1.4.12 Text Spacing): https://www.w3.org/TR/WCAG22/
- Tailwind Labs, `@tailwindcss/typography` README: https://github.com/tailwindlabs/tailwindcss-typography
- tailwind-merge docs, Configuration (default theme only, extending `font-size` class group): https://github.com/dcastil/tailwind-merge/blob/main/packages/tailwind-merge/docs/configuration.md
