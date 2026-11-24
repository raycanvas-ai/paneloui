---
title: "UI SDK vs AI SDK: Vercel's Two SDKs, Explained"
description: "Vercel's UI SDK and AI SDK sound alike but do different jobs. See what each one does, how AI SDK UI and AI Elements fit, and how to use them together."
slug: ui-sdk-vs-ai-sdk
primaryKeyword: ui sdk vs ai sdk
secondaryKeywords:
  - vercel ui sdk vs ai sdk
  - ai sdk ui vs ui sdk
  - ai sdk ui
  - ai elements
  - "@ui-sdk/react vs ai"
intent: comparison
cluster: UI SDK
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1982
cta:
  free: [agent-kit]
  pro: [dashboard-pages-11]
---

# UI SDK vs AI SDK: Vercel's two SDKs, explained

The AI SDK (npm `ai`) is Vercel's TypeScript toolkit for calling language models, tools and agents. Vercel's UI SDK (`@ui-sdk/*`, in beta) is a component library whose agent bridge lets a model read and operate your page. The AI SDK is how an agent thinks. UI SDK is what it touches.

> **Skip the build:** [Agent kit](https://www.paneloui.com/r/agent-kit.json) is a free, MIT-licensed shadcn/ui registry item (code, not a visual component) that wires the two SDKs together for you: an `/api/agent` route that calls the AI SDK's `generateText` with UI SDK's agent tools declared without `execute`, and a React hook that runs each tool call on the UI SDK bridge in the browser. Add it with `npx shadcn@latest add @panelo/agent-kit` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Why do people mix up UI SDK and AI SDK?

Because the names are one letter apart and both come from Vercel. It gets worse: the AI SDK has a part called **AI SDK UI**, and there is a component set called **AI Elements**. Search engines often rewrite "vercel ui sdk" into "vercel ai sdk ui", so you can land on the wrong docs without noticing.

Here are the four names side by side.

| Name | Package | Job | Calls a model? | Status |
|---|---|---|---|---|
| AI SDK (Core) | `ai` | Generate text and structured data, call tools, build agents, with any provider | Yes | Stable, major version 7 |
| AI SDK UI | `@ai-sdk/react` (`useChat` and friends) | Hooks for chat and generative UI | Through your API route | Stable |
| AI Elements | Installed through the shadcn CLI | Chat and agent UI components built on shadcn/ui | Through the AI SDK | Released |
| Vercel's UI SDK | `@ui-sdk/core`, `@ui-sdk/react` and other adapters | Component behaviors plus an agent bridge that reads and changes components | No | Beta |

The short rule: if it talks to a model, it is the AI SDK family. If it is the button the model presses, it is UI SDK.

## What is the AI SDK?

The AI SDK docs call it "the TypeScript toolkit designed to help developers build AI-powered applications and agents." Its npm description is more concrete: build apps like ChatGPT, Claude and Gemini "with a single interface for any model."

It has two main parts:

- **AI SDK Core**: `generateText`, `streamText`, structured output, tool calling and agents, with one API across providers such as OpenAI, Anthropic, Google and Groq.
- **AI SDK UI**: framework hooks like `useChat` for building chat and generative interfaces that stream from your server.

The AI SDK has been around for years and has a large ecosystem. If you are calling a model from a Next.js app, it is the default choice for good reason.

## What is Vercel's UI SDK?

UI SDK is a component layer, not a model layer. `@ui-sdk/core` holds behaviors (focus, keyboard navigation, selection, popups, drag and drop and the ARIA they need), and adapters render them in React, Vue, Svelte, Solid and Web Components.

Its distinctive feature is the agent bridge:

```ts
import { createAgent } from "@ui-sdk/react/agent"

const agent = createAgent()

agent.snapshot() // components, their state and available actions
await agent.act({
  steps: [{ ref: "Project name", action: "setValue", args: ["Atlas"] }],
})
```

`snapshot()` returns structured state. `act()` changes components through their own API, so your change callbacks run with `details.source === "agent"`. Nothing in this code calls a model. For the full picture, read [Vercel's UI SDK explained](/blog/vercel-ui-sdk-explained).

## What about AI SDK UI and AI Elements?

These two are the ones most often confused with UI SDK, because they are also "UI".

**AI SDK UI** is the chat plumbing. `useChat` manages messages, streaming and tool calls between your React component and your server route. It does not know what is on the rest of your page.

**AI Elements** is a set of styled components (message lists, prompt inputs, reasoning and tool-call displays) built on shadcn/ui for AI SDK apps. In October 2026, shadcn/ui announced AI Elements in its own docs as "a set of patterns for agentic interfaces built from shadcn/ui components."

Both are about the conversation. UI SDK is about everything else on the screen: the filters, switches, tables and dialogs the conversation is supposed to change.

## How do UI SDK and AI SDK work together?

They fit together cleanly, and the UI SDK docs show exactly how. The model runs on your server with the AI SDK. The tools run in the browser on the UI SDK bridge.

**On the server**, declare UI SDK's `agentTools` as AI SDK tools without `execute`:

```ts
// app/api/chat/route.ts
import { convertToModelMessages, jsonSchema, streamText, tool } from "ai"
import { agentTools } from "@ui-sdk/react/agent"

const tools = Object.fromEntries(
  agentTools.map(({ name, description, inputSchema }) => [
    name,
    tool({ description, inputSchema: jsonSchema(inputSchema) }),
  ])
)

export async function POST(request: Request) {
  const { messages } = await request.json()
  const result = streamText({
    model: "anthropic/claude-sonnet-5.5",
    messages: await convertToModelMessages(messages),
    tools,
  })
  return result.toUIMessageStreamResponse()
}
```

A tool without `execute` is not run on the server. The call streams to the browser instead.

**In the browser**, AI SDK UI's `useChat` receives the call and runs it on the bridge:

```tsx
import { useChat } from "@ai-sdk/react"
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { agent } from "./agent"

const { messages, sendMessage, addToolOutput } = useChat({
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  async onToolCall({ toolCall }) {
    const tool = toolCall.toolName as "snapshot" | "act" | "query"
    const output = await agent[tool](toolCall.input as never)
    addToolOutput({ tool, toolCallId: toolCall.toolCallId, output })
  },
})
```

That is the whole loop. The model asks for a snapshot, reads labels and values, sends an `act` call, the switch flips on the page, and the result goes back to the model. Your API keys never leave the server. The model string above is from the UI SDK docs; swap in any provider the AI SDK supports.

If you would rather not write this loop yourself, Panelo UI's free [agent kit](https://www.paneloui.com/r/agent-kit.json) ships a working version: a non-streaming `generateText` route on Groq and a hook that runs each returned call on the bridge.

## Which one do I need?

It depends on what you are building.

| You want to… | Use |
|---|---|
| Call a model, stream text, get JSON back | AI SDK Core |
| Build a chat window in React | AI SDK UI (`useChat`) |
| A styled chat UI on shadcn/ui, quickly | AI Elements |
| Let an agent change real controls on your page | UI SDK, plus the AI SDK for the model |
| Expose your page to a browser's built-in agent | UI SDK `registerTools` (WebMCP) |
| Accessible headless components, no agent plans | UI SDK works, but Base UI, Radix or React Aria are more mature |

Most real apps that want an in-app agent will use both: the AI SDK on the server, UI SDK on the page.

## Can I use the AI SDK without UI SDK to control my UI?

Yes, and many apps do. You write your own tools (`setFilter`, `toggleNotifications`, `deleteRow`), each with a schema and an `execute` or a client handler that updates state. That works well for a handful of actions.

The cost shows up as the app grows. Every new control needs a new tool, a schema and a handler, and they drift from the real UI. UI SDK's approach is that each component declares its own agent actions once (a Checkbox offers `setChecked`, an Input offers `setValue` and `clear`), so any page built from those components is operable without writing tools by hand.

The other option is a browser agent that reads the accessibility tree and clicks. That needs no code from you, but it is slower and costs more. In UI SDK's own benchmark (one React task, vendor-run), the same screen took 17 tool calls and $0.140 with browser tools versus 7 calls and $0.044 with the bridge. We compare these approaches in [what is agent-ready UI](/blog/what-is-agent-ready-ui).

## Is it risky to let the AI SDK drive UI SDK components?

It is as risky as you allow. The bridge's `allow` callback runs before every step and can return a promise that waits for a person. Controls marked `data-agent-confirm` refuse agent steps unless your `allow` passes them through, and the sentence on the mark tells the person what will happen. Every change also reaches your normal change callbacks, where you can cancel it. Do not treat this as your only safeguard: check permissions on the server for anything that writes data.

## How does Panelo UI use both?

Panelo UI's free `agent-kit` is a working example of this pairing. Its `/api/agent` route uses the AI SDK's `generateText` with UI SDK's agent tools declared without `execute`, running an open model on Groq's free tier. A small chat hook runs each `snapshot`, `act` and `query` call on the page and exposes a `confirm` step you render as your own approval prompt for marked controls. The dashboards themselves need no AI key. Try it on the [agent demo](/agent-demo), or install it from the [components](/components) page.

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

The route is plain AI SDK code, so moving to another provider means swapping the `@ai-sdk/groq` import and the model line in `route.ts` for another AI SDK provider. The browser half stays the same.

**See it live:** the [agent demo](https://www.paneloui.com/agent-demo) is a dashboard an AI agent operates through Vercel's UI SDK, and it asks before anything destructive.

**The Pro step:** [AI Automation Dashboard](https://www.paneloui.com/components/dashboard-pages-11) is the full screen from that demo: an AI workflow-automation dashboard with stat cards, an active-workflows table, a templates carousel and an Ask AI assistant panel. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Is UI SDK part of the Vercel AI SDK?

No. They are separate projects with separate packages. The AI SDK is published as `ai` and `@ai-sdk/*`; UI SDK is published as `@ui-sdk/*` from the vercel-labs/ui repo.

### Does UI SDK need the AI SDK?

No. UI SDK exports plain tool definitions (`agentTools`) that work with any model SDK, and its bridge can also be used from the browser console or through WebMCP.

### Is AI SDK UI the same as UI SDK?

No. AI SDK UI is the hooks layer of the AI SDK, like `useChat`, for building chat interfaces. UI SDK is a component library with an agent bridge.

### Can AI Elements and UI SDK be used together?

Yes. AI Elements can render the chat, and UI SDK components can make up the rest of the page the agent operates. They solve different parts of the screen.

### Which one is in beta?

UI SDK is in beta and its APIs may change. The AI SDK is a stable, widely used library.

## Sources

- AI SDK introduction: https://ai-sdk.dev/docs/introduction
- AI SDK UI: https://ai-sdk.dev/docs/ai-sdk-ui
- `ai` on npm: https://www.npmjs.com/package/ai
- AI Elements: https://elements.ai-sdk.dev
- shadcn/ui changelog, October 2026 (AI Elements): https://ui.shadcn.com/docs/changelog/2026-10-ai-elements
- UI SDK README: https://github.com/vercel-labs/ui
- UI SDK, Built for Agents: https://ui-sdk.dev/docs/agents
- UI SDK, Run the model on your server: https://ui-sdk.dev/docs/agents/connect-an-agent/run-on-your-server
- UI SDK, Permissions: https://ui-sdk.dev/docs/agents/connect-an-agent/permissions
- UI SDK agent benchmark: https://github.com/vercel-labs/ui/tree/main/benchmarks/agent
