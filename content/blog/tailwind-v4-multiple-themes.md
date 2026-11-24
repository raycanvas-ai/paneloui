---
title: "Tailwind v4 Multiple Themes Without a Plugin"
description: "Add multiple themes to Tailwind CSS v4 with data-theme attributes, semantic CSS variables and @theme inline, pair them with dark mode, and skip the var() trap."
slug: tailwind-v4-multiple-themes
primaryKeyword: tailwind v4 multiple themes
secondaryKeywords:
  - tailwind v4 theme switcher
  - tailwind 4 switch theme
  - tailwind data-theme
  - tailwind custom-variant theme
  - tailwind v4 css variables
intent: informational
cluster: Tailwind v4
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1834
cta:
  free: [panelo-theme]
  pro: [dashboard-pages-3]
---

# Multiple themes in Tailwind CSS v4, without a plugin

To support multiple themes in Tailwind CSS v4, define semantic CSS variables in `:root`, override them under selectors like `[data-theme="ocean"]`, and map them to utilities with `@theme inline`. Components use one set of classes, such as `bg-surface`, and the attribute on `<html>` decides the colors. No plugin or config file is needed.

> **Skip the build:** [panelo-theme](https://www.paneloui.com/r/panelo-theme.json) is a free, MIT-licensed shadcn/ui theme item, not a component: 36 role-named color tokens (status colors, six tonal pill hues, a hairline and an AI gradient pair) with light values in `:root`, dark overrides in `.dark`, and `--color-*` mappings, the same variables-plus-mapping structure this post builds. It ships light and dark; your brand themes go on top as `[data-theme]` blocks. Add it with `npx shadcn@latest add @panelo/panelo-theme` ([registry setup](#get-this-working-in-your-app)), then change anything: the values are written into your own CSS.

## How does theming work in Tailwind CSS v4?

Tailwind CSS v4 is configured in CSS. The `@theme` directive defines design tokens, and each token in a known namespace becomes utilities. A `--color-*` variable creates `bg-*`, `text-*`, `border-*` and the other color utilities.

The Tailwind docs draw the line clearly: "Use `@theme` when you want a design token to map directly to a utility class, and use `:root` for defining regular CSS variables that shouldn't have corresponding utility classes."

A theme switcher needs both:

- **Plain CSS variables** in `:root` and under each theme selector. These change at runtime.
- **An `@theme inline` block** that turns those variables into utilities.

## How do you set up multiple themes step by step?

### 1. Define semantic variables per theme

Name variables by role, not by color. `--surface`, not `--white`.

```css
@import "tailwindcss";

:root {
  --surface: var(--color-white);
  --surface-raised: var(--color-neutral-50);
  --text-strong: var(--color-neutral-950);
  --text-muted: var(--color-neutral-500);
  --line: var(--color-neutral-200);
  --brand: var(--color-blue-600);
}

[data-theme="ocean"] {
  --surface: var(--color-sky-50);
  --surface-raised: var(--color-white);
  --text-strong: var(--color-slate-900);
  --text-muted: var(--color-slate-600);
  --line: var(--color-sky-200);
  --brand: var(--color-cyan-700);
}

[data-theme="forest"] {
  --surface: var(--color-stone-50);
  --surface-raised: var(--color-white);
  --text-strong: var(--color-stone-900);
  --text-muted: var(--color-stone-600);
  --line: var(--color-stone-200);
  --brand: var(--color-emerald-700);
}
```

Tailwind's default palette is available as variables (`--color-sky-50` and so on), so themes can reference it.

Writing every variable for every theme is the tedious part. One way to cut it is to derive tints from a single value per hue, as the `.dark` block of the free [panelo-theme](https://www.paneloui.com/r/panelo-theme.json) item does: each tonal pill's background is `color-mix(in oklab, var(--tone-violet-solid) 14%, transparent)` and its border the same at 28%, so one solid drives both (mind the variable-chain caveat later in this post).

### 2. Map them to utilities with @theme inline

```css
@theme inline {
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-text-strong: var(--text-strong);
  --color-text-muted: var(--text-muted);
  --color-line: var(--line);
  --color-brand: var(--brand);
}
```

Now `bg-surface`, `text-text-muted`, `border-line` and `bg-brand` exist. With `inline`, the utility uses the variable's value directly, so `bg-surface` compiles to `background-color: var(--surface)`. Whatever `--surface` is on that element wins.

### 3. Use the semantic classes everywhere

```tsx
<div className="rounded-3xl border border-line bg-surface-raised p-6">
  <h2 className="text-text-strong">Revenue</h2>
  <p className="text-text-muted">Last 30 days</p>
  <button className="rounded-full bg-brand px-4 py-2 text-surface">Export</button>
</div>
```

This card has no idea which theme is active. That is the point.

### 4. Switch themes with one attribute

```ts
export function setTheme(theme: "default" | "ocean" | "forest") {
  const root = document.documentElement;
  if (theme === "default") delete root.dataset.theme;
  else root.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}
```

To avoid a flash of the wrong theme on load, set the attribute before the page paints, in a small inline script in `<head>` that reads the same `localStorage` key. In server-rendered apps you can also set `data-theme` on `<html>` from a cookie.

## Why use @theme inline instead of @theme?

Because of how CSS resolves variables. The CSS Variables spec says "custom properties resolve any var() functions in their values at computed-value time." That happens on the element where the variable is declared.

If you write the mapping with plain `@theme`:

```css
/* Not what you want for runtime themes */
@theme {
  --color-surface: var(--surface);
}
```

Tailwind emits `--color-surface: var(--surface)` on `:root` and makes `bg-surface` use `var(--color-surface)`. `--color-surface` is resolved once, at `:root`, and descendants inherit the result. Override `--surface` on a nested element and `bg-surface` inside it does not change. The Tailwind docs warn about this: without `inline`, utilities that reference other variables can resolve to unexpected values.

With `@theme inline`, the utility points at `var(--surface)` itself, so it resolves on the element using it, inside whatever theme scope it sits in.

## How do you combine brand themes with dark mode?

Treat them as two axes: brand (`data-theme`) and mode (`.dark`). Tailwind's dark mode docs show how to drive the `dark` variant from a class:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Then give each brand a dark block:

```css
.dark {
  --surface: var(--color-neutral-950);
  --surface-raised: var(--color-neutral-900);
  --text-strong: var(--color-neutral-50);
  --text-muted: var(--color-neutral-400);
  --line: var(--color-neutral-800);
  --brand: var(--color-blue-400);
  color-scheme: dark;
}

.dark[data-theme="ocean"] {
  --surface: var(--color-slate-950);
  --line: var(--color-cyan-900);
  --brand: var(--color-cyan-400);
}
```

Put both on `<html>`: `<html class="dark" data-theme="ocean">`. The compound selector is more specific, so it wins over plain `.dark`, and any token it does not set falls back to `.dark`.

Set `color-scheme: dark` in dark blocks. MDN notes it changes "the default colors of form controls" and "the default colors of scrollbars and other interaction UI," which no Tailwind class does for you.

Components still never write `dark:` for colors. Panelo UI's rules file says it plainly: "Do not write `dark:` overrides with raw colors; if a token pair looks wrong in dark mode, pick a different token, not a literal."

## When do you need a custom variant per theme?

Rarely. Tokens cover color. A variant helps when a theme changes something that is not a token, like a different illustration or border radius.

The Tailwind docs show this exact pattern:

```css
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

which lets you write `theme-midnight:bg-black`. If you need it to match the element carrying the attribute too, use `&:where([data-theme="midnight"], [data-theme="midnight"] *)`. Use these sparingly. Every `theme-x:` class is a place a new theme has to be remembered.

## Can I scope a theme to one section of the page?

Yes, with a catch. Put `data-theme="ocean"` on a `<section>` and its `--surface` overrides apply inside it, and `@theme inline` utilities pick them up.

The catch is chains of variables. If a semantic variable is declared on `:root` as a reference to another variable, the reference is resolved on `:root`. Overriding the inner variable deeper in the tree does not reach it.

Panelo hits this with its accent ramp. In `theme.css`, eleven `--color-accent-*` variables drive buttons, switches, tabs, selection and the focus ring:

```css
@theme {
  --color-accent-50:  var(--color-blue-50);
  /* ... */
  --color-accent-500: var(--color-blue-500);
  /* ... */
}

:root {
  --color-border-focus-ring: var(--color-accent-500);
}
```

Override the accent ramp on `<html>` and everything re-tints, including `ring-border-focus-ring`. Override it on a nested `<section>` and `bg-accent-500` changes there, but the focus ring does not, because `--color-border-focus-ring` was already resolved at `:root`.

Two ways out:

1. **Theme the root.** Put `data-theme` on `<html>`. This is the simplest and covers most apps.
2. **Redeclare the chain.** In a scoped theme, set the semantic variables themselves, not just the primitives they point to.

## How many themes should a design system ship?

Fewer than you think. Each theme multiplies what you must check: contrast for text, borders, focus rings and chart colors, in light and dark. WCAG 1.4.11 asks for 3:1 contrast for the parts of controls people need to see. Run your contrast checks per theme, not once.

A practical order:

1. Ship light and dark first, on semantic tokens.
2. Add one accent override, since most "brand themes" are really a different accent color.
3. Add full themes only when surfaces and text need to change too.

Panelo UI follows the first two steps: every item ships light and dark from the same tokens, and the accent ramp can be overridden without touching components. The free `panelo-theme` registry item installs the tokens its blocks add on top of shadcn/ui's (status colors and tonal pills) into a shadcn/ui project, with a light value for each and a dark value where it changes.

For the token layer itself, see [semantic color tokens in Tailwind](/blog/tailwind-semantic-color-tokens) and [@theme vs @theme inline](/blog/tailwind-theme-vs-theme-inline). If dark mode is not switching at all, start with [Tailwind v4 dark mode not working](/blog/tailwind-v4-dark-mode-not-working).

## Get this working in your app

Copy the CSS above into a Tailwind CSS v4 project and toggle `data-theme` in DevTools. To see one token set drive light and dark across full dashboards, browse the free [Panelo UI components](/components).

To add Panelo's tokens as a starting set, put the registry in `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the theme:

```bash
npx shadcn@latest add @panelo/panelo-theme
```

The CLI writes its `:root` and `.dark` values into your CSS. To give a brand theme its own status colors, set `--success`, `--warning` or `--info` in its `[data-theme]` and `.dark[data-theme]` blocks, the same way as `--brand` above. Every free Panelo block lists `panelo-theme` as a dependency, so installing a block brings it along. See it live: the free [Home Care Schedule](https://www.paneloui.com/components/dashboard-pages-13) marks at-risk visits with `bg-tone-orange-bg`, `text-tone-orange-fg` and `ring-tone-orange-border`.

Next step: [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3), a Panelo Pro page with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Like every Panelo item it ships light and dark from the same tokens, which makes it a full page to try a brand theme on. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

**Do I need a plugin for multiple themes in Tailwind CSS v4?**
No. Define CSS variables per theme under `[data-theme="..."]` selectors, map them with `@theme inline`, and switch the attribute on `<html>`. Plugins built for v3 configs are not needed.

**Why does my theme override not change some colors?**
Usually a variable chain: a semantic variable declared on `:root` as `var(--other)` is resolved at `:root`. Set the theme on `<html>`, or redeclare the semantic variables inside the theme selector.

**What is the difference between @theme and @theme inline for themes?**
`@theme` makes utilities reference the theme variable, which is resolved at `:root`. `@theme inline` puts the referenced variable into the utility, so it resolves wherever the class is used and follows scoped overrides.

**How do I combine dark mode with brand themes?**
Use `.dark` for mode and `data-theme` for brand, both on `<html>`. Write `.dark[data-theme="x"]` blocks for brand-specific dark values and let anything unset fall back to `.dark`.

**Should components use dark: classes for colors?**
No. Components should use semantic token classes that flip with the theme. Keep `dark:` for the rare non-color change.

## Sources

- Tailwind CSS docs, Theme variables (`@theme` vs `:root`, `@theme inline`): https://tailwindcss.com/docs/theme
- Tailwind CSS docs, Dark mode (`@custom-variant dark` with class or data attribute): https://tailwindcss.com/docs/dark-mode
- Tailwind CSS docs, Functions and directives (`@custom-variant theme-midnight` example): https://tailwindcss.com/docs/functions-and-directives
- W3C, CSS Custom Properties for Cascading Variables Level 1 (var() resolved at computed-value time): https://www.w3.org/TR/css-variables-1/
- MDN, Using CSS custom properties (inheritance): https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- MDN, `color-scheme`: https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
- W3C WAI, Understanding SC 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
