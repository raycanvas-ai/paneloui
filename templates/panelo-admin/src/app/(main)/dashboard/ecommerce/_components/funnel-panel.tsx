import { cn } from "cn";
import { Filter } from "lucide-react";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";

import { getFunnel, getSummary, type RangeKey } from "./store-data";

export function FunnelPanel({ range }: { readonly range: RangeKey }) {
  const steps = getFunnel(range);
  const { conversion } = getSummary(range);
  const top = steps[0].value;

  return (
    <div className={cn(PANEL, "flex flex-1 flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead icon={<Filter className="size-4 text-muted-foreground" strokeWidth={1.8} />} title="Conversion funnel">
        <PanelLink href="/dashboard/analytics" label="Open funnel report" />
      </PanelHead>

      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-2xl tabular-nums tracking-tight">{conversion}%</span>
        <span className="text-muted-foreground text-sm">of sessions purchased</span>
      </div>

      <ol className="flex flex-col gap-2.5">
        {steps.map((step, index) => {
          const previous = steps[index - 1]?.value;
          const last = index === steps.length - 1;
          return (
            <li key={step.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{step.label}</span>
                <span className="flex shrink-0 items-baseline gap-2">
                  {previous ? (
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {Math.round((step.value / previous) * 100)}%
                    </span>
                  ) : null}
                  <span className="font-medium tabular-nums">{step.value.toLocaleString()}</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                <div
                  className={cn(
                    "h-1.5 rounded-full",
                    last ? "bg-[var(--tone-primary)]" : "bg-[var(--tone-primary)]/35",
                  )}
                  // Floor keeps the narrowest steps visible as a sliver.
                  style={{ width: `${Math.max((step.value / top) * 100, 1.5)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
