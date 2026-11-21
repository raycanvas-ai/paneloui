import { existsSync } from "node:fs";
import type { NextConfig } from "next";

// Pro blocks are gitignored. `@pro` types against pro-fallback.ts (tsconfig) and bundles the
// real components/panelo/pro when this checkout has it, so a public clone still builds.
const hasPro = existsSync(`${import.meta.dirname}/components/panelo/pro/index.ts`);

// `PANELO_EXPORT=1 next build` writes the whole site as static files to out/ for Cloudflare.
// Route handlers (*.ts) are left out of that build; worker/index.ts serves /api/agent instead.
const exporting = process.env.PANELO_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(exporting ? { output: "export" as const, pageExtensions: ["tsx"] } : {}),
  // Pin the workspace root to this project so Turbopack never walks up the
  // filesystem looking for a lockfile.
  turbopack: {
    root: import.meta.dirname,
    resolveAlias: hasPro ? { "@pro": "./components/panelo/pro/index.ts" } : {},
  },
};

export default nextConfig;
