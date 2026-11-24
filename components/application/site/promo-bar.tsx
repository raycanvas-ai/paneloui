"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiArrowRightLine, RiCloseLine, RiFlashlightFill } from "@remixicon/react";

import { ALL_ENTRIES } from "@/components/application/docs/components-index";
import { LAUNCH_OFF, PLANS } from "@/components/application/site/pricing";

const proCount = ALL_ENTRIES.filter((e) => e.tier === "pro").length;
const fromPrice = Math.min(...PLANS.flatMap((p) => (p.price === null ? [] : [p.price])));

/** The site-wide offer bar, on every page but the bare previews the catalogue frames and the full-window agent demo. Dismissed for the visit. */
export function PromoBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  if (!open || pathname?.startsWith("/preview") || pathname === "/agent-demo") return null;
  return (
    // The offer in the site's Pro blue, tinted over the page so it reads in both themes.
    <div className="relative h-[38px] border-b border-site-pro-ring bg-site-page bg-linear-to-r from-site-pro to-site-pro text-site-pro-text">
      <Link href="/#pricing" className="group flex h-full items-center justify-center gap-1.5 px-10 text-site-body outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus-ring">
        <RiFlashlightFill className="size-3.5 shrink-0 text-site-pro-icon" aria-hidden />
        {/* Phones get the offer alone; wider screens add what Pro holds. */}
        <span className="truncate">
          <span className="font-semibold">Early bird: ${LAUNCH_OFF} off Pro</span>
          <span className="hidden sm:inline">, {proCount} pages, calendars and blocks from ${fromPrice} once</span>
        </span>
        <RiArrowRightLine className="size-3.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setOpen(false)}
        className="absolute top-1/2 end-3 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-site-pro-text/70 outline-none hover:bg-site-pro hover:text-site-pro-text focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <RiCloseLine className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
