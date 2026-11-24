---
title: "@theme vs @theme inline in Tailwind CSS v4, Explained"
description: "What @theme inline changes in Tailwind CSS v4 output, when to use it over @theme, and why the wrong choice breaks dark mode or nested themes. With compiled CSS."
slug: tailwind-theme-vs-theme-inline
primaryKeyword: "@theme vs @theme inline"
secondaryKeywords:
  - what is @theme inline
  - what does @theme inline do
  - tailwind v4 @theme inline
  - tailwind v4 theme variables
  - "@theme inline dark mode"
intent: informational
cluster: Tailwind v4
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1849
cta:
  free: [panelo-theme]
  pro: [dashboard-pages-3]
---

# @theme vs @theme inline in Tailwind CSS v4

`@theme` makes Tailwind emit a CSS variable and generate utilities that reference it, like `background-color: var(--color-brand)`. `@theme inline` puts the variable's value straight into the utility instead. Use `inline` when a theme variable points at another variable, as shadcn/ui does. Avoid it for literal values you plan to override in `.dark`.

> **Skip the build:** [`panelo-theme`](https://www.paneloui.com/r/panelo-theme.json) is a free, MIT-licensed shadcn/ui theme item, not a component, that follows the split this post recommends: literal light and dark values under `:root` and `.dark`, and `--color-*` pointers to them in `@theme inline`. Add it with `npx shadcn@latest add @panelo/panelo-theme` ([registry setup](#get-this-working-in-your-app)), then change anything: the values land in your CSS.

## What does each one compile to?

The fastest way to understand the difference is to look at the output. We compiled this input with Tailwind CSS v4.3.5:

```css
@import "tailwindcss";

:root {
  --brand: oklch(0.6 0.2 250);
}

@theme {
  --color-a: var(--brand);
}

@theme inline {
  --color-b: var(--brand);
}
```

Output (trimmed to the relevant rules):

```css
:root, :host {
  --color-a: var(--brand);
}
.bg-a {
  background-color: var(--color-a);
}
.bg-b {
  background-color: var(--brand);
}
```

`bg-a` points at the theme variable, which in turn points at `--brand`. `bg-b` skips the middle step and points at `--brand` directly. That is the whole mechanical difference. The Tailwind docs put it this way: "the utility class will use the theme variable *value* instead of referencing the actual theme variable."

Both forms create the same utilities and both live in the `--color-*` namespace, so `bg-b`, `text-b`, `border-b/50` and the rest all exist either way.

## Why does inline matter when a variable references another variable?

Because CSS resolves `var()` where the property is declared, not where it is used.

With plain `@theme`, `--color-a: var(--brand)` is declared on `:root`. The browser substitutes `--brand` at the root, and every descendant inherits the already-resolved color. If you later redefine `--brand` on a nested element, such as a `<section class="ocean">` theme scope, `--color-a` inside that section still holds the root's value. Your nested theme does nothing.

The official docs show the same failure with fonts: `--font-sans: var(--font-inter, sans-serif)` defined on a parent, `--font-inter` defined on a child, and the text falls back to `sans-serif`, because "`var(--font-sans)` is resolved where `--font-sans` is defined... and `--font-inter` has no value there."

With `@theme inline`, the utility itself contains `var(--brand)`, so it resolves on the element that has the class. Nested overrides work.

When the override is on `<html>` itself (the usual `class="dark"` setup), both forms happen to work, because `<html>` is `:root`. That is why many projects never notice the difference until they add a second theme scope.

## Why did @theme inline break my dark mode?

This is the opposite mistake, and it is the one people hit when they switch everything to `inline`. Put a literal value in `@theme inline` and try to flip it in `.dark`:

```css
@theme inline {
  --color-surface: #ffffff;
}

.dark {
  --color-surface: #111111;
}
```

Tailwind 4.3.5 output:

```css
.bg-surface {
  background-color: #ffffff;
}
.dark {
  --color-surface: #111111;
}
```

The utility contains `#ffffff`. Nothing references `--color-surface`, so overriding it in `.dark` changes nothing. Dark mode silently stays light.

A GitHub answer on discussion #18560 sums it up: "With `@theme inline`, you are responsible for providing the variable override, since the variable does not exist globally. In contrast, with `@theme`, the value is embedded into a global variable, which means its value can be overridden later."

The same input with plain `@theme` works, because the utility becomes `background-color: var(--color-surface)` and `.dark` redefines that variable.

## Which should I use? A decision table

| Situation | Use | Why |
|---|---|---|
| Literal values: hex, oklch, rem | `@theme` | Utilities reference the variable, so you can override it later |
| Literal value you never override | Either | `@theme` is the default and more idiomatic |
| Token that points at a variable set in `:root` and `.dark` | `@theme inline` | Resolves on the element; nested theme scopes work |
| Font family from `next/font` (`var(--font-inter)`) | `@theme inline` | The docs' own example |
| Variable you want to re-tint at runtime by overriding the theme variable itself | `@theme` | The utility reads the theme variable, so redefining it anywhere works |

Adam Wathan's answer on discussion #17826 gives the rule of thumb: it's "more idiomatic in v4 for the actual generated CSS to reference your theme variables. I would personally only use `inline` when things don't work without it."

## How do shadcn/ui and Panelo UI split them?

shadcn/ui puts raw colors in `:root` and `.dark` and maps them in one `@theme inline` block. Its theming docs show the pattern for a new token:

```css
:root {
  --warning: oklch(0.84 0.16 84);
}
.dark {
  --warning: oklch(0.41 0.11 46);
}
@theme inline {
  --color-warning: var(--warning);
}
```

Every `--color-*` entry is a pointer to a plain variable, which is exactly the case `inline` is for.

If you need status colours like this `--warning`, Panelo UI's free [`panelo-theme`](https://www.paneloui.com/r/panelo-theme.json) adds `--success`, `--warning` and `--info` in this exact shape, so you can install them instead of writing each block by hand.

Panelo UI's `styles/theme.css` uses both, and its header comment states the layering:

```css
/*
 *   @theme { ... }     primitives + ramp overrides → Tailwind utilities
 *   :root { ... }      semantic tokens (light mode) — reference primitives
 *   .dark { ... }      semantic overrides (dark mode) — landed when designed
 *   @theme inline {..} re-export of semantic tokens so they become utilities
 */
```

Primitives like `--color-neutral-925: #121212` and the `--color-accent-*` ramp sit in plain `@theme`, so they stay overridable. A comment notes that the whole interface "re-tints by overriding these eleven variables." Semantic tokens such as `--color-text-primary` are set in `:root` and `.dark`, then re-exported with `@theme inline`.

For more on why the semantic layer exists at all, see [semantic color tokens in Tailwind CSS v4](/blog/tailwind-semantic-color-tokens).

## Is a self-referencing @theme inline variable safe?

Panelo's re-export block looks odd at first:

```css
@theme inline {
  --color-text-primary: var(--color-text-primary);
}
```

shadcn/ui's own site CSS does the same with `--font-sans: var(--font-sans)`. In our 4.3.5 build this compiles to `.text-text-primary { color: var(--color-text-primary); }`, which reads whatever `:root` or `.dark` sets. Tailwind also emits `--color-text-primary: var(--color-text-primary)` on `:root, :host` inside its `theme` cascade layer. That line refers to itself, but your unlayered `:root` rule beats anything in a layer, so it never takes effect.

It is safe as long as the real value is always declared outside the layer. If you delete the `:root` line, the variable becomes invalid and the text falls back to its inherited color, without any build error. Using a different name for the raw variable (`--warning` vs `--color-warning`, as shadcn/ui does for colors) avoids the question.

## What other @theme options exist?

- **`@theme static`**: "By default only used CSS variables will be generated in the final CSS output." `static` emits all of them, which helps if JavaScript or inline styles read variables no class uses.
- **Namespace resets**: `--color-*: initial;` inside `@theme` removes the default palette, and only your colors generate utilities.
- **Options combine**: you can have several `@theme` and `@theme inline` blocks in one project, as discussion #18560 notes.

One rule applies to all of them: theme variables "are also required to be defined top-level and not nested under other selectors or media queries." Put light and dark values in plain `:root` and `.dark` rules, never in a `@theme` nested inside `.dark`.

## How does the opacity modifier behave with each?

Both support `bg-brand/50`. Tailwind v4.3.5 emits `color-mix(in oklab, ... 50%, transparent)` inside an `@supports` block either way. The fallback differs:

- A literal `@theme` color gets a precomputed fallback: `color-mix(in srgb, #3392ff 50%, transparent)`.
- An `inline` pointer gets `background-color: var(--brand)` as the fallback, which is the color at full opacity.

Tailwind CSS v4 targets Safari 16.4+, Chrome 111+ and Firefox 128+, so most users get the `color-mix` path. It only matters if you serve older browsers.

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the theme:

```bash
npx shadcn@latest add @panelo/panelo-theme
```

The shadcn CLI writes its light values into `:root`, its dark values into `.dark`, and entries like `--color-success: var(--success)` into `@theme inline`. That covers status colours (success, warning, info), six tonal pill colours, a hairline and two AI gradient stops. The raw variables use different names from the `--color-*` tokens, which is the option the self-referencing section above calls safer.

See it live: every free item in the [Panelo UI catalogue](https://www.paneloui.com/components) installs `panelo-theme` as a dependency. [Revenue Lines](https://www.paneloui.com/components/revenue-chart), for example, colours a rising change with `text-success`, which has its own light and dark value.

For a whole page on the same tokens, the [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) in Panelo Pro has revenue, orders and new-customer stat cards, bar sparklines, and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### What is @theme inline in Tailwind CSS?
It is an option on the `@theme` directive that makes generated utilities contain the theme variable's value instead of a reference to the theme variable. It is meant for theme variables that point at other CSS variables.

### Should I use @theme or @theme inline for dark mode?
Put light and dark values in `:root` and `.dark`, then map them with `@theme inline { --color-x: var(--x); }`. Or put literal values in plain `@theme` and override the same variable in `.dark`. Don't put literal values in `@theme inline` and override them.

### Why aren't my @theme inline colors changing in dark mode?
The literal value was baked into the utility, so nothing reads the variable you override. Move the value to `:root` under a separate name and point the inline token at it, or switch to plain `@theme`.

### Can I use @theme and @theme inline together?
Yes. Many projects use `@theme` for literal primitives and `@theme inline` for semantic tokens that point at `:root` and `.dark` variables.

### Can I nest @theme inside .dark or a media query?
No. The docs say theme variables must be defined top-level. Put mode-specific values in regular `.dark` rules instead.

Panelo UI's dashboard components and charts ship light and dark themes from one token set and install with the shadcn CLI. Browse them on [the components page](/components), or read the full token architecture in [design tokens in Tailwind CSS v4](/blog/design-tokens-tailwind-v4). If dark mode still won't flip, work through [Tailwind v4 dark mode not working](/blog/tailwind-v4-dark-mode-not-working).

## Sources

- Tailwind CSS theme variables docs (inline, static, namespaces, top-level rule): https://tailwindcss.com/docs/theme
- Tailwind CSS colors docs: https://tailwindcss.com/docs/colors
- Tailwind CSS upgrade guide (browser targets): https://tailwindcss.com/docs/upgrade-guide
- GitHub discussion #17826, "Use of @theme and @theme inline" (answer by Adam Wathan): https://github.com/tailwindlabs/tailwindcss/discussions/17826
- GitHub discussion #18560, "v4 @theme vs. @theme inline": https://github.com/tailwindlabs/tailwindcss/discussions/18560
- shadcn/ui theming docs: https://ui.shadcn.com/docs/theming
- shadcn/ui Tailwind v4 docs: https://ui.shadcn.com/docs/tailwind-v4
- shadcn/ui site CSS (self-referencing `--font-sans`): https://github.com/shadcn-ui/ui/blob/main/apps/v4/app/globals.css
- MDN, using CSS custom properties (inheritance, invalid var() substitution): https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
