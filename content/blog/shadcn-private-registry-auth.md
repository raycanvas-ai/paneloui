---
title: "shadcn Private Registry: Auth With Tokens and Licence Keys"
description: "Set up a shadcn private registry: send a token from components.json, keep it in .env.local, check it in a Next.js route, and avoid the redirect that drops it."
slug: shadcn-private-registry-auth
primaryKeyword: shadcn private registry
secondaryKeywords:
  - shadcn registry auth
  - shadcn registry token
  - shadcn registry headers
  - sell shadcn components
  - shadcn registry 401
intent: informational
cluster: shadcn registry
date: 2026-11-24
status: draft
author: Raycanvas
cta:
  free: [revenue-chart]
  pro: [dashboard-pages-1]
wordCount: 1778
---

# shadcn private registry: auth with tokens and licence keys

A shadcn private registry is a namespace in `components.json` whose requests carry a secret. Add the namespace in object form with a `headers` entry such as `"Authorization": "Bearer ${REGISTRY_TOKEN}"`, keep the token in `.env.local`, and have your server return the item only when the token is valid, and a 401 with a message when it is not.

> **Skip the build:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) is a free, MIT-licensed shadcn/ui block (a dual-line revenue chart) that installs from the public half of Panelo UI's two-namespace registry, with no token and no `.env` entry, so you can see the plain path work before you add auth to yours. Add it with `npx shadcn@latest add @panelo/revenue-chart` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

This guide covers both sides: what the person installing has to configure, and what the server has to check. It ends with how Panelo UI sells its Pro items this way, including two mistakes we designed around.

## How does authentication work in the shadcn CLI?

Registry auth is configured per namespace: the CLI sends whatever you put in that namespace's config with every request to that registry. The shadcn docs list three methods:

| Method | What the CLI sends | Notes |
|---|---|---|
| Bearer token | `Authorization: Bearer <token>` header | The most common pattern |
| API key header | A custom header such as `X-API-Key` | Useful when you need several values, like a workspace ID |
| Query parameter | `?token=<token>` on the URL | Simplest to set up, but URLs tend to end up in logs |

All three read the secret from an environment variable using `${VAR}` placeholders, so the token itself never sits in `components.json`.

## How do you configure components.json for a private registry?

Use the object form of a namespace. This is the bearer pattern from the docs:

```json
{
  "registries": {
    "@private": {
      "url": "https://registry.company.com/{name}.json",
      "headers": {
        "Authorization": "Bearer ${REGISTRY_TOKEN}"
      }
    }
  }
}
```

A custom header looks the same, with a different key:

```json
{
  "registries": {
    "@premium": {
      "url": "https://premium.company.com/{name}.json",
      "headers": {
        "X-License-Key": "${LICENSE_KEY}"
      }
    }
  }
}
```

Then install as usual:

```bash
npx shadcn@latest add @private/data-table
```

## Where should the token live?

In `.env.local` (or `.env`), which the CLI reads, and which should never be committed:

```bash
# .env.local
REGISTRY_TOKEN=your_token_here
```

We tested this with shadcn 4.23.0. With the variable missing, the CLI stops before making a request and names it: `Registry "@panelo-pro" requires the following environment variables: PANELO_LICENSE_KEY`, with the suggestion to set it in `.env` or `.env.local`. With the variable set in `.env.local`, the request went out with the header.

For CI, set the same variable as a secret in your pipeline. You can also pass it inline for a one-off install, as the docs show: `REGISTRY_TOKEN=your_token npx shadcn@latest add @private/button`.

## What should the server check?

The registry is just an HTTP endpoint, so the checks are ordinary API hygiene. A minimal Next.js route handler for `/r/pro/[name]` looks like this:

```ts
// app/r/pro/[name]/route.ts
import { readFile } from "node:fs/promises"
import { createHash } from "node:crypto"

import { findLicenceByKeyHash } from "@/lib/licences" // your own lookup

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const key =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? ""
  const hash = createHash("sha256").update(key).digest("hex")
  const licence = key ? await findLicenceByKeyHash(hash) : null

  if (!licence) {
    // The CLI shows this message to the user.
    return Response.json(
      { error: "A valid licence key is required." },
      { status: 401 }
    )
  }

  // Item names are slugs. Anything else never reaches the filesystem.
  const name = (await params).name.replace(/\.json$/, "")
  if (!/^[a-z0-9-]+$/.test(name)) {
    return Response.json({ error: "Not found." }, { status: 404 })
  }

  // Built outside public/, so it is never served without this check.
  const body = await readFile(
    `${process.cwd()}/registry-private/${name}.json`,
    "utf8"
  ).catch(() => null)

  return body
    ? new Response(body, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "private, no-store",
        },
      })
    : Response.json({ error: "Not found." }, { status: 404 })
}
```

The points that matter:

- **Store a hash of each key, not the key.** Show the key to the buyer once and compare hashes after that.
- **Validate the item name** before it touches the filesystem, so `../` tricks go nowhere.
- **Keep private items outside `public/`.** In Next.js anything in `public/` is served to anyone.
- **Mark responses `private, no-store`** so a shared cache never hands one buyer's response to someone else.
- **Rate-limit by IP** and return 429 when exceeded. The docs list rate limiting, token rotation and access logging as recommendations.

The docs also list the status codes the CLI understands: 401 for a missing or invalid token, 403 for a valid token without permission for that item, and 429 for rate limiting. A `message` in the response body is shown to the user, so write it for a person.

## What errors will people see, and what do they mean?

| What the user sees | Likely cause | Fix |
|---|---|---|
| "requires the following environment variables" | Variable not set | Add it to `.env.local` |
| "You are not authorized to access the item" plus your message | Server returned 401 | Wrong, expired or revoked key |
| 401 with a key you know is valid | Auth header dropped on a redirect | Use the final host, usually `www` |
| Auth error only from a subfolder | CLI not run from the folder with `components.json` | Run it from the project root |
| 404 | Typo in the item name | Check with `shadcn search` on the free namespace |

## Why does a valid token still get a 401?

The most common cause is a redirect. In July 2026 shadcnblocks documented installs failing for users whose config used the apex domain: `shadcnblocks.com` redirects to `www.shadcnblocks.com`, and native `fetch`, which the CLI uses from 4.11.1, strips the `Authorization` header on any redirect that changes origin. `curl -L` does the same.

The fix is to publish the final host. Panelo's apex domain redirects to `www` too, which is why every Panelo config line uses `https://www.paneloui.com`. If you run a registry, avoid redirects on registry paths, and put the exact URL in your docs.

## Should free and paid items share one namespace?

Usually not. Once a namespace has a `headers` entry with a `${VAR}`, the CLI requires that variable before it fetches anything from that namespace, free items included. shadcnblocks' docs make the same point for their own registry. Two namespaces avoid the problem: one plain URL for free items, one with headers for paid ones. It also keeps your free namespace eligible for the official directory, which only lists open, publicly accessible registries.

## How does Panelo UI sell Pro items through a private registry?

Panelo UI uses the two-namespace setup. Free items, such as the [charts](/components), install from a plain URL with no key (try `npx shadcn@latest add @panelo/revenue-chart`), and Pro items from a second namespace with a header:

```json
{
  "registries": {
    "@panelo": "https://www.paneloui.com/r/{name}.json",
    "@panelo-pro": {
      "url": "https://www.paneloui.com/r/pro/{name}.json",
      "headers": { "Authorization": "Bearer ${PANELO_LICENSE_KEY}" }
    }
  }
}
```

Behind it:

- **Two build outputs.** The build script writes free items to `public/r` as static files and Pro items to a separate folder that is never public. It fails the build if a free item imports Pro code, so paid source cannot leak into a public file. The full build is described in [how to create a shadcn registry](/blog/how-to-create-a-shadcn-registry).
- **A route handler for Pro.** `/r/pro/[name]` applies a per-IP rate limit, reads the bearer key, and looks it up by its SHA-256 hash. No match returns 401 with "A valid Panelo Pro licence key is required."
- **Keys are shown once and can be rotated.** The account page shows the key and the exact `components.json` lines. Rotating makes a new key and replaces the old one.
- **The key follows the plan.** A key stops opening the registry when its licence is revoked or its update window ends. On the 1 Year of Updates plan, that means new Pro releases stop after a year, while everything already installed stays in the buyer's repo. Plans and terms are on the [pricing section](/#pricing).

None of this is special to Panelo. It is the pattern the shadcn docs describe, plus the details that bit other registries first.

## Get this working in your app

Start with the free namespace, which needs no token. Add it under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install a chart:

```bash
npx shadcn@latest add @panelo/revenue-chart
```

With a Panelo Pro licence key, add the `@panelo-pro` entry shown above, put `PANELO_LICENSE_KEY=...` in `.env.local`, and install Pro items the same way:

```bash
npx shadcn@latest add @panelo-pro/dashboard-pages-1
```

- **See it live:** [Revenue Lines](https://www.paneloui.com/components/revenue-chart) and the [Companies CRM Table](https://www.paneloui.com/components/dashboard-pages-1).
- **What the key installs, in Panelo Pro:** every Pro page, calendar and block, for example the [Companies CRM Table](https://www.paneloui.com/components/dashboard-pages-1): a CRM companies table with a resizable sidebar, saved views, sort and filter menus, column visibility, row selection, footer calculations and CSV export. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Can I use a shadcn private registry without a server?

Not if you want real access control. Static hosting cannot check a token, so you need something that runs code, such as a Next.js route handler, a serverless function or an edge function.

### Does the shadcn CLI read .env.local?

Yes. In our tests with shadcn 4.23.0, a token set only in `.env.local` was sent with the request, and a missing variable produced an error naming it.

### Should I use a header or a query parameter for the token?

Prefer a header. Query parameters work and are simpler, but full URLs are more likely to be written to server and proxy logs.

### Why do I get a 401 when my token is correct?

Check the host first. If the registry URL redirects to another host, such as apex to `www`, the auth header is dropped. Use the final URL in `components.json`.

### Can a private registry be listed in the shadcn directory?

No. The directory requires registries to be open source and publicly accessible. List your free namespace and document the private one yourself.

## Sources

- shadcn/ui, Authentication: https://ui.shadcn.com/docs/registry/authentication
- shadcn/ui, Namespaces: https://ui.shadcn.com/docs/registry/namespace
- shadcn/ui, Registry index: https://ui.shadcn.com/docs/registry/registry-index
- shadcnblocks, Shadcn CLI registry auth failure on non-www URLs (2026-07-02): https://www.shadcnblocks.com/blog/shadcn-registry-auth-cross-host-redirects
- shadcnblocks, Shadcn CLI docs: https://www.shadcnblocks.com/docs/shadcn-cli/overview
- shadcnblocks, CLI troubleshooting: https://www.shadcnblocks.com/docs/shadcn-cli/troubleshooting
- shadcn package on npm (version tested): https://www.npmjs.com/package/shadcn
