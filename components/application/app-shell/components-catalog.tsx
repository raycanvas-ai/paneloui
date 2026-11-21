"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { SegmentedControl, SegmentedControlItem } from "@ui-sdk/react/segmented-control";

import { ALL_ENTRIES, COMPONENT_SECTIONS, installCommand, sectionOf, type Entry } from "@/components/application/docs/components-index";
import { LookPlayer } from "@/components/application/docs/look-player";
import { PANELO_PREVIEWS } from "@/components/application/docs/panelo-catalog";
import { Chip, ProTag, SiteTabPanel, SiteTabs } from "@/components/application/site/site-ui";
import { cx } from "@/utils/cx";

export type CatalogTier = "all" | "free" | "pro";

const TIERS: { value: CatalogTier; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

function TierFilter({ tier, onChange }: { tier: CatalogTier; onChange: (tier: CatalogTier) => void }) {
  return (
    <SegmentedControl
      aria-label="Show"
      value={tier}
      onValueChange={(value: string | null) => value && onChange(value as CatalogTier)}
      className="flex h-7 items-center gap-0.5 rounded-full bg-site-pill p-0.5"
    >
      {TIERS.map((item) => (
        <SegmentedControlItem
          key={item.value}
          value={item.value}
          className={cx(
            "h-6 cursor-pointer rounded-full px-2.5 text-site-body-medium text-site-muted transition-colors duration-150 outline-none",
            "hover:text-site-ink data-checked:bg-site-surface data-checked:text-site-ink data-checked:shadow-site-raised",
            "focus-visible:ring-2 focus-visible:ring-border-focus-ring",
          )}
        >
          {item.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}

/** The library index: every Panelo item by registry category, a tab per category, narrowed by tier. */
export function ComponentsCatalog() {
  const [tier, setTier] = useState<CatalogTier>("all");
  const [tab, setTab] = useState("all");

  // Category links arrive as /components#<id>, from the landing and the footer.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (COMPONENT_SECTIONS.some((s) => s.id === id)) setTab(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const select = (value: string) => {
    setTab(value);
    window.history.replaceState(null, "", value === "all" ? window.location.pathname : `#${value}`);
  };

  const inTier = (entry: Entry) => tier === "all" || entry.tier === tier;
  const items = [
    { value: "all", label: "All", count: ALL_ENTRIES.filter(inTier).length },
    ...COMPONENT_SECTIONS.map((s) => ({ value: s.id, label: s.title, count: s.entries.filter(inTier).length })),
  ];

  return (
    <div className="pt-6 pb-10 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="max-w-[520px] text-site-page-title text-balance">Dashboard components AI agents can operate – built on Vercel&apos;s UI SDK.</h1>
        <TierFilter tier={tier} onChange={setTier} />
      </div>
      <LookPlayer className="mt-5" />
      <SiteTabs
        label="Library categories"
        items={items}
        value={tab}
        onValueChange={select}
        className="mt-7"
      >
        {items.map((item) => (
          <SiteTabPanel key={item.value} value={item.value} className="pt-6">
            {tab === item.value && (
              <div className="flex flex-col gap-10">
                {COMPONENT_SECTIONS.filter((s) => item.value === "all" || s.id === item.value).map((section) => {
                  const entries = section.entries.filter(inTier);
                  if (entries.length === 0) return null;
                  return (
                    <section key={section.id} aria-label={section.title} className="flex flex-col gap-3">
                      {item.value === "all" && (
                        <h2 className="flex items-baseline gap-2 text-site-body-medium text-site-muted">
                          {section.title}
                          <span className="text-site-count text-site-faint">{entries.length}</span>
                        </h2>
                      )}
                      <div className={cx("grid grid-cols-1 gap-3.5 sm:grid-cols-2", section.wide ? "xl:grid-cols-2" : "xl:grid-cols-3")}>
                        {entries.map((entry) => (
                          <PreviewCard key={entry.href} entry={entry} />
                        ))}
                      </div>
                    </section>
                  );
                })}
                {items.find((i) => i.value === item.value)?.count === 0 && (
                  <p className="py-16 text-center text-site-body text-site-muted">Nothing {tier} here yet.</p>
                )}
              </div>
            )}
          </SiteTabPanel>
        ))}
      </SiteTabs>
    </div>
  );
}

function CopyInstall({ command, name }: { command: string; name: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy the install command for ${name}`}
      onClick={async () => {
        await navigator.clipboard.writeText(command);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className="relative z-10 grid size-[30px] shrink-0 cursor-pointer place-items-center rounded-full bg-site-surface text-site-muted ring-1 ring-site-ring transition-colors duration-150 outline-none hover:text-site-ink focus-visible:ring-2 focus-visible:ring-border-focus-ring"
    >
      {copied ? <RiCheckLine className="size-3.5" aria-hidden /> : <RiFileCopyLine className="size-3.5" aria-hidden />}
    </button>
  );
}

/** A catalogue entry as a card: its live preview in a recessed well, name and line below, the whole card a link. */
export function PreviewCard({ entry }: { entry: Entry }) {
  const { Preview, options } = PANELO_PREVIEWS[entry.href];
  const install = installCommand(entry.href);
  return (
    <article className="relative flex flex-col rounded-[14px] border border-site-hairline bg-site-surface p-1.5 pb-0 transition-[border-color] duration-150 [container-type:inline-size] hover:border-site-ring">
      <div className={cx("relative h-[230px] overflow-hidden rounded-lg bg-site-preview ring-1 ring-site-hairline ring-inset", options.previewClassName)}>
        <Preview />
        {options.fade && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-11 bg-linear-to-b from-transparent to-site-preview" />
        )}
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 z-20 flex items-start justify-between gap-2">
          <Chip>{sectionOf(entry.href)?.title}</Chip>
          {entry.tier === "pro" && <ProTag />}
        </div>
      </div>
      <div className="flex items-center gap-3 py-2.5 ps-[11.5px] pe-1">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-site-body-medium text-site-ink">
            <Link
              href={entry.href}
              className="outline-none after:absolute after:inset-0 after:rounded-[14px] focus-visible:after:ring-2 focus-visible:after:ring-border-focus-ring"
            >
              {entry.name}
            </Link>
          </h3>
          <p className="truncate text-site-body text-site-muted">{entry.description}</p>
        </div>
        {install && <CopyInstall command={install} name={entry.name} />}
      </div>
    </article>
  );
}
