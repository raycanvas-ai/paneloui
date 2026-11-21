import { existsSync } from "node:fs";
import type { NextConfig } from "next";

// Pro blocks are gitignored. `@pro` types against pro-fallback.ts (tsconfig) and bundles the
// real components/panelo/pro when this checkout has it, so a public clone still builds.
const hasPro = existsSync(`${import.meta.dirname}/components/panelo/pro/index.ts`);

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Turbopack never walks up the
  // filesystem looking for a lockfile.
  turbopack: {
    root: import.meta.dirname,
    resolveAlias: hasPro ? { "@pro": "./components/panelo/pro/index.ts" } : {},
  },
};

export default nextConfig;
