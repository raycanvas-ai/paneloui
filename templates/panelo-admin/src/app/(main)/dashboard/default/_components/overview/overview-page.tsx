"use client";

import * as React from "react";

import { cn } from "cn";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DealsTable } from "./deals-table";
import { InsightCards } from "./insight-cards";
import { KpiCards } from "./kpi-cards";
import { METRICS, type MetricKey, OWNERS, PLANS, RANGES, type RangeKey, REGIONS } from "./overview-data";
import { RevenuePanel } from "./revenue-panel";
import { PlanDistribution, RecentActivity } from "./side-panels";

/** One place to retune the two accents; both themes are declared up front. */
const TONE_VARS = "[--tone-primary:var(--primary)] [--tone-secondary:var(--chart-2)]";

const PILL = "h-8 gap-1.5 rounded-full bg-card px-3.5 text-sm shadow-xs hover:bg-card";

function toggle(list: string[], item: string) {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
}

function FilterPill({
  label,
  options,
  selected,
  onToggle,
}: {
  readonly label: string;
  readonly options: readonly string[];
  readonly selected: string[];
  readonly onToggle: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={PILL}>
          {selected.length > 0 ? `${label}: ${selected.length}` : label}
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selected.includes(option)}
            onCheckedChange={() => onToggle(option)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OverviewPage() {
  const [range, setRange] = React.useState<RangeKey>("week");
  const [metric, setMetric] = React.useState<MetricKey>("gross");
  const [plans, setPlans] = React.useState<string[]>([]);
  const [regions, setRegions] = React.useState<string[]>([]);
  const [owners, setOwners] = React.useState<string[]>([]);

  const rangeLabel = RANGES.find((item) => item.key === range)?.label ?? "";

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col gap-4 overflow-y-auto bg-muted p-4 sm:p-5", TONE_VARS)}
      data-content-padding="false"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
        <div className="pl-10 md:pl-0">
          <h1 className="font-semibold text-2xl tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">
            Track recurring revenue, customer growth, payment health, and churn performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={PILL}>
                {rangeLabel}
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Date Range</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={range} onValueChange={(value) => setRange(value as RangeKey)}>
                {RANGES.map((item) => (
                  <DropdownMenuRadioItem key={item.key} value={item.key}>
                    {item.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <FilterPill
            label="Company"
            options={OWNERS}
            selected={owners}
            onToggle={(value) => setOwners((previous) => toggle(previous, value))}
          />
          <FilterPill
            label="Region"
            options={REGIONS}
            selected={regions}
            onToggle={(value) => setRegions((previous) => toggle(previous, value))}
          />
          <FilterPill
            label="Plan"
            options={PLANS}
            selected={plans}
            onToggle={(value) => setPlans((previous) => toggle(previous, value))}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={PILL}>
                More
                <SlidersHorizontal className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Revenue metric</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={metric} onValueChange={(value) => setMetric(value as MetricKey)}>
                {METRICS.map((item) => (
                  <DropdownMenuRadioItem key={item.key} value={item.key}>
                    {item.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={plans.length + regions.length + owners.length === 0}
                onCheckedChange={() => {
                  setPlans([]);
                  setRegions([]);
                  setOwners([]);
                }}
              >
                Clear all filters
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <KpiCards />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <RevenuePanel range={range} onRangeChange={setRange} metric={metric} onMetricChange={setMetric} />
          <InsightCards />
        </div>
        <div className="flex flex-col gap-4">
          <PlanDistribution />
          <RecentActivity />
        </div>
      </div>

      <DealsTable plans={plans} regions={regions} owners={owners} />
    </div>
  );
}
