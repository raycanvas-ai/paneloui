"use client";

import { cn } from "cn";
import { CircleDollarSign, UserMinus, UserPlus } from "lucide-react";
import { Bar, BarChart, Cell, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

import { Delta, MoneyBag, PANEL, PanelHead, PanelLink, PanelMenu, PillTooltip, TONE } from "./overview-chrome";
import { arrSeries, churnRows, mrrSeries, subscriptionSeries } from "./overview-data";

const ICON = "size-4 shrink-0 text-muted-foreground";

const mrrConfig = { mrr: { label: "MRR", theme: TONE.primary } } satisfies ChartConfig;
const arrConfig = {
  arr: { label: "ARR", theme: TONE.primary },
  forecast: { label: "Forecast", theme: TONE.ghost },
} satisfies ChartConfig;
const subsConfig = { subscriptions: { label: "Subscriptions", theme: TONE.primary } } satisfies ChartConfig;
const churnConfig = { value: { label: "Churn", theme: TONE.primary } } satisfies ChartConfig;

const reportLinks = [
  { label: "Open reporting", href: "/dashboard/analytics" },
  { label: "Open finance", href: "/dashboard/finance" },
];

function MonthlyRecurring() {
  return (
    <div className={cn(PANEL, "flex flex-col gap-3 p-4 sm:col-span-2 xl:col-span-1")}>
      <PanelHead icon={<CircleDollarSign className={ICON} strokeWidth={1.8} />} title="Monthly Recurring Revenue MRR">
        <PanelMenu links={reportLinks} />
        <PanelLink href="/dashboard/finance" label="Open MRR breakdown" />
      </PanelHead>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-semibold text-3xl tracking-tight sm:text-4xl">$482,340</span>
        <Delta value={12.4} />
        <span className="text-muted-foreground text-sm">from last month</span>
      </div>

      <ChartContainer config={mrrConfig} className="mt-auto aspect-auto h-24 w-full">
        <BarChart data={mrrSeries} margin={{ top: 4, right: 8, bottom: 0, left: 8 }} barCategoryGap={2}>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={8} interval={5} />
          <ChartTooltip
            cursor={false}
            content={<PillTooltip format={(slice) => `$${Number(slice.value).toLocaleString()}`} />}
          />
          <Bar dataKey="mrr" radius={4} isAnimationActive={false}>
            {mrrSeries.map((point) => (
              <Cell key={point.slot} fill={point.peak ? "var(--color-mrr)" : "var(--muted)"} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function AnnualRecurring() {
  return (
    <div className={cn(PANEL, "flex flex-col gap-3 p-4")}>
      <PanelHead icon={<MoneyBag className={ICON} />} title="Annual Recurring Revenue ARR">
        <PanelLink href="/dashboard/finance" label="Open ARR breakdown" />
      </PanelHead>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-semibold text-2xl tracking-tight">$5.79M</span>
        <Delta value={9.8} suffix="YOY" />
      </div>

      <ChartContainer config={arrConfig} className="mt-auto aspect-auto h-24 w-full">
        <LineChart data={arrSeries} margin={{ top: 8, right: 10, bottom: 0, left: 10 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            interval={0}
            padding={{ left: 6, right: 6 }}
          />
          <YAxis hide domain={["dataMin - 0.6", "dataMax + 0.6"]} />
          <ChartTooltip
            cursor={{ strokeDasharray: "4 4" }}
            content={<PillTooltip format={(slice) => `$${Number(slice.value).toFixed(2)}M`} />}
          />
          <Line
            dataKey="forecast"
            type="monotone"
            stroke="var(--color-forecast)"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 2.5, strokeWidth: 0, fill: "var(--color-forecast)" }}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            dataKey="arr"
            type="monotone"
            stroke="var(--color-arr)"
            strokeWidth={2}
            dot={{ r: 2.5, strokeWidth: 0, fill: "var(--color-arr)" }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

function ActiveSubscriptions() {
  const peak = Math.max(...subscriptionSeries.map((point) => point.subscriptions));
  return (
    <div className={cn(PANEL, "flex flex-col gap-3 p-4")}>
      <PanelHead icon={<UserPlus className={ICON} strokeWidth={1.8} />} title="Active Subscriptions">
        <PanelLink href="/dashboard/users" label="Open subscriptions" />
      </PanelHead>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-semibold text-2xl tracking-tight">8,942</span>
        <Delta value={6.2} />
        <span className="text-muted-foreground text-sm">new subscriptions</span>
      </div>

      <ChartContainer config={subsConfig} className="mt-auto aspect-auto h-24 w-full">
        <BarChart data={subscriptionSeries} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            ticks={["Jan", "Apr", "Jul", "Oct", "Dec"]}
          />
          <ChartTooltip
            cursor={false}
            content={<PillTooltip format={(slice) => Number(slice.value).toLocaleString()} />}
          />
          <Bar dataKey="subscriptions" radius={3} isAnimationActive={false}>
            {subscriptionSeries.map((point) => (
              <Cell
                key={point.month}
                fill={point.subscriptions === peak ? "var(--color-subscriptions)" : "var(--muted)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function ChurnRate() {
  return (
    <div className={cn(PANEL, "flex flex-col gap-3 p-4")}>
      <PanelHead icon={<UserMinus className={ICON} strokeWidth={1.8} />} title="Churn Rate">
        <PanelLink href="/dashboard/analytics" label="Open churn report" />
      </PanelHead>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-semibold text-2xl tracking-tight">2.1%</span>
        <span className="text-muted-foreground text-sm">from</span>
        <span className="font-medium text-sm">2.8%</span>
      </div>

      <ChartContainer config={churnConfig} className="mt-auto aspect-auto h-24 w-full">
        <BarChart data={churnRows} layout="vertical" margin={{ top: 4, right: 44, bottom: 0, left: 0 }}>
          <XAxis type="number" hide domain={[0, 3.5]} />
          <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={72} />
          <ChartTooltip cursor={false} content={<PillTooltip format={(slice) => `${slice.value}%`} />} />
          <Bar dataKey="value" radius={4} barSize={8} isAnimationActive={false}>
            <LabelList
              dataKey="value"
              position="right"
              offset={10}
              className="fill-foreground font-medium text-xs"
              formatter={(value) => `${value}%`}
            />
            {churnRows.map((row, index) => (
              <Cell key={row.label} fill={index === 0 ? "var(--color-value)" : "var(--muted-foreground)"} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[3fr_2fr_2fr_2fr]">
      <MonthlyRecurring />
      <AnnualRecurring />
      <ActiveSubscriptions />
      <ChurnRate />
    </div>
  );
}
