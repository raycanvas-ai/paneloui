---
title: "Tailwind v4 Dark Mode Not Working? 8 Causes, in Order"
description: "Tailwind CSS v4 dark mode not working with a .dark class or next-themes? Check these 8 causes in order, from a missing @custom-variant to cascade layers."
slug: tailwind-v4-dark-mode-not-working
primaryKeyword: tailwind v4 dark mode not working
secondaryKeywords:
  - tailwind 4 dark mode not working
  - custom variant dark not working
  - shadcn dark mode not working
  - tailwind v4 dark mode class
  - next themes tailwind v4
intent: informational
cluster: Tailwind v4
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 2034
cta:
  free: [panelo-theme, revenue-chart]
  pro: [dashboard-pages-3]
---

# Tailwind v4 dark mode not working? Check these 8 causes

In Tailwind CSS v4, `dark:` follows the operating system's `prefers-color-scheme` by default, so a `.dark` class does nothing until you add `@custom-variant dark (&:where(.dark, .dark *));` to your CSS. If that line is there, the usual culprits are a `tailwind.config.js` that v4 ignores, next-themes writing `data-theme` instead of a class, or tokens that never flip.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) is a free, MIT-licensed shadcn/ui block that makes a known-good test for your setup: it uses no `dark:` classes, only shadcn/ui token classes like `text-chart-1` and `bg-popover`, so it flips when your theme tokens change, whether or not your `dark:` variant works. Add it with `npx shadcn@latest add @panelo/revenue-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## How do I find the cause quickly?

Toggle dark mode, then open DevTools and answer three questions:

1. Is `class="dark"` (or your attribute) actually on `<html>`?
2. Does the compiled CSS contain `.dark\:bg-black:where(.dark, .dark *)` or `@media (prefers-color-scheme: dark)`?
3. On an element that should change, which rule wins in the Styles panel, and from which layer?

Then work down the list below. The causes are ordered by how often they come up.

## 1. Is the dark variant still media-query based?

This is the cause in most v4 migrations. The Tailwind docs say the `dark` variant "uses the `prefers-color-scheme` CSS media feature" by default. We compiled `dark:bg-black` with Tailwind CSS v4.3.5 and no custom variant:

```css
@media (prefers-color-scheme: dark) {
  .dark\:bg-black {
    background-color: var(--color-black);
  }
}
```

No class selector anywhere. Your toggle adds `.dark`, and nothing listens. Add the override from the docs right after the import:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Now the same class compiles to `.dark\:bg-black:where(.dark, .dark *)`. If you prefer an attribute, the docs give `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`.

## 2. Is Tailwind ignoring your tailwind.config.js?

`darkMode: "class"` or `darkMode: "selector"` in a v3 config does nothing on its own in v4. The upgrade guide is direct: JavaScript config files "are no longer detected automatically in v4." You can load one with `@config "../../tailwind.config.js";`, but for dark mode the CSS-first `@custom-variant` line is the v4 way. Delete the dead config key so nobody trusts it later.

## 3. Does your selector match where the class lives?

Two selectors are in common use and they behave differently:

| Variant | Matches `<html class="dark">` itself? | Matches descendants? | Adds specificity? |
|---|---|---|---|
| `&:where(.dark, .dark *)` (Tailwind docs) | Yes | Yes | No (`:where` is zero) |
| `&:is(.dark *)` (shadcn/ui default) | No | Yes | Yes, one class |

With shadcn/ui's `&:is(.dark *)`, a `dark:` class on the `<html>` element itself never applies, because `<html>` has no `.dark` ancestor. Put the class on `<html>` and style its children, or switch to the docs' version.

Also check where the class is. If you put `.dark` on a wrapper `<div>` instead of `<html>`, anything rendered in a portal (dialogs, popovers, toasts) usually mounts at the end of `<body>`, outside the wrapper, and stays light.

## 4. Is next-themes writing a data attribute instead of a class?

next-themes is the most common toggle in Next.js apps, and its default does not match Tailwind's class variant. Its README lists `attribute = 'data-theme'` as the default and says "If you set the attribute of your Theme Provider to class... next-themes will modify the `class` attribute on the `html` element."

```tsx
// app/providers.tsx
"use client";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}
```

Either set `attribute="class"`, or keep `data-theme` and use the attribute version of `@custom-variant`. Both work. Mixing them doesn't.

## 5. Do your tokens actually change in .dark?

If you follow the token pattern (and you should, see [semantic color tokens](/blog/tailwind-semantic-color-tokens)), components contain no `dark:` classes at all. Dark mode works only if the variables they read are redefined under `.dark`.

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

Common slips: a token added to `:root` but never to `.dark`, a typo in the name in one of the two blocks, or a component using a raw palette class like `bg-white` that has no reason to flip. Search your components for raw palette classes; each one is a spot dark mode can't reach.

If the slip is a token you never defined, such as a success or warning colour, Panelo UI's free [`panelo-theme`](https://www.paneloui.com/r/panelo-theme.json) adds `--success`, `--warning` and `--info` with a light and a dark value each, in this same `:root`, `.dark` and `@theme inline` layout.

## 6. Did @theme inline bake a literal value into the utility?

If you put a literal color in `@theme inline` and override it in `.dark`, the override is ignored. In our v4.3.5 build, `@theme inline { --color-surface: #ffffff; }` produced `.bg-surface { background-color: #ffffff; }`. The utility no longer reads the variable, so `.dark { --color-surface: #111111; }` changes nothing.

Fix: keep literals in `:root` and `.dark` under their own names and point `@theme inline` at them, or use plain `@theme` and override the same variable. The full explanation, with compiled output, is in [@theme vs @theme inline](/blog/tailwind-theme-vs-theme-inline).

## 7. Is a cascade layer hiding your .dark rule?

Tailwind v4 uses native cascade layers (`theme`, `base`, `components`, `utilities`). Styles outside any layer beat styles inside one, whatever the selector specificity.

So this v3-era leftover fails:

```css
:root {
  --background: oklch(1 0 0);
}

@layer base {
  .dark {
    --background: oklch(0.145 0 0); /* loses to the unlayered :root */
  }
}
```

shadcn/ui's Tailwind v4 guide tells you to "Move `:root` and `.dark` out of the `@layer` base." Keep both blocks at the same level, both unlayered, with `.dark` after `:root`.

## 8. Is it a flash, not a failure?

If dark mode works after a moment but the page loads light first, the class is being added after the first paint. Tailwind's docs recommend setting it with a small script "inline in `head` to avoid FOUC":

```js
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches),
);
```

next-themes injects an equivalent script for you. Because that script edits `<html>` before React hydrates, add `suppressHydrationWarning` to `<html>`. The next-themes README notes it "only applies one level deep."

## Why are scrollbars and form inputs still light?

Sometimes every Tailwind class flips but the page still looks half light: white scrollbars, a bright date picker, light checkboxes. Those are drawn by the browser, not by your CSS. The browser picks their colors from the `color-scheme` property, and a `.dark` class does not set it.

Set it next to your tokens:

```css
html {
  color-scheme: light;
}
html.dark {
  color-scheme: dark;
}
```

Tailwind v4 also has utilities for it. The docs list `scheme-light`, `scheme-dark`, `scheme-light-dark` and others, and show `<html class="scheme-light dark:scheme-dark">` for a class-based toggle. With next-themes, check the `enableColorScheme` prop. Its README says it defaults to `true` and tells browsers "which color scheme is used (dark or light) for built-in UI like inputs and buttons."

## Still stuck? A five-minute checklist

If none of the eight causes matched, run these checks on the element that stays light:

1. **Compute, don't read.** In the Computed tab, look at the final `background-color`. If it is a variable, open it and see which rule set it. A token can resolve to the light value even when `.dark` is present, because another rule wins.
2. **Check the build, not the source.** Search the CSS your browser actually loaded for `:where(.dark`. If the dev server serves an old file, restart it.
3. **Look for inline styles.** A `style` attribute with a hard-coded color beats every class. Charts and third-party widgets often set one.
4. **Check for a second Tailwind entry.** Two CSS files that each `@import "tailwindcss"` can each carry a different dark variant. Only one of them may have the `@custom-variant` line.
5. **Try a single test class.** Add `dark:bg-red-500` to `<body>`. If it turns red, the variant works and the problem is your tokens. If not, go back to causes 1 to 4.

## What does a working setup look like?

Panelo UI's codebase is a compact reference. `styles/globals.css` declares the variant once, under a comment that sets the rule for the whole project (trimmed here):

```css
/* Components should NOT use `dark:` prefixes directly. */
@custom-variant dark (&:where(.dark, .dark *));
```

`styles/globals.css` also sets `color-scheme: dark` on `html.dark`, so native controls follow. `styles/theme.css` sets every semantic token in `:root` and overrides it in `.dark`, both unlayered, then re-exports them with `@theme inline`. The root layout puts `suppressHydrationWarning` on `<html>` and runs a `beforeInteractive` script that reads the stored theme and toggles `.dark` before first paint. Components only use token classes like `bg-background-primary-default` and `text-text-secondary`, so there is no per-component dark styling to forget. The three-tier token layout behind this is explained in [design tokens in Tailwind CSS v4](/blog/design-tokens-tailwind-v4).

You can see the result on any [Panelo UI component](/components): every item ships light and dark from the same tokens.

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the test chart, or only the theme tokens:

```bash
npx shadcn@latest add @panelo/revenue-chart
npx shadcn@latest add @panelo/panelo-theme
```

Revenue Lines lands in `components/panelo-ui`, next to your `components/ui`, and pulls in `panelo-theme`. Render it and toggle your theme. If it stays light, check causes 4, 5 and 7: the class is not landing, or your tokens don't change under it. If it flips but your own `dark:` classes don't, the variant is the problem: check causes 1 to 3. `panelo-theme` is not a component: it writes status colours, tonal pill colours, a hairline and two AI gradient stops into your CSS, with light values under `:root`, dark values under `.dark` and `--color-*` pointers in `@theme inline`.

See it live: [Revenue Lines](https://www.paneloui.com/components/revenue-chart).

For a whole page on the same token approach, the [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3) in Panelo Pro has revenue, orders and new-customer stat cards, bar sparklines, and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Why is Tailwind v4 dark mode following my OS instead of my toggle?
By default the `dark` variant uses `prefers-color-scheme`. Add `@custom-variant dark (&:where(.dark, .dark *));` after `@import "tailwindcss";` so it follows a `.dark` class instead.

### Does darkMode: "class" in tailwind.config.js work in Tailwind v4?
Not by default. v4 doesn't detect JavaScript config files automatically; configure dark mode in CSS with `@custom-variant`, or load the old file explicitly with `@config`.

### Why does shadcn dark mode not apply to the html element?
shadcn/ui uses `@custom-variant dark (&:is(.dark *));`, which only matches descendants of `.dark`. `<html class="dark">` itself is not matched. Use `&:where(.dark, .dark *)` if you need it.

### What attribute should next-themes use with Tailwind v4?
Use `attribute="class"` with the class-based custom variant. If you keep next-themes' default `data-theme`, change the variant to `&:where([data-theme=dark], [data-theme=dark] *)`.

### How do I stop the white flash before dark mode loads?
Set the class with a blocking inline script in `<head>` before first paint, as next-themes does, and add `suppressHydrationWarning` to `<html>`.

### Do I need dark: classes if I use CSS variable tokens?
No. If every color is a token that `.dark` redefines, components need no `dark:` prefixes. The variant is still useful for one-off cases like swapping a logo.

## Sources

- Tailwind CSS dark mode docs: https://tailwindcss.com/docs/dark-mode
- Tailwind CSS upgrade guide (JS config not auto-detected, `@config`): https://tailwindcss.com/docs/upgrade-guide
- Tailwind CSS theme variables docs: https://tailwindcss.com/docs/theme
- GitHub discussion #18560, "v4 @theme vs. @theme inline" (dark mode breaks with inline): https://github.com/tailwindlabs/tailwindcss/discussions/18560
- shadcn/ui Tailwind v4 docs (move `:root` and `.dark` out of `@layer base`): https://ui.shadcn.com/docs/tailwind-v4
- shadcn/ui theming docs (`@custom-variant dark (&:is(.dark *))`): https://ui.shadcn.com/docs/theming
- next-themes README (`attribute`, `suppressHydrationWarning`, `enableColorScheme`): https://github.com/pacocoursey/next-themes
- Tailwind CSS color-scheme docs (`scheme-*` utilities): https://tailwindcss.com/docs/color-scheme
- MDN, `color-scheme` (scrollbars, form controls): https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme
- MDN, cascade layers (unlayered styles take precedence): https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers
- MDN, `:where()` specificity: https://developer.mozilla.org/en-US/docs/Web/CSS/:where
