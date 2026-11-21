import { POST } from "../app/api/agent/route";

/**
 * Cloudflare Worker for paneloui.com: static files from out/ (built with PANELO_EXPORT=1),
 * plus the one dynamic route, /api/agent, reusing the Next route handler as-is.
 */
export default {
  async fetch(request: Request, env: { ASSETS: { fetch(request: Request): Promise<Response> } }) {
    if (new URL(request.url).pathname === "/api/agent") {
      return request.method === "POST" ? POST(request) : new Response("Method not allowed", { status: 405 });
    }
    return env.ASSETS.fetch(request);
  },
};
