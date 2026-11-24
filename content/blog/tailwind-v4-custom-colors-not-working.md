---
title: "Tailwind v4 Custom Colors Not Working: 7 Real Causes"
description: "Tailwind CSS v4 custom colors not generating bg-* or text-* classes? Fix the 7 real causes: ignored config, wrong namespace, :root, HSL channels, scanning."
slug: tailwind-v4-custom-colors-not-working
primaryKeyword: tailwind v4 custom colors not working
secondaryKeywords:
  - tailwind 4 colors not working
  - tailwind v4 bg classes not working shadcn
  - how to add custom colors in tailwind v4
  - tailwind v4 theme colors
  - tailwind v4 utilities not working
intent: informational
cluster: Tailwind v4
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1946
cta:
  free: [panelo-theme]
  pro: [dashboard-pages-3]
---

# Tailwind v4 custom colors not working? The 7 real causes

In Tailwind CSS v4, a custom color only becomes a utility when it is declared inside `@theme` with the `--color-` prefix, like `--color-brand: #3392ff;`. Colors in `tailwind.config.js`, in plain `:root`, or under another prefix generate no `bg-brand` class. If the class exists but looks wrong, check for v3-style HSL channels or dynamic class names.

> **Skip the build:** [panelo-theme](https://www.paneloui.com/r/panelo-theme.json) is a free, MIT-licensed shadcn/ui theme item, not a component: 36 color tokens (success, warning and info with `-solid` and `-foreground` pairs, six tonal pill hues, a hairline and an AI gradient pair) already wired the way this post explains, with values in `:root` and `.dark` mapped to `--color-*` theme variables, so `bg-success` and `text-tone-blue-fg` exist as soon as it lands. Add it with `npx shadcn@latest add @panelo/panelo-theme` ([registry setup](#get-this-working-in-your-app)), then change anything: the values are written into your own CSS.

## What's the correct way to add a custom color in Tailwind v4?

Start from the version that works, then compare it with yours. From the Tailwind colors docs:

```css
@import "tailwindcss";

@theme {
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
```

"Now utilities like `bg-midnight`, `text-tahiti`, and `fill-bermuda` will be available in your project in addition to the default colors." Any color format works: hex, `rgb()`, `hsl()` or `oklch()`.

If yours looks like that and still fails, one of the causes below applies. We checked each one against a Tailwind CSS v4.3.5 build.

## 1. Are your colors still in tailwind.config.js?

v4 configures the theme in CSS. The upgrade guide says JavaScript config files "are still supported for backward compatibility, but they are no longer detected automatically in v4." A `theme.extend.colors` block in a config file that nothing loads is simply ignored.

Move the colors to `@theme`. If you need the old file for a while, load it explicitly:

```css
@import "tailwindcss";
@config "../../tailwind.config.js";
```

## 2. Is the variable in the --color-* namespace?

Theme variables map to utilities by prefix. Only `--color-*` creates color utilities. We compiled this:

```css
@theme {
  --brand: #3392ff;
  --colors-brand: red;
}
```

Asked for `bg-brand`, Tailwind generated nothing. Not an error, just no rule. The same goes for `--clr-brand`, `--brand-color` or any other naming. The namespace table in the theme docs lists what each prefix creates: `--color-*` for colors, `--font-*` for families, `--text-*` for font sizes, `--radius-*` for corners, and so on.

## 3. Did you define it in :root instead of @theme?

A variable in `:root` is a regular CSS variable. The theme docs say to use `:root` "for defining regular CSS variables that shouldn't have corresponding utility classes," and `@theme` "when you want a design token to map directly to a utility class."

```css
:root {
  --color-brand: red; /* no bg-brand utility */
}
```

You have three options:

1. Move it into `@theme`.
2. Keep the raw value in `:root` and map it with `@theme inline { --color-brand: var(--brand); }`. This is the shadcn/ui pattern and the right one for colors that change in dark mode.
3. Skip the utility and use the variable shorthand, `bg-(--color-brand)`, which compiles to `background-color: var(--color-brand)`.

Option 2 is the one most worth copying, and the free [panelo-theme](https://www.paneloui.com/r/panelo-theme.json) item is a full worked example of it: raw values like `--success: oklch(0.52 0.13 150)` in `:root` and `.dark`, each mapped as `--color-success: var(--success)`.

## 4. Is shadcn/ui's bg-background or bg-primary not working after an upgrade?

This is usually leftover v3 syntax. In shadcn/ui's v3 setup, variables held bare HSL channels and the config wrapped them:

```css
:root {
  --primary: 222 47% 11%;
}
```

If you map that with `@theme inline { --color-primary: var(--primary); }`, the class is generated, but it compiles to `background-color: var(--primary)`, and `222 47% 11%` is not a valid color. The browser drops the declaration and you see no background.

shadcn/ui's Tailwind v4 guide gives the fix in four steps: move `:root` and `.dark` out of `@layer base`, wrap the values in `hsl()`, use `@theme inline`, and remove the `hsl()` wrappers from `@theme`:

```css
:root {
  --primary: hsl(222 47% 11%);
}

@theme inline {
  --color-primary: var(--primary);
}
```

New shadcn/ui projects write these values in `oklch()`, which works the same way. [Why shadcn/ui uses OKLCH](/blog/why-shadcn-uses-oklch) covers that change.

## 5. Is Tailwind actually seeing the class name?

Tailwind scans your files as plain text. The detection docs say it "has no way of understanding string concatenation or interpolation," so this never works:

```tsx
<div className={`bg-${color}-500`} />
```

Map props to complete class names instead:

```tsx
const swatch = {
  brand: "bg-brand text-white",
  danger: "bg-red-600 text-white",
} as const;

<div className={swatch[color]} />;
```

Also check the file is scanned at all. Tailwind skips files in `.gitignore`, `node_modules`, binaries, CSS files and lock files. Panelo UI's repo hits this on purpose: its Pro components live in a gitignored folder, so `styles/globals.css` registers it by hand:

```css
/* Tailwind skips gitignored folders, and pro/ is gitignored. Name it so pro classes are generated; a clone without it is unaffected. */
@source "../components/panelo/pro";
```

For a class that never appears in source, safelist it with `@source inline("bg-brand");`.

## 6. Did --color-*: initial wipe out more than you expected?

Resetting the namespace is useful when you want only your palette. The theme docs explain that afterwards "all of the default utilities that use that namespace (like `bg-red-500`) will be removed." In our build, `@theme { --color-*: initial; --color-brand: #f00; }` produced `bg-brand` and no `bg-red-500`.

If default colors disappeared, search your CSS for `--color-*: initial` or a per-hue reset such as `--color-lime-*: initial`. Also note the order: declare your own colors after the reset in the same block.

## 7. Is the class defined with @layer utilities instead of @utility?

If you wrote a color helper as a plain class in v3 style, it won't behave like a utility in v4. The upgrade guide says v4 uses "native cascade layers and no longer hijacking the `@layer` at-rule," and introduces `@utility` as the replacement:

```css
@utility bg-brand-gradient {
  background-image: linear-gradient(var(--color-brand), var(--color-tahiti));
}
```

`@utility` classes work with variants like `hover:` and `md:`. If you also merge classes with tailwind-merge, register custom utilities with it too, or it may drop them. See [tailwind-merge custom classes](/blog/tailwind-merge-custom-classes).

## Why does bg-brand work but bg-brand/50 doesn't?

The opacity modifier is a separate step, and it fails in its own ways. The colors docs describe it: in `bg-black/75`, "`75` sets the alpha channel of the color to 75%". In our v4.3.5 build, `@theme { --color-brand: #3392ff; }` plus `bg-brand/50` compiled to:

```css
.bg-brand\/50 {
  background-color: color-mix(in srgb, #3392ff 50%, transparent);
  @supports (color: color-mix(in lab, red, red)) {
    background-color: color-mix(in oklab, var(--color-brand) 50%, transparent);
  }
}
```

So v4 mixes your color with `transparent`, it doesn't append an alpha channel. That has two consequences:

- **The variable must hold a full color.** With the v3-style channels from cause 4, `color-mix()` gets `222 47% 11%` and the declaration is dropped, the same as the plain class.
- **`@theme inline` with a variable loses the fallback.** When we mapped `--color-primary: var(--primary)` in `@theme inline`, the first declaration became `background-color: var(--primary)` with no transparency. Browsers that support `color-mix()` use the second line and look right. Older ones show the color at full strength.

In your own CSS, the docs offer the `--alpha()` function for the same job: `background-color: --alpha(var(--color-brand) / 10%);`.

## Still broken? Three more checks

- **Check for a prefix.** If your import reads `@import "tailwindcss" prefix(tw);`, every class needs it: `tw:bg-brand`, not `bg-brand`. The prefix applies to variables too. The docs show `--color-red-500` compiled as `--tw-color-red-500`, and in our build `tw:bg-brand` read `var(--tw-color-brand)`. Custom CSS that reads `var(--color-brand)` finds nothing.

- **Restart the dev server** after moving large blocks of CSS. In GitHub discussion #19150 ("bg-* classes not working in nextjs with shadcn"), the reporter's fix was running `next dev` without the Turbopack flag. Treat that as one person's report, not a known bug, but a clean restart is a cheap test.
- **Check that the color reads as a color.** `bg-brand` with a value like `16px` compiles fine and does nothing. Inspect the element and look for a struck-through declaration.

## How do I keep custom colors from breaking again?

Most of these bugs come from colors living in too many places. A layout that holds up:

| Layer | Where | Example |
|---|---|---|
| Primitives | `@theme` | `--color-neutral-925: #121212;` |
| Semantic tokens | `:root` and `.dark` | `--color-text-primary: var(--color-neutral-950);` |
| Utility mapping | `@theme inline` | `--color-text-primary: var(--color-text-primary);` |

That is the structure of Panelo UI's `styles/theme.css`, and its project rules ban raw palette classes like `text-gray-500` in components. Every color a component uses is a semantic token, so a missing color shows up in one file. The whole approach is laid out in [design tokens in Tailwind CSS v4](/blog/design-tokens-tailwind-v4).

## Get this working in your app

Add the Panelo registry to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the theme:

```bash
npx shadcn@latest add @panelo/panelo-theme
```

The shadcn CLI writes the light and dark values and their `--color-*` mappings into your CSS, so the tokens behave like any color you declared yourself. Every free Panelo block lists `panelo-theme` as a dependency, so installing a block brings it along.

See it live: the at-risk visits in the free [Home Care Schedule](https://www.paneloui.com/components/dashboard-pages-13) are styled with `bg-tone-orange-bg`, `text-tone-orange-fg` and `ring-tone-orange-border` from this theme.

Panelo UI's charts and dashboard pages install with the shadcn CLI and read colors from tokens like `chart-1` to `chart-5`, so they follow your palette. Browse them on [the components page](/components).

Next step: [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3), a Panelo Pro page with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart, shows a whole page running on tokens, in light and dark. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### How do I add a custom color in Tailwind v4?
Add a variable with the `--color-` prefix inside `@theme` in your main CSS file, for example `@theme { --color-brand: #3392ff; }`. Tailwind then generates `bg-brand`, `text-brand`, `border-brand` and the rest.

### Why is tailwind.config.js colors not working in Tailwind 4?
v4 doesn't detect JavaScript config files automatically. Move colors to `@theme` in CSS, or load the old file with `@config`.

### Why does bg-primary not work in my shadcn project on Tailwind v4?
Usually your `:root` variables still hold bare HSL channels like `222 47% 11%`. Wrap them in `hsl()` (or convert to `oklch()`) and map them with `@theme inline`.

### Can I use a CSS variable as a Tailwind color without @theme?
Yes, with the arbitrary shorthand `bg-(--my-color)`. You won't get a named utility, but it works anywhere a color is accepted.

### Why do dynamic class names like bg-${color}-500 not work?
Tailwind scans source files as plain text and only generates classes it finds as complete strings. Map each option to a full class name.

### Why does bg-primary/50 not work in Tailwind v4?
v4 builds opacity with `color-mix()`, so the variable behind the color must hold a complete color such as `hsl(222 47% 11%)` or an `oklch()` value. Bare HSL channels make the declaration invalid.

## Sources

- Tailwind CSS colors docs: https://tailwindcss.com/docs/colors
- Tailwind CSS theme variables docs (namespaces, `:root` vs `@theme`, resets): https://tailwindcss.com/docs/theme
- Tailwind CSS upgrade guide (`@config`, `@utility`): https://tailwindcss.com/docs/upgrade-guide
- Tailwind CSS styling with utility classes (`prefix(tw)` option): https://tailwindcss.com/docs/styling-with-utility-classes
- Tailwind CSS detecting classes in source files: https://tailwindcss.com/docs/detecting-classes-in-source-files
- Tailwind CSS functions and directives: https://tailwindcss.com/docs/functions-and-directives
- shadcn/ui Tailwind v4 docs: https://ui.shadcn.com/docs/tailwind-v4
- shadcn/ui theming docs: https://ui.shadcn.com/docs/theming
- GitHub discussion #19150, "Tailwind v4 bg-* classes not working in nextjs with shadcn": https://github.com/tailwindlabs/tailwindcss/discussions/19150
