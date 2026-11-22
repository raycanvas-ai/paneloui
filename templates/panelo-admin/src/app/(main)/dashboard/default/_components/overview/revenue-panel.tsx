"use client";

import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Delta, MoneyBag, PANEL, PanelMenu, SeriesPillTooltip, TONE } from "./overview-chrome";
import { METRICS, type MetricKey, RANGES, type RangeKey, revenueHeadline, revenueSeries } from "./overview-data";

const config = {
  current: { label: "This month", theme: TONE.primary },
  previous: { label: "Last month", theme: TONE.ghost },
} satisfies ChartConfig;

export function RevenuePanel({
  range,
  onRangeChange,
  metric,
  onMetricChange,
}: {
  readonly range: RangeKey;
  readonly onRangeChange: (range: RangeKey) => void;
  readonly metric: MetricKey;
  readonly onMetricChange: (metric: MetricKey) => void;
}) {
  const data = revenueSeries[range];
  const headline = revenueHeadline[range][metric];
  const metricLabel = METRICS.find((item) => item.key === metric)?.label ?? "";

  return (
    <div className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MoneyBag className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Revenue</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full bg-muted p-0.5" role="tablist" aria-label="Revenue range">
            {RANGES.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={range === item.key}
                onClick={() => onRangeChange(item.key)}
                className={cn(
                  "cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors",
                  range === item.key
                    ? "bg-card font-medium text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-1.5 rounded-full bg-muted px-3.5 text-sm hover:bg-muted">
                {metricLabel}
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={metric} onValueChange={(value) => onMetricChange(value as MetricKey)}>
                {METRICS.map((item) => (
                  <DropdownMenuRadioItem key={item.key} value={item.key}>
                    {item.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <PanelMenu
            links={[
              { label: "Open reporting", href: "/dashboard/analytics" },
              { label: "Open invoices", href: "/dashboard/invoice" },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-2xl tracking-tight sm:text-3xl">{headline.total}</span>
            <Delta value={headline.delta} />
          </div>
          <p className="mt-1 text-muted-foreground text-sm">On track to hit monthly target</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-4 rounded-full bg-[var(--tone-primary)]" />
            This month
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-4 rounded-full bg-muted-foreground/40" />
            Last month
          </span>
        </div>
      </div>

      <ChartContainer config={config} className="aspect-auto h-56 w-full sm:h-72">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenue-current" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-current)" stopOpacity={0.18} />
              <stop offset="90%" stopColor="var(--color-current)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={12} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            width={44}
            tickFormatter={(value) => `${value}M`}
            domain={[0, 12]}
            ticks={[0, 3, 6, 9, 12]}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "4 4", stroke: "var(--muted-foreground)" }}
            content={
              <SeriesPillTooltip
                brandKey="current"
                format={(slice) => `${slice.dataKey === "current" ? "Revenue" : "Last Month"}: $${slice.value}M`}
              />
            }
          />
          <Area
            dataKey="previous"
            type="monotone"
            stroke="var(--color-previous)"
            strokeWidth={2}
            fill="none"
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
          <Area
            dataKey="current"
            type="monotone"
            stroke="var(--color-current)"
            strokeWidth={2.2}
            fill="url(#revenue-current)"
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
