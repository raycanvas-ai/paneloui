import { createHmac, timingSafeEqual } from "node:crypto";

export type Plan = "year" | "lifetime" | "startups";
export type Mode = "test_mode" | "live_mode";

/**
 * The site's public origin. Behind the proxy, a request's own URL is the container's (http, internal),
 * so redirects and Dodo's return URL use SITE_URL when it's set.
 */
export const siteOrigin = (request: Request) => (process.env.SITE_URL ?? new URL(request.url).origin).replace(/\/$/, "");

/** Live only when asked for by name, so a missing variable can never take real money. */
export const mode = (): Mode => (process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode");

export const API: Record<Mode, string> = { test_mode: "https://test.dodopayments.com", live_mode: "https://live.dodopayments.com" };

// Product ids differ per mode. Each product is priced at its list price; the launch code takes $50 off.
export const PRODUCTS: Record<Mode, Record<Plan, string>> = {
  test_mode: { year: "pdt_0NsQEqNyo5UonT1RdmTiV", lifetime: "pdt_0NsQEqQ40NcUTGTi0cVIc", startups: "pdt_0NsQEqSiguTGJ4gLuXikF" },
  live_mode: { year: "pdt_0NsQEqXEEbJlZCxNpWZ8l", lifetime: "pdt_0NsQEqa9WtiHLyYgBhHS0", startups: "pdt_0NsQEqdNkiFjQzrDZ6LQS" },
};

export const SEATS: Record<Plan, number> = { year: 1, lifetime: 1, startups: 5 };

/** The plan a product id sells in the current mode, or null for anything else. */
export function planFor(productId: string): Plan | null {
  const entry = Object.entries(PRODUCTS[mode()]).find(([, id]) => id === productId);
  return entry ? (entry[0] as Plan) : null;
}

export async function dodo<T>(path: string, init?: RequestInit): Promise<T | null> {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) throw new Error("DODO_PAYMENTS_API_KEY is not set.");
  const response = await fetch(`${API[mode()]}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init?.headers },
  });
  return response.ok ? ((await response.json()) as T) : null;
}

export type DodoPayment = {
  payment_id: string;
  status: string | null;
  refund_status?: string | null;
  dispute_status?: string | null;
  customer: { email: string };
  product_cart: { product_id: string; quantity: number }[] | null;
  metadata: Record<string, string>;
  created_at: string;
};

/**
 * Standard Webhooks signature check (Dodo signs this way), over the raw body: re-serialising
 * parsed JSON changes the bytes and breaks the HMAC. Rejects anything older than five minutes,
 * so a captured request can't be replayed later.
 */
export function verifyWebhook(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signature = headers.get("webhook-signature");
  if (!id || !timestamp || !signature || !secret) return false;
  const sent = Number(timestamp);
  if (!Number.isFinite(sent) || Math.abs(Date.now() / 1000 - sent) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  if (key.length === 0) return false;
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest();
  return signature.split(" ").some((entry) => {
    if (!entry.startsWith("v1,")) return false;
    const provided = Buffer.from(entry.slice(3), "base64");
    return provided.length === expected.length && timingSafeEqual(provided, expected);
  });
}

// ponytail: in-process memory, which is exact on one server; move to Redis if Panelo ever runs several.
const WINDOW = 10 * 60_000;
const hits = new Map<string, number[]>();
let swept = 0;

/** True when `ip` has used up `max` requests to `bucket` in the last 10 minutes. */
export function limited(bucket: string, request: Request, max: number) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  // Forget addresses idle for a whole window, at most once a minute: the privacy page promises IPs are held
  // for 10 minutes at most, and without this the map would grow for as long as the server runs.
  if (now - swept > 60_000) {
    swept = now;
    for (const [k, times] of hits) if (now - times[times.length - 1] >= WINDOW) hits.delete(k);
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}
