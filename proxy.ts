import type { NextFetchEvent, NextRequest } from "next/server";

import { capture } from "@/lib/server/analytics";

/**
 * Counts what static files can't report themselves: free registry items and templates fetched by the
 * shadcn CLI (public/r, public/t), and /llms.txt read by AI assistants. Never changes the response; the
 * event is sent after it. Pro items are counted in their own routes, where the licence is known.
 */
export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (/^\/[rt]\/pro\//.test(pathname)) return;
  const name = pathname.match(/^\/([rt])\/([a-z0-9-]+)\.(json|tgz)$/);
  if (name) event.waitUntil(capture("registry_fetch", null, { item: name[2], kind: name[1] === "r" ? "component" : "template", tier: "free" }, { request }));
  else if (pathname === "/llms.txt") event.waitUntil(capture("llms_txt_fetched", null, {}, { request }));
}

export const config = { matcher: ["/r/:path*", "/t/:path*", "/llms.txt"] };
