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
//
// Two editions from one source. The UI SDK edition is the code as written (`@panelo/<item>`). The Base UI
// edition (`@panelo/<item>-base`, `@panelo-pro/<item>-base`) swaps each `@ui-sdk/react/<part>` import for its
// Base UI adapter in components/panelo/base, so the blocks are the same files and only the primitives differ.
// An item that still needs UI SDK after the swap (the agent kit, the workflow canvas) has no Base UI edition.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SITE = (process.env.SITE_URL ?? "https://www.paneloui.com").replace(/\/$/, "");
const FREE_OUT = join(ROOT, "public/r");
const PRO_OUT = join(ROOT, "registry-pro");
const FREE_TEMPLATES_OUT = join(ROOT, "public/t");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

// --- Editions ------------------------------------------------------------------------------------------
type Edition = "sdk" | "base";
let EDITION: Edition = "sdk";
const ADAPTERS = new Set(readdirSync(join(ROOT, "components/panelo/base")).filter((f) => f.endsWith(".tsx")).map((f) => f.replace(/\.tsx$/, "")));
const toBase = (source: string) => source.replace(/(["'])@ui-sdk\/react\/([a-z-]+)\1/g, (whole, q: string, part: string) => (ADAPTERS.has(part) ? `${q}@/components/panelo/base/${part}${q}` : whole));
/** A library file as the current edition ships it. */
const src = (path: string) => (EDITION === "base" && path.startsWith("components/panelo/") ? toBase(read(path)) : read(path));
/** An item's name in the current edition: Base UI items carry `-base` (the adapters are Base UI-only already). */
const named = (name: string) => (EDITION === "base" && !name.startsWith("base-") ? `${name}-base` : name);
const UI_SDK = /^@ui-sdk\//;

const pkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string> };
// Provided by any Next.js project the components install into.
const PROVIDED = new Set(["react", "react-dom", "next"]);

// --- The catalogue: names, slugs, descriptions and tiers, from the site's own index. ---------------
type Entry = { name: string; slug: string; description: string; tier: "free" | "pro"; style?: string };
const catalogue: Entry[] = [...read("components/application/docs/components-index.ts").matchAll(/\b(free|pro)\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]*)"(?:,\s*"([^"]+)")?\s*\)/g)].map(
  ([, tier, name, slug, description, style]) => ({ tier: tier as Entry["tier"], name, slug, description, style }),
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

/** A file's local imports (resolved) and npm packages. */
function importsOf(file: string) {
  const local: string[] = [];
  const packages: string[] = [];
  for (const [, spec] of src(file).matchAll(/(?:from\s+|import\s*\(\s*|^import\s+)["']([^"']+)["']/gm)) {
    if (spec.startsWith("@/")) local.push(resolveFile(spec.slice(2)));
    else if (spec.startsWith(".")) local.push(resolveFile(relative(ROOT, resolve(join(ROOT, dirname(file)), spec))));
    else if (!spec.startsWith("node:") && !PROVIDED.has(packageName(spec))) packages.push(packageName(spec));
  }
  return { local, packages };
}

// Free items are split the way a component library's registry is: a component carries only its own
// files, and each shared primitive (ui/, lib/, hooks/, logos/) is its own item that components depend on.
const SHARED = /^components\/panelo\/(ui|lib|hooks|logos|base)\//;
const sharedName = (file: string) => file.replace(/^components\/panelo\//, "").replace(/\.tsx?$/, "").replace(/\//g, "-");
const sharedUrl = (file: string) => `${SITE}/r/${named(sharedName(file))}.json`;

/** An entry's own files (stopping at shared primitives), the primitives it imports, and its packages. */
function split(entry: string[], allowed: (file: string) => boolean) {
  const roots = entry.map(resolveFile);
  const own = new Set<string>();
  const shared = new Set<string>();
  const packages = new Set<string>();
  const queue = [...roots];
  while (queue.length) {
    const file = queue.pop()!;
    if (own.has(file)) continue;
    if (!allowed(file)) throw new Error(`${entry[0]} imports ${file}, outside the component library`);
    own.add(file);
    const deps = importsOf(file);
    deps.packages.forEach((p) => packages.add(p));
    for (const dep of deps.local) {
      if (SHARED.test(dep) && !roots.includes(dep)) shared.add(dep);
      else queue.push(dep);
    }
  }
  return { roots, own: [...own].sort(), shared: [...shared].sort(), packages: [...packages].sort() };
}

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
    for (const [, spec] of src(file).matchAll(/(?:from\s+|import\s*\(\s*|^import\s+)["']([^"']+)["']/gm)) {
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

// Every item carries Panelo's name: as its author, and as the line the CLI prints once it has installed.
const AUTHOR = `Panelo UI <${SITE}>`;
const BRAND = (name: string, title: string) => ({
  author: AUTHOR,
  docs: name === "agent-kit" ? `Panelo UI · ${title}. Docs: ${SITE}` : `Panelo UI · ${title}. Docs and live preview: ${SITE}/components/${name.replace(/-base$/, "")}`,
});

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
    name,
    type: "registry:block",
    title,
    description,
    ...BRAND(name, title),
    dependencies: packages.map(version),
    registryDependencies: [`${SITE}/r/panelo-theme.json`],
    files: files.map((file) => ({ path: extraTargets[file] ?? target(file), type: "registry:file", target: extraTargets[file] ?? target(file), content: rewrite(src(file)) })),
  };
}

const pascal = (slug: string) => slug.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());
const file = (path: string, content: string) => ({ path, type: "registry:file", target: path, content });

/** A free component: its own files, the primitives it builds on as dependencies, and the copy order for the
 *  manual steps (`meta.copy`): the component first, the demo-only index left out, data last. */
function freeItem(name: string, title: string, description: string, entry: string[], allowed: (f: string) => boolean, extraTargets: Record<string, string> = {}) {
  const { roots, own, shared, packages } = split(entry, allowed);
  const root = roots[0];
  const sheet = isSheet(root);
  // A sheet's index is a demo plus re-exports; the component is what its default export renders.
  const main = sheet ? resolveFile(relative(ROOT, resolve(join(ROOT, dirname(root)), [...src(root).matchAll(/^import \{[^}]*\} from ["'](\.[^"']+)["']/gm)][0][1]))) : root;
  const copy = [main, ...own.filter((f) => f !== main && !(sheet && f === root)).sort((a, b) => Number(/data\.ts$/.test(a)) - Number(/data\.ts$/.test(b)) || a.localeCompare(b))];
  const path = (f: string) => extraTargets[f] ?? target(f);
  return {
    name,
    type: "registry:block",
    title,
    description,
    ...BRAND(name, title),
    dependencies: packages.map(version),
    registryDependencies: [`${SITE}/r/panelo-theme.json`, ...shared.map(sharedUrl)],
    files: own.map((f) => file(path(f), rewrite(src(f)))),
    meta: { copy: copy.map(path) },
    demo: demo(name.replace(/-base$/, ""), root, sheet),
    _shared: shared,
  };
}

/** An index that re-exports its siblings and renders them in a default export is a demo sheet. */
const isSheet = (root: string) => root.endsWith("/index.tsx") && (src(root).match(/^(?:export \{[^}]*\}|\}) from ["']\.\//gm)?.length ?? 0) >= 2;

/** The demo a component page shows under Code: what renders the preview, importing from installed paths. */
function demo(name: string, root: string, sheet: boolean) {
  const dir = target(dirname(root)).replace(/^components\//, "@/components/");
  if (sheet)
    return rewrite(src(root))
      .replace(/^export (?:type )?\{[^}]*\} from ["']\.[^"']*["'];?\n/gm, "")
      .replace(/^\/\* -{10,} \*\/\n(?:\/\*.*\*\/\n)*?\/\* -{10,} \*\/\n/gm, "")
      .replace(/(from\s+["'])\.\/([^"']+)(["'])/g, `$1${dir}/$2$3`)
      .replace(/\n{3,}/g, "\n\n");
  const source = src(root);
  const at = target(root).replace(/^components\//, "@/components/").replace(/(\/index)?\.tsx?$/, "");
  const fallback = source.match(/^export default function (\w+)/m)?.[1];
  if (fallback) return `import ${fallback} from "${at}";\n\nexport default function ${fallback}Demo() {\n  return <${fallback} />;\n}\n`;
  const names = [...source.matchAll(/^export (?:function|const) ([A-Z]\w*)/gm)].map((m) => m[1]);
  const pick = names.find((n) => n === pascal(name)) ?? names.find((n) => n.startsWith(pascal(name).replace(/Chart$/, ""))) ?? names[0];
  return `import { ${pick} } from "${at}";\n\nexport default function ${pick}Demo() {\n  return <${pick} />;\n}\n`;
}

/** A shared primitive as its own item, depending on the primitives it imports in turn. */
function primitiveItem(path: string) {
  const { own, shared, packages } = split([path], inLibrary);
  const kind = path.split("/")[2];
  const title = path.split("/").pop()!.replace(/\.tsx?$/, "").replace(/-/g, " ");
  return {
    name: named(sharedName(path)),
    type: kind === "ui" || kind === "base" ? "registry:ui" : kind === "hooks" ? "registry:hook" : "registry:lib",
    title: title[0].toUpperCase() + title.slice(1),
    description: `Panelo ${kind === "ui" ? "primitive" : kind === "hooks" ? "hook" : kind === "logos" ? "logo" : kind === "base" ? "Base UI adapter" : "helper"}: ${title}.`,
    author: AUTHOR,
    dependencies: packages.map(version),
    registryDependencies: [`${SITE}/r/panelo-theme.json`, ...shared.map(sharedUrl)],
    files: own.map((f) => file(target(f), rewrite(src(f)))),
    _shared: shared,
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
    name: "panelo-theme",
    type: "registry:theme",
    title: "Panelo theme",
    description: "The tokens Panelo components read: status colours (success, warning, info) and tonal pills.",
    author: AUTHOR,
    cssVars: { theme: Object.fromEntries(names.filter((n) => n in light).map((n) => [`color-${n}`, `var(--${n})`])), light, dark },
  };
}

// --- Write ---------------------------------------------------------------------------------------
for (const dir of [FREE_OUT, PRO_OUT, FREE_TEMPLATES_OUT]) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}
type Written = { name: string; type: string; title: string; description: string };
const index: Written[] = [];
const write = (dir: string, data: Written, listed = true) => {
  writeFileSync(join(dir, `${data.name}.json`), JSON.stringify(data, null, 2));
  if (dir === FREE_OUT && listed) index.push({ name: data.name, type: data.type, title: data.title, description: data.description });
};
/** One edition's items: free ones (+ demos and primitives) in public/r, Pro ones and style skills in registry-pro. */
function buildEdition(edition: Edition) {
  EDITION = edition;
  // Every primitive a free item reaches, built once each (they can depend on one another).
  const primitives = new Set<string>();
  const needs = (files: string[]) => files.forEach((f) => primitives.add(f));
  /** A free item, its demo item and its primitives queued; `demo` and `copy` are page data, not CLI fields. */
  function writeFree(built: ReturnType<typeof freeItem>, name: string, title: string) {
    const { demo: code, _shared, ...data } = built;
    needs(_shared);
    write(FREE_OUT, data);
    write(
      FREE_OUT,
      {
        name: `${name}-demo`,
        type: "registry:example",
        title: `${title} demo`,
        description: `A demo of ${title}.`,
        ...BRAND(name, title),
        registryDependencies: [`${SITE}/r/${name}.json`],
        files: [file(`components/panelo-ui/demos/${name.replace(/-base$/, "")}-demo.tsx`, code)],
      } as Written,
      false,
    );
  }

  if (edition === "sdk") {
    write(FREE_OUT, theme());
    write(
      FREE_OUT,
      item("agent-kit", "Agent kit", "The agent bridge, approval prompts, a chat hook and the /api/agent route.", ["components/panelo/lib/agent.ts", "components/panelo/hooks/use-agent-chat.ts", "app/api/agent/route.ts"], (f) => (inLibrary(f) && !f.startsWith("components/panelo/pro/")) || f === "app/api/agent/route.ts", { "app/api/agent/route.ts": "app/api/agent/route.ts" }),
    );
  }

  let free = 0;
  let pro = 0;
  const sdkOnly: string[] = [];
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
    // After the swap, anything still on UI SDK (the agent bridge, UI SDK's primitive engine) keeps the item out of this edition.
    if (edition === "base" && collect(entry, allowed).packages.some((p) => UI_SDK.test(p))) {
      sdkOnly.push(e.slug);
      continue;
    }
    const title = edition === "base" ? `${e.name} (Base UI)` : e.name;
    if (e.tier === "pro") write(PRO_OUT, item(named(e.slug), title, e.description, [entry], allowed));
    else writeFree(freeItem(named(e.slug), title, e.description, [entry], allowed), named(e.slug), title);
    if (e.tier === "pro") pro++;
    else free++;
  }
  if (missing.length) throw new Error(`Free catalogue items with no preview entry: ${missing.join(", ")}`);
  // The site tells readers which pages are UI SDK only (SDK_ONLY in components-index.ts); keep it true.
  if (edition === "base") {
    const declared = (JSON.parse(read("components/application/docs/components-index.ts").match(/SDK_ONLY = (\[[^\]]*\])/)![1]) as string[]).filter((slug) => entries.has(slug));
    if (declared.sort().join() !== [...sdkOnly].sort().join()) throw new Error(`SDK_ONLY in components-index.ts is [${declared.join(", ")}], but the build found [${sdkOnly.join(", ")}] still on UI SDK`);
  }
  // Style skills, Pro only: a Pro page's skill/ folder (in the private pro repo) becomes an item in registry-pro,
  // never public/r. It installs the skill (.claude/skills for Claude Code, .agents/skills for Codex and Cursor) and the page
  // itself, whose parts the skill builds from. The Base UI edition's skill installs the Base UI page.
  let styles = 0;
  for (const e of catalogue) {
    const entry = entries.get(e.slug);
    if (e.tier !== "pro" || !e.style || !entry || sdkOnly.includes(e.slug)) continue;
    const skill = `panelo-${e.style}`;
    const body = read(`${dirname(resolveFile(entry))}/skill/SKILL.md`);
    write(PRO_OUT, {
      name: named(e.style),
      type: "registry:item",
      title: `${e.name} style${edition === "base" ? " (Base UI)" : ""}`,
      description: `A skill that teaches your coding agent to build new pages in the ${e.name} style, from the page's own parts.`,
      ...BRAND(e.slug, `${e.name} style`),
      registryDependencies: [`@panelo-pro/${named(e.slug)}`],
      files: [".claude", ".agents"].map((root) => file(`${root}/skills/${skill}/SKILL.md`, body)),
    } as Written);
    styles++;
  }
  // The primitives, each once, following their own dependencies.
  const done = new Set<string>();
  for (const path of primitives) {
    if (done.has(path)) continue;
    done.add(path);
    const { _shared, ...data } = primitiveItem(resolveFile(path));
    _shared.forEach((f) => primitives.add(f));
    // A Base UI item must never install UI SDK, even through a primitive it depends on.
    if (edition === "base" && data.dependencies.some((d) => UI_SDK.test(d))) throw new Error(`${data.name} (Base UI edition) still depends on UI SDK: ${data.dependencies.join(", ")}`);
    write(FREE_OUT, data, false);
  }
  const label = edition === "base" ? "Base UI edition" : "UI SDK edition";
  console.log(
    `Registry, ${label}: ${free} free items (+ demos), ${done.size} primitives${edition === "sdk" ? ", panelo-theme and agent-kit" : ""} in public/r; ${pro} Pro items and ${styles} style skills in registry-pro (private).` +
      (sdkOnly.length ? ` UI SDK only: ${sdkOnly.join(", ")}.` : ""),
  );
}

buildEdition("sdk");
buildEdition("base");
// The index shadcn's registry directory and `shadcn search @panelo` read. Free items only, both editions, and no
// file contents: those stay in each item's own JSON.
writeFileSync(join(FREE_OUT, "registry.json"), JSON.stringify({ name: "panelo", homepage: SITE, items: index }, null, 2));

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
