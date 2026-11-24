---
title: "Is shadcn/ui Built on Vercel's UI SDK? What We Know"
description: "No: shadcn/ui runs on Base UI, Radix or React Aria, and Vercel hasn't said it will move to UI SDK. Here's what is known and how to use both in one project."
slug: is-shadcn-built-on-ui-sdk
primaryKeyword: shadcn ui sdk
secondaryKeywords:
  - does shadcn use ui sdk
  - vercel ui sdk shadcn
  - shadcn base ui radix react aria
  - ui sdk vs base ui
  - shadcn ai agent
intent: informational
cluster: UI SDK
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1691
cta:
  free: [agent-kit]
  pro: [dashboard-pages-11]
---

# Is shadcn/ui built on Vercel's UI SDK? What we know

No. As of November 2026, shadcn/ui components are built on Base UI (the default for new projects), Radix or React Aria, and its charts use Recharts. Vercel's UI SDK is a separate beta library from Vercel Labs. Vercel has not said whether shadcn/ui will move onto it, though you can use both in one project today.

> **Skip the build:** [Agent kit](https://www.paneloui.com/r/agent-kit.json) is a free, MIT-licensed shadcn/ui registry item (code, not a visual component) that adds the UI SDK agent bridge to a shadcn/ui project: a shared bridge that holds marked steps for a person, a chat hook that runs a model's calls on the page, and an `/api/agent` route, installed with the same shadcn CLI you already use. Add it with `npx shadcn@latest add @panelo/agent-kit` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Why are people asking?

Three things point at a connection, so the question is fair.

- **Timing.** Vercel's UI SDK came out of Vercel Labs in late 2026, the same year shadcn/ui added two new component bases.
- **The npm maintainer.** The maintainer account listed on the `@ui-sdk/react` npm package is named `shadcn`.
- **Same audience.** Both target React developers who own their component source and use Tailwind CSS.

None of that is an announcement. InfoQ's coverage of the UI SDK launch put it plainly: "Vercel has not said whether shadcn/ui will be rebuilt on UI SDK." We checked every entry in the shadcn/ui changelog up to the latest one (October 2026) and found no mention of UI SDK.

## What is shadcn/ui built on today?

shadcn/ui is not a component library in the usual sense. It is a set of components you copy into your project, each built on a headless primitive library and styled with Tailwind CSS. The primitive layer has changed over time.

| Date | Change | Source |
|---|---|---|
| January 2023 | shadcn/ui launches, built on Radix | shadcn/ui changelog |
| July 2, 2026 | Base UI becomes the default for new projects; Radix "still fully supported" | shadcn/ui changelog |
| July 17, 2026 | React Aria becomes a first-class component base (`--base aria`) | shadcn/ui changelog |
| October 14, 2026 | AI Elements added to the docs as patterns for agentic interfaces | shadcn/ui changelog |

The charts are a separate story. The shadcn/ui chart docs say: "We use Recharts under the hood."

So when you run `npx shadcn init` today, you get Base UI unless you pick another base. You do not get UI SDK.

## How is UI SDK different from Base UI, Radix and React Aria?

All four are headless: they handle behavior and accessibility and leave styling to you. The difference is in who they are built for.

| | Base UI | Radix | React Aria | Vercel's UI SDK |
|---|---|---|---|---|
| Status | Stable | Stable | Stable | Beta |
| Frameworks | React | React | React | React, Vue, Svelte, Solid, Web Components |
| shadcn/ui base option | Yes (default) | Yes | Yes | No |
| Agent bridge (snapshot, act, query) | No | No | No | Yes |
| Confirm-first marks for agents | No | No | No | `data-agent-confirm` |

UI SDK's distinctive feature is the agent bridge. Created with `createAgent()`, it lets an AI agent read every UI SDK component on the page as named controls with their state, and change them through each component's own API. We explain how it works in [Vercel's UI SDK explained](/blog/vercel-ui-sdk-explained).

Be fair to the others here. Base UI, Radix and React Aria are mature, widely used and well documented. If you have no plans for in-app agents, they are the safer choice today, and an agent can still operate them through browser tools that read the accessibility tree. UI SDK's own benchmark found that a UI SDK screen driven through browser tools costs about the same as Base UI. The savings came from the bridge's structured tools.

## Will shadcn/ui move to UI SDK?

We do not know, and nobody outside Vercel has said. Here is how to think about it without guessing:

- shadcn/ui has a track record of **adding** bases rather than replacing them. When Base UI arrived, the changelog says, "we rebuilt every component for Base UI, kept the same abstraction, and let you choose." Radix stayed supported.
- In that same post, shadcn wrote that "the worst thing you can do for your production app is switch component libraries." That is good advice regardless of what happens next.
- UI SDK is in beta. Its README says APIs and behavior may change before general availability.

If shadcn/ui ever adds UI SDK as a base, the likely shape based on history is another option next to the existing ones, not a forced migration. That is a pattern, not a prediction. Watch the shadcn/ui changelog for anything official.

## Can you use UI SDK in a shadcn/ui project today?

Yes. Nothing stops you. Install the packages:

```bash
npm install @ui-sdk/react @ui-sdk/core
```

UI SDK components are unstyled and import per component, for example `@ui-sdk/react/switch`. You can wrap one in the same style as your shadcn/ui components, using `cn()` and Tailwind classes on UI SDK's data attributes:

```tsx
// components/agent-ui/switch.tsx
"use client"

import * as React from "react"
import { Switch as SwitchPrimitive, SwitchThumb } from "@ui-sdk/react/switch"
import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: Omit<React.ComponentProps<typeof SwitchPrimitive>, "children">) {
  return (
    <SwitchPrimitive
      className={cn(
        "inline-flex h-5 w-9 items-center rounded-full data-checked:bg-primary data-unchecked:bg-input",
        className
      )}
      {...props}
    >
      <SwitchThumb className="block size-4 rounded-full bg-background transition-transform data-checked:translate-x-4 data-unchecked:translate-x-0.5" />
    </SwitchPrimitive>
  )
}

export { Switch }
```

Keep these wrappers in their own folder so they do not collide with `components/ui`. Then create the agent bridge once (`createAgent()` from `@ui-sdk/react/agent`) and your new controls are readable and operable by an agent. The step-by-step version is in the [@ui-sdk/react tutorial](/blog/ui-sdk-react-tutorial).

To connect a model to that bridge, Panelo UI's free [agent kit](https://www.paneloui.com/r/agent-kit.json) adds the bridge file, a chat hook and an `/api/agent` route with one shadcn CLI command.

Two practical notes:

- You can mix bases. An agent bridge only sees UI SDK components, so put UI SDK where you want agents to act (settings, filters, row actions), and leave the rest as it is.
- Pin the UI SDK version. Beta releases have been frequent.

## What about shadcn/ui and AI agents in general?

shadcn/ui already has agent-related pieces, but they solve a different problem. AI Elements covers the conversation: messages, prompt inputs, reasoning and tool-call displays. UI SDK covers the rest of the screen: the controls the conversation should change. They work well together. If the naming is confusing, [UI SDK vs AI SDK](/blog/ui-sdk-vs-ai-sdk) lays out all of Vercel's similarly named projects.

## Is there a shadcn/ui registry built on UI SDK?

Panelo UI is one. It is a shadcn/ui registry of dashboard components, charts and pages whose interactive parts wrap UI SDK primitives, much like the Switch above. It installs with the shadcn CLI: add `"@panelo": "https://www.paneloui.com/r/{name}.json"` under `registries` in `components.json`, then run `npx shadcn@latest add @panelo/<item>`. Files land in `components/panelo-ui`, next to your `components/ui`, so nothing collides. Free items are MIT. You can see an agent operate a Panelo dashboard on the [agent demo](/agent-demo) or browse the [components](/components). It is built by Raycanvas and backed by Shadcn Labs. It is not an official shadcn/ui project.

## Get this working in your app

Add the Panelo registry to `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the kit:

```bash
npx shadcn@latest add @panelo/agent-kit
```

You get `components/panelo-ui/lib/agent.ts` (the bridge), `components/panelo-ui/hooks/use-agent-chat.ts` (the `useAgentChat` hook) and `app/api/agent/route.ts`, plus the `panelo-theme` tokens. Set `GROQ_API_KEY` on your server, a free key from console.groq.com; nothing else in the kit needs a key. The bridge sees UI SDK components only, so pair it with UI SDK controls or Panelo blocks. In a client component, call `useAgentChat()`, render its `entries` (messages and a plain-words log of each step) and its `confirm` question, and pass the person's text to `send()`.

In the setup above, import `getAgent` from the kit instead of calling `createAgent()` yourself, so your UI SDK wrappers and the chat share one bridge. The kit's bridge and hook land in `components/panelo-ui`, away from your `components/ui`.

**See it live:** the [agent demo](https://www.paneloui.com/agent-demo) is a dashboard an AI agent operates through Vercel's UI SDK, and it asks before anything destructive.

**The Pro step:** [AI Automation Dashboard](https://www.paneloui.com/components/dashboard-pages-11) is the full screen from that demo: an AI workflow-automation dashboard with stat cards, an active-workflows table, a templates carousel and an Ask AI assistant panel. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Is shadcn/ui built on Vercel's UI SDK?

No. shadcn/ui components are built on Base UI, Radix or React Aria, and its charts on Recharts. UI SDK is a separate library.

### Will shadcn/ui switch to UI SDK?

Vercel has not said. shadcn/ui has historically added new bases alongside old ones rather than forcing a switch.

### Can I use UI SDK components alongside shadcn/ui components?

Yes. Install `@ui-sdk/react` and `@ui-sdk/core`, wrap the components you want in Tailwind styles, and keep them in a separate folder from `components/ui`.

### Who maintains the @ui-sdk/react npm package?

The package is published from Vercel Labs' `vercel-labs/ui` repository, and the npm maintainer account listed on it is named `shadcn`.

### Is UI SDK better than Base UI?

Not in general. Base UI is stable and the shadcn/ui default. UI SDK is in beta and mainly worth it when you want AI agents to operate your UI through its bridge.

## Sources

- shadcn/ui changelog, July 2026, Base UI as the default: https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- shadcn/ui changelog, July 2026, React Aria: https://ui.shadcn.com/docs/changelog/2026-07-react-aria
- shadcn/ui changelog, October 2026, AI Elements: https://ui.shadcn.com/docs/changelog/2026-10-ai-elements
- shadcn/ui changelog (all entries): https://ui.shadcn.com/docs/changelog
- shadcn/ui chart docs (Recharts): https://ui.shadcn.com/docs/components/chart
- InfoQ, "Vercel Releases UI SDK": https://www.infoq.com/news/2026/11/vercel-ui-sdk/
- `@ui-sdk/react` npm registry entry: https://registry.npmjs.org/@ui-sdk%2Freact
- UI SDK README: https://github.com/vercel-labs/ui
- UI SDK, Built for Agents (bridge and benchmark): https://ui-sdk.dev/docs/agents
- UI SDK Switch docs: https://ui-sdk.dev/docs/react/components/switch
