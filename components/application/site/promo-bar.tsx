"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiArrowRightLine, RiCloseLine } from "@remixicon/react";

import { ALL_ENTRIES } from "@/components/application/docs/components-index";

const proCount = ALL_ENTRIES.filter((e) => e.tier === "pro").length;

/** The site-wide offer bar, on every page but the bare previews the catalogue frames and the full-window agent demo. Dismissed for the visit. */
export function PromoBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  if (!open || pathname?.startsWith("/preview") || pathname === "/agent-demo") return null;
  return (
    <div className="relative h-[38px] overflow-hidden bg-site-banner-via bg-linear-to-b from-site-banner-from via-site-banner-via to-site-banner-to text-site-on-banner">
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-0 h-[200%] w-30 animate-[site-banner-sweep_7s_ease-in-out_infinite] bg-[radial-gradient(closest-side,rgb(255_255_255/0.36),rgb(255_255_255/0.16)_50%,transparent)] motion-reduce:hidden"
      />
      <Link href="/#pricing" className="group relative flex h-full items-center justify-center gap-3 px-10 text-site-body">
        {/* Phones get the offer alone; wider screens add what Pro holds. */}
        <span className="truncate">
          <span className="font-semibold">$50 off Pro</span>
          <span className="sm:hidden"> for launch</span>
          <span className="hidden sm:inline">
            {" "}
            for launch: {proCount} pages, calendars and blocks, from <span className="font-semibold">$129</span> once
          </span>
        </span>
        <span className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded-md bg-site-on-banner/20 px-2.5 font-semibold transition-colors group-hover:bg-site-on-banner/30">
          Get Pro
          <RiArrowRightLine className="size-3.5" aria-hidden />
        </span>
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setOpen(false)}
        className="absolute top-1/2 end-3 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-site-on-banner/70 outline-none hover:bg-site-on-banner/15 hover:text-site-on-banner focus-visible:ring-2 focus-visible:ring-site-on-banner"
      >
        <RiCloseLine className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
