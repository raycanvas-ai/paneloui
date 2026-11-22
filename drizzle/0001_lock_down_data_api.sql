-- Supabase serves the public schema over its REST API to anyone holding the project's publishable
-- key. These tables are read only by the server, as the owning role, which bypasses RLS. So: RLS on
-- with no policies (the API roles see no rows), and their grants revoked as a second lock. The DO
-- block skips the revokes on plain Postgres, where Supabase's API roles don't exist.
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verificationToken" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "license" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON "user", "account", "session", "verificationToken", "license" FROM anon, authenticated;
    -- Tables added by later migrations start locked too.
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
  END IF;
END $$;
