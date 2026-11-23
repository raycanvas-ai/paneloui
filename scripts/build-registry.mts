// Builds Panelo's shadcn registry from the components themselves.
//   node --experimental-strip-types scripts/build-registry.mts
//
// Every catalogue item becomes one self-contained registry item: its entry file (the one its live
// preview renders) plus every local file it imports, with the npm packages they need at this repo's
// versions. Free items go to public/r/<name>.json, served as-is. Pro items go to registry-pro/,
// which is never public: app/r/pro serves it only to a valid licence key.
//
// Installed files land under components/panelo-ui/ (next to a project's components/ui), so imports
// of `@/components/panelo/…` are rewritten to `@/components/panelo-ui/…`. Site images become
// absolute URLs, and every item depends on `panelo-theme`, the tokens Panelo adds to stock shadcn.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SITE = (process.env.SITE_URL ?? "https://www.paneloui.com").replace(/\/$/, "");
const FREE_OUT = join(ROOT, "public/r");
const PRO_OUT = join(ROOT, "registry-pro");
const FREE_TEMPLATES_OUT = join(ROOT, "public/t");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const pkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string> };
// Provided by any Next.js project the components install into.
const PROVIDED = new Set(["react", "react-dom", "next"]);

// --- The catalogue: names, slugs, descriptions and tiers, from the site's own index. ---------------
type Entry = { name: string; slug: string; description: string; tier: "free" | "pro" };
const catalogue: Entry[] = [...read("components/application/docs/components-index.ts").matchAll(/\b(free|pro)\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]*)"\s*\)/g)].map(
  ([, tier, name, slug, description]) => ({ tier: tier as Entry["tier"], name, slug, description }),
);

// --- Entry files: the same modules /preview/[slug] renders. -------------------------------------------
const entries = new Map<string, string>();
for (const [, slug, spec] of read("components/application/docs/panelo-previews.ts").matchAll(/"([\w-]+)":\s*\(\)\s*=>\s*import\("@\/([^"]+)"\)/g)) entries.set(slug, spec);
if (existsSync(join(ROOT, "components/panelo/pro/index.ts"))) {
  const proIndex = read("components/panelo/pro/index.ts");
  const loaders = proIndex.slice(proIndex.indexOf("PRO_LOADERS"), proIndex.indexOf("PRO_PARTS"));
  for (const [, slug, spec] of loaders.matchAll(/"([\w-]+)":\s*\(\)\s*=>\s*import\("\.\/([^"]+)"\)/g)) entries.set(slug, `components/panelo/pro/${spec}`);
}

// --- Import graph ----------------------------------------------------------------------------------
const EXTENSIONS = ["", ".tsx", ".ts", "/index.tsx", "/index.ts"];
function resolveFile(base: string): string {
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (existsSync(join(ROOT, candidate)) && !candidate.endsWith("/")) {
      try {
        readFileSync(join(ROOT, candidate));
        return candidate;
      } catch {
        // A directory: try the next extension.
      }
    }
  }
  throw new Error(`Can't resolve ${base}`);
}

const packageName = (spec: string) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);

/** The files an entry needs and the packages they import. Throws if it reaches outside the library. */
function collect(entry: string, allowed: (file: string) => boolean) {
  const files = new Set<string>();
  const packages = new Set<string>();
  const queue = [resolveFile(entry)];
  while (queue.length) {
    const file = queue.pop()!;
    if (files.has(file)) continue;
    if (!allowed(file)) throw new Error(`${entry} imports ${file}, outside the component library`);
    files.add(file);
    for (const [, spec] of read(file).matchAll(/(?:from\s+|import\s*\(\s*|^import\s+)["']([^"']+)["']/gm)) {
      if (spec.startsWith("@/")) queue.push(resolveFile(spec.slice(2)));
      else if (spec.startsWith(".")) queue.push(resolveFile(relative(ROOT, resolve(join(ROOT, dirname(file)), spec))));
      else if (!spec.startsWith("node:") && !PROVIDED.has(packageName(spec))) packages.add(packageName(spec));
    }
  }
  return { files: [...files].sort(), packages: [...packages].sort() };
}

const inLibrary = (file: string) => file.startsWith("components/panelo/") && !file.startsWith("components/panelo/pro-fallback");
const target = (file: string) => file.replace(/^components\/panelo\/(pro\/)?/, "components/panelo-ui/");
const rewrite = (source: string) =>
  source
    .replace(/(["'])@\/components\/panelo\/pro\//g, "$1@/components/panelo-ui/")
    .replace(/(["'])@\/components\/panelo\//g, "$1@/components/panelo-ui/")
    .replace(/(["'`])\/(avatars|ai-chat|brand|carousel|templates)\//g, `$1${SITE}/$2/`);

function version(name: string) {
  const range = pkg.dependencies[name];
  if (!range) throw new Error(`${name} is imported but not in package.json dependencies`);
  return `${name}@${range}`;
}

function item(name: string, title: string, description: string, entryFiles: string[], allowed: (f: string) => boolean, extraTargets: Record<string, string> = {}) {
  const graph = entryFiles.map((e) => collect(e, allowed));
  const files = [...new Set(graph.flatMap((g) => g.files))].sort();
  const packages = [...new Set(graph.flatMap((g) => g.packages))].sort();
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:block",
    title,
    description,
    dependencies: packages.map(version),
    registryDependencies: [`${SITE}/r/panelo-theme.json`],
    files: files.map((file) => ({ path: extraTargets[file] ?? target(file), type: "registry:file", target: extraTargets[file] ?? target(file), content: rewrite(read(file)) })),
  };
}

// --- The theme: tokens Panelo adds on top of stock shadcn, read from the component theme in globals.css.
const STOCK = /^(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|radius|chart-\d+|sidebar)/;
function theme() {
  const css = read("styles/globals.css");
  const start = css.indexOf("--color-success:");
  const block = (selector: string) => {
    const from = css.indexOf(`\n${selector} {`, start);
    return css.slice(from, css.indexOf("\n}", from));
  };
  const inline = css.slice(css.lastIndexOf("@theme inline {", start), css.indexOf("\n}", start));
  const names = [...inline.matchAll(/--color-([\w-]+):\s*var\(--([\w-]+)\)/g)].map(([, , v]) => v).filter((v) => !STOCK.test(v));
  const values = (body: string) => Object.fromEntries([...body.matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)].filter(([, n]) => names.includes(n)).map(([, n, v]) => [n, v.trim()]));
  const light = values(block(":root"));
  const dark = values(block(".dark"));
  if (!Object.keys(light).length) throw new Error("No Panelo tokens found in styles/globals.css");
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "panelo-theme",
    type: "registry:theme",
    title: "Panelo theme",
    description: "The tokens Panelo components use beyond stock shadcn/ui: status colours (success, warning, info) and tonal pills.",
    cssVars: { theme: Object.fromEntries(names.filter((n) => n in light).map((n) => [`color-${n}`, `var(--${n})`])), light, dark },
  };
}

// --- Write ---------------------------------------------------------------------------------------
for (const dir of [FREE_OUT, PRO_OUT, FREE_TEMPLATES_OUT]) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}
const write = (dir: string, data: { name: string }) => writeFileSync(join(dir, `${data.name}.json`), JSON.stringify(data, null, 2));

write(FREE_OUT, theme());
write(
  FREE_OUT,
  item("agent-kit", "Agent kit", "The UI SDK agent bridge, approval prompts, a chat hook and the /api/agent route (Groq's free tier).", ["components/panelo/lib/agent.ts", "components/panelo/hooks/use-agent-chat.ts", "app/api/agent/route.ts"], (f) => (inLibrary(f) && !f.startsWith("components/panelo/pro/")) || f === "app/api/agent/route.ts", { "app/api/agent/route.ts": "app/api/agent/route.ts" }),
);

let free = 0;
let pro = 0;
const missing: string[] = [];
for (const e of catalogue) {
  const entry = entries.get(e.slug);
  if (!entry) {
    // A Pro item in a checkout without components/panelo/pro: nothing to build, and nothing to leak.
    if (e.tier === "pro") continue;
    missing.push(e.slug);
    continue;
  }
  // A free item may never reach into pro/: collect() throws if one imports it, so Pro code can't ship publicly.
  const allowed = e.tier === "pro" ? inLibrary : (f: string) => inLibrary(f) && !f.startsWith("components/panelo/pro/");
  write(e.tier === "pro" ? PRO_OUT : FREE_OUT, item(e.slug, e.name, e.description, [entry], allowed));
  if (e.tier === "pro") pro++;
  else free++;
}
if (missing.length) throw new Error(`Free catalogue items with no preview entry: ${missing.join(", ")}`);
console.log(`Registry: ${free} free items + panelo-theme + agent-kit in public/r, ${pro} Pro items in registry-pro (private).`);

// --- Templates: one tarball each, its folder at the top, so `tar -xz` makes ./<slug>. --------------------
// Nothing is packed before launch day (TEMPLATES_LAUNCH in components/application/site/templates.ts).
const { TEMPLATES_LAUNCH } = (await import("../components/application/site/templates.ts")) as typeof import("../components/application/site/templates.ts");
// Free ones are static files in public/t; Pro ones go to registry-pro/templates, served by app/t/pro.
let templates = 0;
for (const [source, out] of TEMPLATES_LAUNCH.open
  ? [
      ["templates", FREE_TEMPLATES_OUT],
      ["components/panelo/pro/templates", join(PRO_OUT, "templates")],
    ]
  : []) {
  if (!existsSync(join(ROOT, source))) continue;
  mkdirSync(out, { recursive: true });
  for (const slug of readdirSync(join(ROOT, source), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
    // COPYFILE_DISABLE keeps macOS tar from adding ._ metadata files.
    execFileSync("tar", ["-czf", join(out, `${slug}.tgz`), "--exclude=node_modules", "--exclude=.next", "--exclude=*.tsbuildinfo", "--exclude=.DS_Store", "--exclude=.dockerignore", "-C", join(ROOT, source), slug], {
      env: { ...process.env, COPYFILE_DISABLE: "1" },
    });
    templates++;
  }
}
console.log(TEMPLATES_LAUNCH.open ? `Templates: ${templates} packed.` : `Templates: none packed, they launch ${TEMPLATES_LAUNCH.date}.`);
