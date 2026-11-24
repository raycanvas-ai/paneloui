---
title: "How to Create a shadcn Registry (With a Real Example)"
description: "Create a shadcn registry step by step: write registry.json, build it with the shadcn CLI, host the JSON, add a namespace, and learn from a registry that ships."
slug: how-to-create-a-shadcn-registry
primaryKeyword: create shadcn registry
secondaryKeywords:
  - shadcn custom registry
  - shadcn registry.json
  - shadcn build
  - shadcn registry namespace
  - shadcn registry directory
intent: informational
cluster: shadcn registry
date: 2026-11-24
status: draft
author: Raycanvas
cta:
  free: [revenue-chart]
  pro: [dashboard-pages-3]
wordCount: 1981
---

# How to create a shadcn registry

To create a shadcn registry, write a `registry.json` file that lists your items and their files, run `npx shadcn@latest build` to write one JSON file per item into `public/r`, and host those files. People then install with `npx shadcn@latest add`, using an item URL or a namespace such as `@acme/stat-card`.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) is a free, MIT-licensed shadcn/ui block, and installing it shows a production registry item end to end before you write your own: the CLI fetches one item JSON, installs two npm packages at set version ranges, pulls the `panelo-theme` tokens as a registry dependency and writes two files into `components/panelo-ui`. Add it with `npx shadcn@latest add @panelo/revenue-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

That is the whole mechanism. The rest of this guide covers the details the docs leave to you, using a small example you can copy and the registry behind Panelo UI as a worked case.

## What is a shadcn registry?

A registry is a set of JSON files the shadcn CLI knows how to read. Each item file holds the source of one component (or block, hook, page or theme), the npm packages it needs, and any other registry items it depends on. When someone runs `shadcn add`, the CLI downloads that JSON, installs the packages, and writes the source into their project.

Nothing runs from your server after install. The code becomes theirs. That is why a registry is a good fit for UI you want people to own and edit, and a poor fit for code you want to update centrally.

There are two files to keep apart:

- **`registry.json`**: the catalogue. The docs say it is the entry point and "must be served at the root of the registry endpoint." The CLI reads it for `search` and `list`.
- **Item files** (`stat-card.json` and so on): what `add` and `view` fetch.

## What do you need before you start?

- A project with the shadcn CLI working in it. A Next.js app is easiest, because anything in `public/` is served as-is.
- The components you want to share, already working in that project.
- A public URL to host the built JSON. Any static host works.

## How do you write registry.json?

Put `registry.json` at the project root. The root needs `name` and `homepage`; each item needs `name`, `type`, `title`, `description` and `files`, and each file needs `path` and `type`. Here is a minimal registry with one item, a KPI card that depends on the official `card` component:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "acme",
  "homepage": "https://acme.com",
  "items": [
    {
      "name": "stat-card",
      "type": "registry:component",
      "title": "Stat card",
      "description": "A KPI card with a label and a value.",
      "registryDependencies": ["card"],
      "files": [
        { "path": "registry/acme/stat-card.tsx", "type": "registry:component" }
      ]
    }
  ]
}
```

And the component it points to:

```tsx
// registry/acme/stat-card.tsx
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

A few fields matter more than they look:

- **`type`** tells the CLI where a file belongs. The item schema lists types such as `registry:block`, `registry:component`, `registry:ui`, `registry:hook`, `registry:lib`, `registry:page`, `registry:file` and `registry:theme`. The `target` property is required for `registry:page` and `registry:file`.
- **`dependencies`** are npm packages. You can pin a version with `name@version`.
- **`registryDependencies`** are other registry items. A bare name like `card` comes from the default shadcn registry; a namespaced name like `@acme/input-form` or a full URL points at another registry.

## How do you build and test it locally?

Run the build. It reads `./registry.json` and writes to `./public/r` unless you pass a path or `--output`:

```bash
npx shadcn@latest build
```

You get `public/r/registry.json` and `public/r/stat-card.json`, with each file's source inlined as `content`. Start your dev server and check the output with the CLI itself before you publish anything:

```bash
# Is the catalogue readable?
npx shadcn@latest search http://localhost:3000/r/registry.json

# Does the item install cleanly? --dry-run writes nothing.
npx shadcn@latest add http://localhost:3000/r/stat-card.json --dry-run
```

We ran exactly this against a fresh Next.js 16 app: the search listed the item, and the dry run listed the files and dependencies it would write without touching the project.

To compare your output with an item that ships, open [revenue-chart.json](https://www.paneloui.com/r/revenue-chart.json): it is a `registry:block` whose two files are `registry:file` entries with explicit `target` paths, with `clsx@^2.1.1` and `tailwind-merge@^3.6.0` as dependencies and `panelo-theme` listed by full URL in `registryDependencies`.

If you would rather not build at all, the docs describe a dynamic option: install the `shadcn` package and serve items from route handlers with `loadRegistry` and `loadRegistryItem` from `shadcn/registry`.

## How do people install from your registry?

Three ways, from least to most setup:

```bash
# 1. By URL, no config
npx shadcn@latest add https://acme.com/r/stat-card.json

# 2. Add a namespace once, then use short names
npx shadcn@latest registry add @acme=https://acme.com/r/{name}.json
npx shadcn@latest add @acme/stat-card
```

The third way is editing `components.json` by hand, which is what `registry add` does for you:

```json
{
  "registries": {
    "@acme": "https://acme.com/r/{name}.json"
  }
}
```

The `{name}` placeholder is required and is replaced with the item name. An optional `{style}` placeholder lets you serve a different file per style. If a namespace needs auth, use the object form with `url`, `headers` and `params`; we cover that in [shadcn private registry auth](/blog/shadcn-private-registry-auth).

## What does a real registry look like?

Panelo UI's registry is a useful case because it is not a hand-written `registry.json`. It is generated from the components on the site, and it serves free and paid items from the same codebase. Here is how `scripts/build-registry.mts` works.

**Items come from the catalogue, not a second list.** The script reads the site's component index (name, slug, description, free or Pro) and the module each preview page renders. One source of truth means the registry cannot drift from the docs.

**Files are found by walking imports.** Starting at each entry file, the script follows every local import and collects the files. It records every npm import as a dependency, pinned to the version range in the repo's own `package.json`. React, React DOM and Next.js are skipped because the host app already has them. If an import leaves the component library, the build fails instead of shipping a broken item.

**Paths are rewritten for the user's project.** Items install into `components/panelo-ui/`, next to the user's `components/ui/`, so nothing collides with stock shadcn files. Each file is written as `registry:file` with an explicit `target`, and internal imports are rewritten to match. Image paths become absolute URLs on the site.

**A theme item carries the extra tokens.** Panelo's components use a few colour tokens stock shadcn/ui does not define (status colours and tonal pills). The script reads them from the site's CSS and emits a `registry:theme` item, `panelo-theme`, with `cssVars` for theme, light and dark. Every other item lists it in `registryDependencies` by full URL, so the tokens arrive with the first install.

**Free and Pro go to different places.** Free items are written to `public/r` and served as static files. Pro items go to a `registry-pro` folder that is never public; a route handler at `/r/pro/[name]` serves them only when the request carries a valid licence key. A guard in the build makes a free item that imports Pro code fail the build, so paid source cannot leak into a public file.

**The index lists free items only, with no file contents.** The generated `public/r/registry.json` holds names, types, titles and descriptions. That is what `npx shadcn@latest search @panelo` reads, and it matches the directory rule that a listed index's `files` must not include `content`.

You can see the result by installing any free item, for example a chart from the [components page](/components):

```bash
npx shadcn@latest registry add @panelo=https://www.paneloui.com/r/{name}.json
npx shadcn@latest add @panelo/revenue-chart
```

## What mistakes should you avoid?

- **Forgetting `target` on `registry:file` items.** The schema requires it, and without a clear target your files land somewhere unexpected.
- **Unpinned dependencies.** If your component was tested against one major version of a package, say so with `name@version`.
- **Tokens your components use but users do not have.** Ship them as a `registry:theme` dependency, or document them.
- **Assuming Radix.** New shadcn projects have used Base UI by default since July 2026. The changelog says to "ship a `registry:base` config" if your items need a specific library.
- **A canonical host that redirects.** If `acme.com` redirects to `www.acme.com`, publish the `www` URL. Redirects across hosts can drop auth headers, which matters as soon as you add a private namespace.

## How do you get listed in the official directory?

The shadcn/ui directory lets the CLI resolve a namespace with no config: when someone runs `shadcn add` or `shadcn search`, the CLI checks the index and adds a registry it finds to their `components.json`. To be listed, add your registry to `apps/v4/registry/directory.json` in the shadcn-ui/ui repo, run `pnpm validate:registries`, and open a pull request.

The requirements are short: the registry must be open source and publicly accessible, valid against the schema, flat (no nested items), and the index's `files` must not include `content`. A private, paid namespace cannot be listed, which is why registries that sell Pro items usually list their free namespace and keep the paid one separate. For how the listed registries compare, see [the best shadcn registries](/blog/best-shadcn-registries).

## Get this working in your app

See a finished registry from the user's side before you publish your own. Add the free Panelo namespace under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install one item:

```bash
npx shadcn@latest add @panelo/revenue-chart
```

Open `components/panelo-ui/blocks/charts/revenue-chart.tsx` and the new theme variables in your CSS to see exactly what one item delivered.

- **See it live:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart), and the generated [registry index](https://www.paneloui.com/r/registry.json) that `npx shadcn@latest search @panelo` reads.
- **The paid half of the same registry, in Panelo Pro:** a licence key opens the `@panelo-pro` namespace (object form with a bearer header, set up as in [shadcn private registry auth](/blog/shadcn-private-registry-auth)). It installs full pages the same way, for example `npx shadcn@latest add @panelo-pro/dashboard-pages-3` for the [Overview Analytics Dashboard](https://www.paneloui.com/components/dashboard-pages-3): revenue, orders and new-customer stat cards, bar sparklines and an interactive pixel-mosaic sales-trend chart. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Do I need Next.js to host a shadcn registry?

No. A registry is static JSON, so any host that serves files over HTTPS works. Next.js is convenient because `public/r` is served as-is and the dev server serves it locally too.

### What is the difference between registry.json and an item JSON file?

`registry.json` is the catalogue the CLI uses for `search` and `list`. Each item file holds one item's source code and dependencies, and is what `add` and `view` fetch.

### Can a registry item depend on items from another registry?

Yes. `registryDependencies` can mix bare names from the default registry, namespaced names and full URLs. The CLI resolves each from its own registry and installs them in order.

### Can I sell items through a shadcn registry?

Yes. Put paid items behind a namespace that sends a token in a header, and check it on the server. Panelo UI does this with a licence key for its [Pro items](/#pricing).

### How do users find what is in my registry?

They can run `npx shadcn@latest search @yournamespace` once the namespace is configured, or search your catalogue URL directly. Listing in the official directory removes the config step for open-source registries.

## Sources

- shadcn/ui, Getting started (registry): https://ui.shadcn.com/docs/registry/getting-started
- shadcn/ui, registry.json: https://ui.shadcn.com/docs/registry/registry-json
- shadcn/ui, registry-item.json: https://ui.shadcn.com/docs/registry/registry-item-json
- shadcn/ui, Namespaces: https://ui.shadcn.com/docs/registry/namespace
- shadcn/ui, Registry index: https://ui.shadcn.com/docs/registry/registry-index
- shadcn/ui, CLI reference: https://ui.shadcn.com/docs/cli
- shadcn/ui changelog, Base UI as the default (July 2026): https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- shadcnblocks, registry auth failure on non-www URLs: https://www.shadcnblocks.com/blog/shadcn-registry-auth-cross-host-redirects
- Panelo UI registry index: https://www.paneloui.com/r/registry.json
