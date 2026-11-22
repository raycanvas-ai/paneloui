"use client";

import { cn } from "cn";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { PANEL, SeriesPillTooltip, TONE } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

import { getSeries, getTotals, METRICS, type MetricKey, RANGES, type RangeKey } from "./analytics-data";

const config = {
  current: { label: "This period", theme: TONE.primary },
  previous: { label: "Previous period", theme: TONE.ghost },
} satisfies ChartConfig;

/** Colour follows whether the move is good news, so a falling bounce rate reads green. */
function Change({ value, lowerIsBetter }: { readonly value: number; readonly lowerIsBetter?: boolean }) {
  const good = lowerIsBetter ? value <= 0 : value >= 0;
  return (
    <span className={cn("font-medium text-xs tabular-nums", good ? "text-success" : "text-destructive")}>
      {value >= 0 ? "↑" : "↓"}
      {Math.abs(value)}%
    </span>
  );
}

export function MetricPanel({
  range,
  metric,
  onMetricChange,
}: {
  readonly range: RangeKey;
  readonly metric: MetricKey;
  readonly onMetricChange: (metric: MetricKey) => void;
}) {
  const totals = getTotals(range);
  const active = METRICS.find((item) => item.key === metric) ?? METRICS[0];
  const days = RANGES.find((item) => item.key === range)?.days ?? 30;
  const data = getSeries(range).map((point) => ({
    label: point.label,
    current: point[metric],
    previous: point.previous[metric],
  }));

  return (
    <div className={cn(PANEL, "flex min-w-0 flex-col overflow-hidden")}>
      <div className="grid grid-cols-2 gap-px border-b bg-border lg:grid-cols-4" role="tablist" aria-label="Metric">
        {METRICS.map((item) => {
          const selected = item.key === metric;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="analytics-metric-chart"
              onClick={() => onMetricChange(item.key)}
              className={cn(
                "relative flex cursor-pointer flex-col items-start gap-1 bg-card px-4 py-3.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
                selected ? "bg-card" : "hover:bg-muted/40",
              )}
            >
              {selected ? (
                <span
                  className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[var(--tone-primary)]"
                  aria-hidden="true"
                />
              ) : null}
              <span className={cn("text-sm", selected ? "text-foreground" : "text-muted-foreground")}>
                {item.label}
              </span>
              <span className="font-semibold text-2xl tabular-nums tracking-tight">
                {item.format(totals.now[item.key])}
              </span>
              <Change value={totals.change[item.key]} lowerIsBetter={item.lowerIsBetter} />
            </button>
          );
        })}
      </div>

      <div id="analytics-metric-chart" role="tabpanel" className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            {active.label} over the last {days} days{range === "90d" ? ", by week" : ""}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-4 rounded-full bg-[var(--tone-primary)]" />
              This period
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0 w-4 border-muted-foreground/60 border-t-2 border-dashed" />
              Previous
            </span>
          </div>
        </div>

        <ChartContainer config={config} className="aspect-auto h-64 w-full sm:h-72">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="analytics-current" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-current)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-current)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={12} minTickGap={28} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={44}
              domain={metric === "bounce" || metric === "engagement" ? ["dataMin - 5", "dataMax + 5"] : [0, "auto"]}
              tickFormatter={active.axis}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "4 4", stroke: "var(--muted-foreground)" }}
              content={
                <SeriesPillTooltip
                  brandKey="current"
                  format={(slice) =>
                    `${slice.dataKey === "current" ? String(slice.payload?.label) : "Previous"}: ${active.format(Number(slice.value))}`
                  }
                />
              }
            />
            <Area
              dataKey="previous"
              type="monotone"
              stroke="var(--color-previous)"
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="none"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Area
              dataKey="current"
              type="monotone"
              stroke="var(--color-current)"
              strokeWidth={2.2}
              fill="url(#analytics-current)"
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
