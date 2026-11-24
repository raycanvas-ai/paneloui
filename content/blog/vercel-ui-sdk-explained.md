---
title: "Vercel UI SDK Explained: Behaviors and the Agent Bridge"
description: "What Vercel's UI SDK is, how behaviors, primitives and the agent bridge work, what the benchmark shows, and whether the beta is ready for your React app."
slug: vercel-ui-sdk-explained
primaryKeyword: vercel ui sdk
secondaryKeywords:
  - ui sdk vercel
  - vercel labs ui
  - ui-sdk.dev
  - "@ui-sdk/react"
  - ui sdk agent bridge
  - createAgent
intent: informational
cluster: UI SDK (pillar)
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 2232
cta:
  free: [agent-kit]
  pro: [dashboard-pages-11]
---

# Vercel's UI SDK explained: behaviors, primitives and the agent bridge

Vercel's UI SDK is an open-source TypeScript library from Vercel Labs, currently in beta, for building UI components out of tested behaviors (focus, keyboard navigation, selection, popups, drag and drop). Its agent bridge lets an AI agent read every component on a page as named controls and change them through each component's own API.

> **Skip the build:** [Agent kit](https://www.paneloui.com/r/agent-kit.json) is a free, MIT-licensed shadcn/ui registry item (code, not a visual component) that puts the agent bridge this post explains into your app: one shared `createAgent()` bridge whose `allow` waits for a person on `data-agent-confirm` steps, a React hook that runs a model's `snapshot`, `act` and `query` calls on the page, and an `/api/agent` route for the model. Add it with `npx shadcn@latest add @panelo/agent-kit` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What is Vercel's UI SDK?

The project describes itself as "a library of behaviors for agents to build and drive the next generation of user interfaces." That sentence holds two ideas, and they are worth separating.

**Agents build components.** `@ui-sdk/core` ships behaviors: small, tested building blocks such as `createPopup`, `createSelection`, `createTypeahead` and `createRovingFocus`. A coding agent (or you) combines them into a component. The keyboard handling, focus management and ARIA come from the behaviors, so the agent does not have to reinvent them each time.

**Agents use components.** A page built with UI SDK components can be read and operated by an agent at runtime. The agent calls `snapshot()` to see what is on screen, then `act()` to change it. No screenshots, no pixel coordinates, no guessing which `<div>` is the real button.

Most libraries do one of these. UI SDK is designed for both.

| Fact | Value |
|---|---|
| Maker | Vercel Labs (repo `vercel-labs/ui`) |
| Licence | Apache-2.0 |
| Status | Beta. "Some APIs may still change." |
| Packages | `@ui-sdk/core` plus adapters `@ui-sdk/react`, `@ui-sdk/vue`, `@ui-sdk/svelte`, `@ui-sdk/solid`, `@ui-sdk/web` |
| React requirement | React 19 or newer |
| Docs | ui-sdk.dev |

## Is UI SDK production-ready?

Not officially. The README says UI SDK "is currently in beta and subject to the Vercel beta terms; the framework, APIs, documentation, and behavior may change before general availability." The GitHub repo was created in late October 2026 and the first npm release followed in November 2026. Beta releases have been shipping often since then.

That does not mean you cannot use it. It means you should pin the exact version, read the changelog before upgrading, and expect small API changes. If you need a headless library with years of production use behind it, Base UI, Radix and React Aria are the safer picks today.

## How do behaviors and primitives work?

A **primitive** brings a component's state, actions and parts together. You define it once with `definePrimitive`. Here is the mute button from the UI SDK docs:

```ts
import { definePrimitive } from "@ui-sdk/core"

const muteButton = definePrimitive({
  name: "mute-button",
  state: () => ({ muted: false }),
  api: (context) => ({
    toggle: () => context.store.set({ muted: !context.store.get().muted }),
  }),
  slots: (slot) => ({
    root: slot({
      attrs: (state) => ({
        type: "button",
        "aria-pressed": String(state.muted),
      }),
      press: ({ api }) => api.toggle(),
    }),
  }),
})

export { muteButton }
```

Pressing the button changes `muted`, and `aria-pressed` follows. The same primitive renders in React, Vue, Svelte, Solid and Web Components through `createParts`. The README is blunt about who writes this code: "Don't worry, you don't need to learn how to write this. Your agents will." There is an agent skill for that (`npx skills@latest add vercel-labs/ui --skill ui-sdk`).

You do not have to write primitives to get started, though. UI SDK also ships ready components such as Input, Select, Switch, Checkbox, Dialog, Menu, Tabs and Combobox, imported per component, for example `@ui-sdk/react/switch`.

## How does an AI agent use a UI SDK page?

Through the **agent bridge**. You create it once, before the page renders:

```ts
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent()

export { agent }
```

The bridge finds UI SDK components already on the page and registers new ones as they mount. It gives the agent three tools.

**`snapshot()`** lists components, their state and the actions available now. For a text input labelled "Project name", the docs show:

```json
{
  "ref": "c1",
  "component": "input",
  "label": "Project name",
  "value": "Apollo",
  "actions": ["setValue", "clear"]
}
```

**`act({ steps })`** runs one or more steps in order:

```ts
await agent.act({
  steps: [{ ref: "Project name", action: "setValue", args: ["Atlas"] }],
})
```

A step can name a component by its `ref` or its label. The change goes through the input's own API and its change callback, exactly like a keystroke would. If a step fails, `result.ok` is `false`, `result.error` says which step and why, and earlier steps stay applied.

**`query()`** finds components and list choices without dumping the whole page. `agent.query({ within: "Region", text: "Europe" })` returns matching options of a Select labelled Region.

The labels come from accessible names. A control without an `aria-label` or a visible label is hard for a screen reader and hard for an agent. That overlap is deliberate.

For a full walkthrough on a dashboard, see the [@ui-sdk/react tutorial](/blog/ui-sdk-react-tutorial).

## How does UI SDK keep the person in control?

This is the part we think matters most. An agent that can press any button needs limits, and UI SDK gives you four layers.

1. **`allow` on the bridge.** `createAgent({ allow })` runs before every step. Return `true`, `false`, or a `Promise<boolean>` that resolves when a person answers your own confirmation UI. The bridge waits up to 5 minutes by default (`timeout` changes it).
2. **`data-agent-confirm`.** Put it on a control with a sentence that says what it does, like `data-agent-confirm="Charges $20 to your card for 1,000 credits"`. The snapshot shows that sentence. Without an `allow` callback, the step fails with "Needs a person". With one, the sentence arrives as `step.confirm`.
3. **`data-agent-hidden` and `data-agent-secret`.** Hidden regions are left out of `snapshot` and `query`. Secret fields show `"[redacted]"`. Password, card and one-time-code fields are secret by default.
4. **Change callbacks.** Every change an agent makes reaches your normal callback with `details.source === "agent"`, and you can call `details.cancel()`.

One warning from the docs is worth repeating: an `allow` that returns `true` without checking `step.confirm` answers yes on the person's behalf. We cover patterns for this in [what is agent-ready UI](/blog/what-is-agent-ready-ui).

## Where does the AI model run?

UI SDK does not call a model. The bridge runs in the browser because it reads and changes components there. You have three ways to connect a model:

- **Your own agent in the page.** UI SDK exports `agentTools`: the names, descriptions and JSON Schemas for `snapshot`, `act` and `query`. Hand them to any model SDK.
- **A model on your server.** The docs show a Next.js route using the AI SDK's `streamText` with those tools declared without `execute`, so each call streams to the browser, runs on the bridge, and goes back to the model.
- **A browser's built-in agent through WebMCP.** `registerTools(agent, { allow })` publishes the same three tools through `document.modelContext`. In browsers without that API it does nothing. See [WebMCP in React with UI SDK](/blog/webmcp-react-ui-sdk).

If you want the second option already wired, Panelo UI's free [agent kit](https://www.paneloui.com/r/agent-kit.json) ships a Next.js route with the tools declared without `execute` and a hook that runs each call on the bridge.

## Does UI SDK make agents faster or cheaper?

The repo includes a benchmark you can run yourself. One task on a project settings screen (rename a project, change visibility, update two members and notification settings, save), medians of three runs, Sonnet through Claude Code, run on November 15, 2026. Every run completed the task.

| React screen | Tool calls | Tokens | Time | Cost |
|---|---|---|---|---|
| Base UI + browser tools | 17 | 291.7k | 53 s | $0.139 |
| Ark UI + browser tools | 19 | 330.9k | 65 s | $0.144 |
| UI SDK + browser tools | 17 | 294.1k | 56 s | $0.140 |
| UI SDK + agent tools | 7 | 69.5k | 31 s | $0.044 |

Two honest caveats. First, this is a vendor-run benchmark of one task. Second, look at row three: with ordinary browser tools, the UI SDK screen costs about the same as Base UI. The benchmark README says it directly: "The difference comes from the agent tools." The gain comes from giving the agent structured state instead of an accessibility tree, not from the components being faster.

## What is UI SDK not?

The name causes confusion, so here is the short version.

| Name | What it does | Calls a model? |
|---|---|---|
| Vercel's UI SDK (`@ui-sdk/*`) | Component behaviors plus an agent bridge | No |
| AI SDK (npm `ai`) | One TypeScript API for calling models, tools and agents | Yes |
| AI SDK UI (`useChat`) | Hooks for chat and generative UI | Through your route |
| AI Elements | Chat and agent UI components built on shadcn/ui | Through the AI SDK |

They work together rather than compete. The full comparison is in [UI SDK vs AI SDK](/blog/ui-sdk-vs-ai-sdk). And on the question many shadcn/ui users ask: Vercel has not said whether shadcn/ui will move onto UI SDK. We collected what is known in [is shadcn/ui built on UI SDK?](/blog/is-shadcn-built-on-ui-sdk)

## Should you use UI SDK today?

Use it if:

- You want an in-app assistant that changes real settings, filters and forms, not one that only describes them.
- You are on React 19 (or Vue, Svelte, Solid, Web Components) and can pin a beta version.
- You care about keeping a person in the loop for risky actions and want that enforced at the component level.

Wait if:

- You need a long track record and a stable API now.
- Your app has no agent plans. Base UI, Radix and React Aria already handle accessibility well.
- You only need a chat window. AI SDK UI or AI Elements cover that without a new component layer.

## How does Panelo UI use it?

Panelo UI is a shadcn/ui registry of dashboard components, charts and pages built on Vercel's UI SDK. Its interactive parts (switches, selects, tabs, dialogs, menus) wrap UI SDK primitives, so an agent can read a Panelo dashboard and act through the same API a click uses. Delete buttons carry `data-agent-confirm`, so the agent asks first. The free `agent-kit` adds the bridge, an approval prompt, a chat hook and an `/api/agent` route. You can try it on the [live agent demo](/agent-demo) or browse the [components](/components).

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

**See it live:** the [agent demo](https://www.paneloui.com/agent-demo) is a dashboard an AI agent operates through Vercel's UI SDK, and it asks before anything destructive.

**The Pro step:** [AI Automation Dashboard](https://www.paneloui.com/components/dashboard-pages-11) is the full screen from that demo: an AI workflow-automation dashboard with stat cards, an active-workflows table, a templates carousel and an Ask AI assistant panel. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Who makes Vercel's UI SDK?

Vercel Labs builds it in the open at github.com/vercel-labs/ui under the Apache-2.0 licence. The docs live at ui-sdk.dev.

### Is UI SDK the same as the Vercel AI SDK?

No. The AI SDK (npm `ai`) calls language models. UI SDK builds components and lets an agent operate them, and it never calls a model itself.

### Does UI SDK work outside React?

Yes. `@ui-sdk/core` has adapters for React, Vue, Svelte, Solid and Web Components, and the agent bridge is available from each adapter's `/agent` entry.

### Is Vercel's UI SDK stable?

No, it is in beta. The README says APIs, documentation and behavior may change before general availability, so pin your version.

### Can an agent delete data through UI SDK without asking?

Only if you let it. Mark the control with `data-agent-confirm` and check `step.confirm` in your `allow` callback, and the step waits for the person.

### Do I need an API key to use UI SDK?

No. The components and the bridge are plain front-end code. You only need a model provider when you connect an agent to the bridge.

## Sources

- UI SDK README: https://github.com/vercel-labs/ui
- UI SDK docs: https://ui-sdk.dev/docs
- Built for Agents (agent bridge and benchmark): https://ui-sdk.dev/docs/agents
- Connect an agent: https://ui-sdk.dev/docs/agents/connect-an-agent
- Permissions: https://ui-sdk.dev/docs/agents/connect-an-agent/permissions
- Run the model on your server: https://ui-sdk.dev/docs/agents/connect-an-agent/run-on-your-server
- WebMCP: https://ui-sdk.dev/docs/agents/connect-an-agent/webmcp
- Agent benchmark README: https://github.com/vercel-labs/ui/tree/main/benchmarks/agent
- npm package: https://www.npmjs.com/package/@ui-sdk/react
- Vercel beta terms: https://vercel.com/docs/release-phases/public-beta-agreement
- InfoQ, "Vercel Releases UI SDK": https://www.infoq.com/news/2026/11/vercel-ui-sdk/
- AI SDK introduction: https://ai-sdk.dev/docs/introduction
- AI Elements: https://elements.ai-sdk.dev
