---
title: "@ui-sdk/react Tutorial: Let an AI Agent Run Your Dashboard"
description: "Step-by-step @ui-sdk/react tutorial: create the agent bridge, read a dashboard with snapshot, change it with act, and make risky buttons ask a person first."
slug: ui-sdk-react-tutorial
primaryKeyword: "@ui-sdk/react tutorial"
secondaryKeywords:
  - ui sdk react
  - createAgent ui sdk
  - agent.snapshot
  - data-agent-confirm
  - ui sdk next.js
intent: informational
cluster: UI SDK
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 2234
cta:
  free: [agent-kit]
  pro: [dashboard-pages-11]
---

# @ui-sdk/react tutorial: let an AI agent operate your React dashboard

To let an AI agent operate a React dashboard with Vercel's UI SDK, install `@ui-sdk/react` and `@ui-sdk/core`, build the controls from UI SDK components with clear labels, and create one bridge with `createAgent()`. The agent reads the page with `snapshot()`, changes it with `act()`, and waits for a person on anything marked `data-agent-confirm`.

> **Skip the build:** [Agent kit](https://www.paneloui.com/r/agent-kit.json) is a free, MIT-licensed shadcn/ui registry item (code, not a visual component) that covers the bridge, the approval step and the model hookup from this tutorial: a lazily created bridge whose `allow` holds marked steps for your own approval UI, a `useAgentChat` hook that sends a model's `snapshot`, `act` and `query` calls to that bridge, and an `/api/agent` route. Add it with `npx shadcn@latest add @panelo/agent-kit` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

This tutorial builds a small dashboard settings panel in Next.js with a date range Select, an email alerts Switch and a Delete button. By the end, you can drive it from the browser console, and you will know where a real model plugs in. UI SDK is in beta, so APIs may change; pin the version you install. If you are new to the library, start with [Vercel's UI SDK explained](/blog/vercel-ui-sdk-explained).

## What do you need before you start?

- A Next.js App Router project (or any React app) on **React 19 or newer**. UI SDK's React adapter requires it.
- Node.js and npm.
- No AI key. Everything in steps 1 to 6 runs without a model.

## Step 1: How do you install @ui-sdk/react?

Install the React adapter and the core package together:

```bash
npm install @ui-sdk/react @ui-sdk/core
```

Optionally, give your coding agent the UI SDK skill so it writes components the way the library expects:

```bash
npx skills@latest add vercel-labs/ui --skill ui-sdk
```

## Step 2: How do you create the agent bridge?

Create the bridge once per page. In Next.js, components render on the server first, so create it lazily in the browser:

```ts
// lib/agent.ts
import { createAgent } from "@ui-sdk/react/agent"

type Agent = ReturnType<typeof createAgent>
let agent: Agent | undefined

export function getAgent() {
  if (!agent) {
    agent = createAgent({
      // Anything marked data-agent-confirm asks the person first.
      allow: (step) => !step.confirm || window.confirm(step.confirm),
    })
    // For this tutorial only: expose it in the console.
    Object.assign(window, { agent })
  }
  return agent
}
```

The bridge finds the UI SDK components already on the page when you create it and registers new ones as they mount, so creating it in an effect works. The `allow` callback runs before every step. We will come back to it in step 5.

## Step 3: How do you build controls an agent can read?

Use UI SDK components and give each one an accessible name. The name is what the agent sees as `label`, and it is the same name a screen reader announces.

```tsx
// app/dashboard/settings-panel.tsx
"use client"

import { useEffect } from "react"
import { Button } from "@ui-sdk/react/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
import { getAgent } from "@/lib/agent"

const ranges = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
]

export function SettingsPanel() {
  useEffect(() => void getAgent(), [])

  return (
    <section className="flex flex-col gap-4 p-6">
      <Select defaultValue="30d" items={ranges}>
        <SelectLabel>Date range</SelectLabel>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ranges.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Switch
        aria-label="Email alerts"
        defaultChecked
        onCheckedChange={(checked, details) => {
          console.log("Email alerts", checked, "from", details.source)
        }}
      >
        <SwitchThumb />
      </Switch>

      <Button
        data-agent-confirm="Deletes the Q3 report for everyone on the team"
        onClick={() => console.log("Report deleted")}
      >
        Delete report
      </Button>
    </section>
  )
}
```

Three details matter here:

- `SelectLabel` names the Select "Date range". Passing `items` lets the bridge read the choices while the popup is closed.
- The Switch has no visible text, so `aria-label` names it.
- The Delete button carries `data-agent-confirm` with a sentence that says what it does.

UI SDK components are unstyled. Style them with Tailwind CSS through their data attributes, such as `data-checked` and `data-unchecked` on the Switch.

Render `<SettingsPanel />` from a page and open it in the browser.

## Step 4: How does the agent read the page?

Open the browser console and run:

```js
window.agent.snapshot()
```

You get an array with one entry per component: its `ref` (like `"c1"`), its kind (`"select"`, `"switch"`, `"button"`), its `label`, its current `value` or `checked` state, and the `actions` it accepts right now. The Delete button's entry also carries `confirm` with your sentence, so an agent knows before it tries that a person has to approve.

To list the choices of a Select without dumping the whole page, use `query`:

```js
await window.agent.query({ within: "Date range" })
```

That returns the Select with its three options under `items`, each with a `value` and `label`.

This is what makes the approach cheap for a model. Instead of a screenshot or a long accessibility tree, it reads a short list of named controls. In UI SDK's own benchmark (one task, vendor-run), the agent bridge used 7 tool calls on a React screen where browser tools needed 17.

## Step 5: How does the agent change things?

Call `act` with one or more steps. Each step names a component (by label or `ref`), an action from its `actions` list, and the arguments.

```js
await window.agent.act({
  steps: [
    { ref: "Date range", action: "setValue", args: ["Last 7 days"] },
    { ref: "Email alerts", action: "setChecked", args: [false] },
  ],
})
```

The Select now shows "Last 7 days" and the Switch is off. You can pass an item's label or its value; the bridge resolves "Last 7 days" to `"7d"`. Labels match whole words regardless of case, so `"date range"` works too.

Look at the console: your `onCheckedChange` logged `from agent`. The change went through the component's own API, not a fake DOM event, so your app logic runs the same way it does for a click.

The result tells you what happened. `result.ok` is `true` when every step ran, `result.steps` lists what each step changed, and `result.values` holds the current field values. If a step fails, `result.error` gives the step index and the reason, and earlier steps stay applied.

## Step 6: How do you make risky actions ask a person?

Now try the Delete button:

```js
await window.agent.act({
  steps: [{ ref: "Delete report", action: "press" }],
})
```

Because the button is marked, the step arrives at `allow` with `step.confirm` set to your sentence. Our `allow` shows `window.confirm`. Click **Cancel** and the step fails with "The person said no". Click **OK** and the button's `onClick` runs.

If you had created the bridge without any `allow`, a marked control would refuse every agent step with a "Needs a person" error. That is the safe default.

`window.confirm` is fine for a tutorial. In an app, return a promise from your own dialog. The bridge waits for it (5 minutes by default) and passes a `signal` that aborts if the wait ends:

```ts
createAgent({
  allow: (step, { signal }) =>
    step.confirm ? showApprovalDialog(step.confirm, { signal }) : true,
})
```

Here `showApprovalDialog` is your own function that resolves `true` or `false`. One warning from the UI SDK docs: an `allow` that returns `true` without reading `step.confirm` approves on the person's behalf. Always check it.

Panelo UI's free [agent kit](https://www.paneloui.com/r/agent-kit.json) has this promise written: its `allow` parks each marked step in a small store, cancels it when the `signal` aborts, and `useAgentChat` hands you the question as `confirm` with an `answer(ok)` callback for your Allow and Deny buttons.

Two more marks help on real dashboards. `data-agent-hidden` keeps a region out of the agent's view entirely, and `data-agent-secret` shows a field's value as `"[redacted]"`. Password, card and one-time-code fields are secret without a mark.

## Step 7: How can your app tell an agent change from a person's?

Every change callback gets `details.source`. Use it to log, rate-limit or block agent changes:

```tsx
<Switch
  aria-label="Email alerts"
  onCheckedChange={(checked, details) => {
    if (details.source === "agent" && !checked) {
      details.cancel() // only a person may turn alerts off
    }
  }}
>
  <SwitchThumb />
</Switch>
```

A cancelled change can still leave `act` with `ok: true` for that step, so read `result.values` when you need to know what actually took effect. Put rules like this in change callbacks, not in key or pointer handlers, because agent actions call the component API directly.

To keep the agent informed about what the person changed between turns, `agent.subscribe` reports changes with their source.

## How do you connect a real model?

Everything so far ran from the console. To hand the same tools to a model, UI SDK exports `agentTools`: names, descriptions and JSON Schemas for `snapshot`, `act` and `query`. The documented pattern keeps the model on your server with the AI SDK, declares those tools without `execute`, and runs each call on the bridge in the browser through `useChat`'s `onToolCall`. The full code is in [UI SDK vs AI SDK](/blog/ui-sdk-vs-ai-sdk).

If you would rather let a browser's built-in agent use the page, `registerTools(agent, { allow })` publishes the same tools through WebMCP. See [WebMCP in React with UI SDK](/blog/webmcp-react-ui-sdk).

## What are common mistakes?

| Symptom | Likely cause |
|---|---|
| `snapshot()` is empty | Components are not UI SDK components, or the bridge was never created in the browser |
| A step fails with an ambiguous label | Two controls share a name. Use the `ref` from the snapshot, or give them distinct labels |
| A Select's choices are missing | Pass `items` to the Select, or use `query({ within })` |
| Your validation did not run | It lives in a keyboard or pointer handler. Move it to the change callback |
| The agent pressed a risky button without asking | The control has no `data-agent-confirm`, or `allow` returns `true` without checking `step.confirm` |

## Is there a ready-made version?

Yes. Panelo UI is a shadcn/ui registry of dashboard components and pages built on Vercel's UI SDK, so its switches, selects, tabs and dialogs already work with the bridge. Its free `agent-kit` includes the bridge with an approval prompt, a chat hook and an `/api/agent` route that runs an open model on Groq's free tier. See it on the [live agent demo](/agent-demo), or browse the [free components](/components). For the design principles behind this, read [what is agent-ready UI](/blog/what-is-agent-ready-ui).

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

For this tutorial's panel, point the `getAgent` import in `settings-panel.tsx` at the kit's `@/components/panelo-ui/lib/agent`, so the page has one bridge. The Delete report button then waits on the hook's `confirm` instead of `window.confirm`. The kit has no dialog of its own, so render that question where the person is looking.

**See it live:** the [agent demo](https://www.paneloui.com/agent-demo) is a dashboard an AI agent operates through Vercel's UI SDK, and it asks before anything destructive.

**The Pro step:** [AI Automation Dashboard](https://www.paneloui.com/components/dashboard-pages-11) is the full screen from that demo: an AI workflow-automation dashboard with stat cards, an active-workflows table, a templates carousel and an Ask AI assistant panel. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Does @ui-sdk/react work with Next.js?

Yes, with React 19 or newer. Create the bridge in the browser, for example in an effect inside a client component, because it reads components on the page.

### What does agent.snapshot() return?

An array of components on the page, each with a `ref`, its kind, its accessible `label`, its current state and the `actions` it accepts. Pages with more than 100 components list the first 100; use `query` for the rest.

### How do I stop an agent pressing a delete button?

Add `data-agent-confirm` with a sentence describing the effect. Without an `allow` callback the agent is refused; with one, show the sentence to the person and return their answer.

### Can I use UI SDK actions without an AI model?

Yes. `snapshot`, `act` and `query` are plain functions. You can call them from the console, from tests, or from scripted demos.

### Can I make my own components agent-operable?

Yes. A component built with `definePrimitive` joins the bridge, and an `agent: { actions: [...] }` key lists which API methods an agent may call.

## Sources

- UI SDK README (install, React 19 requirement, skill): https://github.com/vercel-labs/ui
- Connect an agent (createAgent, snapshot, act, query, agentTools): https://ui-sdk.dev/docs/agents/connect-an-agent
- Guide (Select example, console usage): https://ui-sdk.dev/docs/agents/connect-an-agent/guide
- Permissions (allow, data-agent-confirm, hidden, secret, cancel): https://ui-sdk.dev/docs/agents/connect-an-agent/permissions
- Observe changes (subscribe): https://ui-sdk.dev/docs/agents/connect-an-agent/observe-changes
- The agent key (custom primitives): https://ui-sdk.dev/docs/agents/connect-an-agent/your-components
- Switch docs: https://ui-sdk.dev/docs/react/components/switch
- Button docs: https://ui-sdk.dev/docs/react/components/button
- Agent benchmark: https://github.com/vercel-labs/ui/tree/main/benchmarks/agent
