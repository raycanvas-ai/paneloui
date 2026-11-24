---
title: "Why shadcn/ui Uses OKLCH (and When Hex Still Matters)"
description: "Why shadcn/ui and Tailwind CSS v4 moved from HSL and RGB to OKLCH: perceptual lightness, wide-gamut color, simpler opacity. Plus trade-offs and when to use hex."
slug: why-shadcn-uses-oklch
primaryKeyword: shadcn oklch
secondaryKeywords:
  - why shadcn uses oklch
  - why tailwind use oklch
  - why use oklch instead of hex
  - what is oklch in tailwind
  - tailwind oklch opacity
intent: informational
cluster: Tailwind v4
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1784
cta:
  free: [panelo-theme]
  pro: [dashboard-pages-3]
---

# Why shadcn/ui uses OKLCH (and when hex still matters)

shadcn/ui switched its theme colors from HSL to OKLCH when it moved to Tailwind CSS v4, which had already moved its default palette from RGB to OKLCH. OKLCH's lightness value matches how bright a color looks, it can describe wide-gamut P3 colors that hex can't, and v4 handles opacity without bare color channels. Hex still works everywhere.

> **Skip the build:** [panelo-theme](https://www.paneloui.com/r/panelo-theme.json) is a free, MIT-licensed shadcn/ui theme item, not a component: 36 color tokens that extend shadcn/ui's OKLCH theme in the same format (status colors, six tonal pill hues, a hairline and an AI gradient pair). Every base value is an `oklch()` color, with light values in `:root` and dark overrides in `.dark`, and the dark pill tints are mixed from those colors with `color-mix()`. Add it with `npx shadcn@latest add @panelo/panelo-theme` ([registry setup](#get-this-working-in-your-app)), then change anything: the values are written into your own CSS.

## What exactly changed in shadcn/ui?

Two changes, one in Tailwind CSS and one in shadcn/ui.

Tailwind CSS v4.0, released January 22, 2025, "upgraded the entire default color palette from `rgb` to `oklch`, taking advantage of the wider gamut to make the colors more vivid in places where we were previously limited by the sRGB color space." In v4.3 every default color is written that way, for example `--color-neutral-500: oklch(55.6% 0 none)`.

shadcn/ui followed. Its Tailwind v4 page lists the change in one line: "HSL colors are now converted to OKLCH." Today the default theme looks like this:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
}
```

A note on sourcing: shadcn/ui's docs state the change but don't publish a reasoning. The reasons below come from what OKLCH does, what Tailwind CSS said about its palette, and what the switch made easier in practice. Read them as the likely motives, not shadcn's own words.

## What do the three numbers in oklch() mean?

MDN defines `oklch()` as a color "in the Oklab color space," in a cylindrical form with three parts:

| Part | Meaning | Range |
|---|---|---|
| L | Perceived lightness | `0` to `1`, or `0%` to `100%` (0 is black, 1 is white) |
| C | Chroma, roughly "how much color" | `0` (gray) upward; MDN says it doesn't exceed `0.5` in practice |
| H | Hue angle | `0` to `360` |

An optional alpha follows a slash: `oklch(0.6 0.2 250 / 50%)`.

Read shadcn/ui's tokens with that table and they explain themselves. `oklch(0.145 0 0)` is a near-black gray: low lightness, zero chroma. `oklch(0.985 0 0)` is a near-white gray. The hue doesn't matter when chroma is zero.

## Why is perceptual lightness a big deal for themes?

Because a theme is mostly a set of lightness decisions. Background, card, border, muted text and primary text are different steps on a scale, and dark mode is that scale flipped.

HSL's lightness doesn't track what you see. Evil Martians' OKLCH article puts it this way: in HSL, "Different hues represent different 'real' lightness values." Yellow and blue at the same HSL lightness look nothing alike in brightness. So "make the dark-mode version 30 points darker" gives different results for every hue.

In OKLCH, L is designed to be perceptually uniform. Two colors with the same L look about equally bright, whatever their hue. That makes these jobs simpler:

- **Building a ramp.** Space L evenly and the steps look even.
- **Dark mode.** Pick lightness values for each role and swap them; hue and chroma can stay.
- **Contrast.** Text-on-surface contrast depends mostly on lightness difference, so you can reason about it from the numbers. You still need to measure; WCAG ratios are calculated from luminance, not OKLCH L.
- **Brand variants.** Keep L and C, rotate H, and a new accent sits at the same visual weight as the old one.

You can see the dark-mode move in the free [panelo-theme](https://www.paneloui.com/r/panelo-theme.json) item: `--success` is `oklch(0.52 0.13 150)` in light mode and `oklch(0.78 0.15 152)` in dark, so lightness carries almost the whole change while chroma and hue barely move.

## What does OKLCH do that hex can't?

It can describe colors outside sRGB. Evil Martians notes that "`rgb()`, `hsl()`, or hex formats can't be used to specify P3 colors," while OKLCH can. The article notes that modern Apple devices and many OLED screens show the P3 gamut, so a saturated OKLCH green can look more vivid on those screens than any hex value could.

That is the reason Tailwind CSS gave for its palette change. For a mostly neutral theme like shadcn/ui's default, the wide-gamut benefit is small; the lightness benefit is what you'll notice.

## Did OKLCH make opacity easier?

Yes, and this was a practical pain point in v3. Tailwind v3's docs said that to use opacity modifiers with CSS variables, "you'll need to define those variables as just the color *channels*," and warned: "Don't include the color space function or opacity modifiers won't work." That's why shadcn/ui's v3 themes stored values like `0 0% 3.9%` and wrapped them in `hsl()` elsewhere.

Tailwind CSS v4 generates opacity with `color-mix()`, so the variable can hold a complete color in any format. We compiled `bg-brand/40` with Tailwind CSS v4.3.5 and `--color-brand: oklch(0.62 0.19 255)`:

```css
.bg-brand\/40 {
  background-color: color-mix(in srgb, oklch(0.62 0.19 255) 40%, transparent);
  @supports (color: color-mix(in lab, red, red)) {
    background-color: color-mix(in oklab, var(--color-brand) 40%, transparent);
  }
}
```

Storing a full color is what let shadcn/ui wrap its values in a color function and map them with `@theme inline`. Once the values were complete colors anyway, converting them to OKLCH to match Tailwind's palette was a small step. This works with hex too; OKLCH is not required for opacity in v4.

For CSS outside utilities, Tailwind provides `--alpha()`: `background-color: --alpha(var(--color-gray-950) / 10%);`.

## Is OKLCH supported in browsers?

Yes. MDN marks `oklch()` as Baseline widely available, "available across browsers since May 2023." Tailwind CSS v4 itself targets Safari 16.4+, Chrome 111+ and Firefox 128+, and its upgrade guide says to stay on v3.4 if you need older browsers. If your project can run Tailwind v4, it can use OKLCH.

## What are the downsides of OKLCH?

Fair ones, all from the same Evil Martians article:

- **Out-of-gamut colors.** Some L, C and H combinations can't be shown on a given screen. The browser maps them to the closest color it can display, and clipping-based mapping can shift the hue. Keep chroma moderate, or check values in a picker that shows gamut.
- **Tooling.** Not every design tool works natively in OKLCH; the article noted Figma lacked official support when it was written, with a plugin available. Check your own tools.
- **Readability for newcomers.** `#121212` is familiar. `oklch(0.2 0 0)` takes a minute to learn, though it's easier to adjust once learned.

## When should I still use hex?

Whenever the value comes from somewhere that speaks hex, and nobody needs to tune it:

- A brand color from a style guide that must match print or other apps exactly.
- Colors copied from a design file, while you're matching a spec pixel for pixel.

Tailwind CSS v4 doesn't care what format a theme variable uses. Panelo UI's `styles/theme.css` keeps Tailwind's OKLCH palette and overrides a handful of primitives with hex values from its Figma variables:

```css
@theme {
  --color-neutral-100: #f7f7f7;
  --color-neutral-200: #ebebeb;
  --color-neutral-925: #121212;
  --color-blue-400:    #3392ff;
}
```

Semantic tokens then point at those primitives, so components never see the format at all. That is the real lesson: the format matters less than having a token layer. Pick OKLCH for colors you will tune, and keep hex where hex is the source of truth.

To convert a brand hex to OKLCH, paste it into oklch.com, the picker Evil Martians built, which also shows whether the result fits in sRGB and P3.

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

The tokens land next to shadcn/ui's own OKLCH values, in the same format, so you can tune them with the lightness rules above. Every free Panelo block lists `panelo-theme` as a dependency, so installing a block brings it along. See it live: the free [Home Care Schedule](https://www.paneloui.com/components/dashboard-pages-13) marks at-risk visits with `bg-tone-orange-bg`, `text-tone-orange-fg` and `ring-tone-orange-border`.

Panelo UI's components install into any shadcn/ui project and read the same kind of tokens, so they follow your OKLCH or hex theme in light and dark. See them on [the components page](/components). For the bigger picture, read [design tokens in Tailwind CSS v4](/blog/design-tokens-tailwind-v4) and [semantic color tokens](/blog/tailwind-semantic-color-tokens).

Next step: [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3), a Panelo Pro page with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Like every Panelo item it ships light and dark from the same tokens. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Why did shadcn/ui switch from HSL to OKLCH?
shadcn/ui made the switch when it moved to Tailwind CSS v4, whose default palette is already OKLCH. shadcn/ui doesn't publish its reasoning, but OKLCH gives perceptually even lightness for light and dark themes and access to wide-gamut colors.

### Is OKLCH better than hex?
For building and tuning palettes, usually yes: lightness is perceptual and it can express P3 colors. For a fixed brand color you never adjust, hex is fine and Tailwind CSS v4 accepts it.

### Do Tailwind opacity modifiers work with OKLCH colors?
Yes. `bg-primary/50` compiles to `color-mix()` and works with OKLCH, hex or any other format. You no longer need to store bare color channels as in v3.

### Can I use hex colors in a shadcn/ui theme?
Yes. Set `--primary: #3392ff;` in `:root` and the `@theme inline` mapping works the same. You lose nothing at runtime, only the convenience of editing in OKLCH.

### What does oklch(0.145 0 0) mean?
Lightness 0.145 (near black), chroma 0 (no color, so a neutral gray) and hue 0, which is ignored when chroma is zero. It's shadcn/ui's default foreground color.

## Sources

- Tailwind CSS v4.0 release post (palette moved to oklch): https://tailwindcss.com/blog/tailwindcss-v4
- Tailwind CSS colors docs (`--alpha()`, opacity modifiers): https://tailwindcss.com/docs/colors
- Tailwind CSS upgrade guide (browser targets): https://tailwindcss.com/docs/upgrade-guide
- Tailwind CSS v3 customizing colors (CSS variables as channels): https://v3.tailwindcss.com/docs/customizing-colors
- shadcn/ui Tailwind v4 docs ("HSL colors are now converted to OKLCH"): https://ui.shadcn.com/docs/tailwind-v4
- shadcn/ui theming docs (default OKLCH theme): https://ui.shadcn.com/docs/theming
- MDN, `oklch()`: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch
- Evil Martians, "OKLCH in CSS: why we moved from RGB and HSL": https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
- OKLCH color picker and converter: https://oklch.com
