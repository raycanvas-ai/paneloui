"use client";

import type { ReactNode } from "react";

import { cn } from "cn";
import { Landmark } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import {
  Delta,
  PANEL,
  PanelMenu,
  SeriesPillTooltip,
  TONE,
} from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

import {
  cashOnHand,
  cashZeroDate,
  compact,
  current,
  getCashSeries,
  grossMargin,
  percentChange,
  previous,
  type RangeKey,
  raise,
  runwayMonths,
} from "./finance-data";

const config = {
  cash: { label: "Cash", theme: TONE.primary },
  forecast: { label: "Forecast", theme: TONE.ghost },
} satisfies ChartConfig;

/** Burn falling is good news, so the arrow and colour follow direction, not sign. */
function BurnChange({ value }: { readonly value: number }) {
  return (
    <span className={cn("font-medium text-sm", value <= 0 ? "text-success" : "text-destructive")}>
      {value <= 0 ? "↓" : "↑"}
      {Math.abs(value)}%
    </span>
  );
}

function Stat({
  label,
  value,
  children,
}: {
  readonly label: string;
  readonly value: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-muted/60 px-3.5 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-semibold text-xl tabular-nums tracking-tight">{value}</p>
      <div className="mt-0.5 text-muted-foreground text-xs">{children}</div>
    </div>
  );
}

export function CashPanel({ range }: { readonly range: RangeKey }) {
  const data = getCashSeries(range);
  const start = data.find((point) => point.cash !== null)?.cash ?? cashOnHand;
  const showRaise = data.some((point) => point.label === raise.month);

  return (
    <div className={cn(PANEL, "flex min-w-0 flex-col gap-4 p-4 sm:p-5")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Landmark className="size-4 text-muted-foreground" strokeWidth={1.8} />
          <span className="text-muted-foreground text-sm">Cash on hand</span>
        </div>
        <PanelMenu
          links={[
            { label: "Open invoices", href: "/dashboard/invoice" },
            { label: "Open billing", href: "/dashboard/settings/billing" },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-3xl tabular-nums tracking-tight sm:text-4xl">
              {formatCurrency(cashOnHand, { noDecimals: true })}
            </span>
            <Delta value={percentChange(cashOnHand, start)} />
          </div>
          <p className="mt-1 text-muted-foreground text-sm">Across 4 accounts · since {data[0].label}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-4 rounded-full bg-[var(--tone-primary)]" />
            Balance
          </span>
          <span className="flex items-center gap-2">
            <span className="h-0 w-4 border-muted-foreground/60 border-t-2 border-dashed" />
            Forecast
          </span>
        </div>
      </div>

      <ChartContainer config={config} className="aspect-auto h-60 w-full sm:h-64">
        <AreaChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="finance-cash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-cash)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--color-cash)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={12} minTickGap={24} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            width={48}
            tickFormatter={(value) => `$${(value / 1_000_000).toFixed(1)}M`}
          />
          {showRaise ? (
            <ReferenceLine
              x={raise.month}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
              label={{ value: raise.label, position: "insideTopRight", fill: "var(--muted-foreground)", fontSize: 11 }}
            />
          ) : null}
          <ChartTooltip
            cursor={{ strokeDasharray: "4 4", stroke: "var(--muted-foreground)" }}
            content={
              <SeriesPillTooltip
                brandKey="cash"
                format={(slice) =>
                  `${slice.dataKey === "cash" ? "Balance" : "Forecast"} ${String(slice.payload?.label)}: ${compact(Number(slice.value))}`
                }
              />
            }
          />
          <Area
            dataKey="forecast"
            type="monotone"
            stroke="var(--color-forecast)"
            strokeWidth={2}
            strokeDasharray="5 4"
            fill="none"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Area
            dataKey="cash"
            type="monotone"
            stroke="var(--color-cash)"
            strokeWidth={2.2}
            fill="url(#finance-cash)"
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Stat label="Net burn · this month" value={compact(current.burn)}>
          <BurnChange value={percentChange(current.burn, previous.burn)} /> vs last month
        </Stat>
        <Stat label="Runway" value={`${runwayMonths} months`}>
          Cash lasts until {cashZeroDate}
        </Stat>
        <Stat label="Gross margin" value={`${grossMargin.value}%`}>
          <Delta value={Math.round((grossMargin.value - grossMargin.previous) * 10) / 10} suffix="pts" />
        </Stat>
      </div>
    </div>
  );
}
