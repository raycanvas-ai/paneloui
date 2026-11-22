"use client";

import { cn } from "cn";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Delta,
  MoneyBag,
  PANEL,
  PanelMenu,
  SeriesPillTooltip,
  TONE,
} from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

import { getSummary, RANGES, type RangeKey, salesSeries } from "./store-data";

const config = {
  current: { label: "This period", theme: TONE.primary },
  previous: { label: "Previous period", theme: TONE.ghost },
} satisfies ChartConfig;

const usd = (value: number) => formatCurrency(value, { noDecimals: true });

export function SalesPanel({ range }: { readonly range: RangeKey }) {
  const data = salesSeries[range];
  const { net, netDelta } = getSummary(range);
  const label = RANGES.find((item) => item.key === range)?.label ?? "";
  const best = data.reduce((top, point) => (point.current > top.current ? point : top), data[0]);

  return (
    <div className={cn(PANEL, "flex min-w-0 flex-col gap-4 p-4 sm:p-5")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MoneyBag className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Net sales</span>
        </div>
        <PanelMenu
          links={[
            { label: "Open orders", href: "/dashboard/orders" },
            { label: "Open reporting", href: "/dashboard/analytics" },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-3xl tabular-nums tracking-tight">{usd(net)}</span>
            <Delta value={netDelta} />
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            Last {label} · best {range === "90d" ? "week" : "day"} {best.label} at {usd(best.current)}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-4 rounded-full bg-[var(--tone-primary)]" />
            This period
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-4 rounded-full bg-muted-foreground/40" />
            Previous
          </span>
        </div>
      </div>

      <ChartContainer config={config} className="mt-auto aspect-auto h-64 w-full sm:h-80">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="store-sales" x1="0" y1="0" x2="0" y2="1">
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
            tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "4 4", stroke: "var(--muted-foreground)" }}
            content={
              <SeriesPillTooltip
                brandKey="current"
                format={(slice) =>
                  `${slice.dataKey === "current" ? String(slice.payload?.label) : "Previous"}: ${usd(Number(slice.value))}`
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
            fill="url(#store-sales)"
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
