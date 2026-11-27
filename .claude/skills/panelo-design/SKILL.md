---
name: panelo-design
description: Panelo's design-engineering spec and verify loop for blocks in components/panelo (free and pro). Use whenever building, restyling or reviewing a Panelo block, a control inside one, or its motion, before calling the work done. Sets the exact type, radius, border, shadow, motion and contrast values Panelo uses, how to style UI SDK parts, and the screenshot-and-measure check every block must pass.
---

# Panelo design engineering

Panelo is judged on taste, so "it renders" is not done. Done is: on-spec values, every control measured, light/dark/RTL/keyboard checked, and a review pass. This file is the house style; the other skills are references it draws on:

- `ui-sdk`: composing parts, agent-ready, state attributes, testing.
- `shadcn`: registry and CLI work.
- `emil-design-eng`, `review-animations`: motion decisions and review.
- `web-design-guidelines`: the final a11y/UX audit.

## Two codebases, two token sets

| Code | Lives in | Styling |
| --- | --- | --- |
| Site (docs, landing, account) | `components/application`, `app` | `AGENTS.md`: Panelo semantic tokens and composite type utilities |
| Blocks (what users install) | `components/panelo/**` | shadcn tokens (`bg-card`, `text-muted-foreground`, `border-border/70`), `cn` from `@/components/panelo/lib/utils`, UI SDK parts. They land in a stock shadcn project, so no site-only tokens or utilities |

## House values (taken from the shipped blocks; match them)

- **Type.** Body/control 14px (`text-sm leading-5`); descriptions 13.5px; dense rows 13 / 12.5px; meta 12 / 11px with `leading-4`. Labels `font-medium`, headings `font-semibold` with `tracking-[-0.01em]` (large display `-0.02em`). Every number that changes or lines up: `tabular-nums`.
- **Radius.** Controls `rounded-lg`; cards and picture tiles `rounded-xl`; preview frames `rounded-[18px]`; pills, avatars, dots `rounded-full`. Nested corners: inner radius = outer radius − padding.
- **Lines.** Hairlines and dividers `border-border/70`; card edges `ring-1 ring-border/70`. Never a raw palette border.
- **Depth.** Raised controls (outline buttons, inputs, selects) `shadow-xs`; popups `shadow-lg`; nothing in between on static surfaces.
- **Icons.** lucide-react, `size-4` default, `size-3.5` in dense rows, decorative ones `aria-hidden`.
- **Spacing.** Tailwind scale; settings-style rows `py-5`, a 317px label column, `gap-4` between picture cards.

## Motion

- Animate only what tells the user something (state, origin, feedback). Never animate keyboard-driven actions or 100-times-a-day surfaces.
- Name the properties: `transition-[translate,opacity]`, `transition-colors`. No `transition-all` in new code.
- Easing: enter/exit and UI responses `ease-out` or `ease-[cubic-bezier(0.23,1,0.32,1)]`; on-screen movement `ease-[cubic-bezier(0.77,0,0.175,1)]`; a small overshoot `ease-[cubic-bezier(0.34,1.36,0.64,1)]` only for toggles and knobs. Never `ease-in`.
- Durations: press 100-160ms, hovers and toggles 150-250ms, popovers ≤ 200ms, sheets/drawers ≤ 500ms. Exit faster than enter.
- Pressables get `active:scale-[0.97]` (0.95 for small round targets). Popups scale from `origin-(--transform-origin)` and style `data-starting-style` / `data-ending-style`, never from `scale(0)`.
- Every transition gets `motion-reduce:transition-none` unless it only changes color or opacity.
- Tailwind v4's `hover:` is already gated to hover-capable pointers; don't add hover effects through JS.

## Controls

- Build controls from UI SDK parts so agents can operate them (Radio/RadioGroup, Switch, Select, Menu…). A native element only where UI SDK has no part.
- **Don't squeeze a stock control.** If a design needs a different size than `components/panelo/ui/*`, compose a block-local control from the UI SDK primitive (see `BrandSwitch` in `blocks/settings/one`). `[&>span]:size-*` overrides break the geometry: that's how a switch ended up with a 5px inset on one side and 2px on the others.
- Geometry is symmetric: a thumb, badge or icon sits the same distance from every edge it's inset from, in every state (off, on, pressed).
- State must read on its own at 3:1: a fill, a full ring or a weight change, not a faint tint. Checked cards: `ring-2` in the accent with `ring-offset-2 ring-offset-background`.
- A label that swaps (Save → Saved) keeps its width: stack both in one grid cell (`grid *:col-start-1 *:row-start-1`) and fade between them. Announce async results in a `role="status"` region.
- Free blob URLs you create (`URL.revokeObjectURL`) once nothing can show them.

## Color

- Text 4.5:1, control edges / focus / state fills 3:1, in light and dark.
- A user-chosen color (brand, tag) picks its own text: white or near-black by WCAG luminance, threshold ≈ 0.18 (see `ink()` in `blocks/settings/one`).
- Literal colors only in decorative art that depicts a fixed theme (theme thumbnails, logos); everything else rides tokens so dark mode is automatic.

## Direction

- Logical properties only (`ms`/`me`, `ps`/`pe`, `start`/`end`, `text-start`).
- Motion that travels sideways flips with a `--dir` variable: `[&:dir(rtl)]:[--dir:-1]` on the root, `translate-x-[calc(var(--dir,1)*16px)]` on the mover. This site's Lightning CSS lowers `:dir()` to `:lang()`, so RTL needs `lang` (e.g. `ar`) and `dir="rtl"` set together, which `AGENTS.md` requires anyway.

## Shell and filing

- Pro app screens ship inside an app shell with a sidebar; free blocks, profile/login pages and the sidebars themselves don't (see `.claude/CLAUDE.md`).
- File each block under the category it is, in `components/application/docs/components-index.ts`, and register its preview in `panelo-previews.ts`.

## Verify loop (required before "done")

With the dev server on :3000:

```bash
python -I .claude/skills/panelo-design/scripts/verify.py <slug>   # e.g. settings-1
```

It writes light, dark and RTL screenshots plus 3x crops of every switch, radio, checkbox, button, input and select into `$TMPDIR/panelo-verify/<slug>/`, and prints a failure for any part (thumb, indicator, badge) that sits outside its control or is inset unevenly. Then:

1. Look at every crop at 3x. Check alignment, insets, weight, optical centring, and that light and dark both read.
2. Tab through the block: every control reachable, focus visible, Escape closes popups.
3. Click every control once and confirm state, Cancel/undo, and that nothing jumps.
4. Run `web-design-guidelines` on the block's files and `review-animations` if it has motion. Fix or justify each finding.
5. `npx tsc --noEmit -p .`, then `node --experimental-strip-types scripts/build-registry.mts` and confirm the item's JSON lists only the files and packages it needs.
6. Base UI edition (every block ships on UI SDK and on Base UI, from the same source; see `components/panelo/base`): `npx tsc --noEmit -p tsconfig.base-edition.json`, start `PANELO_EDITION=base npx next dev -p 3001`, then `python -I .claude/skills/panelo-design/scripts/parity.py <slug>` and look at any block that differs or logs errors. A UI SDK part a block newly imports needs its adapter in `components/panelo/base`, or the build drops the block from the Base UI edition and fails until `SDK_ONLY` in `components-index.ts` says so.

Report what was measured, not adjectives.

## Gold standards

Compare new work against `settings-1` (controls, brand tinting, verify-loop fixes) and `dashboard-pages-13` (dense data, popover → sheet on phones via `presentation="auto"`).
