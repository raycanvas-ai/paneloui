import type { NextFetchEvent, NextRequest } from "next/server";

import { capture, visitorId } from "@/lib/server/analytics";

/**
 * Counts what route code can't report itself: free registry items and templates fetched by the shadcn
 * CLI (static files in public/r, public/t), /llms.txt read by AI assistants, and prompts to the agent
 * demo (app/api/agent ships as a registry item, so it can't import the site's analytics). Never changes
 * the response; events are sent after it. Pro items are counted in their own routes.
 */
export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (/^\/[rt]\/pro\//.test(pathname)) return;
  const name = pathname.match(/^\/([rt])\/([a-z0-9-]+)\.(json|tgz)$/);
  if (name) event.waitUntil(capture("registry_fetch", null, { item: name[2], kind: name[1] === "r" ? "component" : "template", tier: "free" }, { request }));
  else if (pathname === "/llms.txt") event.waitUntil(capture("llms_txt_fetched", null, {}, { request }));
  else if (pathname === "/api/agent" && request.method === "POST") event.waitUntil(agentPrompt(request.clone()));
}

/**
 * One event per thing a person typed; the browser's follow-up requests carrying tool results aren't
 * prompts. The text is kept (the privacy page says so) to learn what people ask the demo.
 */
async function agentPrompt(request: Request) {
  const body = await request.text().catch(() => "");
  if (body.length > 400_000) return;
  let messages: { role?: string; content?: unknown }[];
  try {
    messages = JSON.parse(body).messages;
  } catch {
    return;
  }
  if (!Array.isArray(messages)) return;
  const last = messages[messages.length - 1];
  if (last?.role !== "user" || typeof last.content !== "string") return;
  const turn = messages.filter((m) => m.role === "user" && typeof m.content === "string").length;
  await capture("agent_demo_prompt", visitorId(request), { prompt: last.content.slice(0, 500), turn }, { request });
}

export const config = { matcher: ["/r/:path*", "/t/:path*", "/llms.txt", "/api/agent"] };
