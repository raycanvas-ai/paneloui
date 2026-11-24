---
title: "CopilotKit Alternatives: assistant-ui vs AI Elements"
description: "CopilotKit vs assistant-ui vs AI Elements: what each React AI library does, licences, runtimes and where each is stronger, plus where Vercel's UI SDK fits."
slug: copilotkit-vs-assistant-ui-vs-ai-elements
primaryKeyword: copilotkit alternatives
secondaryKeywords:
  - copilotkit vs assistant-ui
  - assistant-ui vs ai elements
  - copilotkit vs ai sdk
  - is copilotkit open source
  - is assistant ui free
intent: comparison
cluster: Agents
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1764
cta:
  free: [agent-kit]
  pro: [dashboard-pages-2]
---

# CopilotKit vs assistant-ui vs AI Elements

CopilotKit is a full frontend stack for agents: chat, generative UI, shared state and human-in-the-loop over its AG-UI protocol. assistant-ui is a focused chat UI library that plugs into many backends. AI Elements is copy-in shadcn/ui patterns for AI interfaces, now moving into shadcn/ui itself. All three are MIT or copy-in and free to start.

> **Skip the build:** [Agent kit](https://www.paneloui.com/r/agent-kit.json) is a free, MIT-licensed shadcn/ui registry item (code, not a visual component) that connects a chat to the controls on the rest of your page: a UI SDK bridge, a React hook that runs a model's `snapshot`, `act` and `query` calls against those controls and keeps a plain-words step log, and an `/api/agent` route. It is not a chat UI, so it sits next to whichever of the three you pick. Add it with `npx shadcn@latest add @panelo/agent-kit` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What does each library actually do?

They overlap on chat, but they sit at different layers.

| | CopilotKit | assistant-ui | AI Elements |
|---|---|---|---|
| One-line pitch | "The Frontend Stack for Agents & Generative UI" | "Typescript/React Library for AI Chat" | "Patterns for agentic interfaces, built from shadcn/ui components" |
| Licence | MIT | MIT | Copy-in source (the code is yours) |
| Delivery | npm packages | npm packages plus a CLI that scaffolds shadcn-styled components | Copy the pattern; add parts with the shadcn CLI |
| Backend | Its own runtime, AG-UI protocol | AI SDK (default), LangGraph, AG-UI, A2A, Google ADK, custom | Examples render AI SDK message parts |
| Chat UI | Prebuilt chat components | Composable primitives (Thread, Message, Composer, ThreadList) | Chat, Message, Prompt Input and more |
| Agent features | Shared state, frontend tools, human-in-the-loop, generative UI | Tool calls rendered as components, inline approvals | Tool, Confirmation, Plan, Subagent, Reasoning patterns |
| Frameworks | React and Next.js; Angular, Vue and React Native also listed | React (Vue docs exist) | React |
| Hosted add-on | CopilotKit Intelligence (cloud or self-hosted) | Optional Assistant Cloud | None |
| GitHub stars (Nov 24, 2026) | 38.9k | 13.4k | n/a |

## What is CopilotKit best at?

CopilotKit is the most complete of the three. It is a stack, not a component set.

Its README lists generative UI in three forms (pick from components you registered, describe UI as a structured spec, or ship a full interface in a sandbox), "one state layer that both the agent and the UI can read and write," human-in-the-loop where "agents pause for input, confirmation, or edits before they act," and frontend tools that "let the agent take actions inside your app, with your code doing the work."

CopilotKit also created AG-UI, an open protocol for agent-to-user interaction. Other libraries now speak it too, which is a fair sign of its reach.

**Pick CopilotKit when** you are building an agent product, not just a chat box: shared state between agent and app, multi-step agents (for example on LangGraph), and generative UI. It also has the widest framework coverage of the three.

**The trade-off** is surface area. You adopt its runtime and its way of wiring agents. Some APIs have changed between versions too: the v1 `useHumanInTheLoop` reference recommends moving to the v2 hook, and the older `renderAndWaitForResponse` callback was renamed to `render`.

## What is assistant-ui best at?

assistant-ui does chat UI and does it thoroughly. It handles the details that take weeks to get right: streaming, auto-scroll, retries, attachments, markdown, voice dictation. It gives you primitives to style rather than a finished widget.

Its strongest point is backend choice. The README lists the Vercel AI SDK (`useChatRuntime`, the default), LangGraph and LangChain, AG-UI and A2A, Google ADK, and custom runtimes. Its CLI can start from a shadcn/ui theme in either Base UI (the default) or Radix flavour.

For agent work, it renders tool calls as React components and supports inline approvals: a tool UI receives `addResult`, and calling it once with the person's decision resumes the assistant.

**Pick assistant-ui when** you want a polished chat surface in front of a backend you already chose, and you want to swap backends later without rewriting the UI.

**The trade-off** is scope. It is a chat library. Shared agent state or an agent that drives the rest of your app is up to you.

## What is AI Elements, and what is changing?

AI Elements started as Vercel's component library and registry for AI apps, built on shadcn/ui with deep AI SDK integration. Its site now says: "AI Elements is moving to shadcn/ui and this project will be deprecated at the end of November 2026."

The new home is the AI Elements section of the shadcn/ui docs, announced in shadcn/ui's October 2026 changelog. It has 21 patterns, including Chat, Prompt Input, Reasoning, Tool, Plan, Subagent and Confirmation. "There is no package to install." You copy each pattern into your project and add its parts with the shadcn CLI. Existing copies of the old components keep working, and the docs include a migration table. Separately, shadcn released chat components (MessageScroller, Message, Bubble, Attachment, Marker) in August 2026.

**Pick AI Elements when** you already use shadcn/ui and the AI SDK and want to own every line. There is no runtime to adopt and nothing to upgrade.

**The trade-off** is that you assemble the behaviour. Patterns show how to render AI SDK message parts. State, transport and persistence are yours.

## How do they compare on human approvals?

All three can pause an agent for a person:

- **CopilotKit:** `useHumanInTheLoop`. The agent stays paused until your UI calls `respond`.
- **assistant-ui:** a tool UI that calls `addResult({ approve: true })` or `false`.
- **AI Elements:** the Confirmation pattern, "a prompt to approve or deny a tool before it runs," typically paired with the AI SDK's tool approval.

Whichever you pick, enforce the approval on the server path too. We cover the details in [human-in-the-loop approval UI](/blog/ai-agent-approval-ui).

## Where does Vercel's UI SDK fit?

Vercel's UI SDK is not a fourth chat library. It is a beta library of component behaviours (popups, lists, typeahead and more) with an agent bridge. The bridge lets an agent read the page as named controls with `snapshot()` and change them with `act()`, through each component's own API. It calls no model and ships no chat UI.

That makes it complementary. You could put an assistant-ui or AI Elements chat on the side of a dashboard and let the agent behind it operate the dashboard through UI SDK. CopilotKit's frontend tools cover similar ground action by action. UI SDK exposes every control on the page without writing a tool for each. Do not confuse it with the Vercel AI SDK (npm `ai`), which is what most of these libraries use to call models. We untangle the names in [UI SDK vs AI SDK](/blog/ui-sdk-vs-ai-sdk).

Panelo UI's free [agent kit](https://www.paneloui.com/r/agent-kit.json) is one version of that glue: its hook keeps its own message list, which you can render in any of these chat UIs, and runs the agent's calls on the bridge.

## Which one should you choose?

| If you need… | Start with |
|---|---|
| A full agent frontend with shared state and generative UI | CopilotKit |
| A great chat UI over LangGraph, AI SDK or your own backend | assistant-ui |
| shadcn/ui-native AI components you fully own | AI Elements in shadcn/ui |
| An agent that operates your existing dashboard controls | Vercel's UI SDK, alongside any chat UI |

## Where does Panelo UI fit?

Panelo UI is a shadcn/ui registry of dashboard components and pages built on Vercel's UI SDK, so the agent side is the page itself. Its free `agent-kit` adds the bridge, approval prompts and a chat hook. It is new and small next to the three libraries above, and it does not replace a chat library. See the [agent demo](/agent-demo) or the [components](/components), and for a list of shadcn-based options read [shadcn AI agent components](/blog/shadcn-ai-agent-components).

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

To pair it with a chat library, map each `entries` item to that library's message component. Approvals come through `confirm`, so they stay in one place whichever chat UI draws them.

**See it live:** the [agent demo](https://www.paneloui.com/agent-demo) is a dashboard an AI agent operates through Vercel's UI SDK, and it asks before anything destructive.

**The Pro step:** [AI Workflow Builder](https://www.paneloui.com/components/dashboard-pages-2) is an AI workflow builder with a chat-driven automation thread, workflow preview tabs, a node-graph editor and a sample output table. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Is CopilotKit open source?

Yes. The CopilotKit repository is MIT-licensed. CopilotKit Intelligence is a separate production layer, cloud-hosted or self-hosted, with a free Developer plan listed.

### Is assistant-ui free?

Yes. assistant-ui is MIT-licensed. Assistant Cloud, for managed thread history and analytics, is optional.

### Is AI Elements being deprecated?

The original AI Elements site says the project is moving to shadcn/ui and will be deprecated at the end of November 2026. New projects should use the AI Elements patterns in the shadcn/ui docs.

### Can I use assistant-ui with CopilotKit?

assistant-ui lists AG-UI among its supported runtimes, and AG-UI is the protocol CopilotKit created. Check both projects' docs for the current integration path before relying on it.

### Which is the best fit for a shadcn/ui project?

AI Elements is native to shadcn/ui and copied in as source. assistant-ui can also scaffold shadcn/ui-styled components, in Base UI or Radix flavour.

## Sources

- CopilotKit README: https://github.com/CopilotKit/CopilotKit
- CopilotKit, useHumanInTheLoop: https://docs.copilotkit.ai/reference/v1/hooks/useHumanInTheLoop
- assistant-ui README: https://github.com/assistant-ui/assistant-ui
- assistant-ui, approval UI tutorial: https://assistant-ui.com/docs/runtimes/langgraph/tutorial/part-3
- AI Elements (original site and deprecation notice): https://elements.ai-sdk.dev/docs/setup
- shadcn/ui AI Elements: https://ui.shadcn.com/docs/ai-elements
- shadcn/ui changelog, October 2026: https://ui.shadcn.com/docs/changelog/2026-10-ai-elements
- InfoQ, shadcn chat components (August 17, 2026): https://infoq.com/news/2026/08/shadcn-conversational-primitives
- Vercel's UI SDK, agents docs: https://ui-sdk.dev/docs/agents
