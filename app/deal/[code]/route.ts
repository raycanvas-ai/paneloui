import { after } from "next/server";

import { DEAL_COOKIE, DEALS } from "@/components/application/site/pricing";
import { capture, visitorId } from "@/lib/server/analytics";
import { siteOrigin } from "@/lib/server/dodo";

/**
 * GET /deal/<code>: the link a partner shares. A code listed in DEALS is kept in a cookie for 30 days,
 * so /checkout applies it and the pricing cards show its price, however the visitor browses before
 * buying. Anything else lands on pricing unchanged. Dodo still decides whether the code is valid.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase();
  const known = Object.hasOwn(DEALS, code);
  after(() => capture("deal_link_opened", visitorId(request), { code: code.slice(0, 40), known }, { request }));
  const headers = new Headers({ Location: `${siteOrigin(request)}/#pricing` });
  // Readable by the page (not HttpOnly): the pricing cards read it to show the deal price.
  if (known) headers.append("Set-Cookie", `${DEAL_COOKIE}=${code}; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`);
  return new Response(null, { status: 307, headers });
}
