"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { RiArrowDownSLine, RiCheckLine, RiFileCopyLine } from "@remixicon/react";

import { PACKAGE_MANAGERS, type PackageManager } from "@/components/application/docs/components-index";
import { cx } from "@/utils/cx";

/* -------------------------------------------------------------------------- */
/*  Code on component pages: a small highlighter (TSX, CSS, shell), a block    */
/*  with a copy button that folds long files, and the reader's package        */
/*  manager, remembered and shared by every block on the page.                */
/* -------------------------------------------------------------------------- */

export type Lang = "tsx" | "css" | "bash";

const KEYWORDS =
  "import|from|export|default|function|return|const|let|var|if|else|for|while|switch|case|break|continue|new|typeof|instanceof|in|of|as|type|interface|extends|async|await|try|catch|finally|throw|class|null|undefined|true|false|this|void|keyof|readonly";

// One pass, first match wins: comments and strings before anything that could match inside them.
const GRAMMAR: Record<Lang, RegExp> = {
  tsx: new RegExp(
    [
      String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
      String.raw`(?<string>\`(?:\\[\s\S]|[^\\\`])*\`|"(?:\\.|[^\\"\n])*"|'(?:\\.|[^\\'\n])*')`,
      String.raw`(?<tag>(?<=<\/?)[A-Za-z][\w.]*)`,
      String.raw`(?<keyword>\b(?:${KEYWORDS})\b)`,
      String.raw`(?<number>\b\d[\d_]*(?:\.\d+)?\b)`,
      String.raw`(?<attr>\b[a-zA-Z][\w-]*(?==[{"']))`,
      String.raw`(?<fn>\b[a-zA-Z_$][\w$]*(?=\())`,
      String.raw`(?<type>\b[A-Z][A-Za-z0-9]*\b)`,
    ].join("|"),
    "g",
  ),
  css: new RegExp(
    [
      String.raw`(?<comment>\/\*[\s\S]*?\*\/)`,
      String.raw`(?<string>"[^"\n]*"|'[^'\n]*')`,
      String.raw`(?<attr>--[\w-]+|\b[a-z-]+(?=\s*:))`,
      String.raw`(?<keyword>@[\w-]+|:root|\.dark)`,
      String.raw`(?<fn>\b[a-z-]+(?=\())`,
      String.raw`(?<number>\b\d[\d.]*%?)`,
    ].join("|"),
    "g",
  ),
  bash: new RegExp([String.raw`(?<fn>^\S+(?:\s+(?:dlx|--bun))?)`, String.raw`(?<string>https?:\/\/\S+|"[^"]*")`, String.raw`(?<attr>(?<=\s)--?[\w-]+)`].join("|"), "gm"),
};

const TONE: Record<string, string> = {
  comment: "text-site-code-comment",
  string: "text-site-code-string",
  tag: "text-site-code-tag",
  keyword: "text-site-code-keyword",
  number: "text-site-code-number",
  attr: "text-site-code-attr",
  fn: "text-site-code-fn",
  type: "text-site-code-tag",
};

export function highlight(code: string, lang: Lang): ReactNode[] {
  const out: ReactNode[] = [];
  let at = 0;
  for (const m of code.matchAll(GRAMMAR[lang])) {
    const kind = Object.entries(m.groups ?? {}).find(([, v]) => v !== undefined)?.[0];
    if (!kind || m.index === undefined) continue;
    if (m.index > at) out.push(code.slice(at, m.index));
    out.push(
      <span key={m.index} className={TONE[kind]}>
        {m[0]}
      </span>,
    );
    at = m.index + m[0].length;
  }
  if (at < code.length) out.push(code.slice(at));
  return out;
}

/* ------------------------------ Package manager ------------------------------ */

const KEY = "panelo:package-manager";
const listeners = new Set<() => void>();
const read = (): PackageManager => {
  const v = typeof window === "undefined" ? null : window.localStorage.getItem(KEY);
  return (PACKAGE_MANAGERS as string[]).includes(v ?? "") ? (v as PackageManager) : "npm";
};

/** The reader's package manager: remembered across visits, and every block on the page moves together. */
export function usePackageManager(): [PackageManager, (pm: PackageManager) => void] {
  const pm = useSyncExternalStore(
    (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    read,
    () => "npm" as PackageManager,
  );
  const set = (next: PackageManager) => {
    window.localStorage.setItem(KEY, next);
    listeners.forEach((fn) => fn());
  };
  return [pm, set];
}

/* ---------------------------------- Pieces ---------------------------------- */

const focus = "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";

export function CopyButton({ text, label = "Copy", onCopy, className }: { text: string; label?: string; onCopy?: () => void; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        onCopy?.();
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className={cx("grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-site-muted transition-colors hover:bg-site-pill-hover hover:text-site-ink", focus, className)}
    >
      {copied ? <RiCheckLine className="size-3.5" aria-hidden /> : <RiFileCopyLine className="size-3.5" aria-hidden />}
    </button>
  );
}

/** A code panel: a header (title or tabs, then copy) over highlighted code that folds when long. */
export function CodeBlock({
  code,
  lang,
  header,
  onCopy,
  fold = 22,
  prompt = false,
  height,
  className,
}: {
  code: string;
  lang: Lang;
  /** Left side of the header: a file path, a label or tabs. */
  header?: ReactNode;
  onCopy?: () => void;
  /** Lines shown before the block folds; `0` never folds. */
  fold?: number;
  /** Show a `$` before a one-line shell command. */
  prompt?: boolean;
  /** A fixed height: the code scrolls inside it instead of folding (the Code tab matches the preview's height). */
  height?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n").length;
  const foldable = !height && fold > 0 && lines > fold;
  const folded = foldable && !open;
  // Files get line numbers; a one-line command doesn't need them.
  const numbered = lang !== "bash";
  return (
    <div className={cx("flex flex-col overflow-hidden rounded-xl bg-site-surface ring-1 ring-site-hairline", className)} style={height ? { height } : undefined}>
      <div className="flex min-h-10 shrink-0 items-center gap-2 border-b border-site-hairline ps-3.5 pe-1.5">
        <div className="min-w-0 flex-1">{header}</div>
        <CopyButton text={code} onCopy={onCopy} label={lang === "bash" ? "Copy command" : "Copy code"} />
      </div>
      <div className="relative min-h-0 flex-1">
        <div
          className={cx(
            "flex h-full overflow-auto py-3.5 font-mono text-[13px] leading-[1.65] [scrollbar-width:thin]",
            folded && "max-h-[372px] overflow-y-hidden",
          )}
        >
          {numbered ? (
            // Sticky, so the numbers stay put while a long line scrolls sideways.
            <span aria-hidden className="sticky start-0 shrink-0 bg-site-surface ps-4 pe-5 text-end whitespace-pre text-site-faint tabular-nums select-none">
              {Array.from({ length: lines }, (_, i) => i + 1).join("\n")}
            </span>
          ) : null}
          <pre className={cx("min-w-0 flex-1 pe-4 text-site-ink [tab-size:2]", !numbered && "ps-4")}>
            <code>
              {prompt ? <span className="text-site-faint select-none">$ </span> : null}
              {highlight(code, lang)}
            </code>
          </pre>
        </div>
        {foldable ? (
          <div className={cx("flex justify-center pb-3", folded && "absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-site-surface to-60% pt-16")}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className={cx("inline-flex h-7 cursor-pointer items-center gap-1 rounded-full bg-site-pill px-3 text-site-body-medium text-site-ink hover:bg-site-pill-hover", focus)}
            >
              {open ? "Collapse" : `Expand · ${lines} lines`}
              <RiArrowDownSLine className={cx("size-4 transition-transform", open && "rotate-180")} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Package-manager tabs, for a code block's header. */
export function ManagerTabs({ value, onChange }: { value: PackageManager; onChange: (pm: PackageManager) => void }) {
  return (
    <div role="radiogroup" aria-label="Package manager" className="-ms-1.5 flex items-center gap-0.5">
      {PACKAGE_MANAGERS.map((pm) => (
        <button
          key={pm}
          type="button"
          role="radio"
          aria-checked={value === pm}
          onClick={() => onChange(pm)}
          className={cx(
            "h-7 cursor-pointer rounded-md px-2 font-mono text-[12.5px] transition-colors",
            value === pm ? "bg-site-pill text-site-ink" : "text-site-muted hover:text-site-ink",
            focus,
          )}
        >
          {pm}
        </button>
      ))}
    </div>
  );
}
