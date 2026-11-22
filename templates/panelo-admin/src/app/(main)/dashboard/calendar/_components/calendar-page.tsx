"use client";

import { Bell, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { TodayPanel } from "./today-panel";
import { WeekGrid } from "./week-grid";

// Every size on this page is measured off the reference mock in px. UI_SCALE is
// the single knob that trims the whole page down without re-deriving them.
// ponytail: CSS zoom, not a transform — keeps layout/scrollbars honest.
const UI_SCALE = 0.9;

// Measured off the reference: 44px controls, 9px gutters, 12px radius.
const control = "flex size-10 shrink-0 items-center justify-center rounded-[12px] transition-colors";

export function CalendarPage() {
  return (
    <div
      className="flex h-full min-h-0 flex-col px-5 pt-[11px] pb-5"
      style={{ zoom: UI_SCALE }}
      data-content-padding="false"
    >
      <p className="text-[19px] text-muted-foreground">Calendar</p>

      <div className="mt-[21px] flex items-start justify-between gap-4">
        <h1 className="font-normal text-[52px] leading-none tracking-[-0.02em]">Calendar</h1>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className={`${control} relative border bg-card hover:bg-muted/50`}
          >
            <Bell className="size-5" strokeWidth={1.3} />
            <span className="absolute top-2 right-2 size-[9px] rounded-full bg-warning-solid" />
          </button>
          <button
            type="button"
            className="h-10 rounded-[12px] border bg-card px-3.5 text-[15px] transition-colors hover:bg-muted/50"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Previous week"
            className={`${control} bg-muted text-foreground hover:bg-foreground/15`}
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Next week"
            className={`${control} bg-muted text-foreground hover:bg-foreground/15`}
          >
            <ChevronRight className="size-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="New event"
            className={`${control} bg-foreground text-background hover:bg-foreground/90`}
          >
            <Plus className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-[14px] flex min-h-0 flex-1 gap-5">
        <TodayPanel />
        <WeekGrid />
      </div>
    </div>
  );
}
