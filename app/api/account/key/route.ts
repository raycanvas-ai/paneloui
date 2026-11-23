import { getUser } from "@/lib/server/auth";
import { limited } from "@/lib/server/dodo";
import { rotateKey } from "@/lib/server/licenses";

/**
 * POST { licenseId } -> a new key for a licence the user owns, shown once. JSON only: a cross-site
 * form can't send application/json, and the Lax session cookie isn't sent on cross-site POSTs anyway.
 */
export async function POST(request: Request) {
  if (request.headers.get("content-type") !== "application/json") return Response.json({ error: "Expected JSON." }, { status: 415 });
  if (limited("key", request, 20)) return Response.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  const user = await getUser(request);
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  const { licenseId } = (await request.json().catch(() => ({}))) as { licenseId?: unknown };
  // Licence ids are UUIDs; anything else would only make the database throw.
  const key = typeof licenseId === "string" && /^[0-9a-f-]{36}$/i.test(licenseId) ? await rotateKey(user.id, licenseId) : null;
  return key ? Response.json({ key }) : Response.json({ error: "No such licence on this account." }, { status: 404 });
}
