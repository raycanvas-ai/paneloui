import { integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

// --- Auth.js tables: the shape @auth/drizzle-adapter requires (same as snapcn's) ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// --- Pro licences: one row per paid Dodo payment ---

export const licenses = pgTable("license", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** The Dodo payment that bought it. Unique, so a replayed webhook or a second sync is a no-op. */
  paymentId: text("payment_id").notNull().unique(),
  plan: text("plan").$type<"year" | "lifetime" | "startups">().notNull(),
  seats: integer("seats").notNull(),
  /** The buyer's email at Dodo. A licence bought signed-out is claimed by the account with this verified email. */
  email: text("email").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  /** SHA-256 of the key. The key itself is shown once, when it is made, and never stored. */
  keyHash: text("key_hash").unique(),
  /** The key's last four characters, so the owner can tell keys apart. */
  keyHint: text("key_hint"),
  /** When registry access ends. Null for lifetime plans. */
  updatesUntil: timestamp("updates_until", { mode: "date" }),
  /** Set on a refund or a chargeback; the key stops working. */
  revokedAt: timestamp("revoked_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type License = typeof licenses.$inferSelect;
