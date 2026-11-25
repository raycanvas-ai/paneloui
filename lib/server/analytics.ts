import { createHash, randomUUID } from "node:crypto";

import { POSTHOG_KEY } from "@/lib/analytics";

type Options = {
  /** The request the event came from: its IP gives PostHog the visitor's location, its user agent the client. */
  request?: Request;
  /** Same seed, same event id: PostHog drops the repeat when a webhook and the return page both report a payment. */
  dedupe?: string;
  timestamp?: string;
};

/** The PostHog id this browser already has, read from PostHog's own cookie, so server events join its journey. */
export function visitorId(request: Request): string | undefined {
  const cookie = request.headers.get("cookie")?.match(new RegExp(`(?:^|; )ph_${POSTHOG_KEY}_posthog=([^;]+)`))?.[1];
  if (!cookie) return undefined;
  try {
    const id = (JSON.parse(decodeURIComponent(cookie)) as { distinct_id?: unknown }).distinct_id;
    return typeof id === "string" && id.length <= 200 ? id : undefined;
  } catch {
    return undefined;
  }
}

const clientIp = (request: Request) => request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

/**
 * Sends one event to PostHog. Never throws and gives up after 5s: analytics must not fail a checkout or a
 * webhook. Production only. Without a distinct id the event is anonymous and creates no person profile.
 */
export async function capture(event: string, distinctId: string | null | undefined, properties: Record<string, unknown> = {}, { request, dedupe, timestamp }: Options = {}) {
  if (process.env.NODE_ENV !== "production") return;
  const uuid = dedupe ? createHash("sha256").update(`${event}:${dedupe}`).digest("hex").replace(/^(.{8})(.{4}).(.{3}).(.{3})(.{12}).*$/, "$1-$2-4$3-8$4-$5") : undefined;
  await fetch("https://us.i.posthog.com/i/v0/e/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event,
      distinct_id: distinctId || randomUUID(),
      uuid,
      timestamp,
      properties: {
        $lib: "panelo-server",
        ...(!distinctId && { $process_person_profile: false }),
        // Without the visitor's IP, PostHog would place every server event at our server in Germany.
        ...(request ? { $ip: clientIp(request), $raw_user_agent: request.headers.get("user-agent") ?? undefined } : { $geoip_disable: true }),
        ...properties,
      },
    }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => undefined);
}
