---
title: "shadcn AI Agent Components: Chat, Voice and Dashboards"
description: "Guide to shadcn/ui AI agent components: AI Elements, assistant-ui, Agent Elements, LiveKit Agents UI and Panelo UI, with install commands and when to use each."
slug: shadcn-ai-agent-components
primaryKeyword: shadcn ai agent components
secondaryKeywords:
  - shadcn agent ui
  - shadcn ai chat components
  - shadcn ai agent
  - agentic ui components
  - shadcn voice agent ui
intent: commercial
cluster: Agents
date: 2026-11-24
status: draft
author: Raycanvas
cta:
  free: [agent-kit, elements-2]
  pro: [dashboard-pages-11]
wordCount: 1940
---

# shadcn AI agent components: chat, voice and dashboards

The main shadcn/ui options for AI agents are shadcn/ui's own AI Elements patterns and chat components, assistant-ui for chat, 21st.dev's Agent Elements for agent chat with tool cards, LiveKit's Agents UI for voice, and Panelo UI for dashboards an agent can operate. Each installs as source you own.

> **Skip the build:** Panelo UI's free, MIT-licensed `agent-kit` is not a visual component; it is the wiring that lets an agent operate the shadcn/ui components on your page. It adds a Vercel UI SDK agent bridge that holds any step on a control marked `data-agent-confirm` until a person approves it, a `useAgentChat` hook that runs the model's `snapshot`, `act` and `query` calls against the components on screen and logs each step in plain words, and an `/api/agent` route that calls an open model on Groq's free tier. Add it with `npx shadcn@latest add @panelo/agent-kit` ([registry setup](#get-this-working-in-your-app)), watch it in the [agent demo](https://www.paneloui.com/agent-demo), then change anything: the source is yours.

## What kinds of shadcn AI agent components are there?

"AI agent components" covers three different jobs. Pick by job first, then by library.

| Job | What it looks like | Libraries |
|---|---|---|
| Chat with an agent | Messages, prompt input, tool calls, reasoning, approvals | shadcn/ui AI Elements and chat components, assistant-ui, Agent Elements |
| Talk to an agent | Audio visualisers, call controls, live transcript | LiveKit Agents UI |
| Let the agent operate your app | Dashboard controls an agent can read and change | Panelo UI (on Vercel's UI SDK) |

All of the libraries below either install through the shadcn CLI or scaffold shadcn/ui-styled source, so the code lands in your repo and follows your theme.

## What does shadcn/ui ship for AI?

shadcn/ui now has two official pieces for AI interfaces.

**AI Elements in shadcn/ui.** Announced in the October 2026 changelog, these are "patterns for agentic interfaces, built from shadcn/ui components." There are 21, including Chat, Prompt Input, Reasoning, Tool, Plan, Subagent, Confirmation, Sources and Queue. "There is no package to install": you copy the pattern and add its parts with the CLI.

```bash
npx shadcn@latest add trace code-block
```

The examples render AI SDK message parts. This replaces the standalone AI Elements site (elements.ai-sdk.dev), which says it "will be deprecated at the end of November 2026." Existing copies keep working.

**Chat components.** In August 2026 shadcn released MessageScroller, Message, Bubble, Attachment and Marker, plus a headless `@shadcn/react` package that holds the scroll logic. InfoQ's write-up notes MessageScroller handles anchored turns, streamed replies and jump-to-message, and leaves AI state and transport to you.

```bash
npx shadcn@latest add message-scroller message bubble attachment marker
```

**Best for:** teams already on shadcn/ui and the AI SDK who want official, minimal building blocks.

## Is assistant-ui a shadcn library?

It is a React chat library that fits shadcn/ui well. Its CLI can start from a shadcn/ui theme in Base UI (the default) or Radix flavour, and it gives you primitives like Thread, Message and Composer. It is MIT-licensed, with an optional Assistant Cloud for hosted thread history.

Its strength is the runtime layer. It works with the Vercel AI SDK by default, and with LangGraph, AG-UI, A2A, Google ADK and custom backends. Tool calls render as components, and tool UIs can collect inline approvals.

**Best for:** a production chat surface where the backend might change.

## What is 21st.dev Agent Elements?

Agent Elements is an MIT-licensed shadcn-style registry of agent UI built on React 19, Tailwind CSS v4 and the Vercel AI SDK. It is the UI layer of 21st.dev's Agent SDK but works on its own. The catalogue leans towards coding-agent interfaces: an agent chat, input bar, markdown, and tool cards such as an Edit tool "with diffs + approval" and a Bash tool.

```bash
npx shadcn@latest add https://agent-elements.21st.dev/r/agent-chat.json
```

**Best for:** coding-agent or dev-tool products that show file edits and commands.

## What about voice agents?

LiveKit's Agents UI describes itself as "polished Shadcn components for rapid development of voice agent frontends." It includes audio visualisers, a control bar, a chat transcript and full session views. Most components expect a LiveKit session.

```bash
npx shadcn@latest registry add @agents-ui
npx shadcn@latest add @agents-ui/{component-name}
```

**Best for:** voice or multimodal agents running on LiveKit.

## Which shadcn components can an agent operate?

The libraries above build the agent's surface: the chat, the transcript, the approval prompt. None of them makes the rest of your app usable by the agent. For that, the components themselves have to expose their state and actions.

Panelo UI is a shadcn/ui registry built for this. Its dashboard components, charts and pages are built on Vercel's UI SDK (in beta), so an agent can read the page as named controls with `snapshot()` and act through the same component API a click uses. Controls with real consequences carry `data-agent-confirm`, so the agent has to ask first.

Add the registry to `components.json`:

```json
{
  "registries": {
    "@panelo": "https://www.paneloui.com/r/{name}.json"
  }
}
```

Then install the free agent kit (the bridge, approval prompts, a chat hook and an `/api/agent` route that calls an open model on Groq's free tier):

```bash
npx shadcn@latest add @panelo/agent-kit
```

Components land in `components/panelo-ui`, next to `components/ui`. The components themselves need no AI key; only the agent route does.

**Best for:** dashboards where the assistant should do things on the page, not just describe them. **Weak points:** Panelo UI is new and small (32 items, 15 free), React-only, and Vercel's UI SDK is still in beta. It is not a chat library, so pair it with one of the options above if you need a full chat surface.

## How do they compare?

| | Job | Install | Licence | Needs |
|---|---|---|---|---|
| shadcn/ui AI Elements | Agent chat patterns | Copy pattern + shadcn CLI | Copy-in source | shadcn/ui; examples use the AI SDK |
| shadcn/ui chat components | Chat layout and scrolling | shadcn CLI | Copy-in source | shadcn/ui |
| assistant-ui | Chat UI with many runtimes | npm + CLI | MIT | A runtime (AI SDK default) |
| Agent Elements | Coding-agent chat and tool cards | shadcn CLI (URL) | MIT | React 19, Tailwind CSS v4, AI SDK |
| LiveKit Agents UI | Voice agent UI | shadcn CLI (`@agents-ui`) | See LiveKit docs | A LiveKit session |
| Panelo UI | Agent-operable dashboards | shadcn CLI (`@panelo`) | Free items MIT; Pro paid | React 19; Groq key for the agent route |

## How do you combine them?

A realistic dashboard assistant uses two layers:

1. **A chat surface** from AI Elements, assistant-ui or Agent Elements, where the person types and sees steps.
2. **An operable page**, where the agent's actions land on real controls the person can see change.

If a full chat is more than you need, a command palette is a lighter way in: [AI Workforce Command](https://www.paneloui.com/components/elements-2) is a free command palette of agents and actions that ⌘K jumps into, with search, arrow-key selection and a status line. Its runs are simulated, so you wire Enter to your own agent call.

Add an approval prompt wherever the agent can delete, pay or send. We cover that in [human-in-the-loop approval UI](/blog/ai-agent-approval-ui), and compare the chat libraries in [CopilotKit vs assistant-ui vs AI Elements](/blog/copilotkit-vs-assistant-ui-vs-ai-elements).

To see an operable dashboard working, try the [Panelo agent demo](/agent-demo) or browse the [component catalogue](/components).

## Which one should you pick? A quick checklist

Answer these in order and stop at the first clear yes:

1. **Is the agent spoken to rather than typed to?** Start with LiveKit Agents UI, if you run LiveKit.
2. **Does the agent mostly edit files and run commands?** Look at Agent Elements first; its tool cards are built for that.
3. **Might your backend change, or is it not the AI SDK?** assistant-ui is built for that, with runtimes for the AI SDK, LangGraph, AG-UI, A2A, Google ADK and custom backends.
4. **Are you on shadcn/ui and the AI SDK already, and want the fewest new dependencies?** Use shadcn/ui's AI Elements patterns and chat components.
5. **Should the agent change things on the page the person is looking at?** Add agent-operable components, such as Panelo UI, next to whichever chat you chose.

Most products end up with one answer from questions 1 to 4, and sometimes one from question 5.

## What mistakes do teams make with agent UI?

- **Treating chat as the whole product.** If the agent can only describe what to click, the person still does the work. Decide early whether the agent should act on the page.
- **Letting the agent act with no gate.** Mark deletes, payments and sends so a person must approve them, and enforce that in code, not in the system prompt.
- **Putting the model key in the browser.** Call the model from a server route and keep the key in a server-only environment variable.
- **Hiding what the agent did.** Show each step in plain words, and make the changed control visible, so the person can undo a mistake quickly.
- **Mixing two chat libraries.** Each one brings its own message state. Pick one for the conversation and keep it.
- **Skipping the keyboard.** Chat input, tool cards and approval prompts all need focus states and screen reader labels, the same as any other control.

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the agent wiring and, if you want it, the command palette:

```bash
npx shadcn@latest add @panelo/agent-kit
npx shadcn@latest add @panelo/elements-2
```

Set `GROQ_API_KEY` (free from console.groq.com) on your server for the `/api/agent` route. The components themselves need no key.

- **See it live:** the [agent demo](https://www.paneloui.com/agent-demo), where an agent operates a dashboard through the UI SDK, and [AI Workforce Command](https://www.paneloui.com/components/elements-2).
- **A full agent dashboard, in Panelo Pro:** [AI Automation Dashboard](https://www.paneloui.com/components/dashboard-pages-11) is a workflow-automation page with stat cards, an active-workflows table, a templates carousel and an Ask AI assistant panel. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).
- **Whole apps:** three Next.js dashboard [templates](https://www.paneloui.com/templates) launch December 1, 2026, one free and two in Pro.

## FAQ

### Does shadcn/ui have official AI components?

Yes. shadcn/ui has AI Elements, 21 copy-in patterns for agentic interfaces, and chat components such as MessageScroller and Message.

### Is AI Elements still at elements.ai-sdk.dev?

The original site still exists but says it is moving to shadcn/ui and will be deprecated at the end of November 2026. New projects should use the patterns in the shadcn/ui docs.

### Can I use these libraries together?

Yes, since each installs as source into your project. A common split is a chat library for the conversation and agent-operable components for the page.

### Which shadcn library is best for voice agents?

LiveKit's Agents UI is built for voice agent frontends and installs from the `@agents-ui` registry. Most of its components expect a LiveKit session.

### Do Panelo UI components need an AI API key?

No. The components are plain React. Only the optional agent route calls a model, using a free Groq key set as `GROQ_API_KEY` on your server.

## Sources

- shadcn/ui AI Elements: https://ui.shadcn.com/docs/ai-elements
- shadcn/ui changelog, October 2026: https://ui.shadcn.com/docs/changelog/2026-10-ai-elements
- AI Elements setup and deprecation notice: https://elements.ai-sdk.dev/docs/setup
- InfoQ, shadcn chat components (August 17, 2026): https://infoq.com/news/2026/08/shadcn-conversational-primitives
- assistant-ui README: https://github.com/assistant-ui/assistant-ui
- 21st.dev Agent Elements README: https://cdn.jsdelivr.net/gh/21st-dev/agent-elements@main/README.md
- LiveKit Agents UI docs: https://docs.livekit.io/frontends/agents-ui/
- Vercel's UI SDK, agents docs: https://ui-sdk.dev/docs/agents
- Vercel's UI SDK, permissions: https://ui-sdk.dev/docs/agents/connect-an-agent/permissions
