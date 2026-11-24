---
title: "Tailwind Semantic Colors: A v4 Token Setup That Scales"
description: "How to set up semantic color tokens in Tailwind CSS v4: primitives in @theme, roles in :root and .dark, @theme inline mapping, naming rules, no dark: prefixes."
slug: tailwind-semantic-color-tokens
primaryKeyword: tailwind semantic colors
secondaryKeywords:
  - semantic color tokens
  - tailwind css semantic colors
  - semantic color tokens design system
  - what are semantic tokens
  - tailwind v4 theme colors
intent: informational
cluster: Tailwind v4
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1763
cta:
  free: [panelo-theme]
  pro: [dashboard-pages-3]
---

# Semantic color tokens in Tailwind CSS v4

Semantic color tokens name a color by its job, like `text-secondary` or `border-error`, instead of its value, like `gray-500`. In Tailwind CSS v4 you keep raw palette values in `@theme`, assign roles in `:root` and `.dark`, and expose the roles as utilities with `@theme inline`. Components then use only role classes, and dark mode needs no `dark:` prefixes.

> **Skip the build:** [panelo-theme](https://www.paneloui.com/r/panelo-theme.json) is a free, MIT-licensed shadcn/ui theme item, not a component: 36 semantic color tokens that extend shadcn/ui's set with status roles (`success`, `warning`, `info`, each with `-solid` and `-foreground`), six tonal pill hues (`-bg`, `-border`, `-fg`, `-solid`), a hairline and an AI gradient pair. Values sit in `:root` and `.dark` and are mapped to utilities, which is steps 2 and 3 of the setup below. Add it with `npx shadcn@latest add @panelo/panelo-theme` ([registry setup](#get-this-working-in-your-app)), then change anything: the values are written into your own CSS.

## What is the difference between a primitive and a semantic token?

A primitive says what a color is. A semantic token says what it's for.

| | Primitive | Semantic |
|---|---|---|
| Example name | `--color-neutral-500` | `--color-text-secondary` |
| Value | `oklch(55.6% 0 none)` | `var(--color-neutral-500)`, free to point elsewhere in dark |
| Changes in dark mode? | No | When it needs to |
| Who picks it | The design system | Every component author |
| Class in markup | `text-neutral-500` | `text-text-secondary` |

Tailwind's default palette is a primitive set: in v4.3 it has 26 hues by 11 steps, all defined in `oklch()`. It is a good base and a bad thing to scatter through components, because `text-gray-500` encodes a decision ("this gray") that should have been a role ("secondary text").

shadcn/ui is the most widespread semantic setup in the Tailwind world. Its theming docs describe the convention: "The base token controls the surface color and the `-foreground` token controls the text and icon color," and "Tailwind maps these tokens into utilities like `bg-background`, `text-foreground`, `border-border`, and `ring-ring`."

## Why bother with semantic colors?

Three practical wins, in the order you notice them:

1. **Dark mode becomes a CSS change.** A token like `--color-text-secondary` is redefined under `.dark`. No component needs `dark:text-neutral-400` next to `text-neutral-500`.
2. **Rebrands are one file.** Changing the accent hue means changing what `--color-accent-500` points at, not finding every `blue-600`.
3. **Decisions are visible.** A reviewer reading `border-border-error-default` knows the intent. Reading `border-red-500`, they don't know if it's an error, a delete button or a chart series.

The cost is upfront naming work and a token list someone has to own. For a landing page with one theme, primitives are fine. For an app with dark mode, multiple products or contributors, the token layer pays for itself quickly.

## How do I set up semantic tokens in Tailwind v4?

Three blocks, in this order.

**Step 1. Primitives in `@theme`.** Keep Tailwind's palette and override only what your brand needs.

```css
@import "tailwindcss";

@theme {
  --color-neutral-925: #121212;
  --color-accent-500: var(--color-blue-500);
}
```

**Step 2. Roles in `:root` and `.dark`, pointing at primitives.**

```css
:root {
  --color-text-primary: var(--color-neutral-950);
  --color-text-secondary: var(--color-neutral-500);
  --color-background-primary-default: var(--color-white);
  --color-border-error-default: var(--color-red-500);
}

.dark {
  --color-text-primary: var(--color-neutral-50);
  --color-background-primary-default: var(--color-neutral-800);
}
```

**Step 3. Expose the roles as utilities with `@theme inline`.**

```css
@theme inline {
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-background-primary-default: var(--color-background-primary-default);
  --color-border-error-default: var(--color-border-error-default);
}
```

Then add the class-based variant so `.dark` takes over from the OS setting:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

These snippets are lifted from Panelo UI's `styles/theme.css`, trimmed to four tokens. Note that `.dark` doesn't redefine `--color-text-secondary` or the error border in this excerpt; a role only needs a dark value when the light one doesn't work on dark surfaces.

Why `@theme inline` and not plain `@theme` for step 3? Inline makes the utility read the variable on the element itself, so nested theme scopes work. Plain `@theme` with literal values is fine too, but `@theme inline` with literal values breaks dark mode. [@theme vs @theme inline](/blog/tailwind-theme-vs-theme-inline) walks through the compiled output for each.

Prefer separate names for raw values (shadcn/ui uses `--warning` for the value and `--color-warning` for the token)? That works the same and avoids self-referencing lines. Pick one style and keep it. The free [panelo-theme](https://www.paneloui.com/r/panelo-theme.json) item uses the separate-names style throughout, with a different value per mode, such as `--success: oklch(0.52 0.13 150)` in `:root`, `oklch(0.78 0.15 152)` in `.dark`, and `--color-success: var(--success)` for the utility.

## How should I name semantic color tokens?

There are two proven styles. Both are fine; mixing them is not.

| | shadcn/ui style | Property-first style (Panelo UI) |
|---|---|---|
| Shape | `role` + `role-foreground` | `property-role-state` |
| Examples | `bg-primary text-primary-foreground`, `bg-muted text-muted-foreground` | `text-text-secondary`, `bg-background-secondary-hover`, `border-border-button-default` |
| Token count | Small, about 30 colors | Large, every state named |
| Strength | Easy to learn, every shadcn/ui component reads it | Hover, active, disabled and error states are tokens, not guesses |
| Weakness | States are left to opacity tricks or ad hoc classes | Long names, doubled words like `text-text-primary` |

Rules that hold for either:

- **Name the role, never the hue.** `--color-danger` survives a palette change; `--color-red` doesn't.
- **Pair surfaces with their content.** Every background a component can sit on needs a text or foreground token that passes contrast on it, in both modes.
- **Number series that have no meaning.** Panelo's chart tokens follow the numbered `chart-N` convention shadcn/ui also uses (Panelo goes from `chart-1` to `chart-9`). A comment in its theme file gives the reason: "Numbered (not hue-named) so the palette can be retuned without renaming."
- **Give interaction states their own tokens** when your design specifies them. `background-primary-hover` is clearer than `hover:bg-neutral-100/80` scattered around.

## How do I stop raw palette classes creeping back in?

Tokens only help if people use them. Panelo UI writes the rule into its AGENTS.md, which coding agents and humans both read:

> Never use raw palette classes (`text-gray-500`, `bg-white`, `border-neutral-200`) or hex/oklch literals. Every color rides a Panelo semantic token, which also makes dark mode automatic.

The same file names the approved tokens for text, surfaces, borders, icons and charts, and adds: "Do not write `dark:` overrides with raw colors; if a token pair looks wrong in dark mode, pick a different token, not a literal." If you want agents to follow your tokens, see [AGENTS.md for design systems](/blog/agents-md-design-system).

A cheap check in CI catches the rest:

```bash
grep -rnE "(text|bg|border)-(gray|slate|zinc|neutral|white|black|red|blue)(-[0-9]+)?\b" components/ \
  && echo "Raw palette class found" && exit 1 || true
```

Adjust the hue list to your palette. It's crude, but it turns a style rule into a failing build.

## Do semantic tokens work with opacity and arbitrary values?

Yes. Tokens are ordinary `--color-*` theme variables, so every color utility and modifier works:

- `bg-background-primary-default/50` compiles to a `color-mix(in oklab, ...)` with 50% transparency.
- `ring-border-focus-ring`, `fill-chart-1`, `decoration-text-error-primary` all exist automatically.
- In custom CSS, read the variable directly: `color: var(--color-text-secondary);`.

The opacity modifier is handy for one-off tints. If you find yourself using the same `/10` tint in many places, that tint deserves its own token.

## What about tailwind-merge?

Custom color names merge correctly by default, because tailwind-merge accepts any value after `text-`, `bg-` or `border-` as a color. `cn("text-text-secondary", "text-text-primary")` returns `text-text-primary`. The trouble starts with custom font sizes in the same `text-*` space. If you add composite text styles, read [tailwind-merge custom classes](/blog/tailwind-merge-custom-classes) before you ship.

## How do I check contrast in both modes?

Each surface and content pair needs checking twice, once per mode. WCAG 2.2 asks for at least 4.5:1 for body text and 3:1 for large text and UI component boundaries. Lightness steps in OKLCH are perceptually even, which makes it easier to predict which pairs pass, but you still need to measure. Browser DevTools show the contrast ratio in the color picker for any text element.

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

It adds roles on top of shadcn/ui's own tokens, so `bg-primary` and `text-muted-foreground` keep working next to `text-success` and `bg-tone-violet-bg`. Every free Panelo block lists it as a dependency, so installing a block brings it along.

See it live: the free [Home Care Schedule](https://www.paneloui.com/components/dashboard-pages-13) marks at-risk visits with `bg-tone-orange-bg`, `text-tone-orange-fg` and `ring-tone-orange-border`, and the free [Revenue Lines](https://www.paneloui.com/components/revenue-chart) chart colors its period change with `text-success`.

Panelo UI's free charts, login pages and dashboard pages read their interface colors from tokens, so they follow your theme in light and dark. Browse them on [the components page](/components), and see the full token architecture in [design tokens in Tailwind CSS v4](/blog/design-tokens-tailwind-v4).

Next step: [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3), a Panelo Pro page with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart, applies the same token approach to a full page in light and dark. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### What are semantic color tokens?
They are named colors that describe a purpose, like `text-secondary` or `background-error`, and point at a raw palette value. The value can change per theme while the name used in components stays the same.

### Does Tailwind v4 have built-in semantic colors?
No. The default palette is primitive (`red-500`, `neutral-200`). You add semantic tokens yourself with `@theme`, or get a starter set from shadcn/ui's theme.

### Should semantic tokens go in @theme or :root?
Put the values in `:root` and `.dark`, since they change per mode, and register them as utilities in `@theme inline`. Keep raw primitives in plain `@theme`.

### Do I still need dark: classes with semantic tokens?
Rarely. When every color is a token redefined under `.dark`, components switch automatically. Keep `dark:` for things tokens can't express, like swapping an image.

### How many semantic color tokens should a design system have?
Enough that nobody reaches for a raw palette class. shadcn/ui ships about 30 color tokens; systems that name every interaction state have many more. Start small and add a token when two components need the same role.

## Sources

- Tailwind CSS colors docs (default palette, `--color-*` namespace, opacity): https://tailwindcss.com/docs/colors
- Tailwind CSS theme variables docs (`@theme`, `inline`): https://tailwindcss.com/docs/theme
- Tailwind CSS dark mode docs (`@custom-variant dark`): https://tailwindcss.com/docs/dark-mode
- Tailwind CSS v4.0 release post (oklch palette): https://tailwindcss.com/blog/tailwindcss-v4
- shadcn/ui theming docs (background/foreground convention, adding tokens): https://ui.shadcn.com/docs/theming
- tailwind-merge configuration docs: https://github.com/dcastil/tailwind-merge/blob/main/packages/tailwind-merge/docs/configuration.md
- W3C, WCAG 2.2 contrast (minimum) and non-text contrast: https://www.w3.org/TR/WCAG22/#contrast-minimum
