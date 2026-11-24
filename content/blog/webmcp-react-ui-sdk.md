---
title: "WebMCP in React: Expose Your UI with UI SDK registerTools"
description: "Add WebMCP to a React or Next.js app without hand-writing a tool per control: UI SDK's registerTools exposes snapshot, act and query to browser agents safely."
slug: webmcp-react-ui-sdk
primaryKeyword: webmcp react
secondaryKeywords:
  - webmcp nextjs
  - webmcp example
  - ui sdk webmcp
  - registerTools webmcp
  - document.modelContext
intent: informational
cluster: UI SDK
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1980
cta:
  free: [agent-kit]
  pro: [dashboard-pages-11]
---

# WebMCP in React without hand-writing tools: UI SDK's registerTools

To add WebMCP to a React app, you can register tools one by one with `document.modelContext.registerTool()`, or build the page from Vercel's UI SDK and call `registerTools(agent, { allow })`. That one call exposes three generic tools, `snapshot`, `act` and `query`, which let a browser's agent read and operate every UI SDK component on the page.

> **Skip the build:** [Agent kit](https://www.paneloui.com/r/agent-kit.json) is a free, MIT-licensed shadcn/ui registry item (code, not a visual component) that ships this setup with the ask-the-person pattern already done: one UI SDK bridge whose `allow` waits for a person on `data-agent-confirm` steps, `registerTools` so WebMCP browser agents get the same tools and rules, plus a chat hook and an `/api/agent` route for your own assistant. Add it with `npx shadcn@latest add @panelo/agent-kit` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What is WebMCP?

WebMCP is a proposed web API that lets a page expose its functionality as tools: JavaScript functions with natural-language descriptions and JSON Schemas that an AI agent can call. The agent can be built into the browser, run in an extension, or sit in another app's embedded browser. The spec is an experimental W3C community group draft, developed in the `webmachinelearning/webmcp` repository.

The core API is imperative. A page calls `document.modelContext.registerTool()` with a name, description, input schema and an `execute` callback. A declarative version based on HTML forms is being explored but is not in the spec yet. Older tutorials use `navigator.modelContext`; the current draft uses `document.modelContext`.

## Which browsers support WebMCP today?

Support is early. As listed in the spec repo's implementation status page at the time of writing:

| Where | Status |
|---|---|
| Chrome | Origin trial in Chrome 149; a flag for local testing |
| Edge | Origin trial in Edge 150 |
| ChatGPT desktop app | Supported in its built-in browser ("site tools") |
| Brave | Support announced for an upcoming release |
| Firefox | Standards position under discussion |

There is also a polyfill, `@w3c/webmcp-polyfill`, that provides `document.modelContext` for registering and testing tools. Connecting to a real browser agent still needs native support. Because support is moving fast, check the implementation status page before you rely on any row above.

## How do you add WebMCP to React by hand?

Here is one hand-written tool in a React component. It registers on mount and unregisters on unmount by aborting a signal, which is how the spec removes tools:

```tsx
"use client"

import { useEffect, useState } from "react"

export function DateRangeFilter() {
  const [range, setRange] = useState("30d")

  useEffect(() => {
    const modelContext = (document as any).modelContext // types: webmcp-types
    if (!modelContext?.registerTool) return

    const controller = new AbortController()
    modelContext.registerTool(
      {
        name: "set-date-range",
        description: "Sets the dashboard date range.",
        inputSchema: {
          type: "object",
          properties: { range: { type: "string", enum: ["7d", "30d", "90d"] } },
          required: ["range"],
        },
        execute({ range }: { range: string }) {
          setRange(range)
          return { range }
        },
      },
      { signal: controller.signal }
    )
    return () => controller.abort()
  }, [])

  return <p>Showing {range}</p>
}
```

This is a good fit when a page has a few high-level actions, like "add to cart" or "search flights". It gets heavy on a dashboard. Every filter, switch, tab, row menu and dialog needs its own tool, schema and handler, and each one has to stay in sync with the UI as it changes. The tool also bypasses your components: `setRange` changes state, but nothing tells the Select's change callback that an agent did it.

## How does UI SDK's registerTools work?

Vercel's UI SDK (in beta) takes a different approach. Its components already describe themselves to an agent bridge: their label, state and the actions they accept. `registerTools` publishes that bridge through WebMCP as three tools:

| Tool | What it does | WebMCP annotations |
|---|---|---|
| `snapshot` | Lists components on the page, their state and available actions | `readOnlyHint`, `untrustedContentHint` |
| `query` | Finds components, or the choices inside a Select or Combobox | `readOnlyHint`, `untrustedContentHint` |
| `act` | Runs steps such as `setValue`, `setChecked` or `press` through each component's API | `consequentialHint`, `untrustedContentHint` |

The `consequentialHint` on `act` lets the browser ask the person before it runs. `untrustedContentHint` tells the agent that results contain page text, such as names people typed, which it should treat as data and not instructions.

New to the bridge? Read [Vercel's UI SDK explained](/blog/vercel-ui-sdk-explained) first.

## How do you set it up in React or Next.js?

### Step 1: Install UI SDK

```bash
npm install @ui-sdk/react @ui-sdk/core
```

The React adapter needs React 19 or newer.

### Step 2: Create the bridge and register the tools

```ts
// lib/agent.ts
import { createAgent, registerTools } from "@ui-sdk/react/agent"

type Agent = ReturnType<typeof createAgent>
let agent: Agent | undefined

export function getAgent() {
  if (agent) return agent
  agent = createAgent()
  registerTools(agent, {
    // The browser's agent may do anything except steps on marked controls.
    allow: (step) => !step.confirm,
  })
  return agent
}
```

In browsers without `document.modelContext.registerTool`, `registerTools` does nothing, so this is safe to ship everywhere. It returns an `unregister` function if you need to remove the tools later.

### Step 3: Create the bridge when the page mounts

```tsx
"use client"

import { useEffect } from "react"
import { getAgent } from "@/lib/agent"

export function AgentBridge() {
  useEffect(() => void getAgent(), [])
  return null
}
```

Render `<AgentBridge />` in your dashboard layout. The bridge picks up UI SDK components already on the page and registers new ones as they mount.

### Step 4: Build with labelled UI SDK components

```tsx
<Select defaultValue="30d" items={ranges}>
  <SelectLabel>Date range</SelectLabel>
  {/* trigger, content, items */}
</Select>

<Button data-agent-confirm="Deletes this report for everyone" onClick={deleteReport}>
  Delete report
</Button>
```

There is no per-control tool. The browser's agent calls `snapshot`, sees a select labelled "Date range" with its value and actions, and calls `act` with `{ ref: "Date range", action: "setValue", args: ["Last 7 days"] }`. The Select's own change callback runs with `details.source === "agent"`.

The full component setup is in the [@ui-sdk/react tutorial](/blog/ui-sdk-react-tutorial).

## How do you keep a browser agent from doing damage?

You did not write the browser's agent, so treat it as untrusted. UI SDK gives `registerTools` its own `allow`, which runs for every step the browser's agent requests, after the bridge's own `allow`. Your component change callbacks still apply on top.

Three patterns, from strict to permissive:

1. **Read-only.** `allow: () => false`. The browser agent can call `snapshot` and `query` but every `act` step is refused.
2. **Leave marked controls to the person.** `allow: (step) => !step.confirm`. Ordinary controls work; anything with `data-agent-confirm` is refused, so the person has to press it.
3. **Ask the person in your own UI.** Put the approval in the bridge's `allow` (it can return a promise that resolves when the person answers), and let `registerTools` pass steps through. The docs' guide uses a simpler version: `allow: (step) => step.action !== "press" || confirm(...)`.

The UI SDK docs warn that an `allow` returning `true` without checking `step.confirm` answers yes for the person. Do not write `allow: () => true` on `registerTools` unless the bridge's own `allow` already asks.

Panelo UI's free [agent kit](https://www.paneloui.com/r/agent-kit.json) ships pattern 3 as a ready file: the bridge's `allow` waits for the person on marked steps, and `registerTools` passes steps through so the person is asked once.

And as with any client-side control: the server must still check permissions on every write. WebMCP tools run in the page with the user's session, which is convenient and also why you should be careful.

## How do you test it?

- In any browser console, check for the API: `typeof document.modelContext?.registerTool` returns `"function"` where registration is supported.
- In Chrome, enable the WebMCP testing flag for local development, as described in the spec's implementation status page.
- UI SDK's guide walks through the ChatGPT desktop app: open your local app in its built-in browser, open **Site tools**, and you should see `snapshot`, `query` and `act`. It does not discover tools inside an iframe.
- Even without WebMCP, you can call `snapshot()` and `act()` on the bridge directly from the console or tests.

## Hand-written tools or UI SDK registerTools?

| | Hand-written WebMCP tools | UI SDK `registerTools` |
|---|---|---|
| Setup | One tool per action | One call for the page |
| Best for | A few high-level actions (checkout, search) | Dense UIs: dashboards, settings, admin panels |
| Goes through component logic | Only if you wire it | Yes, via each component's API |
| Confirmation | You build it | `allow` plus `data-agent-confirm` |
| Maturity | Spec is an experimental draft | Spec draft plus a beta library |

They also combine. Nothing stops you registering a high-level `checkout` tool by hand next to UI SDK's three generic ones.

## Does Panelo UI support WebMCP?

Yes. Panelo UI is a shadcn/ui registry built on Vercel's UI SDK, and its free `agent-kit` creates one bridge per page with an approval prompt in the bridge's `allow`, then registers the same tools through WebMCP. So a dashboard built from Panelo components works with an in-app assistant and with a WebMCP-capable browser agent, under the same rules. See it on the [agent demo](/agent-demo) or browse the [components](/components). For the wider design question, read [what is agent-ready UI](/blog/what-is-agent-ready-ui).

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

For WebMCP alone, render any component that calls `useAgentChat()` (it creates the bridge on mount), or call `getAgent()` from `@/components/panelo-ui/lib/agent` in an effect, as in step 3. Show the hook's `confirm` somewhere visible: a browser agent's marked steps wait on the same question.

**See it live:** the [agent demo](https://www.paneloui.com/agent-demo) is a dashboard an AI agent operates through Vercel's UI SDK, and it asks before anything destructive.

**The Pro step:** [AI Automation Dashboard](https://www.paneloui.com/components/dashboard-pages-11) is the full screen from that demo: an AI workflow-automation dashboard with stat cards, an active-workflows table, a templates carousel and an Ask AI assistant panel. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Is WebMCP the same as MCP?

No. MCP connects AI platforms to services, usually through a server. WebMCP lets a web page register tools in the browser, so the agent works with the page and the user's existing session.

### Is it document.modelContext or navigator.modelContext?

The current WebMCP draft uses `document.modelContext.registerTool()`. Some older guides and libraries use `navigator.modelContext`.

### Does registerTools break in browsers without WebMCP?

No. UI SDK's `registerTools` does nothing when `document.modelContext.registerTool` is missing, and the bridge still works for your own in-app agent.

### Can a browser agent press any button through UI SDK?

Only if your `allow` callbacks let it. Mark risky controls with `data-agent-confirm` and refuse or ask on those steps.

### Do I need Next.js for this?

No. Any React 19 app works, and UI SDK also has adapters for Vue, Svelte, Solid and Web Components with the same `registerTools`.

## Sources

- WebMCP proposal and README: https://github.com/webmachinelearning/webmcp
- WebMCP implementation status: https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md
- Chrome, WebMCP origin trial: https://developer.chrome.com/blog/ai-webmcp-origin-trial
- WebMCP polyfill: https://www.npmjs.com/package/@w3c/webmcp-polyfill
- UI SDK, WebMCP: https://ui-sdk.dev/docs/agents/connect-an-agent/webmcp
- UI SDK, Guide (ChatGPT site tools): https://ui-sdk.dev/docs/agents/connect-an-agent/guide
- UI SDK, Permissions: https://ui-sdk.dev/docs/agents/connect-an-agent/permissions
- UI SDK README: https://github.com/vercel-labs/ui
