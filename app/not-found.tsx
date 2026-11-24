"use client";

import Link from "next/link";
import { RiArrowRightUpLine } from "@remixicon/react";

import { SiteFooter, SiteHeader } from "@/components/application/landing/landing-page";
import { CONTAINER, FOCUS } from "@/components/application/site/layout-classes";
import { pill } from "@/components/application/site/site-ui";
import { cx } from "@/utils/cx";

// Where people usually meant to go, so a dead link still ends somewhere useful.
const PLACES = [
  { href: "/components", title: "Components", body: "Charts, pages and blocks for shadcn/ui." },
  { href: "/agent-demo", title: "Agent demo", body: "Watch an AI agent run a live dashboard." },
  { href: "/blog", title: "Blog", body: "Guides to shadcn/ui, UI SDK and Tailwind CSS v4." },
  { href: "/templates", title: "Templates", body: "Whole apps, from December 1." },
];

/** Every unknown URL: the site chrome stays, so a wrong link is one click from the right page. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-site-page font-sans text-site-ink">
      <SiteHeader />
      <main className={cx(CONTAINER, "flex flex-1 flex-col items-center py-20 text-center sm:py-28")}>
        <p className="font-mono text-body-2-regular text-site-faint">404</p>
        <h1 className="mt-5 max-w-[640px] text-site-display-sm text-balance text-site-ink sm:text-site-display">
          This page isn&apos;t here.
        </h1>
        <p className="mt-5 max-w-[460px] text-site-lead text-pretty text-site-muted">It may have moved, or the link has a typo. These are the places people usually look for.</p>
        <div className="mt-9 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
          <Link href="/" className={pill("primary", "lg")}>
            Back to home
          </Link>
          <Link href="/components" className={pill("secondary", "lg")}>
            Browse components
          </Link>
        </div>
        <ul className="mt-16 grid w-full max-w-[880px] gap-3 text-start sm:grid-cols-2">
          {PLACES.map((place) => (
            <li key={place.href}>
              <Link
                href={place.href}
                className={cx(
                  "group flex h-full items-start justify-between gap-4 rounded-3xl border border-site-hairline bg-site-surface p-5 transition-colors hover:border-site-ring",
                  FOCUS,
                )}
              >
                <span className="flex flex-col gap-1">
                  <span className="text-site-body-medium text-site-ink">{place.title}</span>
                  <span className="text-site-body text-site-muted">{place.body}</span>
                </span>
                <RiArrowRightUpLine className="size-4 shrink-0 text-site-faint transition-colors group-hover:text-site-ink rtl:-scale-x-100" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
