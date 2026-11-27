"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { RiCheckLine, RiLock2Line, RiTerminalBoxLine } from "@remixicon/react";

import { CodeBlock, ManagerTabs, useEdition, usePackageManager } from "@/components/application/docs/code";
import { ADD, EDITIONS, hasBase, installCommand, itemName, RUNNER, type Edition, type Entry } from "@/components/application/docs/components-index";
import { cx } from "@/utils/cx";
import { pill, SiteTabPanel, SiteTabs } from "@/components/application/site/site-ui";
import { SITE } from "@/components/application/site/templates";
import { track } from "@/lib/analytics";

/* -------------------------------------------------------------------------- */
/*  Getting a component into a project, the way component libraries document   */
/*  it: a demo under Code, then CLI or Manual. Manual installs the packages,   */
/*  adds the primitives the component builds on, and shows only the           */
/*  component's own files. Everything is read from the registry JSON the CLI  */
/*  installs from, so the page and the install never drift. Pro source stays  */
/*  behind the licence.                                                        */
/* -------------------------------------------------------------------------- */

type RegistryFile = { path: string; content: string };
type RegistryItem = { dependencies?: string[]; registryDependencies?: string[]; files: RegistryFile[]; meta?: { copy?: string[] } };

const cache = new Map<string, Promise<unknown>>();
function load<T>(url: string): Promise<T> {
  if (!cache.has(url)) {
    const p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return cache.get(url) as Promise<T>;
}

/** Fetch a registry item once per page; `retry` reloads after a failure. */
function useItem(url: string | null) {
  const [item, setItem] = useState<RegistryItem | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!url) return;
    let live = true;
    setFailed(false);
    load<RegistryItem>(url)
      .then((i) => live && setItem(i))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [url, attempt]);
  return { item, failed, retry: () => setAttempt((n) => n + 1) };
}

const link = "rounded-sm text-site-ink underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";
const path = (p: string) => <span className="block truncate font-mono text-[12.5px] text-site-muted">{p}</span>;

function Loading({ heights = [200] }: { heights?: number[] }) {
  return (
    <div aria-busy className="flex flex-col gap-3">
      {heights.map((h, k) => (
        <span key={k} className="block animate-pulse rounded-xl bg-site-pill" style={{ height: h }} />
      ))}
    </div>
  );
}

function Failed({ retry }: { retry: () => void }) {
  return (
    <p className="text-site-body text-site-muted">
      The code didn’t load.{" "}
      <button type="button" onClick={retry} className={`cursor-pointer ${link}`}>
        Try again
      </button>
    </p>
  );
}

/* ---------------------------------- Quick ---------------------------------- */

/** A small pill by the title: copies the install command in the reader's package manager. Pro items need the
 *  licence set up first, so theirs jumps to the steps instead of copying a command that would fail. */
export function CopyInstall({ entry }: { entry: Entry }) {
  const [pm] = usePackageManager();
  const [edition] = useEdition();
  const [copied, setCopied] = useState(false);
  const command = installCommand(entry.href, pm, edition);
  if (entry.tier === "pro")
    return (
      <a href="#installation" className={pill("secondary")}>
        <RiTerminalBoxLine aria-hidden />
        How to install
      </a>
    );
  return (
    <button
      type="button"
      title={command}
      aria-label={copied ? "Copied" : `Copy install command: ${command}`}
      onClick={async () => {
        await navigator.clipboard.writeText(command);
        track("install_command_copied", { command, pm, edition, surface: "component_page" });
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className={pill("secondary")}
    >
      {copied ? <RiCheckLine aria-hidden /> : <RiTerminalBoxLine aria-hidden />}
      {copied ? "Copied" : "Copy install"}
    </button>
  );
}

/* ---------------------------------- Demo ---------------------------------- */

/** The Code tab: the demo that renders the preview above, nothing else. */
export function DemoCode({ entry, slug, height }: { entry: Entry; slug: string; height?: number }) {
  const pro = entry.tier === "pro";
  const { item, failed, retry } = useItem(pro ? null : `/r/${slug}-demo.json`);
  if (pro)
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-site-hairline bg-site-surface px-6 py-16 text-center" style={height ? { height } : undefined}>
        <RiLock2Line className="size-5 text-site-muted" aria-hidden />
        <p className="text-site-body-medium text-site-ink">The code comes with Pro</p>
        <p className="max-w-sm text-site-body text-pretty text-site-muted">Install it with your licence key, and the full source lands in your project.</p>
        <Link href="/#pricing" className={pill("primary", "sm", "mt-1")}>
          See Pro
        </Link>
      </div>
    );
  if (failed) return <Failed retry={retry} />;
  if (!item) return <Loading heights={[height ?? 220]} />;
  const demo = item.files[0];
  return <CodeBlock code={demo.content} lang="tsx" header={path(demo.path)} height={height} fold={28} onCopy={() => track("demo_code_copied", { slug })} />;
}

/* ---------------------------------- Section ---------------------------------- */

export function Installation({ entry, slug }: { entry: Entry; slug: string }) {
  const pro = entry.tier === "pro";
  const [tab, setTab] = useState("cli");
  return (
    <section aria-labelledby="installation" className="mt-14">
      <h2 id="installation" className="text-site-heading text-site-ink">
        Installation
      </h2>
      <EditionPicker entry={entry} />
      <SiteTabs
        label="Installation method"
        value={tab}
        onValueChange={setTab}
        items={[{ value: "cli", label: "CLI" }, ...(pro ? [] : [{ value: "manual", label: "Manual" }])]}
        className="mt-2"
      >
        <SiteTabPanel value="cli" className="pt-5">
          {pro ? <ProSteps entry={entry} /> : <Cli entry={entry} />}
        </SiteTabPanel>
        {pro ? null : (
          <SiteTabPanel value="manual" className="pt-5">
            {tab === "manual" ? <Manual entry={entry} /> : null}
          </SiteTabPanel>
        )}
      </SiteTabs>
    </section>
  );
}

const EDITION_NOTE: Record<Edition, string> = {
  base: "Built on Base UI, like shadcn's Base UI components. Same look, same files; no UI SDK in your project.",
  sdk: "Built on Vercel's UI SDK, so AI agents can read and operate every control. Installs next to Base UI or Radix.",
};

/** Which primitives the item installs on. A radio group: arrow keys move and select, like the platform's own. */
function EditionPicker({ entry }: { entry: Entry }) {
  const [edition, setEdition] = useEdition();
  if (!hasBase(entry.href))
    return <p className="mt-3 max-w-[620px] text-site-body text-pretty text-site-muted">This page runs on UI SDK&rsquo;s agent engine, so it installs on UI SDK only. Every other Panelo page also comes in Base UI.</p>;
  const move = (step: number) => {
    const next = EDITIONS[(EDITIONS.findIndex((e) => e.value === edition) + step + EDITIONS.length) % EDITIONS.length].value;
    setEdition(next);
    document.getElementById(`edition-${next}`)?.focus();
  };
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div
        role="radiogroup"
        aria-label="Edition"
        onKeyDown={(event) => {
          const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
          if (!step) return;
          event.preventDefault();
          // Left and right follow reading direction.
          move(event.currentTarget.matches(":dir(rtl)") && /Left|Right/.test(event.key) ? -step : step);
        }}
        className="flex w-fit shrink-0 rounded-full bg-site-pill p-0.5"
      >
        {EDITIONS.map((e) => (
          <button
            key={e.value}
            id={`edition-${e.value}`}
            type="button"
            role="radio"
            aria-checked={edition === e.value}
            tabIndex={edition === e.value ? 0 : -1}
            onClick={() => {
              setEdition(e.value);
              track("edition_selected", { edition: e.value, slug: entry.href });
            }}
            className={cx(
              "h-7 cursor-pointer rounded-full px-3 text-site-body-medium transition-colors duration-150",
              edition === e.value ? "bg-site-surface text-site-ink shadow-site-raised" : "text-site-muted hover:text-site-ink",
              "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>
      <p className="text-site-body text-pretty text-site-muted">{EDITION_NOTE[edition]}</p>
    </div>
  );
}

/** A numbered step: a counter on a rail, a title, then its content. */
function Step({ title, children, last = false }: { title: ReactNode; children?: ReactNode; last?: boolean }) {
  return (
    <li className="relative ps-10 pb-8 [counter-increment:step] last:pb-0">
      <span aria-hidden className="absolute start-0 top-0 grid size-7 place-items-center rounded-full bg-site-pill font-mono text-[12.5px] text-site-ink ring-4 ring-site-page before:content-[counter(step)]" />
      {last ? null : <span aria-hidden className="absolute start-[13.5px] top-8 bottom-1 w-px bg-site-hairline" />}
      <h3 className="pt-0.5 text-site-body-medium text-site-ink">{title}</h3>
      {children ? <div className="mt-3 flex flex-col gap-3 text-site-body text-site-muted">{children}</div> : null}
    </li>
  );
}

function Cli({ entry }: { entry: Entry }) {
  const [pm, setPm] = usePackageManager();
  const [edition] = useEdition();
  const command = installCommand(entry.href, pm, edition);
  return (
    <CodeBlock
      code={command}
      lang="bash"
      prompt
      fold={0}
      header={<ManagerTabs value={pm} onChange={setPm} />}
      onCopy={() => track("install_command_copied", { command, pm, edition, surface: "component_page_installation" })}
    />
  );
}

function ProSteps({ entry }: { entry: Entry }) {
  const [pm, setPm] = usePackageManager();
  const [edition] = useEdition();
  const command = installCommand(entry.href, pm, edition);
  const style = entry.style && (edition === "base" && hasBase(entry.href) ? `${entry.style}-base` : entry.style);
  const registry = `"registries": {\n  "@panelo-pro": {\n    "url": "${SITE}/r/pro/{name}.json",\n    "headers": { "Authorization": "Bearer \${PANELO_LICENSE_KEY}" }\n  }\n}`;
  return (
    <ol className="flex flex-col [counter-reset:step]">
      <Step title="Add your licence key">
        <p>
          Your{" "}
          <Link href="/account" className={link}>
            account page
          </Link>{" "}
          has the key. Put it in <code className="font-mono text-site-ink">.env.local</code>:
        </p>
        <CodeBlock code="PANELO_LICENSE_KEY=your-key" lang="bash" header={path(".env.local")} fold={0} />
      </Step>
      <Step title="Add the Pro registry to components.json">
        <CodeBlock code={registry} lang="css" header={path("components.json")} fold={0} />
      </Step>
      <Step title="Install" last={!entry.style}>
        <CodeBlock
          code={command}
          lang="bash"
          prompt
          fold={0}
          header={<ManagerTabs value={pm} onChange={setPm} />}
          onCopy={() => track("install_command_copied", { command, pm, edition, surface: "component_page_installation" })}
        />
      </Step>
      {entry.style ? (
        <Step title="Get this style for your agent" last>
          <p>
            Adds a skill (in <code className="font-mono text-site-ink">.claude/skills</code> and <code className="font-mono text-site-ink">.agents/skills</code>) that teaches Claude Code, Codex or Cursor to build your other pages in this style, from this page&rsquo;s parts.
          </p>
          <CodeBlock
            code={`${RUNNER[pm]} shadcn@latest add @panelo-pro/${style}`}
            lang="bash"
            prompt
            fold={0}
            header={<ManagerTabs value={pm} onChange={setPm} />}
            onCopy={() => track("install_command_copied", { command: `@panelo-pro/${style}`, pm, edition, surface: "component_page_style" })}
          />
        </Step>
      ) : null}
    </ol>
  );
}

/** "ui-dropdown-menu" → "Dropdown menu"; the helpers read as what they are. */
function primitiveName(url: string) {
  const name = url.split("/r/")[1].replace(/\.json$/, "").replace(/-base$/, "");
  if (name === "lib-utils") return "the cn helper";
  if (name.startsWith("base-")) return `the Base UI ${name.slice(5).replace(/-/g, " ")} adapter`;
  const [, rest] = name.split(/-(.+)/);
  const words = rest.replace(/-/g, " ");
  return name.startsWith("hooks-") ? `the ${words.replace(/^use (\w)/, (_, c: string) => `use${c.toUpperCase()}`)} hook` : words[0].toUpperCase() + words.slice(1);
}
const list = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

function Manual({ entry }: { entry: Entry }) {
  const [pm, setPm] = usePackageManager();
  const [edition] = useEdition();
  const slug = entry.href.replace("/components/", "");
  const { item, failed, retry } = useItem(`/r/${itemName(entry.href, edition)}.json`);
  if (failed) return <Failed retry={retry} />;
  if (!item) return <Loading heights={[64, 64, 320]} />;

  const deps = item.dependencies ?? [];
  const add = `${ADD[pm]} ${deps.map((d) => (/[\^~<>*]/.test(d) ? `"${d}"` : d)).join(" ")}`;
  const primitives = (item.registryDependencies ?? []).filter((u) => !u.endsWith("/panelo-theme.json"));
  // Installed from paneloui.com wherever the page runs, so the command works as copied.
  const urls = primitives.map((u) => `${SITE}/r/${u.split("/r/")[1]}`);
  const base = `${RUNNER[pm]} shadcn@latest add ${urls.join(" ")}`;
  const copy = item.meta?.copy ?? item.files.map((f) => f.path);
  const files = copy.map((p) => item.files.find((f) => f.path === p)!).filter(Boolean);

  return (
    <ol className="flex flex-col [counter-reset:step]">
      {deps.length ? (
        <Step title="Install the following dependencies:">
          <CodeBlock code={add} lang="bash" prompt fold={0} header={<ManagerTabs value={pm} onChange={setPm} />} onCopy={() => track("manual_step_copied", { slug, step: "packages", pm })} />
        </Step>
      ) : null}
      {urls.length ? (
        <Step title="Add the Panelo pieces it builds on:">
          <p className="text-pretty">
            {list(primitives.map(primitiveName)).replace(/^./, (c) => c.toUpperCase())}. They bring the Panelo tokens for your global CSS with them.
          </p>
          <CodeBlock code={base} lang="bash" prompt fold={0} header={<ManagerTabs value={pm} onChange={setPm} />} onCopy={() => track("manual_step_copied", { slug, step: "primitives", pm })} />
        </Step>
      ) : null}
      <Step title="Copy and paste the following code into your project.">
        {files.map((f) => (
          <CodeBlock key={f.path} code={f.content} lang="tsx" header={path(f.path)} fold={16} onCopy={() => track("manual_step_copied", { slug, step: "file", file: f.path })} />
        ))}
      </Step>
      <Step title="Update the import paths to match your project setup." last />
    </ol>
  );
}
