// Server analytics: the cookie that joins a purchase to its visitor, and the ids that stop a webhook
// retry from counting a sale twice. Run:
//   node --experimental-strip-types lib/server/analytics.check.mts
import { registerHooks } from "node:module";

// Resolve the app's "@/…" alias the way the bundler does.
const root = new URL("../../", import.meta.url);
registerHooks({ resolve: (spec, ctx, next) => next(spec.startsWith("@/") ? new URL(`${spec.slice(2)}.ts`, root).href : spec, ctx) });
const { capture, visitorId } = await import("./analytics.ts");
const { POSTHOG_KEY } = await import("../analytics.ts");

const sent: Record<string, any>[] = [];
globalThis.fetch = (async (_url: string, init: RequestInit) => {
  sent.push(JSON.parse(String(init.body)));
  return new Response("{}");
}) as typeof fetch;
(process.env as Record<string, string>).NODE_ENV = "production";

// The cookie exactly as posthog-js wrote it in a real browser, with its sibling `_cpm` cookie first.
const cookie = `ph_${POSTHOG_KEY}_posthog_cpm=${encodeURIComponent('{"p":[]}')}; ph_${POSTHOG_KEY}_posthog=${encodeURIComponent('{"$device_id":"d1","distinct_id":"01a210d7-abc"}')}`;
const req = (headers: Record<string, string>) => new Request("http://x", { headers });

await capture("purchase_completed", "u1", {}, { dedupe: "pay_1" });
await capture("purchase_completed", "u1", {}, { dedupe: "pay_1" });
await capture("purchase_completed", "u1", {}, { dedupe: "pay_2" });
await capture("registry_fetch", null, {}, { request: req({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }) });
globalThis.fetch = (async () => {
  throw new Error("network down");
}) as typeof fetch;
const survived = await capture("x", "u1").then(() => true, () => false);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/;
const cases: [string, unknown, unknown][] = [
  ["cookie: reads the distinct id past the _cpm cookie", visitorId(req({ cookie })), "01a210d7-abc"],
  ["cookie: none", visitorId(req({})), undefined],
  ["cookie: garbage", visitorId(req({ cookie: `ph_${POSTHOG_KEY}_posthog=%7Bnot-json` })), undefined],
  ["dedupe: a valid UUID", UUID.test(sent[0].uuid), true],
  ["dedupe: same payment, same id", sent[0].uuid === sent[1].uuid, true],
  ["dedupe: another payment, another id", sent[0].uuid === sent[2].uuid, false],
  ["anonymous: no person profile", sent[3].properties.$process_person_profile, false],
  ["anonymous: visitor IP, not the proxy's", sent[3].properties.$ip, "203.0.113.9"],
  ["no request: geo off, so events don't land in Germany", sent[0].properties.$geoip_disable, true],
  ["a failed send never throws", survived, true],
];

for (const [name, got, want] of cases) console.log(got === want ? "PASS" : "FAIL", name);
if (cases.some(([, got, want]) => got !== want)) process.exit(1);
