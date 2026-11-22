import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { NotifyForm } from "./_components/notify-form";

const PANEL = "rounded-xl bg-card shadow-xs";
const BAR = "rounded-full bg-muted";

/** Bar heights for the ghost chart, as a share of the panel. */
const bars = [38, 52, 44, 66, 58, 74, 49, 81, 63, 70, 88, 76];

/** A faded sketch of the screen to come, in the same canvas as the default overview. */
function GhostDashboard() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none flex flex-col gap-4 opacity-70 [mask-image:linear-gradient(to_bottom,black_10%,transparent_85%)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className={`${BAR} h-5 w-40`} />
          <div className={`${BAR} h-3 w-64`} />
        </div>
        <div className="hidden gap-2 sm:flex">
          <div className={`${PANEL} h-8 w-24`} />
          <div className={`${PANEL} h-8 w-20`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {["w-24", "w-20", "w-28", "w-16"].map((width) => (
          <div key={width} className={`${PANEL} flex flex-col gap-3 p-4`}>
            <div className={`${BAR} h-3 ${width}`} />
            <div className={`${BAR} h-6 w-20`} />
            <div className="mt-2 flex h-10 items-end gap-1">
              {bars.slice(0, 8).map((height, index) => (
                <div key={index} className="flex-1 rounded-sm bg-muted" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className={`${PANEL} flex flex-col gap-4 p-5`}>
          <div className={`${BAR} h-3 w-28`} />
          <div className="flex h-56 items-end gap-2">
            {bars.map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-md bg-primary/15 last:bg-primary/40"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
        <div className={`${PANEL} hidden flex-col gap-4 p-5 xl:flex`}>
          <div className={`${BAR} h-3 w-24`} />
          {["w-3/4", "w-2/3", "w-4/5", "w-1/2", "w-3/5"].map((width) => (
            <div key={width} className="flex items-center gap-3">
              <div className="size-8 shrink-0 rounded-full bg-muted" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className={`${BAR} h-2.5 ${width}`} />
                <div className={`${BAR} h-2 w-1/3`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-muted p-4 sm:p-5" data-content-padding="false">
      <GhostDashboard />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="animate-stage stage-0 flex w-full max-w-md flex-col gap-6 rounded-2xl bg-card p-6 shadow-lg ring-1 ring-foreground/5 sm:p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-primary text-sm">Coming soon</p>
              <h1 className="text-balance font-semibold text-2xl leading-tight tracking-tight">
                This page is on its way
              </h1>
              <p className="text-muted-foreground text-sm">
                We&apos;re putting the finishing touches on it. Leave your email and we&apos;ll let you know the moment
                it&apos;s live.
              </p>
            </div>
          </div>

          <NotifyForm />

          <Button variant="ghost" asChild className="-ml-2.5 self-start text-muted-foreground">
            <Link prefetch={false} href="/dashboard/default">
              <ArrowLeft data-icon="inline-start" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
