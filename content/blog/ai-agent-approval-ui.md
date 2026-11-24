---
title: "Human-in-the-Loop Approval UI for AI Agents"
description: "How to build an approval UI for AI agents: which actions need a person, what the prompt should say, where to enforce it, and working React code with UI SDK."
slug: ai-agent-approval-ui
primaryKeyword: human in the loop approval ui
secondaryKeywords:
  - ai agent approval ui
  - human in the loop tool approval
  - agent confirmation dialog
  - ai agent permissions
  - destructive action confirmation
intent: informational
cluster: Agents
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 2175
cta:
  free: [agent-kit]
  pro: [dashboard-pages-11]
---

# Human-in-the-loop approval UI for AI agents

A human-in-the-loop approval UI pauses an AI agent before a risky action and asks a person to allow or deny it. A good one names the exact effect in plain words, shows the values involved, makes "deny" as easy as "allow", and is enforced in code the model cannot skip, not just in the prompt.

> **Skip the build:** [Agent kit](https://www.paneloui.com/r/agent-kit.json) is a free, MIT-licensed shadcn/ui registry item (code, not a visual component) that ships the bridge-side approval gate from this post: an `allow` that holds every `data-agent-confirm` step until a person answers, a `useAgentChat` hook that hands you the pending question with an `answer(ok)` callback, and an `/api/agent` route whose model is told to stop when a step needs a person. Add it with `npx shadcn@latest add @panelo/agent-kit` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Which agent actions need human approval?

Not every step. If the agent asks about everything, people click "allow" without reading, and the prompt stops protecting anyone. Gate the actions where a mistake is expensive or hard to undo:

| Gate it | Usually let it run |
|---|---|
| Deleting records, files or accounts | Filtering, sorting, searching |
| Spending money or credits | Opening a tab, panel or dialog |
| Sending email, messages or invites | Filling a draft the person will review |
| Changing permissions or roles | Toggling a view setting |
| Anything that leaves your system (webhooks, exports to third parties) | Reading data the person can already see |

A simple test: if the person would be upset to discover the agent did it without asking, gate it.

## What should an approval prompt say?

The prompt is the only thing between the agent and the action, so it has to be read in two seconds.

1. **Say the effect, not the function name.** "Deletes the project Apollo and its 14 files" beats `deleteProject({ id: 42 })`.
2. **Show the specific values.** Amount, recipient, record name. Vague prompts get approved by habit.
3. **Make deny equal to allow.** Same size, same reach, both reachable by keyboard. Denying should not feel like breaking something.
4. **Say what happens on deny.** "Nothing will be deleted. The agent will stop here."
5. **Show what already happened.** If the agent ran three steps before this one, list them. People decide differently when they know the context.
6. **Do not hide it in the chat scroll.** Put the prompt where the person is looking, and keep it until they answer.

## Where should approval be enforced?

In code, on the path the action actually takes. A system prompt that says "always ask first" is a request, not a control.

The AI SDK docs make this point directly for server-side tools. Because "the server does not persist conversation state between requests," the message history is client-controlled input, so approvals are re-validated before execution, and "a server-side policy denial prevents execution even when the client supplies an approved response with a valid signature." For sensitive tools the docs recommend `experimental_toolApprovalSecret`, which signs approval requests.

The same rule applies to UI-level agents. The gate should sit inside the bridge the agent uses to act, so there is no path around it.

## How do the main frameworks handle approvals?

| Library | How you mark an action | How the person answers |
|---|---|---|
| AI SDK (`ToolLoopAgent`) | `toolApproval: { runCommand: 'user-approval' }` | Your app sends a `tool-approval-response` |
| AI SDK chat (`useChat`, as in Vercel's Chatbot template) | `needsApproval: true` on the tool | `addToolApprovalResponse({ id, approved })` |
| CopilotKit | `useHumanInTheLoop` (v2) | Your render function calls `respond()`; the agent stays paused until it does |
| assistant-ui | A tool UI component | `addResult({ approve: true })`, called once |
| shadcn/ui AI Elements | The Confirmation pattern | "A prompt to approve or deny a tool before it runs" |
| Vercel's UI SDK | `data-agent-confirm="…"` on the control | An `allow` callback that returns `true`, `false` or a promise |

The first five gate **tool calls**: functions the model invokes. Vercel's UI SDK gates **controls on the page**: the agent presses the same button a person would, and the button itself says it needs a person. Both are valid. Tool-level gates fit server actions. Control-level gates fit an agent that operates your UI, because the rule lives on the element and covers every route the agent could take to it.

## How do you build an approval prompt with Vercel's UI SDK?

Vercel's UI SDK is in beta, so check the docs for API changes. The pattern has three parts.

**1. Mark the control.** The sentence is what the person will read.

```tsx
<Button
  data-agent-confirm="Deletes the project Apollo and all its files"
  onClick={deleteProject}
>
  Delete forever
</Button>
```

Without an `allow` callback, an agent that presses this button gets a refusal that starts with "Needs a person," and nothing happens.

**2. Give the bridge an `allow` that asks.** This is close to what Panelo UI's `agent-kit` ships. Steps without a confirm sentence run; steps with one wait for a person.

```ts
"use client"
import { createAgent } from "@ui-sdk/react/agent"

type Ask = { text: string; answer: (ok: boolean) => void }
let ask: Ask | null = null
const listeners = new Set<() => void>()

function setAsk(next: Ask | null) {
  ask = next
  listeners.forEach((l) => l())
}

export const pendingConfirm = {
  subscribe: (l: () => void) => {
    listeners.add(l)
    return () => void listeners.delete(l)
  },
  get: () => ask,
  getServer: () => null,
}

export const agent = createAgent({
  allow: (step, { signal }) =>
    !step.confirm ||
    new Promise<boolean>((resolve) => {
      const answer = (ok: boolean) => {
        setAsk(null)
        resolve(ok)
      }
      signal.addEventListener("abort", () => answer(false))
      setAsk({ text: step.confirm!, answer })
    }),
})
```

The docs warn about the shortcut to avoid: "An `allow` that returns `true` without reading `step.confirm` answers yes for the person."

**3. Render the prompt.**

```tsx
"use client"
import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { pendingConfirm } from "@/lib/agent"

export function ApprovalPrompt() {
  const ask = useSyncExternalStore(
    pendingConfirm.subscribe,
    pendingConfirm.get,
    pendingConfirm.getServer
  )
  if (!ask) return null
  return (
    <div role="alertdialog" aria-labelledby="agent-ask" className="rounded-xl border p-4">
      <p id="agent-ask">The assistant wants to: {ask.text}</p>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" onClick={() => ask.answer(false)}>Deny</Button>
        <Button onClick={() => ask.answer(true)}>Allow</Button>
      </div>
    </div>
  )
}
```

If you install Panelo UI's free [agent kit](https://www.paneloui.com/r/agent-kit.json), part 2 arrives as `components/panelo-ui/lib/agent.ts` and its `useAgentChat` hook returns the pending question as `confirm`, so this component is the only part you write.

## What edge cases should an approval flow handle?

- **Partial runs.** In Vercel's UI SDK, a refusal stops `act` with `ok: false`, and "any earlier steps stay applied." Tell the person what already changed, and have the agent report it.
- **Timeouts.** A pending confirmation fails after 5 minutes by default (configurable with `timeout`). Clear the prompt when that happens, which the abort listener above does.
- **Denials.** Tell the model the person said no, and tell it not to retry. Panelo's agent route instructs the model: if a step fails with "Needs a person," say so plainly and stop.
- **Stuck agents.** CopilotKit's docs note the agent stays paused until `respond` is called. Every prompt needs a way out.
- **Visibility.** After an approved step runs, show what changed. Panelo's `agent-kit` logs each step in plain words ("Set Search workflows to slack") and briefly rings the control the agent touched.
- **Double prompts.** If you expose the same agent to browser agents through WebMCP, make sure the person is asked once, not twice.

## What are the common approval UI mistakes, and how do you fix them?

| Mistake | Why it hurts | Fix |
|---|---|---|
| The prompt shows a tool name and raw JSON | Nobody reads it, so everyone approves | Write one sentence of effect with the real values in it |
| "Allow" is a big filled button, "Deny" is a grey link | It nudges people towards yes | Give both buttons equal weight and keyboard reach |
| The approval is only remembered on the client | A tampered request can claim an approval nobody gave | Check it again on the server path that runs the action |
| One approval covers a whole batch | The person approves step one and gets ten | Ask per risky step, or list every step in the one prompt |
| Approvals are kept for the whole session | A "yes" from an hour ago covers a different context | Ask again each time, unless the person chose to trust that action |
| The agent retries after a deny | It feels like nagging and wears people down | Treat a deny as final for that request |

## How do you test an approval flow before shipping?

Run these by hand, then turn them into tests:

1. Ask the agent to do the risky thing directly. The prompt must appear, and nothing must change before you answer.
2. Deny it. Check that the data is untouched and that the agent says it stopped.
3. Leave the prompt open past the timeout. The prompt should clear and the step should fail.
4. Close the tab or start a new message while a prompt is open. No hidden approval should be left behind.
5. Ask for a mix of safe and risky steps in one request. Only the risky ones should wait.
6. Answer with the keyboard alone, and with a screen reader. The `alertdialog` role should announce the question.

## Can I see an approval flow working?

Panelo UI's [agent demo](/agent-demo) runs a dashboard an agent operates, with delete actions that wait for you. The free `agent-kit` is installable from the [component catalogue](/components) with the shadcn CLI. For the bigger picture on how agents operate UIs, read [computer use vs browser agents vs in-app agents](/blog/computer-use-vs-browser-agents-vs-in-app-agents) and [what agent-ready UI is](/blog/what-is-agent-ready-ui).

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

For the prompt itself, point the `ApprovalPrompt` above at the kit: import `pendingConfirm` from `@/components/panelo-ui/lib/agent`, or read the same question from the hook's `confirm`. The kit covers the timeout and double-prompt edge cases from this post; the wording, equal Allow and Deny buttons and server checks are still yours.

**See it live:** the [agent demo](https://www.paneloui.com/agent-demo) is a dashboard an AI agent operates through Vercel's UI SDK, and it asks before anything destructive.

**The Pro step:** [AI Automation Dashboard](https://www.paneloui.com/components/dashboard-pages-11) is the full screen from that demo: an AI workflow-automation dashboard with stat cards, an active-workflows table, a templates carousel and an Ask AI assistant panel. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### What is human-in-the-loop approval for AI agents?

It is a pause before a chosen action where a person must allow or deny it. The agent continues only after an explicit answer.

### Should every agent action need approval?

No. Gate actions that are costly or hard to undo, like deleting, paying, sending or changing permissions. Asking about everything trains people to click allow without reading.

### Is a system prompt telling the agent to ask first enough?

No. The model can ignore or be tricked out of prompt instructions. Enforce approval in the code path that runs the action, such as the AI SDK's `toolApproval` or Vercel's UI SDK `allow` callback.

### What happens to earlier steps when a person denies one?

It depends on the library. In Vercel's UI SDK, earlier steps in the same `act` call stay applied, so show the person what already changed.

### Should an approved action be remembered for next time?

Not by default. Ask again for each risky step, and only skip the prompt when the person has explicitly chosen to trust that specific action.

### How is data-agent-confirm different from tool approval?

Tool approval gates a function the model calls. `data-agent-confirm` marks a control on the page, so any agent that tries to press it through UI SDK's bridge must get a person's approval.

## Sources

- AI SDK, tool approvals: https://ai-sdk.dev/docs/agents/tool-approvals
- Vercel Chatbot template, tool approval: https://chatbot.ai-sdk.dev/docs/customization/tool-approval
- CopilotKit, useHumanInTheLoop: https://docs.copilotkit.ai/reference/v1/hooks/useHumanInTheLoop
- assistant-ui, approval UI tutorial: https://assistant-ui.com/docs/runtimes/langgraph/tutorial/part-3
- assistant-ui, tool UI guide: https://www.assistant-ui.com/docs/guides/tool-ui
- shadcn/ui AI Elements (Confirmation pattern): https://ui.shadcn.com/docs/ai-elements
- Vercel's UI SDK, permissions: https://ui-sdk.dev/docs/agents/connect-an-agent/permissions
- Vercel's UI SDK, WebMCP: https://ui-sdk.dev/docs/agents/connect-an-agent/webmcp
