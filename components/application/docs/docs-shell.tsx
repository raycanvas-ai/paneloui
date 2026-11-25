"use client";

import { GitHubLink } from "@/components/application/site/github-link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type RemixiconComponentType,
  RiArrowDownSLine,
  RiBarChartBoxLine,
  RiBookShelfLine,
  RiCalendarLine,
  RiDashboardLine,
  RiFlashlightFill,
  RiHome5Line,
  RiLayoutGridLine,
  RiLayoutLeftLine,
  RiLoginBoxLine,
  RiMenuLine,
  RiPriceTag3Line,
  RiProfileLine,
  RiSearchLine,
  RiSparkling2Line,
  RiStackLine,
  RiTableLine,
  RiNumbersLine,
} from "@remixicon/react";

import { COMPONENT_SECTIONS } from "@/components/application/docs/components-index";
import { pill } from "@/components/application/site/site-ui";
import { ThemeToggle } from "@/components/application/theme/theme-toggle";
import { Logo } from "@/components/foundations/brand/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/panelo/ui/sheet";
import { cx } from "@/utils/cx";

export const AGENT_DEMO = "/agent-demo";

type Icon = RemixiconComponentType;

const NAV: { name: string; href: string; icon: Icon }[] = [
  { name: "Home", href: "/", icon: RiHome5Line },
  { name: "Library", href: "/components", icon: RiBookShelfLine },
  { name: "Agent demo", href: AGENT_DEMO, icon: RiSparkling2Line },
  { name: "Pricing", href: "/#pricing", icon: RiPriceTag3Line },
];

const SECTION_ICONS: Record<string, Icon> = {
  "dashboard-pages": RiDashboardLine,
  "login-pages": RiLoginBoxLine,
  "profile-pages": RiProfileLine,
  sidebars: RiLayoutLeftLine,
  elements: RiStackLine,
  charts: RiBarChartBoxLine,
  calendars: RiCalendarLine,
  tables: RiTableLine,
  stats: RiNumbersLine,
};

const row = (current: boolean) =>
  cx(
    "flex h-[29px] shrink-0 items-center gap-2 rounded-lg text-site-body transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
    current ? "bg-site-active text-site-ink" : "text-site-muted hover:bg-site-pill hover:text-site-ink",
  );

// Every page mounts its own shell, so the sidebar would reopen at the top on each click.
let navScroll = 0;

/** The library's navigation: site links, then every catalogue section as a folding list, filtered by search. */
function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const q = query.trim().toLocaleLowerCase();

  useEffect(() => {
    if (navRef.current) navRef.current.scrollTop = navScroll;
    // The landing's ⌘K arrives as /components?search.
    if (new URLSearchParams(window.location.search).has("search")) inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLocaleLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ordered = COMPONENT_SECTIONS;
  const groups = ordered.map((section) => ({
    ...section,
    shown: section.entries.filter((e) => e.name.toLocaleLowerCase().includes(q)),
  })).filter((group) => group.shown.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 items-center justify-between px-2">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
          <Logo size={18} />
          <span className="text-site-button text-site-ink">Panelo UI</span>
        </Link>
      </div>
      <label className="mx-0.5 mt-2.5 flex h-8 items-center gap-2 rounded-lg bg-site-surface ps-[11px] pe-2 text-site-faint shadow-site-field focus-within:ring-2 focus-within:ring-border-focus-ring">
        <RiSearchLine className="size-4 shrink-0" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Escape" && setQuery("")}
          placeholder="Search..."
          aria-label="Search components"
          className="min-w-0 flex-1 bg-transparent text-site-body text-site-ink outline-none placeholder:text-site-faint"
        />
        <span aria-hidden className="flex gap-1 text-site-count text-site-faint">
          <kbd className="font-sans">⌘</kbd>
          <kbd className="font-sans">K</kbd>
        </span>
      </label>

      <nav
        ref={navRef}
        onScroll={(event) => (navScroll = event.currentTarget.scrollTop)}
        aria-label="Library"
        // `relative` makes the list the containing block of its sr-only labels, so they scroll inside it instead of stretching the page.
        className="relative mt-2.5 flex min-h-0 flex-1 flex-col gap-px overflow-y-auto pb-9 [scrollbar-width:thin]"
      >
        {NAV.map(({ name, href, icon: ItemIcon }) => {
          const current = pathname === href;
          return (
            <Link key={name} href={href} onClick={onNavigate} aria-current={current ? "page" : undefined} className={cx(row(current), "px-2")}>
              <ItemIcon className="size-4 shrink-0 text-site-muted" aria-hidden />
              {name}
            </Link>
          );
        })}

        <div className="mt-4 flex flex-col gap-px">
          {groups.length === 0 && <p className="px-2 py-3 text-site-body text-site-faint">No results</p>}
          {groups.map((group) => {
            const GroupIcon = SECTION_ICONS[group.id] ?? RiLayoutGridLine;
            return (
              // Remounting on a query reopens every group a search lands in.
              <details key={`${group.id}:${q}`} open className="group/sec">
                <summary className="flex h-[29px] cursor-pointer list-none items-center gap-2 rounded-lg px-1.5 text-site-body-medium text-site-ink outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring [&::-webkit-details-marker]:hidden">
                  <GroupIcon className="size-4 shrink-0 text-site-muted" aria-hidden />
                  {group.title}
                  <span className="text-site-count text-site-faint">{group.shown.length}</span>
                  <RiArrowDownSLine className="size-3.5 -rotate-90 text-site-faint transition-transform duration-150 group-open/sec:rotate-0" aria-hidden />
                </summary>
                <ul className="flex flex-col gap-px pt-px">
                  {group.shown.map((entry) => {
                    const current = pathname === entry.href;
                    return (
                      <li key={entry.href}>
                        <Link
                          href={entry.href}
                          onClick={onNavigate}
                          aria-current={current ? "page" : undefined}
                          className={cx(row(current), "ps-[31.5px] pe-3")}
                        >
                          <span className="truncate">{entry.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

const SUMMARY = COMPONENT_SECTIONS.map((section) => `${section.entries.length} ${section.title.toLocaleLowerCase()}`).join(" · ");

/**
 * The library frame for /components and every component page: the sidebar on the
 * grey ground, the page in an inset panel with the theme and Pro controls on top.
 */
export function DocsShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-1 items-start bg-site-ground font-sans text-site-ink">
      <aside className="sticky top-0 z-30 hidden h-dvh w-64 shrink-0 px-2.5 pt-2 lg:block">
        <DocsSidebar />
      </aside>
      {/* Phones and tablets: the same sidebar in a drawer that slides in and out, with focus trap, Escape,
          swipe-to-close and scroll lock from the UI SDK drawer. */}
      <Sheet side="left" open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent className="w-64 max-w-[85vw] gap-0 rounded-none border-0 bg-site-ground px-2.5 pt-2 pb-0 lg:hidden" overlayClassName="lg:hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <DocsSidebar onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="m-2 flex min-h-[calc(100dvh-1rem)] min-w-0 flex-1 flex-col self-stretch rounded-[18px] border border-site-panel-border bg-site-panel shadow-site-panel lg:ms-0">
        <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-2.5 sm:px-7">
          <div className="flex items-center gap-2 lg:invisible">
            <button type="button" aria-label="Open navigation" onClick={() => setNavOpen(true)} className={pill("ghost", "sm", "w-7 px-0")}>
              <RiMenuLine aria-hidden />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Logo size={18} />
              <span className="text-site-button">Panelo UI</span>
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <GitHubLink className="hidden sm:inline-flex" />
            <ThemeToggle appearance="segmented" size="small" />
            <Link href="/#pricing" className={pill("pro")}>
              <RiFlashlightFill aria-hidden />
              Get Pro
            </Link>
            <Link href={AGENT_DEMO} className={cx(pill("secondary"), "hidden sm:inline-flex")}>
              Live demo
            </Link>
          </div>
        </header>
        <div className="flex flex-1 flex-col px-4 sm:px-7">{children}</div>
        <footer className="px-4 pt-5 pb-8 text-center text-site-count text-site-faint sm:px-7">Panelo UI · {SUMMARY}</footer>
      </main>
    </div>
  );
}
