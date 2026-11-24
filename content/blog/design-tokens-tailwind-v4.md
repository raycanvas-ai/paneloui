---
title: "Design Tokens in Tailwind CSS v4: Primitive to Component"
description: "How design tokens work in Tailwind CSS v4: @theme namespaces, primitive, semantic and component tiers, dark mode, type styles, and keeping JavaScript in sync."
slug: design-tokens-tailwind-v4
primaryKeyword: design tokens tailwind v4
secondaryKeywords:
  - tailwind v4 design tokens
  - tailwind css design tokens
  - design tokens css variables
  - tailwind v4 theme variables
  - what are design tokens
intent: informational
cluster: Tailwind v4 (pillar)
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1986
cta:
  free: [panelo-theme]
  pro: [dashboard-pages-3]
---

# Design tokens in Tailwind CSS v4

In Tailwind CSS v4, design tokens are CSS variables declared in `@theme`. Each namespace, such as `--color-*` or `--radius-*`, generates utility classes and is also a runtime CSS variable. A scalable setup uses three tiers: primitives in `@theme`, semantic roles in `:root` and `.dark` exposed with `@theme inline`, and a few component tokens.

> **Skip the build:** [panelo-theme](https://www.paneloui.com/r/panelo-theme.json) is a free, MIT-licensed shadcn/ui theme item, not a component: a ready semantic tier of 36 color tokens (status colors, six tonal pill hues, a hairline and an AI gradient pair) with light values, dark overrides and `--color-*` mappings, packaged so the shadcn CLI can install it into any project. It extends shadcn/ui's own tokens rather than replacing them. Add it with `npx shadcn@latest add @panelo/panelo-theme` ([registry setup](#get-this-working-in-your-app)), then change anything: the values are written into your own CSS.

## What is a design token?

A design token is a named design decision: a color, a size, a radius, a shadow, a duration. Code uses the name, not the value, so changing the value in one place updates every use.

The idea is old and now has a formal format. The W3C Design Tokens Community Group published its first stable specification, version 2025.10, on October 28, 2025. It defines a JSON format for exchanging tokens between tools; the group notes it is not a W3C Standard. Tailwind's docs describe tokens only as CSS, so if your source of truth is DTCG JSON or a design tool, you generate the CSS from it in a build step.

## How did Tailwind CSS v4 change design tokens?

Two changes, both from the v4.0 release post.

**Tokens moved from JavaScript to CSS.** "Instead of a `tailwind.config.js` file, you can configure all of your customizations directly in the CSS file where you import Tailwind." The upgrade guide adds that JavaScript config files "are no longer detected automatically in v4."

**Every token is a runtime variable.** "Tailwind CSS v4.0 takes all of your design tokens and makes them available as CSS variables by default, so you can reference any value you need at run-time using just CSS."

```css
@import "tailwindcss";

@theme {
  --color-avocado-500: oklch(0.84 0.18 117.33);
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 1920px;
}
```

That block gives you `bg-avocado-500`, `font-display` and a `3xl:` variant, plus `var(--color-avocado-500)` for custom CSS, inline styles or chart libraries.

## Which token namespaces does Tailwind v4 understand?

The prefix decides which utilities a token creates. A selection from the theme docs:

| Namespace | Creates | Example token | Example class |
|---|---|---|---|
| `--color-*` | All color utilities | `--color-brand` | `bg-brand`, `text-brand` |
| `--font-*` | Font family | `--font-sans` | `font-sans` |
| `--text-*` | Font size (plus optional line height, tracking, weight) | `--text-body-medium` | `text-body-medium` |
| `--font-weight-*` | Font weight | `--font-weight-book` | `font-book` |
| `--radius-*` | Border radius | `--radius-2lg` | `rounded-2lg` |
| `--shadow-*` | Box shadow | `--shadow-card` | `shadow-card` |
| `--spacing` / `--spacing-*` | Spacing and sizing | `--spacing: 0.25rem` | `p-4`, `gap-2` |
| `--breakpoint-*` | Responsive variants | `--breakpoint-3xl` | `3xl:grid-cols-4` |
| `--ease-*`, `--animate-*` | Motion | `--ease-snappy` | `ease-snappy` |

Three rules follow from this:

1. A variable outside these namespaces in `@theme` creates no utility. `--brand` or `--colors-brand` produce nothing.
2. A variable in plain `:root` is a regular CSS variable. The docs: use `@theme` "when you want a design token to map directly to a utility class, and use `:root` for defining regular CSS variables that shouldn't have corresponding utility classes."
3. Only used variables are emitted by default. `@theme static` emits all of them.

If a custom color doesn't generate a class, one of these rules is usually why. [Tailwind v4 custom colors not working](/blog/tailwind-v4-custom-colors-not-working) lists the rest.

## What are the three tiers of tokens?

Most mature systems separate tokens by how specific they are. Here is how the tiers map onto Tailwind CSS v4, with examples from Panelo UI's `styles/theme.css`.

| Tier | Answers | Lives in | Example |
|---|---|---|---|
| Primitive | "What values exist?" | `@theme` | `--color-neutral-925: #121212;` |
| Semantic | "What is this value for?" | `:root`, `.dark`, then `@theme inline` | `--color-text-secondary: var(--color-neutral-500);` |
| Component | "What does this one component use?" | `:root` or `@theme` | `--color-chart-1: var(--color-teal-400);` |

### Tier 1: primitives

Primitives are the raw palette and scales. Tailwind CSS v4 ships a full set, so most projects only override or add. Panelo keeps Tailwind's defaults and adds a few values from its Figma variables:

```css
@theme {
  --color-neutral-925: #121212;
  --radius-2lg: 10px;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}
```

The `--color-accent-*` ramp is also a primitive, but an indirect one: each step points at a blue step, and a comment explains that "the whole system re-tints by overriding these eleven variables." Interactive states read `accent-*`, not `blue-*`, so a rebrand touches eleven lines.

Want only your own palette? `--color-*: initial;` removes Tailwind's defaults; then declare yours.

### Tier 2: semantic tokens

Semantic tokens are roles: primary text, secondary surface, error border, focus ring. They are where light and dark mode differ, so their values live in `:root` and `.dark`, and `@theme inline` turns them into utilities:

```css
:root {
  --color-text-primary: var(--color-neutral-950);
}
.dark {
  --color-text-primary: var(--color-neutral-50);
}
@theme inline {
  --color-text-primary: var(--color-text-primary);
}
```

This is the tier components should use almost exclusively. Panelo's project rules make that a hard rule: "Never use raw palette classes (`text-gray-500`, `bg-white`, `border-neutral-200`) or hex/oklch literals." Why the mapping uses `inline` is in [@theme vs @theme inline](/blog/tailwind-theme-vs-theme-inline).

Sharing this tier across several projects is the awkward part, and a shadcn registry item is one answer: the free [panelo-theme](https://www.paneloui.com/r/panelo-theme.json) item stores its semantic tokens as `cssVars` with `light`, `dark` and `theme` keys (`"color-success": "var(--success)"`), and the shadcn CLI merges them into each project's CSS.

### Tier 3: component tokens

Some values belong to one component family. Charts are the common case: a series color has no meaning outside a chart. Panelo defines `--color-chart-1` through `--color-chart-9`, each with an `-active` variant for hover, plus `chart-track` and `chart-cursor`. Its theme file explains the numbering: "Numbered (not hue-named) so the palette can be retuned without renaming."

Component tokens should still point at primitives or semantic tokens, never at literals, so a palette change flows through. Keep the tier small. If a component token is used by two unrelated components, it's a semantic token.

## How do typography tokens work?

Font size tokens can carry their own line height, letter spacing and weight. The font-size docs show the pattern:

```css
@theme {
  --text-tiny: 0.625rem;
  --text-tiny--line-height: 1.5rem;
  --text-tiny--letter-spacing: 0.125rem;
  --text-tiny--font-weight: 500;
}
```

`text-tiny` then sets all four. Panelo UI builds its entire type ramp this way: 13 families from `large-title` to `caption-2`, each in four weights, such as `text-title-1-medium` or `text-body-regular`. One class per text style keeps type consistent and stops people stacking `text-sm font-medium leading-5`.

There is one catch. tailwind-merge doesn't read your CSS, so it treats an unknown `text-*` class as a color and can drop it when a real color follows. [tailwind-merge custom classes](/blog/tailwind-merge-custom-classes) shows the fix.

## How do tokens handle dark mode and multiple themes?

Only semantic tokens change between modes, so dark mode is a second block of values:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

With that variant and a `.dark` block for your semantic tokens, components need no `dark:` prefixes. If it doesn't flip, [Tailwind v4 dark mode not working](/blog/tailwind-v4-dark-mode-not-working) has the checklist.

More themes work the same way: one selector per theme, such as `[data-theme="ocean"]`, redefining the same semantic tokens. The `@theme inline` mapping matters here, because it makes utilities resolve on the element, so nested theme scopes work.

## Which color format should tokens use?

Any format works. Tailwind's default palette is in OKLCH, shadcn/ui's theme is in OKLCH, and opacity modifiers like `bg-brand/50` work with every format because v4 uses `color-mix()`. OKLCH is easier to tune because its lightness value is perceptual; hex is fine for fixed brand values. Panelo mixes both at the primitive tier, and nothing above it notices. [Why shadcn/ui uses OKLCH](/blog/why-shadcn-uses-oklch) covers the trade-offs.

## How do I use tokens from JavaScript?

Because every token is a CSS variable, you rarely need a JavaScript copy:

- **Inline styles and SVG:** `fill="var(--color-chart-1)"` or `style={{ color: "var(--color-text-secondary)" }}`.
- **Animation libraries** that accept CSS variables, as the release post notes for Motion.
- **Measured values:** `getComputedStyle(document.documentElement).getPropertyValue("--color-chart-1")` when a library needs a resolved string, such as a canvas renderer.

If you do keep a JavaScript copy, generate it from the CSS rather than writing it twice.

## What mistakes break a token system?

| Mistake | Symptom | Fix |
|---|---|---|
| Tokens in `tailwind.config.js` | No utilities in v4 | Move them to `@theme` |
| Literal values in `@theme inline`, overridden in `.dark` | Dark mode doesn't change | Point inline tokens at variables |
| Raw palette classes in components | Dark mode and rebrands miss spots | Lint for them; use semantic tokens |
| Wrong prefix (`--clr-*`) | Class not generated | Use the documented namespace |
| Theme variables nested in a selector | Values don't apply as expected | Keep `@theme` top-level; the docs require it |

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

You get its semantic tier in your CSS next to shadcn/ui's, ready to rename or retune. Every free Panelo block lists `panelo-theme` as a dependency, so installing a block brings it along. See it live: the free [Home Care Schedule](https://www.paneloui.com/components/dashboard-pages-13) marks at-risk visits with `bg-tone-orange-bg`, `text-tone-orange-fg` and `ring-tone-orange-border`, and the free [Revenue Lines](https://www.paneloui.com/components/revenue-chart) chart draws its series with the `chart-1` component token.

Panelo UI is a set of dashboard components, charts and pages for shadcn/ui that follow this token model and ship light and dark themes. Browse [the components](/components) to see the tiers in working code.

Next step: [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3), a Panelo Pro page with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Like every Panelo item, the whole page ships light and dark from the same tokens. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### What are design tokens in Tailwind CSS v4?
They are CSS variables declared in `@theme`, like `--color-brand` or `--radius-card`. Tailwind generates utilities from them and also emits them as CSS variables you can use at runtime.

### Does Tailwind v4 still use tailwind.config.js for tokens?
Not by default. Tokens live in CSS with `@theme`. A JavaScript config can still be loaded with the `@config` directive for backward compatibility.

### What's the difference between @theme and :root?
`@theme` variables create utility classes and are emitted as CSS variables. `:root` variables are plain CSS variables with no utilities. Use `:root` and `.dark` for values that change per mode, mapped through `@theme inline`.

### Should I use primitive or semantic tokens in components?
Semantic tokens. Primitives describe the palette; semantic tokens describe purpose and change correctly between light and dark mode.

### Can Tailwind v4 read design tokens from Figma or JSON?
Not directly. Tailwind reads CSS, so export or generate CSS variables from your tool or from DTCG JSON, then place them in `@theme`, `:root` and `.dark`.

## Sources

- Tailwind CSS v4.0 release post (CSS-first config, tokens as CSS variables): https://tailwindcss.com/blog/tailwindcss-v4
- Tailwind CSS theme variables docs (namespaces, `:root` vs `@theme`, `static`, top-level rule): https://tailwindcss.com/docs/theme
- Tailwind CSS font-size docs (`--text-*` sub-properties): https://tailwindcss.com/docs/font-size
- Tailwind CSS colors docs: https://tailwindcss.com/docs/colors
- Tailwind CSS dark mode docs: https://tailwindcss.com/docs/dark-mode
- Tailwind CSS upgrade guide (`@config`, JS config not auto-detected): https://tailwindcss.com/docs/upgrade-guide
- W3C Design Tokens Community Group, first stable specification: https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/
- Design Tokens Format Module 2025.10: https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/
- shadcn/ui theming docs: https://ui.shadcn.com/docs/theming
- tailwind-merge configuration docs: https://github.com/dcastil/tailwind-merge/blob/main/packages/tailwind-merge/docs/configuration.md
