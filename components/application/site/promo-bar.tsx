"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiArrowRightLine, RiCloseLine } from "@remixicon/react";

import { LAUNCH_ENDS, LAUNCH_OFF } from "@/components/application/site/pricing";

const pad = (n: number) => String(n).padStart(2, "0");

/** "6d 09h 15m 05s" until the offer ends. */
function left(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 86400)}d ${pad(Math.floor(s / 3600) % 24)}h ${pad(Math.floor(s / 60) % 60)}m ${pad(s % 60)}s`;
}

/** The site-wide offer bar, on every page but the bare previews the catalogue frames and the full-window agent demo. Dismissed for the visit. */
export function PromoBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  // Set after mount so the server and first client render agree; ticks once a second.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now !== null && now >= LAUNCH_ENDS) return null;
  if (!open || pathname?.startsWith("/preview") || pathname === "/agent-demo") return null;
  return (
    <div className="relative h-[38px] overflow-hidden bg-site-banner-via bg-linear-to-b from-site-banner-from via-site-banner-via to-site-banner-to text-site-on-banner">
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-0 h-[200%] w-30 animate-[site-banner-sweep_7s_ease-in-out_infinite] bg-[radial-gradient(closest-side,rgb(255_255_255/0.36),rgb(255_255_255/0.16)_50%,transparent)] motion-reduce:hidden"
      />
      <Link href="/#pricing" className="group relative flex h-full items-center justify-center gap-3 px-10 text-site-body">
        <span className="truncate">
          <span className="font-semibold">Early bird – ${LAUNCH_OFF} off Pro</span>
          {now !== null && <span className="tabular-nums">, ends in {left(LAUNCH_ENDS - now)}</span>}
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
