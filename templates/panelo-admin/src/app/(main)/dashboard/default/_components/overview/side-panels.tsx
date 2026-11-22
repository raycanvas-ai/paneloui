"use client";

import { cn } from "cn";
import { ReceiptText } from "lucide-react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PANEL, PanelLink, PanelMenu, SeriesPillTooltip, TONE } from "./overview-chrome";
import { activity, atRiskCustomers, currency, planDistribution } from "./overview-data";

const config = {
  revenueShare: { label: "Revenue", theme: TONE.secondary },
  usersShare: { label: "Users", theme: TONE.primary },
} satisfies ChartConfig;

const maxRevenue = Math.max(...planDistribution.map((row) => row.revenue));
const maxUsers = Math.max(...planDistribution.map((row) => row.users));

/** Both series are drawn as a share of their own peak so the plans compare. */
const planChartData = planDistribution.map((row) => ({
  ...row,
  revenueShare: Math.round((row.revenue / maxRevenue) * 100),
  usersShare: Math.round((row.users / maxUsers) * 100),
}));

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export function PlanDistribution() {
  return (
    <Tabs defaultValue="plans" className={cn(PANEL, "gap-0 p-4 sm:p-5")}>
      <div className="flex items-start justify-between gap-2 border-b">
        <TabsList variant="line" className="h-auto gap-6 rounded-none p-0">
          {[
            { value: "plans", label: "Plan Distribution" },
            { value: "risk", label: "At-Risk Customers" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none px-0 pb-2.5 after:bottom-[-1px] data-active:font-medium"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <PanelMenu
          links={[
            { label: "Open companies", href: "/dashboard/companies" },
            { label: "Open reporting", href: "/dashboard/analytics" },
          ]}
        />
      </div>

      <TabsContent value="plans" className="mt-4">
        <div className="flex items-center gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-xs bg-[var(--color-revenueShare)]" />
            Revenue
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-xs bg-[var(--color-usersShare)]" />
            Users
          </span>
        </div>

        <ChartContainer config={config} className="mt-4 aspect-auto h-52 w-full">
          <BarChart data={planChartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap="14%">
            <XAxis dataKey="plan" axisLine={false} tickLine={false} tickMargin={10} />
            <YAxis hide domain={[0, 200]} />
            <ChartTooltip
              cursor={false}
              content={
                <SeriesPillTooltip
                  brandKey="usersShare"
                  format={(slice) =>
                    slice.dataKey === "revenueShare"
                      ? `Revenue: ${currency(Number(slice.payload?.revenue))}`
                      : `Users: ${Number(slice.payload?.users).toLocaleString()}`
                  }
                />
              }
            />
            <Bar
              dataKey="usersShare"
              stackId="plan"
              fill="var(--color-usersShare)"
              radius={[0, 0, 6, 6]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="users"
                position="center"
                className="fill-white text-xs"
                formatter={(value) => Number(value).toLocaleString()}
              />
            </Bar>
            <Bar
              dataKey="revenueShare"
              stackId="plan"
              fill="var(--color-revenueShare)"
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="revenue"
                position="center"
                className="fill-white text-xs"
                formatter={(value) => currency(Number(value))}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
        <p className="mt-1 text-center text-muted-foreground text-xs">
          Each series is shown as a share of its own peak.
        </p>
      </TabsContent>

      <TabsContent value="risk" className="mt-4 space-y-3">
        {atRiskCustomers.map((customer) => (
          <div key={customer.name} className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials(customer.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{customer.name}</p>
              <p className="text-muted-foreground text-xs">{customer.plan}</p>
            </div>
            <div className="w-24 shrink-0">
              <div className="h-1.5 rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-destructive" style={{ width: `${customer.health}%` }} />
              </div>
              <p className="mt-1 text-right text-muted-foreground text-xs">{customer.health}/100</p>
            </div>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}

export function RecentActivity() {
  return (
    <div className={cn(PANEL, "flex min-h-0 flex-1 flex-col p-4 sm:p-5")}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-base tracking-tight">Recent Activity</h2>
        <div className="-mr-1.5 flex items-center">
          <PanelMenu
            links={[
              { label: "Open mail", href: "/dashboard/mail" },
              { label: "Open invoices", href: "/dashboard/invoice" },
            ]}
          />
          <PanelLink href="/dashboard/companies" label="Open activity feed" />
        </div>
      </div>

      <ol className="relative mt-4 space-y-5">
        <span className="absolute top-1.5 bottom-8 left-[3px] w-0.5 bg-border" aria-hidden="true" />
        {activity.map((item) => (
          <li key={item.id} className="relative pl-4">
            <span className="absolute top-1 left-0 size-2 rounded-full bg-[var(--tone-secondary)]" aria-hidden="true" />
            <p className="text-sm leading-none">{item.time}</p>
            <div className="mt-2 flex gap-2">
              {item.who ? (
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px]">{initials(item.who)}</AvatarFallback>
                </Avatar>
              ) : (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                  <ReceiptText className="size-3.5 text-muted-foreground" strokeWidth={1.8} />
                </span>
              )}
              <p className="text-sm leading-5">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
