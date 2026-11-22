import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/lib/server/db";
import { dodo, planFor, SEATS, type DodoPayment } from "@/lib/server/dodo";
import { licenses, users, type License } from "@/lib/server/schema";

const hash = (key: string) => createHash("sha256").update(key).digest("hex");

/**
 * Records the licence a Dodo payment bought, reading the payment from Dodo itself. Nothing the
 * caller sends is trusted but the id: the status, product, buyer and metadata all come from the API,
 * so the return-page sync and the webhook can share this and neither can be forged into a licence.
 * Idempotent on `payment_id`; a refund or chargeback revokes.
 */
export async function syncPayment(paymentId: string): Promise<License | null> {
  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) return null;
  const payment = await dodo<DodoPayment>(`/payments/${paymentId}`);
  if (!payment) return null;
  const plan = payment.product_cart?.map((item) => planFor(item.product_id)).find(Boolean) ?? null;
  if (!plan) return null;

  const db = getDb();
  const lost = payment.refund_status === "succeeded" || ["dispute_lost", "dispute_opened"].includes(payment.dispute_status ?? "");
  if (lost) {
    await db.update(licenses).set({ revokedAt: new Date() }).where(and(eq(licenses.paymentId, paymentId), isNull(licenses.revokedAt)));
    return null;
  }
  if (payment.status !== "succeeded") return null;

  // The user id travels in checkout metadata only when the buyer was signed in; check it still exists.
  const signedIn = payment.metadata?.panelo_user_id;
  const owner = signedIn ? await db.query.users.findFirst({ where: eq(users.id, signedIn) }) : undefined;
  const paidAt = new Date(payment.created_at);
  const [row] = await db
    .insert(licenses)
    .values({
      paymentId,
      plan,
      seats: SEATS[plan],
      email: payment.customer.email.toLowerCase(),
      userId: owner?.id ?? null,
      updatesUntil: plan === "year" ? new Date(paidAt.getTime() + 365 * 24 * 60 * 60 * 1000) : null,
    })
    .onConflictDoNothing({ target: licenses.paymentId })
    .returning();
  return row ?? (await db.query.licenses.findFirst({ where: eq(licenses.paymentId, paymentId) })) ?? null;
}

/** The user's licences, after claiming any bought signed-out with their (provider-verified) email. */
export async function licensesFor(userId: string, email: string | null | undefined) {
  const db = getDb();
  if (email) {
    await db.update(licenses).set({ userId }).where(and(eq(licenses.email, email.toLowerCase()), isNull(licenses.userId)));
  }
  return db.query.licenses.findMany({ where: eq(licenses.userId, userId), orderBy: (l, { desc }) => [desc(l.createdAt)] });
}

/** Makes a new key for a licence the user owns, replacing any old one. Returns it once; only its hash is kept. */
export async function rotateKey(userId: string, licenseId: string): Promise<string | null> {
  const key = `pnl_${randomBytes(24).toString("base64url")}`;
  const [row] = await getDb()
    .update(licenses)
    .set({ keyHash: hash(key), keyHint: key.slice(-4) })
    .where(and(eq(licenses.id, licenseId), eq(licenses.userId, userId), isNull(licenses.revokedAt)))
    .returning({ id: licenses.id });
  return row ? key : null;
}

/** The licence a key opens, if it is live: not revoked, and inside its update window. */
export async function licenseForKey(key: string): Promise<License | null> {
  if (!/^pnl_[A-Za-z0-9_-]{32}$/.test(key)) return null;
  const row = await getDb().query.licenses.findFirst({ where: eq(licenses.keyHash, hash(key)) });
  if (!row || row.revokedAt || (row.updatesUntil && row.updatesUntil < new Date())) return null;
  return row;
}
