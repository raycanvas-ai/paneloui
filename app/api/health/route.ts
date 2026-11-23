import { sql } from "drizzle-orm";

import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/** For the uptime check: 200 only when the app answers and the database does too. */
export async function GET() {
  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false, error: "Database unreachable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
