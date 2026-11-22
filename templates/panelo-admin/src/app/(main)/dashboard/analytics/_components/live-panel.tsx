import { cn } from "cn";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";

import { liveMinutes, liveNow, livePages } from "./analytics-data";

const peak = Math.max(...liveMinutes);

export function LivePanel() {
  return (
    <div className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead
        icon={
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="absolute inline-flex size-full rounded-full bg-success-solid opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2.5 rounded-full bg-success-solid" />
          </span>
        }
        title="Live now"
      >
        <PanelLink href="/dashboard/activity" label="Open activity" />
      </PanelHead>

      <div>
        <p className="font-semibold text-4xl tabular-nums tracking-tight">{liveNow}</p>
        <p className="mt-1 text-muted-foreground text-sm">visitors on site right now</p>
      </div>

      <div>
        <div
          className="flex h-16 items-end gap-[3px]"
          role="img"
          aria-label={`Active visitors per minute over the last 30 minutes, peaking at ${peak}`}
        >
          {liveMinutes.map((count, index) => (
            <span
              // Minutes are positional; the array never reorders.
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length time buckets
              key={index}
              className={cn(
                "flex-1 rounded-sm",
                index === liveMinutes.length - 1 ? "bg-[var(--tone-primary)]" : "bg-[var(--tone-primary)]/25",
              )}
              style={{ height: `${(count / peak) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-muted-foreground text-xs">
          <span>30 min ago</span>
          <span>Now</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t pt-4">
        <p className="text-muted-foreground text-xs">Top pages right now</p>
        {livePages.map((page) => (
          <div key={page.path} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-mono text-xs">{page.path}</span>
            <span className="shrink-0 font-medium tabular-nums">{page.visitors}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
