import { verifyWebhook } from "@/lib/server/dodo";
import { syncPayment } from "@/lib/server/licenses";

/**
 * Dodo's webhook: the backstop for buyers who close the tab before the return page loads, and the
 * path refunds and chargebacks take. Every event only names a payment; syncPayment re-reads it from
 * Dodo, so even a valid signature can't hand out a licence the API doesn't agree with.
 */
export async function POST(request: Request) {
  // Comma-separated: the test and the live endpoint each sign with their own secret. The Dodo business is
  // shared with other products, so events for them arrive too; syncPayment ignores any payment that isn't
  // a Panelo product in this mode, and they're acknowledged rather than left in Dodo's retry queue.
  const secrets = (process.env.DODO_WEBHOOK_SECRET ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  // No secret means no webhooks, never "accept unsigned": a missing variable must not open the door.
  if (!secrets.length) return Response.json({ error: "Webhooks aren't configured." }, { status: 503 });
  const raw = await request.text();
  if (!secrets.some((secret) => verifyWebhook(raw, request.headers, secret))) return Response.json({ error: "Invalid signature." }, { status: 401 });
  const event = JSON.parse(raw) as { type?: string; data?: { payment_id?: string } };
  const paymentId = event.data?.payment_id;
  if (paymentId && /^(payment|refund|dispute)\./.test(event.type ?? "")) await syncPayment(paymentId);
  return Response.json({ received: true });
}
