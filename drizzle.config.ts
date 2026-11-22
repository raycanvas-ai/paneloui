import { defineConfig } from "drizzle-kit";

// `npx drizzle-kit generate` writes SQL to drizzle/; `npx drizzle-kit migrate` applies it to DATABASE_URL.
export default defineConfig({
  schema: "./lib/server/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  // The journal lives beside the tables, so the app's role needs no right to create schemas.
  migrations: { schema: "public" },
});
