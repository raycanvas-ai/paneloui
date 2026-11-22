import { limited } from "@/lib/server/dodo";
import { syncPayment } from "@/lib/server/licenses";

/**
 * POST { paymentId }: Dodo's return page lands on /account with the payment id, and this records
 * the licence at once, without waiting on the webhook (which can't reach localhost at all). Safe to
 * expose: the payment is re-read from Dodo, and the licence goes to its buyer, not to the caller.
 */
export async function POST(request: Request) {
  if (request.headers.get("content-type") !== "application/json") return Response.json({ error: "Expected JSON." }, { status: 415 });
  if (limited("sync", request, 20)) return Response.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  const { paymentId } = (await request.json().catch(() => ({}))) as { paymentId?: unknown };
  const license = typeof paymentId === "string" ? await syncPayment(paymentId) : null;
  return Response.json({ recorded: Boolean(license) });
}
