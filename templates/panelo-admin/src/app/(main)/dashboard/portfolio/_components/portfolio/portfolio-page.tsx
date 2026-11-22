"use client";

import { Bell, Search, Sparkles } from "lucide-react";

import { SearchDialog } from "@/app/(main)/dashboard/_components/header/search-dialog";

import { AllocationPanel } from "./allocation-panel";
import { PerformancePanel } from "./performance-panel";
import { DOT_UP, iconPill } from "./portfolio-chrome";
import { investor } from "./portfolio-data";
import { WatchlistPanel } from "./watchlist-panel";

// Same knob as the companies and calendar screens: sizes are written at the
// companies scale, this trims the whole page without re-deriving them.
const UI_SCALE = 0.8;

export function PortfolioPage() {
  return (
    <div
      className="flex h-full min-h-0 flex-col bg-background text-foreground"
      style={{ zoom: UI_SCALE }}
      data-content-padding="false"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-[18px] pb-[22px]">
        <div>
          <p className="text-[15px] text-muted-foreground">{investor.greeting}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <h1 className="font-semibold text-[22px] tracking-[-0.01em]">{investor.name}</h1>
            <span className="flex h-[28px] items-center gap-2 rounded-full bg-accent px-3 text-[15px]">
              <span className="size-[7px] rounded-full" style={{ backgroundColor: DOT_UP }} />
              {investor.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <SearchDialog
            trigger={(open) => (
              <button
                type="button"
                onClick={open}
                className="flex h-[38px] w-[220px] items-center gap-2.5 rounded-full border border-border bg-card pr-[6px] pl-4 text-left text-[16px] text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Search className="size-[17px] shrink-0" strokeWidth={1.6} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">Search..</span>
                <kbd className="flex h-[26px] shrink-0 select-none items-center rounded-full bg-accent px-2.5 font-medium text-[13px]">
                  ⌘K
                </kbd>
              </button>
            )}
          />
          <button type="button" aria-label="Notifications" className={iconPill}>
            <Bell className="size-[18px]" strokeWidth={1.6} />
          </button>
          {/* The screen's one saturated control, matching the companies primary. */}
          <button
            type="button"
            className="flex h-[38px] shrink-0 items-center gap-1.5 rounded-full bg-primary pr-4 pl-3 font-medium text-[17px] text-white transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Sparkles className="size-[18px]" strokeWidth={2} aria-hidden="true" />
            AI Assistant
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <PerformancePanel />
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_470px]">
          <WatchlistPanel />
          <AllocationPanel />
        </div>
      </div>
    </div>
  );
}
