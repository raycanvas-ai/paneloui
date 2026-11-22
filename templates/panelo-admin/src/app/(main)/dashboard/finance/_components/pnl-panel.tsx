"use client";

import { cn } from "cn";
import { ChartColumnBig } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  PANEL,
  PanelHead,
  PanelLink,
  SeriesPillTooltip,
  TONE,
} from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

import { compact, getMonths, percentChange, type RangeKey } from "./finance-data";

const config = {
  revenue: { label: "Revenue", theme: TONE.primary },
  expenses: { label: "Expenses", theme: TONE.ghost },
} satisfies ChartConfig;

export function PnlPanel({ range }: { readonly range: RangeKey }) {
  const data = getMonths(range);
  const first = data[0];
  const last = data[data.length - 1];
  const burnChange = percentChange(last.burn, first.burn);

  return (
    <div className={cn(PANEL, "flex min-w-0 flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead
        icon={<ChartColumnBig className="size-4 text-muted-foreground" strokeWidth={1.8} />}
        title="Revenue vs expenses"
      >
        <PanelLink href="/dashboard/analytics" label="Open reporting" />
      </PanelHead>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-2xl tabular-nums tracking-tight">
            {compact(last.revenue)} <span className="font-normal text-base text-muted-foreground">revenue</span>
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            Burn {burnChange <= 0 ? "down" : "up"}{" "}
            <span className={cn("font-medium", burnChange <= 0 ? "text-success" : "text-destructive")}>
              {Math.abs(burnChange)}%
            </span>{" "}
            since {first.label}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-xs bg-[var(--tone-primary)]" />
            Revenue
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-xs bg-muted-foreground/30" />
            Expenses
          </span>
        </div>
      </div>

      <ChartContainer config={config} className="mt-auto aspect-auto h-56 w-full">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barGap={3} barCategoryGap="22%">
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            tickFormatter={(value: string) => value.split(" ")[0]}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            width={44}
            tickFormatter={(value) => `$${Math.round(value / 1000)}K`}
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={
              <SeriesPillTooltip
                brandKey="revenue"
                format={(slice) =>
                  `${slice.dataKey === "revenue" ? "Revenue" : "Expenses"}: ${compact(Number(slice.value))}`
                }
              />
            }
          />
          <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
