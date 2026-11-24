---
title: "Tailwind RTL in v4: Logical Properties and dir"
description: "Build RTL layouts in Tailwind CSS v4 with ms/me, ps/pe, inset-s and rounded-s, a :dir() rtl variant, and a locale provider so keyboard navigation flips too."
slug: tailwind-rtl-logical-properties
primaryKeyword: tailwind rtl
secondaryKeywords:
  - tailwind v4 rtl
  - tailwind logical properties
  - tailwind rtl support
  - tailwind ps pe
  - react aria rtl
intent: informational
cluster: Tailwind v4
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1927
cta:
  free: [login-pages-1]
  pro: [dashboard-pages-7]
---

# RTL in Tailwind CSS v4: logical properties, dir, and what CSS alone misses

Tailwind CSS v4 supports right-to-left layouts without a plugin. Set `dir="rtl"` and `lang` on `<html>`, use logical utilities such as `ms-*`, `pe-*`, `inset-s-*`, `text-start` and `rounded-s-*` instead of left/right ones, and use the `rtl:` variant only for the few things that must flip by hand, like arrow icons.

> **Skip the build:** [Split Login Page](https://www.paneloui.com/components/login-pages-1) is a free, MIT-licensed shadcn/ui block: a split-screen login whose form and showcase panels sit in a flex row, so they swap sides under `dir="rtl"` with no extra code. It is not fully converted: a few physical classes still place the brand lockup, the input icons and the password toggle, which makes it a small, real file to run this post's checklist on. Add it with `npx shadcn@latest add @panelo/login-pages-1` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Does Tailwind CSS v4 support RTL out of the box?

Yes. You do not need `tailwindcss-rtl` or similar plugins, which were written for older Tailwind versions. Two built-in pieces cover it:

1. **Logical property utilities.** `ms-4` compiles to `margin-inline-start`, and `me-4` to `margin-inline-end`. The browser maps "inline start" to the left in LTR and the right in RTL.
2. **`rtl:` and `ltr:` variants** for styles that have no logical equivalent.

The rest is HTML: set `dir` and `lang` on the root element, and the browser does the mirroring.

```html
<html lang="ar" dir="rtl">
```

## Which Tailwind utilities are logical?

Here are the logical utilities you will use most, and the physical ones they replace:

| Physical (avoid) | Logical (use) | CSS property |
|---|---|---|
| `ml-4` / `mr-4` | `ms-4` / `me-4` | `margin-inline-start` / `-end` |
| `pl-4` / `pr-4` | `ps-4` / `pe-4` | `padding-inline-start` / `-end` |
| `left-0` / `right-0` | `inset-s-0` / `inset-e-0` | `inset-inline-start` / `-end` |
| `text-left` / `text-right` | `text-start` / `text-end` | `text-align: start` / `end` |
| `border-l` / `border-r` | `border-s` / `border-e` | `border-inline-start-width` / `-end-width` |
| `rounded-l-md` / `rounded-r-md` | `rounded-s-md` / `rounded-e-md` | `border-start-start-radius` + `border-end-start-radius` (and `-end`) |

One note on insets. Tailwind v4.2 added `inset-s-*` and `inset-e-*`, and the v4.3 release post says the older `start-*` and `end-*` utilities "are still available, but they're now deprecated." They still compile, but new code should use `inset-s-*`. Panelo UI's own rules file still says `start`/`end`; both forms compile today.

Symmetric utilities such as `mx-4`, `px-4` and `gap-4` are already direction-neutral. Flexbox and grid also follow direction on their own: `justify-start` puts items at the inline start, which is the right edge in RTL.

## How do the rtl: and ltr: variants work in v4?

Tailwind's default `rtl` variant compiles to:

```css
&:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)
```

That works for a page that is all one direction. It has a gap when you nest regions. Inside `<div dir="ltr">` within an RTL page, an element still matches `[dir="rtl"] *` because an ancestor has `dir="rtl"`. So `rtl:` styles apply inside your LTR island.

The `:dir()` pseudo-class does not have that problem. MDN describes the difference: `[dir=…]` selectors only match the attribute, while `:dir()` "will match the value calculated by the user agent, even if inherited." It has been Baseline widely available since December 2023.

Panelo overrides both variants in its global CSS so they resolve against the nearest direction boundary:

```css
/* Resolve the nearest direction boundary, including nested LTR regions.
 * Tailwind's ancestor-based defaults also match inside an opposing region. */
@custom-variant rtl (&:dir(rtl));
@custom-variant ltr (&:dir(ltr));
```

With this, `rtl:rotate-180` compiles to `.rtl\:rotate-180:dir(rtl) { rotate: 180deg; }`, and it stops applying inside an LTR region. It also works with `dir="auto"`, which attribute selectors never match.

## What should flip in RTL, and what should not?

Logical utilities flip layout. Some things need a decision.

**Mirror these:**

- Navigation and disclosure glyphs: back and forward arrows, chevrons on menu rows, sidebar collapse icons.
- Horizontal drawer and sheet motion. A drawer that slides in from the start edge should come from the right in RTL.
- Progress that reads in the inline direction, such as a stepper.

**Keep these physical:**

- Charts and measured geometry. A time axis, a canvas drawing or an SVG path with computed coordinates should not be flipped by CSS.
- Logos, media playback controls and trend arrows. An "up and to the right" trend arrow means growth in any language.
- Code, OTP digits, email addresses and URLs. Put them in an explicit LTR region.

Panelo encodes the icon decision in a small helper, so the choice is made once:

```ts
/** Navigation glyphs mirror; logos, media controls and trend arrows do not. */
const directionalIcons: ReadonlySet<unknown> = new Set([
  RiArrowLeftLine, RiArrowLeftSLine, RiArrowRightLine, RiArrowRightSLine,
  RiSidebarFoldLine, RiSidebarUnfoldLine,
]);

export function directionalIconClass(icon: unknown): string | undefined {
  return directionalIcons.has(icon) ? "rtl:rotate-180" : undefined;
}
```

For mixed text, such as a user's English name inside an Arabic sentence, use `<bdi>`. MDN notes it "tells the browser's bidirectional algorithm to treat the text it contains in isolation," and it behaves as `dir="auto"` by default.

```html
<p>تم الإرسال بواسطة <bdi>Sarah O'Neil</bdi></p>
<code dir="ltr" class="text-start">npx shadcn@latest add @panelo/revenue-chart</code>
```

## Why isn't dir="rtl" enough for React components?

CSS direction fixes layout. It does not tell your JavaScript which way the arrow keys should move.

Accessible component libraries handle arrow keys themselves. In a tab list, a menu or a slider, "next" means the right arrow in LTR and the left arrow in RTL. React Aria, which many component libraries build on, says it "supports right-to-left interactions (e.g. keyboard navigation)". It gets the direction from the locale, not from your CSS. Its docs say it detects the user's language by default, and you use `I18nProvider` to set a specific locale.

So if your page says `dir="rtl"` but the browser's language is English, the layout mirrors while the arrow keys still behave as LTR. Popovers and menus rendered in a portal can also land outside your `dir` wrapper and lay out LTR.

The fix is to drive both from one locale. Panelo's `DirectionProvider` wraps React Aria's `I18nProvider` and writes the resolved direction back to the DOM:

```tsx
"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { I18nProvider, useLocale } from "react-aria-components";
import { cx } from "@/utils/cx";

export function DirectionProvider({ locale, ...props }: DirectionProviderProps) {
  return (
    <I18nProvider locale={locale}>
      <DirectionBoundary {...props} />
    </I18nProvider>
  );
}

function DirectionBoundary({ children, className, ...props }: Omit<DirectionProviderProps, "locale">) {
  const { locale, direction } = useLocale();
  return <div {...props} lang={locale} dir={direction} className={cx("contents", className)}>{children}</div>;
}

export function useDirection(): Direction {
  return useLocale().direction;
}
```

(`DirectionProviderProps` takes a `locale` string plus normal div props; the full file is in the Panelo UI repo.)

Three details make this work:

- **One source of truth.** The locale sets React Aria's keyboard behavior, and the same `useLocale()` result sets `dir` and `lang` on the wrapper.
- **`display: contents`.** The wrapper adds a direction boundary without adding a layout box, so it does not break your flex or grid.
- **Nesting.** Wrap a single region in `<DirectionProvider locale="en-US">` inside an Arabic app, and both its CSS and its keyboard behavior are LTR.

For custom portals, read `useDirection()` and put the value on the portal root, so menus rendered outside the tree still lay out correctly.

## How do you set up full-app RTL in Next.js?

1. Pick the locale per request, from the URL segment or the user's settings.
2. Set `lang` and `dir` on `<html>` in your root layout. React Aria's docs recommend setting both "on the root-most element of your application."
3. Wrap the app in a locale provider (React Aria's `I18nProvider`, or a wrapper like the one above) with the same locale.
4. Replace physical utilities with logical ones. Search for `\b(ml|mr|pl|pr|left|right|text-left|text-right|border-l|border-r|rounded-l|rounded-r)-` to find them.
5. Add `rtl:rotate-180` to navigation icons only.
6. Test with a keyboard: tabs, menus, sliders and date fields should move toward the visual "next" item.

Step 4 is the slow one. To try it on a real file first, run the search on the free [Split Login Page](https://www.paneloui.com/components/login-pages-1): it finds the brand lockup's `left-8`, the input icons' `left-3.5` and `pl-11`, and the password toggle's `right-3.5` (swap them for `inset-s-8`, `inset-s-3.5`, `ps-11` and `inset-e-3.5`), plus `left-1/2` centering on the decorative showcase, which can stay.

## How do you stop agents writing ml-4 again?

Coding agents default to physical utilities because most Tailwind code online uses them. Put the rule in your [AGENTS.md](/blog/agents-md-design-system). Panelo's says, in part: "Use logical styles: `ms`/`me`, `ps`/`pe`, `start`/`end`, `text-start`/`text-end`, `border-s`/`border-e`, `rounded-s`/`rounded-e`... Preserve physical coordinates for measured geometry, charts, canvas, and decorative art."

That same file pairs with semantic tokens and focus rules covered in [semantic color tokens](/blog/tailwind-semantic-color-tokens) and [focus rings in Tailwind v4](/blog/tailwind-v4-focus-ring).

## Get this working in your app

Add the Panelo registry to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the login page:

```bash
npx shadcn@latest add @panelo/login-pages-1
```

Set `dir="rtl"` on a wrapper, watch the two panels swap, then run the step 4 search and fix the four physical classes it finds. See it live on the [Split Login Page](https://www.paneloui.com/components/login-pages-1).

Panelo UI's own site wraps its app in the `DirectionProvider` above. The free blocks vary: the [Painted Login Page](https://www.paneloui.com/components/login-pages-3) already lays out its form with logical utilities (`ps-*`, `pe-*`, `ms-*`, `end-1`), while the Split Login Page still has the physical classes listed in step 4. Browse the free items on the [components page](/components), install one with `npx shadcn@latest add @panelo/<item>`, and switch `dir` to see what mirrors.

Next step: [Team Inbox](https://www.paneloui.com/components/dashboard-pages-7), a Panelo Pro page with an icon rail, a searchable conversation list, a threaded conversation with a reply box and a details panel. That many side-by-side panels is where this post's rules matter most, so it is a good page to test an RTL locale on. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

**Do I need a plugin for RTL in Tailwind CSS v4?**
No. Tailwind v4 ships logical utilities like `ms-*`, `ps-*`, `inset-s-*` and `rounded-s-*`, plus `rtl:` and `ltr:` variants. Set `dir` on `<html>` and the browser mirrors the layout.

**What is the difference between start-0 and inset-s-0?**
Both set `inset-inline-start`. Tailwind v4.2 added `inset-s-*`, and the `start-*` utilities are now deprecated but still work.

**Why do my rtl: styles apply inside an LTR section?**
Tailwind's default `rtl` variant matches any element with a `dir="rtl"` ancestor. Redefine it with `@custom-variant rtl (&:dir(rtl));` so it follows the nearest direction boundary.

**Should charts flip in RTL?**
Usually not. Time axes, measured SVG geometry and canvas drawings keep physical coordinates. Translate the labels and format the numbers, but leave the geometry alone unless your design calls for a mirrored axis.

**Why do arrow keys go the wrong way in my RTL menu?**
Component libraries like React Aria take keyboard direction from the locale, not from CSS. Set the locale with `I18nProvider` to match your `dir`.

## Sources

- Tailwind CSS docs, Hover, focus and other states (`rtl`/`ltr` variants and compiled selectors): https://tailwindcss.com/docs/hover-focus-and-other-states
- Tailwind CSS docs, Margin (`ms-*`, `me-*` logical properties): https://tailwindcss.com/docs/margin
- Tailwind CSS docs, top / right / bottom / left (`inset-s-*`, `inset-e-*`): https://tailwindcss.com/docs/top-right-bottom-left
- Tailwind CSS docs, Border radius (`rounded-s-*`, `rounded-e-*`): https://tailwindcss.com/docs/border-radius
- Tailwind CSS blog, v4.3 release post (v4.2 logical utilities, `start-*`/`end-*` deprecation): https://tailwindcss.com/blog/tailwindcss-v4-3
- Tailwind CSS docs, Functions and directives (`@custom-variant`): https://tailwindcss.com/docs/functions-and-directives
- MDN, `:dir()`: https://developer.mozilla.org/en-US/docs/Web/CSS/:dir
- MDN, CSS logical properties and values: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values
- MDN, `<bdi>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/bdi
- React Aria, Quality: internationalization (locale detection, RTL interactions, `useLocale`, `lang`/`dir`): https://react-aria.adobe.com/quality
- React Aria, I18nProvider: https://react-aria.adobe.com/I18nProvider
