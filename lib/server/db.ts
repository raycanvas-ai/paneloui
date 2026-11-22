import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/server/schema";

type Db = PostgresJsDatabase<typeof schema>;

// One client per process and URL, kept on globalThis so dev reloads don't open a new pool each time,
// while a changed DATABASE_URL still takes effect without a restart.
const cache = globalThis as unknown as { paneloDb?: Db; paneloDbUrl?: string };

export function getDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  // `prepare: false` because Supabase's transaction pooler can't hold prepared statements.
  if (!cache.paneloDb || cache.paneloDbUrl !== url) {
    cache.paneloDb = drizzle(postgres(url, { prepare: false, max: 5 }), { schema });
    cache.paneloDbUrl = url;
  }
  return cache.paneloDb;
}
