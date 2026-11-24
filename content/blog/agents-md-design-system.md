---
title: "AGENTS.md for Design Systems: Rules Agents Follow"
description: "How to write an AGENTS.md that keeps coding agents on your design system: semantic tokens, type utilities, components first, focus and RTL rules, with examples."
slug: agents-md-design-system
primaryKeyword: agents.md design system
secondaryKeywords:
  - agents.md tailwind
  - agents.md for frontend
  - cursor rules design system
  - claude.md design system
  - agents.md react example
intent: informational
cluster: AI coding
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1963
cta:
  free: [revenue-chart]
  pro: [dashboard-pages-3]
---

# AGENTS.md for design systems: rules coding agents actually follow

An AGENTS.md for a design system is a plain Markdown file at your repo root that tells coding agents which components to reuse, which color and type tokens are allowed, and which mechanics (focus, direction, class merging) are fixed. Keep each rule short, concrete and checkable: name the exact class or import, and name the thing to avoid.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) is a free, MIT-licensed shadcn/ui chart that already passes the color and focus rules in this post: no raw palette classes (every color is a token such as `chart-1`, `card`, `muted-foreground` or `success`), classes merged with a `cn()` helper, and a `focus-visible:ring-2 focus-visible:ring-ring` focus ring. Add it with `npx shadcn@latest add @panelo/revenue-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours. It also gives you a known-good file to test your rules and diff checks against.

## What is AGENTS.md?

AGENTS.md is "a simple, open format for guiding coding agents", in the words of the official site. Think of it as a README written for agents instead of people. It is plain Markdown with no required fields, and it is now stewarded by the Agentic AI Foundation under the Linux Foundation.

Most coding tools read it. The agents.md site lists OpenAI Codex, Cursor, GitHub Copilot's coding agent, Gemini CLI, Zed, Windsurf, Devin, Aider and many more. Claude Code can read AGENTS.md directly when your repo has no CLAUDE.md, and its docs show how to import AGENTS.md from a CLAUDE.md when you have both.

Two rules from the spec matter for design systems:

- **The nearest file wins.** Agents read the closest AGENTS.md in the directory tree, so a `packages/ui/AGENTS.md` can be stricter than the root one.
- **The user's prompt overrides everything.** Your file sets defaults. It cannot stop a person from asking for something else.

## Why do coding agents drift off a design system?

Agents write the most common code they have seen. For a Tailwind CSS v4 project that means three recurring mistakes:

1. **Raw palette classes.** `text-gray-500`, `bg-white`, `border-neutral-200`. They look fine in light mode and break in dark mode.
2. **Stacked type.** `text-sm font-medium leading-5` instead of your named text style. Every screen ends up slightly different.
3. **Lookalike components.** A hand-rolled `<button>` next to the Button you already ship, without its focus ring, disabled state or keyboard handling.

None of these are bugs a linter catches easily. A rules file catches them before they are written, because the agent reads it before it writes.

## What should a design-system AGENTS.md contain?

Panelo UI keeps one at its repo root. It is short enough to quote in full, so here is what each section does and why.

### 1. Components first

```md
## Components first

- Before hand-building any UI element, check for an installed Panelo component
  under `components/base/` and `components/application/`, and prefer it.
- Missing a component? Install it (`npx shadcn@latest add @panelo/<name>`)
  instead of writing a lookalike.
- Import through the `@/` alias, e.g.
  `import { Button } from "@/components/base/buttons/button"`.
```

The rule names the folders to search and gives the exact install command. "Prefer our components" alone does not work: the agent has to know where they are.

### 2. Color: semantic tokens only

```md
- Never use raw palette classes (`text-gray-500`, `bg-white`, `border-neutral-200`)
  or hex/oklch literals. Every color rides a Panelo semantic token, which also
  makes dark mode automatic.
- Text: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, ...
- Dark mode flips tokens via the `.dark` class on `<html>`. Do not write `dark:`
  overrides with raw colors; if a token pair looks wrong in dark mode, pick a
  different token, not a literal.
```

This is the most valuable rule in the file. It lists the forbidden pattern, then the allowed classes by role (text, surfaces, borders, icons, charts). Listing real class names matters. An agent told "use semantic tokens" will invent `text-muted`. An agent shown `text-text-tertiary` will copy it.

The tokens themselves live in `styles/theme.css`. Semantic values sit in `:root` and `.dark`, and an `@theme inline` block turns them into utilities. If you have not set this up yet, start with [semantic color tokens in Tailwind](/blog/tailwind-semantic-color-tokens).

### 3. Typography: composite utilities only

```md
- Use Panelo's composite type utilities: `text-title-1-medium`,
  `text-body-medium`, `text-caption-1-semibold`, and friends. Each sets size,
  weight, line-height, and letter-spacing together.
- Never rebuild type by stacking `text-sm font-medium leading-5`; if a style
  seems missing, look in `styles/typography.css` before inventing one.
```

Note the escape hatch: "look in `styles/typography.css` before inventing one." Agents follow pointers to files well. The [Tailwind v4 type scale post](/blog/tailwind-v4-type-scale) shows how these utilities are built.

### 4. Spacing and shape

Short, numeric rules: stay on the spacing scale, prefer `gap` over per-child margins, cards use `rounded-3xl`, inputs `rounded-md` to `rounded-xl`, pills `rounded-full`. Arbitrary values only "when matching an existing Panelo component exactly." Without this line, agents reach for `p-[13px]` the moment a design looks slightly off.

### 5. Mechanics

This section covers things that are easy to get subtly wrong:

- **Direction.** Wrap the app in `DirectionProvider` with an explicit BCP 47 locale. The rule says why: "CSS `dir` alone does not configure React Aria keyboard navigation or portal placement." See [RTL in Tailwind CSS v4](/blog/tailwind-rtl-logical-properties).
- **Scroll regions.** A precise recipe for a top-edge progressive blur, down to layer sizes. See [progressive blur in CSS](/blog/progressive-blur-scroll-fade-css).
- **Class merging.** "Merge classes with `cx()` from `@/utils/cx`... No string concatenation, no plain `clsx`."
- **Icons** as component references (`leadingIcon={RiAddLine}`), not rendered elements.
- **Focus.** `outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring`. See [focus rings in Tailwind v4](/blog/tailwind-v4-focus-ring), which also covers one change we would make to that line.

Each rule is a sentence an agent can act on and a reviewer can check in a diff.

## How do you write rules an agent will follow?

What works, from maintaining this file:

| Do | Avoid |
|---|---|
| Name exact classes, imports and paths | "Use the design system" |
| State the forbidden pattern next to the allowed one | Only listing what is allowed |
| Give the reason in one clause when it is not obvious | Paragraphs of rationale |
| Point to the source file for anything long | Copying whole token lists into the rules |
| Keep it under a few hundred lines | Mixing in build steps, deploy notes, team process |

A reason helps when the wrong choice looks right. "A translucent parent creates a backdrop root and can break blur" stops an agent from "simplifying" the code by moving opacity up a level.

Keep the file current. A rule that names a class you renamed last month teaches the agent the wrong class. One check worth doing: grep the rules file for every class it names and make sure each still exists in your CSS.

## AGENTS.md vs CLAUDE.md vs .cursor/rules: which do you need?

| File | Read by | Format | Notes |
|---|---|---|---|
| `AGENTS.md` | Many agents (Codex, Cursor, Copilot agent, Gemini CLI, Zed and more) | Plain Markdown | Nearest file in the tree wins |
| `CLAUDE.md` | Claude Code | Markdown, supports `@path` imports | Claude Code reads AGENTS.md when no CLAUDE.md exists; otherwise import it |
| `.cursor/rules/*.mdc` | Cursor | Markdown with `description`, `globs`, `alwaysApply` frontmatter | Cursor also reads AGENTS.md; `.mdc` adds file scoping |

You do not need all three. Panelo keeps AGENTS.md as the source and mirrors the design rules into `.cursor/rules/panelo.mdc` with `alwaysApply: true`, so Cursor treats them as always-on project rules:

```md
---
description: Panelo design system rules. Always apply when writing or editing UI code in this project.
alwaysApply: true
---
```

If you mirror rules, make one file the source and copy from it. Two hand-edited copies drift.

## Should a component library ship its own rules file?

Yes, if you can. A library's README tells people how to install it. A rules file tells their agent how to use it after install: which tokens exist, which component to reach for, which classes never to write.

Panelo UI does this. Its components install with the shadcn CLI into your project, so the source is yours, and the same design rules that keep Panelo's own code on-token can sit in your repo's AGENTS.md. Installed blocks use shadcn/ui's token names (`bg-card`, `text-muted-foreground`), plus the status and tonal tokens from the free [`panelo-theme`](https://www.paneloui.com/r/panelo-theme.json) item, so those are the names your rules file should list.

## How do you test that the rules work?

Treat the rules file like code and check its output:

1. Ask the agent for a small feature, such as "add an empty state card to the settings page."
2. Search the diff for raw palette classes: `grep -E "(text|bg|border)-(gray|neutral|slate|zinc|white|black)"`.
3. Search for stacked type: `text-(xs|sm|base|lg)` next to `font-`.
4. Check that it imported an existing component instead of writing a new one.

Calibrate the checks on a file you know is clean before trusting them: step 2's grep finds nothing in the free [Revenue Lines](https://www.paneloui.com/components/revenue-chart) chart, so if it fires on that file, the pattern is wrong, not the code.

Each miss points to a rule that is vague, missing, or buried. Fix the rule, not just the diff.

## Get this working in your app

Copy the structure above into your own repo, swap in your token names, and run the diff checks. To see a design system written for agents end to end, browse the free [Panelo UI components](/components).

To add a block built on those tokens, put the Panelo registry in `components.json` once:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install:

```bash
npx shadcn@latest add @panelo/revenue-chart
```

It lands in `components/panelo-ui` next to `components/ui` and brings `panelo-theme` with it. Point your agent at it as the reference file: "match the token usage in `revenue-chart.tsx`" is a rule it can follow. See it live on the [Revenue Lines page](https://www.paneloui.com/components/revenue-chart).

Next step: [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3), a Panelo Pro page with revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. A full page is a better test bed for your rules file than a single chart: ask your agent to add a stat card and grep the diff. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

**What is AGENTS.md?**
AGENTS.md is a plain Markdown file that gives coding agents project instructions: build steps, conventions and rules. It is an open format stewarded by the Agentic AI Foundation under the Linux Foundation, and many coding agents read it.

**Does Claude Code read AGENTS.md?**
Yes. Claude Code reads AGENTS.md when there is no CLAUDE.md in your working directory or above it. If you have both, it reads CLAUDE.md, and you can import AGENTS.md from it with `@AGENTS.md`.

**Where should a design system's rules go in a monorepo?**
Put shared rules in the root AGENTS.md and stricter UI rules in the UI package's own AGENTS.md. Agents read the nearest file, so the package rules apply when editing files in that package.

**How long should AGENTS.md be?**
As short as it can be while naming every class, path and import an agent needs. Point to source files such as `theme.css` for long token lists instead of copying them in.

**Do Cursor rules replace AGENTS.md?**
No. Cursor reads AGENTS.md too. `.cursor/rules/*.mdc` files add frontmatter such as `alwaysApply` and `globs` for finer control, which is useful when you want rules scoped to certain files.

## Sources

- AGENTS.md official site (format, stewardship, supported tools, nearest-file precedence, FAQ): https://agents.md/
- Claude Code docs, "How Claude remembers your project" (AGENTS.md support, CLAUDE.md imports): https://code.claude.com/docs/en/memory
- Cursor docs, Rules (`.cursor/rules`, `.mdc` frontmatter, AGENTS.md support): https://cursor.com/docs/context/rules
- Tailwind CSS docs, Theme variables (`@theme`, `@theme inline`): https://tailwindcss.com/docs/theme
- Tailwind CSS docs, Dark mode (`@custom-variant dark`): https://tailwindcss.com/docs/dark-mode
