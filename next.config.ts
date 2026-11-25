import { existsSync } from "node:fs";
import type { NextConfig } from "next";

// Pro blocks are gitignored. `@pro` types against pro-fallback.ts (tsconfig) and bundles the
// real components/panelo/pro when this checkout has it, so a public clone still builds.
const hasPro = existsSync(`${import.meta.dirname}/components/panelo/pro/index.ts`);

// Security headers on every response. No CSP yet: the theme script and Next's inline scripts would
// need nonces first. SAMEORIGIN still lets the catalogue frame its own /preview pages.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  // A self-contained Node server in .next/standalone, which the Docker image runs (see Dockerfile).
  output: "standalone",
  // Version skew: each deploy gets its own id (the git commit, passed in by compose), so a tab still running
  // the previous build reloads on its next navigation instead of asking for files that are gone.
  deploymentId: process.env.NEXT_DEPLOYMENT_ID || undefined,
  // The same id on every analytics event (lib/analytics.ts), to compare conversion across releases.
  env: { NEXT_PUBLIC_DEPLOY_ID: process.env.NEXT_DEPLOYMENT_ID || "dev" },
  // Pin the workspace root to this project so Turbopack never walks up the
  // filesystem looking for a lockfile.
  turbopack: {
    root: import.meta.dirname,
    resolveAlias: hasPro ? { "@pro": "./components/panelo/pro/index.ts" } : {},
  },
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  // People type the plural; the blog lives at /blog.
  redirects: async () => [{ source: "/blogs/:path*", destination: "/blog/:path*", permanent: true }],
};

export default nextConfig;
