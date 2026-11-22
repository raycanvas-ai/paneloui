# AGENTS.md

Guidance for coding agents working on **Panelo**, a Next.js 16 admin dashboard template (React 19, TypeScript, Tailwind CSS v4, shadcn/ui styling on Vercel's UI SDK).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Ground rules

- `src/components/ui/` holds the shadcn-styled primitives (`radix-nova` classes), built on **UI SDK** (`@ui-sdk/react` + `@ui-sdk/core`, beta). Treat them as read-only: style and compose them where they're used, and read a wrapper's source before relying on it. Wrappers keep the shadcn API (`asChild` maps to ui-sdk's `render`).
- Before touching ui-sdk code, follow the `ui-sdk` skill and read `node_modules/@ui-sdk/react/docs/llms.txt`. To build a new component, also search `node_modules/@ui-sdk/react/docs/core.md` by heading and read `rendering.md` next to it. Style from ui-sdk state attributes (`data-open`, `data-checked`, …), never Radix ones.
- Agent bridge: `src/components/agent-bridge.tsx` (mounted in the root layout) exposes every ui-sdk control as `window.agent` (`snapshot`/`query`/`act`) and registers WebMCP tools. Give every control an accessible name; mark risky controls with `data-agent-confirm`, and hide sensitive ones with `data-agent-hidden` / `data-agent-secret`.
- For anything shadcn-related (components, composition, registries, presets, `components.json`) use the shadcn skill. Missing? `npx skills add shadcn/ui`. Its rules aren't repeated here.
- npm is the package manager. Don't add a dependency for something a few lines or an installed package already covers.
- No test suite exists yet. Only run `build`, `lint` or `check` when the user asks for that validation.

## Where code lives

Code stays next to the route that owns it and only moves to a shared folder once a second feature needs it.

| What | Where |
| --- | --- |
| Dashboard screen | `src/app/(main)/dashboard/<screen>/page.tsx` |
| That screen's components, data, schemas | `src/app/(main)/dashboard/<screen>/_components/` |
| Pieces shared across dashboard screens | `src/app/(main)/dashboard/_components/` |
| App-wide components | `src/components/` |
| Hooks and helpers | `src/hooks/`, `src/lib/` |
| Theme presets (CSS) and their generated index | `src/styles/presets/`, `src/lib/preferences/presets.ts` |
| Sidebar navigation | `src/navigation/sidebar/sidebar-items.ts` |

## Building a screen

**Start from what exists.** The Overview (`default`), Ecommerce, Finance and Chat screens set the house style; the panel chrome they share (`PANEL`, `PanelHead`, `Delta`, chart tooltips, tone accents) lives in `default/_components/overview/overview-chrome.tsx`. Reuse the dashboard shell, layout controls and tokens rather than inventing new ones.

**Structure.** `page.tsx` stays a small Server Component that composes focused pieces from `_components/`; anything interactive or browser-only goes in its own Client Component. Register the screen in the sidebar if it should be navigable.

**Design.** Settle the information hierarchy first and let it pick the widgets — cards, rows, meters, charts, tabs, empty states — trying a few arrangements before keeping the clearest. Match neighbouring screens on density, borders, radius, spacing, content width and how grids collapse on small screens. When working from a screenshot, follow its layout, hierarchy and spacing closely, but build it from project components.

**Colour.** Semantic theme tokens only, so every screen works in light, dark and each preset. If a design truly needs a colour no token provides (or the user asks for one), use a named Tailwind palette colour — never arbitrary hex, RGB, HSL or OKLCH values in components.

**Completeness.** Cover loading, empty, error, disabled and overflow states, and keep screens accessible: semantic HTML, keyboard paths, visible focus, labels and ARIA where needed.

## Code style

- Strict TypeScript with precise types; no `any`.
- Import through the `@/` aliases.
- Biome decides formatting: double quotes, semicolons, two-space indent, sorted imports, 120-column lines.
- Keep diffs to the task at hand; leave unrelated files alone.

## Commands

```bash
npm install
npm run dev               # local dev server
npm run build             # production build
npm run lint              # biome lint
npm run format            # biome format --write
npm run check             # lint + format check
npm run check:fix         # apply fixes
npm run generate:presets  # rebuild the preset index from src/styles/presets
```

## Commits and pull requests

Conventional prefixes (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). Attach screenshots for new screens or visible changes, including mobile and dark mode when they differ, and call out any new shared pattern or dependency in the PR description.
