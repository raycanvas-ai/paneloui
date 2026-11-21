import { POST } from "../app/api/agent/route";

/**
 * Cloudflare Worker for paneloui.com: static files from out/ (built with PANELO_EXPORT=1),
 * plus the one dynamic route, /api/agent, reusing the Next route handler as-is.
 */
export default {
  async fetch(request: Request, env: { ASSETS: { fetch(request: Request): Promise<Response> } }) {
    const url = new URL(request.url);
    // www is the canonical host; the bare domain only redirects.
    if (url.hostname === "paneloui.com") return Response.redirect(`https://www.paneloui.com${url.pathname}${url.search}`, 301);
    if (url.pathname === "/api/agent") {
      return request.method === "POST" ? POST(request) : new Response("Method not allowed", { status: 405 });
    }
    return env.ASSETS.fetch(request);
  },
};
