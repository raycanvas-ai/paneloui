---
title: "Tailwind v4 Focus Ring: focus-visible, ring, outline"
description: "Accessible focus rings in Tailwind CSS v4: focus-visible vs focus, the 1px ring default, outline-hidden vs outline-none, forced colors, tokens and React Aria."
slug: tailwind-v4-focus-ring
primaryKeyword: tailwind focus visible ring
secondaryKeywords:
  - tailwind v4 ring
  - tailwind outline hidden
  - tailwind remove focus ring
  - focus vs focus-visible tailwind
  - tailwind focus ring offset
intent: informational
cluster: Tailwind v4
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1660
cta:
  free: [revenue-chart]
  pro: [dashboard-pages-9]
---

# Accessible focus rings in Tailwind CSS v4

For an accessible focus ring in Tailwind CSS v4, write `outline-hidden focus-visible:ring-2 focus-visible:ring-<color>`. `focus-visible` shows the ring for keyboard users but not on mouse clicks. Use `outline-hidden`, not `outline-none`: it keeps a fallback outline in Windows forced colors mode, where rings disappear.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) is a free, MIT-licensed shadcn/ui chart with the keyboard focus this post explains: the plot is one focus stop (`role="slider"`, with arrow keys, Home and End moving between days), ringed with `focus-visible:ring-2 focus-visible:ring-ring` and an offset in the card color, so dark mode gets no white halo. Add it with `npx shadcn@latest add @panelo/revenue-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours. It still pairs the ring with `focus-visible:outline-none`, so it makes a good first file for the `outline-hidden` swap below.

## What changed about rings and outlines in Tailwind CSS v4?

Three changes trip people up when they move code from v3 or copy older answers. All three come from the official upgrade guide.

| Utility | v3 | v4 |
|---|---|---|
| `ring` (no number) | 3px ring | 1px ring; use `ring-3` for the old look |
| Default ring color | `blue-500` | `currentColor` |
| `outline-none` | Invisible 2px outline that still shows in forced colors | Real `outline-style: none` |
| `outline-hidden` | Did not exist | The old `outline-none` behavior |

In the guide's words: "We've changed the width of the `ring` utility from 3px to 1px and changed the default color from `blue-500` to `currentColor`." And: "we've renamed this utility to `outline-hidden` and added a new `outline-none` utility that actually sets `outline-style: none`."

So a v3 snippet like `focus:outline-none focus:ring` now gives you a thin ring in the text color and no forced-colors fallback. Always pass a width and a color.

## What is the difference between focus and focus-visible?

`focus` matches whenever an element has focus, including after a mouse click. `focus-visible` matches when the browser decides focus should be shown. MDN describes the usual heuristic: "when a button is clicked using a pointing device, the focus is generally not visually indicated, but when a text box needing user input has focus, focus is indicated."

For buttons, links, tabs and menu items, use `focus-visible:`. Keyboard users get a ring; mouse users do not get a ring stuck on the button they just clicked. `:focus-visible` has been Baseline widely available since March 2022.

Use `focus:` only when the style should also follow mouse focus, such as a border change on a text input. Text inputs get `:focus-visible` on click anyway.

## Why outline-hidden and not outline-none?

Rings in Tailwind are `box-shadow`. MDN lists what Windows forced colors mode (High Contrast) does to author styles, and it includes: "`box-shadow` is forced to 'none'."

So in forced colors mode, your ring is gone. What is left is the outline. Compare what the two utilities compile to in Tailwind v4:

```css
.outline-hidden {
  --tw-outline-style: none;
  outline-style: none;
  @media (forced-colors: active) {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
}

.outline-none {
  --tw-outline-style: none;
  outline-style: none;
}
```

In forced colors mode the browser replaces `outline-color` with a system color, so the "transparent" outline from `outline-hidden` becomes visible. With `outline-none` there is no outline to recolor. A keyboard user in High Contrast mode sees no focus at all.

The Tailwind docs say it directly: use `outline-hidden` "to hide the default browser outline on focused elements, while still preserving the outline in forced colors mode."

An honest note from our own code: Panelo UI's rules file currently specifies `outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring`. Under v4 semantics, `outline-hidden` is the better first class in that line, for exactly this reason. If you copy the pattern, copy it with `outline-hidden`.

## What is a good default focus ring?

```tsx
<button
  className="rounded-xl bg-background-secondary-default px-4 py-2
             outline-hidden focus-visible:ring-2 focus-visible:ring-border-focus-ring"
>
  Save
</button>
```

- `ring-2` is 2px. That matches the 2 CSS pixel perimeter in WCAG 2.4.13 Focus Appearance (AAA), and it is easy to see.
- The ring follows `border-radius`, because it is a box-shadow.
- The color is a token, not a palette class. More on that below.

### When should you add a ring offset?

An offset puts a gap between the element and the ring. It helps when the element's own color is close to the ring color, like a blue button with a blue ring.

In v4 the offset is drawn as a second box-shadow in `--tw-ring-offset-color`, which defaults to white. On a dark surface that leaves a white halo. Set the offset color to the surface the element sits on:

```html
<button class="outline-hidden focus-visible:ring-2 focus-visible:ring-border-focus-ring
               focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary-default">
```

Panelo's free charts do this, passing the surface they sit on (`ring-offset-card` or `ring-offset-background`) so the gap blends into the card in both themes. In [Revenue Lines](https://www.paneloui.com/components/revenue-chart), the plot gets `focus-visible:ring-offset-4 focus-visible:ring-offset-card`, a 4px card-colored gap between the lines and the ring.

### When should you use an inset ring?

When the focused element sits inside a container with `overflow: hidden` or `overflow: auto`, an outer ring gets clipped. Table rows in a scroll area are the classic case. Draw the ring inside instead. From Panelo's global CSS:

```css
.bui-table tbody tr[data-focus-visible] {
  @apply ring-2 ring-inset ring-border-focus-ring;
}
```

### Can I use outline instead of ring?

Yes. An outline survives forced colors mode on its own, so it needs no fallback. One v4 detail to watch: `outline-2` sets `outline-style: var(--tw-outline-style)`, and `outline-hidden` sets that variable to `none`. So `outline-hidden focus-visible:outline-2` shows nothing on focus. Add `focus-visible:outline-solid`:

```html
<a class="outline-hidden focus-visible:outline-2 focus-visible:outline-solid
          focus-visible:outline-offset-2 focus-visible:outline-border-focus-ring">
```

Or drop `outline-hidden` and style the outline on `focus-visible` only.

## Which color should the focus ring use?

WCAG 1.4.11 Non-text Contrast (AA) asks for 3:1 contrast for the visual information needed to identify components and their states. The Understanding document says "the visual focus indicator for a component must have sufficient contrast against the adjacent background." WCAG 2.4.13 (AAA) adds a 3:1 change between the focused and unfocused pixels.

In practice:

1. **Use one token** for every focus ring, such as `--color-border-focus-ring`.
2. **Point it at your accent**, so it re-tints with the brand. Panelo's `theme.css` does `--color-border-focus-ring: var(--color-accent-500);`.
3. **Check contrast in both themes** against the surfaces your controls sit on. A ring that passes on white can fail on a dark card. If it does, give `.dark` its own value for the token.

A token also makes the rule easy to enforce. Put it in your [AGENTS.md](/blog/agents-md-design-system) and grep for `ring-blue-` in review.

## How do focus rings work with React Aria components?

React Aria Components set data attributes for state. Its docs describe `data-focus-visible` as "like `:focus-visible`, but not on input click or programmatic focus."

Tailwind CSS v4's `data-*` variant targets it with no plugin:

```tsx
import { Button } from "react-aria-components";

<Button className="rounded-xl px-4 py-2 outline-hidden
                   data-focus-visible:ring-2 data-focus-visible:ring-border-focus-ring">
  Save
</Button>
```

This compiles to a `[data-focus-visible]` selector. Use it on React Aria components so your ring follows React Aria's own focus logic instead of the browser's.

## How do you test focus rings?

1. **Tab through the page.** Every interactive element shows a ring. Nothing gets focus without one.
2. **Click with the mouse.** Buttons should not keep a ring after a click.
3. **Emulate forced colors.** The Tailwind docs suggest emulating `forced-colors: active` in your browser's developer tools. Every focused element should still show an outline.
4. **Switch to dark mode.** Check ring and offset colors against dark surfaces.
5. **Check clipped containers.** Focus the first and last row in scrollable lists and tables.

## Get this working in your app

Swap `outline-none` for `outline-hidden` across your project, then emulate forced colors and tab through. For components built around one focus token, see the free [Panelo UI components](/components), and read [semantic color tokens](/blog/tailwind-semantic-color-tokens) for how the token layer is set up.

To try the checklist on a real chart, add the Panelo registry to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install it:

```bash
npx shadcn@latest add @panelo/revenue-chart
```

Tab to the plot, press the arrow keys, Home and End, and check the ring against both themes. Then change `focus-visible:outline-none` to `focus-visible:outline-hidden` in its `focusRing` constant and repeat test 3. See it live on the [Revenue Lines page](https://www.paneloui.com/components/revenue-chart).

Next step: [Task Board Dashboard](https://www.paneloui.com/components/dashboard-pages-9), a Panelo Pro page with a greeting, an AI announcement, four stat cards, board view tabs and a drag-and-drop kanban with keyboard moves. Keyboard-movable cards are where visible focus matters most. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

**Why is my Tailwind v4 ring so thin?**
In v4, `ring` is 1px instead of 3px. Use `ring-2` or `ring-3` explicitly.

**Why is my ring the same color as the text?**
v4 changed the default ring color from `blue-500` to `currentColor`. Always add a color class such as `ring-border-focus-ring`.

**Should I use outline-none or outline-hidden?**
Use `outline-hidden` when you replace the outline with a ring. It keeps a transparent outline in forced colors mode, which the system makes visible. `outline-none` removes it entirely.

**What is the difference between focus and focus-visible in Tailwind?**
`focus:` applies on any focus, including mouse clicks. `focus-visible:` applies when the browser decides focus should be shown, typically keyboard focus and text inputs.

**How do I style focus on React Aria components?**
Use `data-focus-visible:` utilities. React Aria sets `data-focus-visible` on keyboard focus but not on pointer clicks or programmatic focus.

## Sources

- Tailwind CSS docs, Upgrade guide (ring width and color, `outline-hidden` rename): https://tailwindcss.com/docs/upgrade-guide
- Tailwind CSS docs, `outline-style` (`outline-hidden`, `outline-none`, forced colors): https://tailwindcss.com/docs/outline-style
- Tailwind CSS docs, `box-shadow` (ring utilities): https://tailwindcss.com/docs/box-shadow
- Tailwind CSS docs, Hover, focus and other states (`focus-visible`, `data-*` variants): https://tailwindcss.com/docs/hover-focus-and-other-states
- MDN, `:focus-visible`: https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible
- MDN, `forced-colors` media feature (box-shadow forced to none, outline-color replaced): https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
- W3C WAI, Understanding SC 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- W3C WAI, Understanding SC 2.4.13 Focus Appearance: https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- React Aria, Quality (interactions, `data-focus-visible`): https://react-aria.adobe.com/quality
