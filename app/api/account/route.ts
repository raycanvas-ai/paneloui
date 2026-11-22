import { getUser } from "@/lib/server/auth";
import { licensesFor } from "@/lib/server/licenses";

/** The signed-in user and their licences. Keys are never returned, only their last four characters. */
export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });
  const rows = await licensesFor(user.id, user.email);
  return Response.json({
    user: { name: user.name, email: user.email, image: user.image },
    licenses: rows.map((l) => ({
      id: l.id,
      plan: l.plan,
      seats: l.seats,
      keyHint: l.keyHint,
      updatesUntil: l.updatesUntil,
      revoked: Boolean(l.revokedAt),
      createdAt: l.createdAt,
    })),
  });
}
