"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { RiArrowRightSFill, RiFullscreenLine } from "@remixicon/react";

import {
  sectionOf,
  type Entry,
} from "@/components/application/docs/components-index";
import {
  DeviceStage,
  DeviceSwitcher,
  usePreviewDevice,
} from "@/components/application/docs/device-preview";
import {
  CopyInstall,
  DemoCode,
  Installation,
} from "@/components/application/docs/install";
import { LookPlayer } from "@/components/application/docs/look-player";
import { useLook } from "@/components/application/docs/looks";
import {
  PaneloChart,
  slugOf,
} from "@/components/application/docs/panelo-catalog";
import {
  pill,
  ProTag,
  SiteTabPanel,
  SiteTabs,
} from "@/components/application/site/site-ui";

/** One catalogue item on its own page. The demo leads: a short header, then Preview / Code at once, so the live
 *  component is in the first screen; installation follows below it. */
export function ComponentDetail({ entry }: { entry: Entry }) {
  const section = sectionOf(entry.href)!;
  const slug = slugOf(entry.href);
  const preview = `/preview/${slug}${slug === "dashboard-pages-11" ? "?assistant" : ""}`;
  const look = useLook();
  const [device, setDevice] = usePreviewDevice();
  const fullScreen = look
    ? `${preview}${preview.includes("?") ? "&" : "?"}look=${look}`
    : preview;
  const [view, setView] = useState("preview");
  // The Code tab takes the preview's height, so switching tabs doesn't make the page jump.
  const stage = useRef<HTMLDivElement>(null);
  const [stageHeight, setStageHeight] = useState<number>();

  return (
    <div className="mx-auto flex w-full max-w-[894px] flex-col pt-5 pb-10 sm:pt-7">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-site-body text-site-muted">
          <li>
            <Link href="/components" className="hover:text-site-ink">
              Components
            </Link>
          </li>
          {
            <li className="flex items-center gap-1.5">
              <RiArrowRightSFill
                className="size-3.5 text-site-faint"
                aria-hidden
              />
              <Link
                href={`/components#${section.id}`}
                className="hover:text-site-ink"
              >
                {section.title}
              </Link>
            </li>
          }
          <li
            aria-current="page"
            className="flex items-center gap-1.5 text-site-ink"
          >
            <RiArrowRightSFill
              className="size-3.5 text-site-faint"
              aria-hidden
            />
            {entry.name}
          </li>
        </ol>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-site-title text-site-ink">{entry.name}</h1>
        {entry.tier === "pro" && <ProTag />}
        <span className="ms-auto">
          <CopyInstall entry={entry} />
        </span>
      </div>
      <p className="mt-2 line-clamp-3 max-w-[760px] text-site-body text-pretty text-site-muted sm:line-clamp-none">
        {entry.description}
      </p>

      <SiteTabs
        label="View"
        value={view}
        onValueChange={(v) => {
          if (stage.current?.offsetHeight)
            setStageHeight(stage.current.offsetHeight);
          setView(v);
        }}
        items={[
          { value: "preview", label: "Preview" },
          { value: "code", label: "Code" },
        ]}
        className="mt-4"
        trailing={
          view === "preview" ? (
            <div className="flex items-center gap-2">
              <LookPlayer className="hidden md:inline-flex" />
              {/* Device sizes need room to show a phone beside a tablet; on a phone the page already is one. */}
              <DeviceSwitcher
                device={device}
                onChange={setDevice}
                className="hidden sm:flex"
              />
              <a
                href={fullScreen}
                target="_blank"
                rel="noreferrer"
                aria-label="Open full screen"
                title="Open full screen"
                className="grid size-7 place-items-center rounded-full bg-site-pill text-site-muted transition-colors outline-none hover:bg-site-pill-hover hover:text-site-ink focus-visible:ring-2 focus-visible:ring-border-focus-ring"
              >
                <RiFullscreenLine className="size-3.5" aria-hidden />
              </a>
            </div>
          ) : null
        }
      >
        {/* The preview stays mounted, so coming back from Code doesn't reload the live demo. */}
        <SiteTabPanel
          value="preview"
          keepMounted
          className="pt-3 data-hidden:hidden"
        >
          {/* Charts render in place on desktop, at the top so a chart that changes height never shifts its own controls;
              screens, and charts at tablet or phone size, run in a real viewport of the device's width. */}
          <div ref={stage}>
            {section.kind === "chart" && device === "desktop" ? (
              <div className="flex min-h-[420px] w-full justify-center overflow-hidden rounded-2xl border border-site-hairline bg-site-surface p-8">
                <div className="w-full max-w-4xl">
                  <PaneloChart slug={slug} />
                </div>
              </div>
            ) : (
              <DeviceStage device={device} src={preview} title={entry.name} />
            )}
          </div>
        </SiteTabPanel>
        <SiteTabPanel value="code" className="pt-3">
          {view === "code" ? (
            <DemoCode entry={entry} slug={slug} height={stageHeight} />
          ) : null}
        </SiteTabPanel>
      </SiteTabs>
      <Installation entry={entry} slug={slug} />
    </div>
  );
}
