---
title: "Progressive Blur CSS: A Scroll Fade That Really Blurs"
description: "Build a progressive blur scroll fade with stacked backdrop-filter layers, mask-image and a 24px opacity ramp, and avoid the backdrop-root bug that kills it."
slug: progressive-blur-scroll-fade-css
primaryKeyword: progressive blur css
secondaryKeywords:
  - tailwind progressive blur
  - scroll fade css
  - css mask image fade
  - backdrop-filter blur not working
  - gradient blur css
intent: informational
cluster: CSS craft
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1866
cta:
  free: [profile-pages-1]
  pro: [profile-pages-2]
---

# Progressive blur in CSS: a scroll fade that actually blurs

A progressive blur is a stack of `backdrop-filter: blur()` layers, each shaped by a `mask-image` gradient, so the blur is strongest at one edge and fades to nothing. For a scroll region, add a surface-color gradient on top and fade the whole effect in over the first 24px of scroll. Put opacity on each layer, never on their parent.

> **Skip the build:** [Designer Profile](https://www.paneloui.com/components/profile-pages-1) is a free, MIT-licensed shadcn/ui page whose case-study cards already use the layered blur this post explains: two masked `backdrop-blur` layers (2px and 10px) under a tint, inside a plain `pointer-events-none`, `aria-hidden` overlay. It is the static, bottom-edge version over artwork; for the scroll-driven top fade, copy the `FadeScroll` component below. Add it with `npx shadcn@latest add @panelo/profile-pages-1` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What is a progressive blur?

A single `backdrop-blur` gives one uniform blur with a hard edge. A progressive blur ramps from blurred to sharp, like a lens going out of focus near the edge of the frame.

CSS has no single property for that. You build it from two:

- **`backdrop-filter`** blurs "the area behind an element" (MDN). It is Baseline 2024.
- **`mask-image`** hides parts of an element "based on the alpha channel of the mask image." A `linear-gradient(to bottom, black, transparent)` mask makes the layer fully visible at the top and invisible at the bottom. It has been Baseline widely available since December 2023.

Mask a blur layer with a gradient and you get a blur that fades out. Stack two or more masked layers with different blur radii and the transition gets smoother.

## Why soften the top edge of a scroll region?

When content scrolls under a fixed header or the top of a card, a hard clip cuts text mid-line. A short fade signals "there is more above" and looks calmer.

The catch: at the top of the list, there is nothing above. A fade there just dims your first row. So the effect should be invisible at `scrollTop` 0 and appear as the user scrolls.

## How do you build it?

Panelo UI's [AGENTS.md](/blog/agents-md-design-system) spells out the recipe its components follow:

> Use a stationary, `pointer-events-none`, `aria-hidden` overlay in a relative wrapper: a 24px masked 1px backdrop blur, a 16px masked 4px backdrop blur, and a gradient from the enclosing semantic surface token to transparent. Ramp each layer's opacity from 0 to 1 over the first 24px of scrolling; keep it invisible at scrollTop 0.

Here it is as a standalone React component with Tailwind CSS v4.

```tsx
"use client";

import { useRef, type ReactNode } from "react";

const fadeMask = "mask-[linear-gradient(to_bottom,black,transparent)]";

export function FadeScroll({ children }: { children: ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-80 rounded-3xl border border-border-button-default bg-background-primary-default">
      <div
        className="h-full overflow-y-auto"
        onScroll={(e) =>
          overlay.current?.style.setProperty(
            "--fade",
            String(Math.min(e.currentTarget.scrollTop / 24, 1)),
          )
        }
      >
        {children}
      </div>

      {/* Stationary overlay: no opacity, filter or mask on this element. */}
      <div
        ref={overlay}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 [--fade:0]"
      >
        <div className={`absolute inset-x-0 top-0 h-6 opacity-(--fade) backdrop-blur-[1px] ${fadeMask}`} />
        <div className={`absolute inset-x-0 top-0 h-4 opacity-(--fade) backdrop-blur-[4px] ${fadeMask}`} />
        <div className="absolute inset-0 bg-linear-to-b from-background-primary-default to-transparent opacity-(--fade)" />
      </div>
    </div>
  );
}
```

(Panelo code merges classes with `cx()`; template strings keep this example dependency-free. Swap `from-background-primary-default` for whatever surface token sits behind your list.)

What each part does:

1. **The wrapper is `relative`** and holds both the scroller and the overlay. The overlay is a sibling of the scroller, not a child, so it stays put while content moves.
2. **Layer one** is 24px tall (`h-6`) with a 1px blur, masked from opaque to transparent.
3. **Layer two** is 16px tall (`h-4`) with a 4px blur and the same mask. Near the very top both layers overlap, so blur is strongest there.
4. **Layer three** is a gradient from the surface color to transparent. Blur alone leaves text readable but busy; the tint lets it sink into the surface.
5. **`--fade`** goes from 0 to 1 over the first 24px of scroll. Each layer reads it through `opacity-(--fade)`, which compiles to `opacity: var(--fade)`.

The scroll handler writes a CSS variable instead of React state, so scrolling does not re-render the list.

## Why does my backdrop-filter blur do nothing?

This is the bug that catches most people, and it is why the recipe insists on per-layer opacity.

`backdrop-filter` blurs what is behind the element only "up to the nearest ancestor that is a backdrop root." MDN lists what creates a backdrop root, including:

- an element with `opacity` less than 1
- an element with a `filter`, `mask-image`, `clip-path` or `backdrop-filter`
- an element with `mix-blend-mode` other than `normal`
- an element with `will-change` set to any of those

MDN spells out the consequence: if a parent has `opacity: 0.9`, "any child's `backdrop-filter` will only blur the content between that parent and the child - not the content behind the parent."

So the tempting shortcut breaks the effect:

```tsx
{/* Broken: the parent becomes a backdrop root */}
<div className="... opacity-(--fade)">
  <div className="backdrop-blur-[4px] ..." />
</div>
```

The parent now isolates its children. The blur layers can only see the empty parent, not your list, and the blur disappears. Panelo's rule notes this "can break blur at normal browser zoom," which makes it easy to miss if you test zoomed in.

Keep the parent plain: no opacity, filter, mask or blend mode. Put opacity, mask and blur on the layers themselves. A layer's own mask and opacity do not stop it from seeing what is behind the overlay, because the backdrop root rule is about ancestors. The case-study cards in the free [Designer Profile](https://www.paneloui.com/components/profile-pages-1) are a working reference: the overlay wrapper carries only positioning and `pointer-events-none`, and each blur layer brings its own `mask-image`.

## Can I use Tailwind's mask utilities instead?

Yes. Tailwind CSS v4 has `mask-b-from-*` and `mask-b-to-*` for edge masks. They compose through several CSS variables and `mask-composite: intersect`, which is useful when you combine sides. For a single top-to-bottom fade, the arbitrary value is shorter and compiles to exactly one declaration:

```css
.mask-\[linear-gradient\(to_bottom\,black\,transparent\)\] {
  mask-image: linear-gradient(to bottom, black, transparent);
}
```

Use whichever your team reads more easily.

## Is a mask on the content simpler?

There is a simpler effect: put `mask-image` on the scroll container itself so content fades to transparent at the edge. It is a good choice when the background behind the card is plain.

| Approach | Looks like | Trade-offs |
|---|---|---|
| Mask on the scroller | Content fades to the page behind it | One class; fades even at scrollTop 0 unless you toggle it; no blur |
| Gradient overlay only | Content fades into the surface color | Easy; text under it stays sharp, so it can look smeared |
| Progressive blur overlay (above) | Content blurs and fades into the surface | Three layers and a scroll handler; needs care with backdrop roots |

The blur version costs more, so use it where it shows: lists under a header, chat threads, side panels.

## What else should you check?

From the same rule: "Verify top/reset, overflow, light/dark mode, and 100% zoom; preserve keyboard scrolling and do not blur the whole content area." In practice:

1. **Top and reset.** Load the page: no fade. Scroll down 10px: partial fade. Scroll back to 0: gone.
2. **No overflow.** If the content fits, the scroller never fires `scroll`, so the overlay stays at 0.
3. **Light and dark mode.** Because the gradient uses a semantic surface token, it flips with your theme. A hardcoded `from-white` would leave a white band in dark mode. See [semantic color tokens](/blog/tailwind-semantic-color-tokens).
4. **100% zoom.** Test at normal zoom, not only zoomed in.
5. **Keyboard scrolling.** The overlay is `pointer-events-none` and `aria-hidden`, so it never captures clicks, focus or screen reader attention. Page Down and arrow keys must still scroll.
6. **Headers stay outside the scroller.** The overlay sits at the top of the scroll region, below the header. If the header must be sticky inside the scroller, offset the overlay by the header height. Panelo's ScrollArea reads a `--scroll-fade-top` variable for this.

## Where does Panelo UI use this?

Panelo's `ScrollArea` takes a `fade` prop with the surface color as a gradient start, such as `fade="from-card"`, and renders the three layers above, so a list scrolled under a card header blurs instead of clipping.

The same idea runs the other way on the case-study cards in the free [Designer Profile](/components/profile-pages-1) page: two masked layers (2px and 10px) deepen toward the bottom edge, then the card's own tint sits on top, so the caption reads cleanly over the artwork.

## Get this working in your app

Copy the `FadeScroll` component above into any Tailwind CSS v4 project. To see the effect inside full dashboards, browse the free [Panelo UI components](/components) or open the [agent demo](/agent-demo).

To start from the Designer Profile, add the Panelo registry to `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install it:

```bash
npx shadcn@latest add @panelo/profile-pages-1
```

The blur lives in the `Card` component of `profile-pages/one/index.tsx`, a few lines you can lift into your own cards. See it live on the [Designer Profile page](https://www.paneloui.com/components/profile-pages-1): hover a case study and the artwork lifts under the blurred caption strip.

Next step: [Team Member Profile](https://www.paneloui.com/components/profile-pages-2), a Panelo Pro page with a banner and verified avatar, a ringing video call, a message drawer that replies, an expanding about with contact details, and sortable role cards that open each role's story. It is the team-member counterpart to the Designer Profile, for when a profile page needs calls and messaging too. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

**What is progressive blur in CSS?**
It is a blur that changes strength across an element. You build it by stacking `backdrop-filter: blur()` layers with different radii, each masked by a `linear-gradient` so it fades out.

**Why is my backdrop-filter not working?**
Usually an ancestor is a backdrop root: it has `opacity` below 1, a `filter`, a `mask` or similar. The blur then only sees content inside that ancestor. Move the opacity to the blurred element itself.

**Does Tailwind CSS v4 have a progressive blur utility?**
No single utility. Combine `backdrop-blur-[1px]` or `backdrop-blur-xs` with a `mask-[linear-gradient(...)]` or `mask-b-from-*` class on each layer.

**How do I make the fade appear only after scrolling?**
Write `Math.min(scrollTop / 24, 1)` to a CSS variable on scroll and use it as each layer's opacity. At scrollTop 0 the variable is 0, so the overlay is invisible.

**Is a progressive blur bad for performance?**
Keep it small and it stays cheap. The blur only covers 16px and 24px strips here, and the recipe says not to blur the whole content area. Profile on low-end devices if you use larger blurs.

## Sources

- MDN, `backdrop-filter` (backdrop root, what creates one, Baseline 2024): https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter
- MDN, `mask-image` (alpha masking, gradients, Baseline status): https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image
- Tailwind CSS docs, `mask-image` utilities: https://tailwindcss.com/docs/mask-image
- Tailwind CSS docs, `backdrop-filter: blur()` utilities: https://tailwindcss.com/docs/backdrop-filter-blur
- Tailwind CSS docs, `opacity` (including `opacity-(<custom-property>)`): https://tailwindcss.com/docs/opacity
