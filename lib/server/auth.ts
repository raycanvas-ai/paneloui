import { Auth, type AuthConfig } from "@auth/core";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { getDb } from "@/lib/server/db";
import { siteOrigin } from "@/lib/server/dodo";
import { accounts, sessions, users, verificationTokens } from "@/lib/server/schema";

export type SessionUser = { id: string; name?: string | null; email?: string | null; image?: string | null };

/**
 * Auth.js through @auth/core rather than next-auth: the site ships as a static export behind a
 * Cloudflare Worker, so auth has to run as a plain Request -> Response handler in both `next dev`
 * and the Worker. Database sessions, so signing out (or deleting a session row) ends access at once.
 */
export function authConfig(): AuthConfig {
  const adapter = DrizzleAdapter(getDb(), { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens });
  return {
    basePath: "/api/auth",
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    // Panelo never calls GitHub or Google for the user, so their OAuth tokens aren't kept: a leaked
    // database then holds no keys to anyone's GitHub or Google account.
    adapter: {
      ...adapter,
      linkAccount: (account) =>
        adapter.linkAccount!({ ...account, access_token: undefined, refresh_token: undefined, id_token: undefined, expires_at: undefined, session_state: undefined }),
    },
    // Linking a second provider onto an account by email is safe only when the provider proved the
    // address: GitHub returns only a primary, verified email, and Google's claim is checked below.
    // Only providers with an OAuth app configured, so a deploy without one still serves everything else.
    providers: [
      ...(process.env.AUTH_GITHUB_ID ? [GitHub({ allowDangerousEmailAccountLinking: true })] : []),
      ...(process.env.AUTH_GOOGLE_ID ? [Google({ allowDangerousEmailAccountLinking: true })] : []),
    ],
    pages: { signIn: "/account", error: "/account" },
    callbacks: {
      // Licences are claimed by email, so an unverified Google address must never get in.
      signIn: ({ account, profile }) => (account?.provider === "google" ? profile?.email_verified === true : true),
      // Return only what the page needs; the session row itself carries the cookie's token.
      session: ({ session, user }) => ({ user: { id: user.id, name: user.name, email: user.email, image: user.image }, expires: session.expires }),
    },
  };
}

/**
 * The request as the browser addressed it. Behind the proxy, Next sees the container's own origin
 * (http://0.0.0.0:3000), and Auth.js would send that to Google as the callback and redirect people to it.
 */
async function atPublicOrigin(request: Request) {
  const url = new URL(request.url);
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  return new Request(new URL(url.pathname + url.search, siteOrigin(request)), { method: request.method, headers: request.headers, body });
}

export async function handleAuth(request: Request) {
  return Auth(await atPublicOrigin(request), authConfig());
}

/** The signed-in user for a request, or null. */
export async function getUser(request: Request): Promise<SessionUser | null> {
  const response = await Auth(new Request(new URL("/api/auth/session", siteOrigin(request)), { headers: request.headers }), authConfig());
  const data = (await response.json()) as { user?: SessionUser } | null;
  return data?.user?.id ? data.user : null;
}
