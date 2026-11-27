import { existsSync, readdirSync } from "node:fs";
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

// The Base UI edition, rendered locally to check it: `PANELO_EDITION=base next dev -p 3001` swaps every UI SDK
// part that has a Base UI adapter in components/panelo/base for that adapter, so /preview/<slug> shows a block
// exactly as the Base UI registry edition (/r/base) installs it. Parts without an adapter (agent, observe,
// shortcuts, primitive) stay UI SDK; the registry build refuses to ship those in the Base UI edition.
const baseEdition =
  process.env.PANELO_EDITION === "base"
    ? Object.fromEntries(
        readdirSync(`${import.meta.dirname}/components/panelo/base`)
          .filter((f) => f.endsWith(".tsx"))
          .map((f) => [`@ui-sdk/react/${f.replace(/\.tsx$/, "")}`, `./components/panelo/base/${f}`]),
      )
    : {};

const nextConfig: NextConfig = {
  // A self-contained Node server in .next/standalone, which the Docker image runs (see Dockerfile).
  output: "standalone",
  // The Base UI edition's dev server builds apart, so it can run next to the normal one.
  ...(process.env.PANELO_EDITION === "base" && { distDir: ".next-base" }),
  // Version skew: each deploy gets its own id (the git commit, passed in by compose), so a tab still running
  // the previous build reloads on its next navigation instead of asking for files that are gone.
  deploymentId: process.env.NEXT_DEPLOYMENT_ID || undefined,
  // The same id on every analytics event (lib/analytics.ts), to compare conversion across releases.
  env: { NEXT_PUBLIC_DEPLOY_ID: process.env.NEXT_DEPLOYMENT_ID || "dev" },
  // Pin the workspace root to this project so Turbopack never walks up the
  // filesystem looking for a lockfile.
  turbopack: {
    root: import.meta.dirname,
    resolveAlias: { ...(hasPro ? { "@pro": "./components/panelo/pro/index.ts" } : {}), ...baseEdition },
  },
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  // People type the plural; the blog lives at /blog.
  redirects: async () => [{ source: "/blogs/:path*", destination: "/blog/:path*", permanent: true }],
};

export default nextConfig;
