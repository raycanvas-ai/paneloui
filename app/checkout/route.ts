import { after } from "next/server";

import { dealExtra, dealFrom } from "@/components/application/site/pricing";
import { capture, visitorId } from "@/lib/server/analytics";
import { getUser } from "@/lib/server/auth";
import { dodo, limited, mode, PRODUCTS, siteOrigin } from "@/lib/server/dodo";

// POST /checkout (form field `plan`: year | lifetime | startups) opens a Dodo checkout with the launch
// code already applied, so the buyer sees the list price, the $50 off and the total. Static payment
// links can't pre-apply a code, so this creates a checkout session server-side and redirects to it.
// POST only: a GET would let crawlers and link prefetching create sessions. GET goes back to pricing.

const LAUNCH_CODE = "PANELO50";

export function GET(request: Request) {
  return Response.redirect(`${siteOrigin(request)}/#pricing`, 303);
}

export async function POST(request: Request) {
  const origin = siteOrigin(request);
  if (limited("checkout", request, 10)) return new Response("Too many checkout attempts. Try again in a few minutes.", { status: 429 });

  const plan = String((await request.formData().catch(() => null))?.get("plan") ?? "");
  // Own keys only: "constructor" or "__proto__" must not resolve to something on the prototype.
  const product = Object.hasOwn(PRODUCTS[mode()], plan) ? PRODUCTS[mode()][plan as keyof (typeof PRODUCTS)["test_mode"]] : null;
  if (!product) return Response.redirect(`${origin}/#pricing`, 303);
  if (!process.env.DODO_PAYMENTS_API_KEY) return new Response("Checkout isn't configured: set DODO_PAYMENTS_API_KEY.", { status: 503 });

  // Signed in: prefill the email and tie the licence to this account. Signed out: the licence is
  // claimed later by whoever signs in with the email used at checkout.
  const user = await getUser(request).catch(() => null);
  // The browser's PostHog id rides along in the metadata, so the webhook's purchase joins this visitor's journey.
  const visitor = visitorId(request);
  const create = (discount_codes?: string[]) =>
    dodo<{ checkout_url?: string }>("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        product_cart: [{ product_id: product, quantity: 1 }],
        // USD to match the prices on the site; Dodo would otherwise open in the buyer's local currency.
        billing_currency: "USD",
        // Dodo appends ?payment_id=…&status=…, which /account uses to record the licence straight away.
        return_url: `${origin}/account`,
        ...(user?.email && { customer: { email: user.email, name: user.name ?? user.email } }),
        // Namespaced: this Dodo business also runs snapcn, whose webhook acts on `user_id` and `product`.
        // Panelo's keys never collide with those, so snapcn ignores Panelo's payments at its first check.
        metadata: { ...(user && { panelo_user_id: user.id }), ...(visitor && { panelo_ph_id: visitor }) },
        ...(discount_codes && { discount_codes }),
      }),
    });

  // A partner deal from /deal/<code> replaces the launch code (Dodo takes one code, and each deal already
  // includes the launch discount). If Dodo refuses a code (expired, or not in this mode), try the next:
  // the deal, then the launch code, then list price rather than fail.
  // Only for the plans the deal lists (Dodo restricts the code to the same products).
  const deal = dealFrom(request.headers.get("cookie"));
  const dealCode = deal && dealExtra(deal, plan as keyof (typeof PRODUCTS)["test_mode"]) > 0 ? deal.code : null;
  let code: string | null = null;
  let session: { checkout_url?: string } | null = null;
  for (const candidate of [...(dealCode ? [dealCode] : []), LAUNCH_CODE, null]) {
    session = await create(candidate ? [candidate] : undefined);
    code = candidate ?? null;
    if (session) break;
  }
  // Redirect only to Dodo's own checkout, whatever the response holds.
  const target = URL.canParse(session?.checkout_url ?? "") ? new URL(session!.checkout_url!) : null;
  const opened = Boolean(target && target.protocol === "https:" && /(^|\.)dodopayments\.com$/.test(target.hostname));
  after(() =>
    capture(opened ? "checkout_started" : "checkout_failed", user?.id ?? visitor, { plan, signed_in: Boolean(user), discount_code: code, $current_url: request.headers.get("referer") }, { request }),
  );
  if (!opened) {
    return new Response("Checkout is unavailable right now. Please try again in a minute.", { status: 502 });
  }
  return Response.redirect(target!.href, 303);
}
