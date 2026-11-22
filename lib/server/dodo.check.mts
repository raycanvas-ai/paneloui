// The webhook signature check is the one gate a forged licence would have to pass. Run:
//   node --experimental-strip-types lib/server/dodo.check.mts
import { createHmac, randomBytes } from "node:crypto";
import { verifyWebhook } from "./dodo.ts";
const secret = "whsec_" + randomBytes(24).toString("base64");
const sign = (id: string, ts: number, body: string) => "v1," + createHmac("sha256", Buffer.from(secret.slice(6), "base64")).update(`${id}.${ts}.${body}`).digest("base64");
const body = '{"type":"payment.succeeded","data":{"payment_id":"pay_x"}}';
const now = Math.floor(Date.now() / 1000);
const h = (id: string, ts: number, sig: string) => new Headers({ "webhook-id": id, "webhook-timestamp": String(ts), "webhook-signature": sig });
const cases: [string, boolean, boolean][] = [
  ["valid", verifyWebhook(body, h("msg_1", now, sign("msg_1", now, body)), secret), true],
  ["tampered body", verifyWebhook(body.replace("pay_x", "pay_y"), h("msg_1", now, sign("msg_1", now, body)), secret), false],
  ["stale (10 min old)", verifyWebhook(body, h("msg_1", now - 600, sign("msg_1", now - 600, body)), secret), false],
  ["wrong secret", verifyWebhook(body, h("msg_1", now, sign("msg_1", now, body)), "whsec_" + randomBytes(24).toString("base64")), false],
  ["no signature", verifyWebhook(body, new Headers(), secret), false],
];
for (const [name, got, want] of cases) console.log(got === want ? "PASS" : "FAIL", name);
if (cases.some(([, got, want]) => got !== want)) process.exit(1);
