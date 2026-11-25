"use client";

import type { ReactNode } from "react";

import { cn } from "@/components/panelo/lib/utils";

import { Scheduler } from "./scheduler";

/* -------------------------------------------------------------------------- */
/*  calendars/two preview: the studio's week and the staff view (a column per  */
/*  person). Each is live.                                                    */
/* -------------------------------------------------------------------------- */

export { Scheduler } from "./scheduler";
export type { SchedulerProps, View } from "./scheduler";
export {
  customers,
  mondayOf,
  sampleAppointments,
  sampleHistory,
  sampleWaitlist,
  services,
  staff,
  STATUSES,
} from "./data";
export type {
  Appointment,
  Customer,
  HistoryEntry,
  Service,
  Staff,
  Status,
  Tone,
  WaitlistEntry,
} from "./data";

function State({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("flex w-full flex-col gap-3", className)}>
      <figcaption className="ps-1 text-[12.5px] leading-4 font-medium text-muted-foreground">
        {label}
      </figcaption>
      {children}
    </figure>
  );
}

const frame = "overflow-hidden rounded-[18px] bg-card ring-1 ring-border/70";

export default function SchedulerSheet() {
  return (
    <div className="flex min-h-svh flex-col items-center gap-12 bg-muted/40 px-4 py-6 font-sans text-foreground sm:px-6">
      <State
        label="Week: click a free slot to book, or a booking to confirm, edit or cancel it"
        className="max-w-[1300px]"
      >
        <div className={cn(frame, "h-[1054px]")}>
          <Scheduler shortcuts />
        </div>
      </State>
      <State
        label="Staff: a column per person for the day"
        className="max-w-[1300px]"
      >
        <div className={cn(frame, "h-[760px]")}>
          <Scheduler defaultView="staff" />
        </div>
      </State>
    </div>
  );
}
