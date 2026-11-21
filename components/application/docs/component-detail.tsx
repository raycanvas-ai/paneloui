"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { RiArrowRightSFill, RiCheckLine, RiFileCopyLine, RiFullscreenLine } from "@remixicon/react";

import { installCommand, sectionOf, type Entry } from "@/components/application/docs/components-index";
import { LookPlayer } from "@/components/application/docs/look-player";
import { useLook, useLookFrame } from "@/components/application/docs/looks";
import { PaneloChart, slugOf } from "@/components/application/docs/panelo-catalog";
import { ScreenFrame } from "@/components/application/docs/preview-frames";
import { pill, ProTag } from "@/components/application/site/site-ui";
import { cx } from "@/utils/cx";

function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex w-fit max-w-full items-center gap-2 rounded-lg bg-site-pill py-1 ps-3 pe-1">
      <code className="min-w-0 truncate font-mono text-site-body text-site-ink">
        <span className="text-site-faint select-none">$ </span>
        {command}
      </code>
      <button
        type="button"
        aria-label="Copy install command"
        onClick={async () => {
          await navigator.clipboard.writeText(command);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-site-muted transition-colors outline-none hover:bg-site-pill-hover hover:text-site-ink focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        {copied ? <RiCheckLine className="size-3.5" aria-hidden /> : <RiFileCopyLine className="size-3.5" aria-hidden />}
      </button>
    </div>
  );
}

/** One catalogue item on its own page: breadcrumb, title, install command and a full-size live preview. */
export function ComponentDetail({ entry }: { entry: Entry }) {
  const section = sectionOf(entry.href)!;
  const install = installCommand(entry.href);
  const slug = slugOf(entry.href);
  const screen = section.kind === "screen";
  const preview = `/preview/${slug}${slug === "dashboard-pages-11" ? "?assistant" : ""}`;
  const look = useLook();
  const frame = useRef<HTMLIFrameElement>(null);
  useLookFrame(frame);
  const fullScreen = look ? `${preview}${preview.includes("?") ? "&" : "?"}look=${look}` : preview;

  return (
    <div className="mx-auto flex w-full max-w-[894px] flex-col pt-6 pb-10 sm:pt-9">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-site-body text-site-muted">
          <li>
            <Link href="/components" className="hover:text-site-ink">
              Components
            </Link>
          </li>
          {(
            <li className="flex items-center gap-1.5">
              <RiArrowRightSFill className="size-3.5 text-site-faint" aria-hidden />
              <Link href={`/components#${section.id}`} className="hover:text-site-ink">
                {section.title}
              </Link>
            </li>
          )}
          <li aria-current="page" className="flex items-center gap-1.5 text-site-ink">
            <RiArrowRightSFill className="size-3.5 text-site-faint" aria-hidden />
            {entry.name}
          </li>
        </ol>
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-site-title text-site-ink">{entry.name}</h1>
        {entry.tier === "pro" && <ProTag />}
      </div>
      <p className="mt-3 max-w-[760px] text-site-lead text-pretty text-site-muted">{entry.description}</p>
      {install && (
        <div className="mt-5">
          <InstallCommand command={install} />
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-2">
        <LookPlayer />
        {(screen || section.kind === "chart") && (
          <a href={fullScreen} target="_blank" rel="noreferrer" className={pill("secondary")}>
            <RiFullscreenLine aria-hidden />
            Open full screen
          </a>
        )}
      </div>
      <div
        className={cx(
          "mt-3",
          "w-full overflow-hidden rounded-2xl border border-site-hairline bg-site-surface",
          // Screens render on a desktop canvas and scale down, so the page shows its full-screen layout, not its tablet one.
          // Charts sit at the top, so a chart that changes height (a morph, a hidden panel) never shifts its own controls.
          screen ? "relative aspect-[1440/900]" : "flex min-h-[420px] justify-center p-8",
        )}
      >
        {section.kind === "chart" ? (
          <div className="w-full max-w-4xl">
            <PaneloChart slug={slug} />
          </div>
        ) : (
          <ScreenFrame width={1440} height={900}>
            <iframe ref={frame} src={preview} title={`${entry.name} preview`} className="size-full border-0" />
          </ScreenFrame>
        )}
      </div>
    </div>
  );
}
