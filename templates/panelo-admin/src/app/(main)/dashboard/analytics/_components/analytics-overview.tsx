"use client";

import { useState } from "react";

import { cn } from "cn";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getSeries, METRICS, type MetricKey, RANGES, type RangeKey } from "./analytics-data";
import { ChannelsPanel } from "./channels-panel";
import { DevicesPanel } from "./devices-panel";
import { LivePanel } from "./live-panel";
import { MetricPanel } from "./metric-panel";
import { PagesPanel } from "./pages-panel";
import { RetentionPanel } from "./retention-panel";

/** Same accents and canvas as the default overview so analytics reads as part of the product. */
const TONE_VARS = "[--tone-primary:var(--primary)] [--tone-secondary:var(--chart-2)]";

const PILL = "h-8 gap-1.5 rounded-full bg-card px-3.5 text-sm shadow-xs hover:bg-card";

/** The visible range as CSV, built client-side so export works without a backend. */
function exportCsv(range: RangeKey) {
  const rows = [
    ["Date", ...METRICS.map((metric) => metric.label)],
    ...getSeries(range).map((point) => [`"${point.label}"`, ...METRICS.map((metric) => point[metric.key])]),
  ];
  const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: `panelo-analytics-${range}.csv` }).click();
  URL.revokeObjectURL(url);
}

export function AnalyticsOverview() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [metric, setMetric] = useState<MetricKey>("visitors");

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col gap-4 overflow-y-auto bg-muted p-4 sm:p-5", TONE_VARS)}
      data-content-padding="false"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
        <div className="pl-10 md:pl-0">
          <h1 className="font-semibold text-2xl tracking-tight">Analytics</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">Traffic, engagement, and retention for panelo.dev.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center rounded-full bg-card p-0.5 shadow-xs"
            role="tablist"
            aria-label="Date range"
          >
            {RANGES.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={range === item.key}
                onClick={() => setRange(item.key)}
                className={cn(
                  "cursor-pointer whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors",
                  range === item.key
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" className={PILL} onClick={() => exportCsv(range)}>
            <Download className="size-4 text-muted-foreground" />
            Export
          </Button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <MetricPanel range={range} metric={metric} onMetricChange={setMetric} />
        <LivePanel />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChannelsPanel range={range} />
        <PagesPanel range={range} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <RetentionPanel />
        <DevicesPanel range={range} />
      </div>
    </div>
  );
}
