"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";

import { pill } from "@/components/application/site/site-ui";
import { THEME_STORAGE_KEY } from "@/components/application/theme/theme-toggle";
import { Logo } from "@/components/foundations/brand/logo";

/**
 * /agent-demo: the live FlowAI dashboard under a slim bar that leads back out. The dashboard sizes itself to
 * the whole window (it's a full app), so it runs in a frame below the bar rather than sharing the page.
 */
export function AgentDemo() {
  const router = useRouter();
  const [cameFromSite, setCameFromSite] = useState(false);

  useEffect(() => {
    // Arrived from a page on this site: the bar goes back there, scroll position included. Opened from
    // outside or a fresh tab: it goes home, since "back" would leave the site. Links inside the site don't
    // reload the page, so they never update document.referrer: a first load at another path means we got
    // here by one of them. A full load needs a same-origin referrer and a page to go back to.
    const firstLoad = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const linkedFromSite = !!firstLoad && new URL(firstLoad.name).pathname !== window.location.pathname;
    const loadedFromSite = window.history.length > 1 && URL.canParse(document.referrer) && new URL(document.referrer).origin === window.location.origin;
    setCameFromSite(linkedFromSite || loadedFromSite);
    // The light/dark switch lives in the dashboard, in the frame. Same origin, so its choice arrives here as a
    // storage event, and the bar follows instead of carrying a second switch.
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) document.documentElement.classList.toggle("dark", event.newValue === "dark");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-site-page font-sans text-site-ink">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-site-hairline px-2 sm:px-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            onClick={(event) => {
              if (!cameFromSite) return;
              event.preventDefault();
              router.back();
            }}
            aria-label="Back to Panelo UI"
            className={pill("ghost", "sm", "gap-2 ps-2 pe-2.5")}
          >
            <RiArrowLeftLine aria-hidden className="rtl:rotate-180" />
            <Logo size={16} />
            <span className="hidden sm:inline">Panelo UI</span>
          </Link>
          <span aria-hidden className="h-4 w-px shrink-0 bg-site-hairline" />
          <h1 className="shrink-0 text-site-body-medium text-site-ink">Agent demo</h1>
          <p className="hidden min-w-0 truncate text-site-body text-site-muted lg:block">Ask the assistant: it works this dashboard through the same UI you click.</p>
        </div>
        <Link href="/components/dashboard-pages-11" className={pill("primary")}>
          Get this dashboard
        </Link>
      </header>
      <iframe src="/preview/dashboard-pages-11?assistant" title="FlowAI, a dashboard an AI agent operates" allow="clipboard-write" className="min-h-0 w-full flex-1 border-0" />
    </div>
  );
}
