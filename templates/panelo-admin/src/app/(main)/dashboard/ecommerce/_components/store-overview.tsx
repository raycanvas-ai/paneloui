"use client";

import { useState } from "react";

import Link from "next/link";

import { cn } from "cn";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { BestSellers } from "./best-sellers";
import { ChannelPanel } from "./channel-panel";
import { FunnelPanel } from "./funnel-panel";
import { Inventory } from "./inventory";
import { KpiStrip } from "./kpi-strip";
import { RecentOrders } from "./recent-orders";
import { SalesPanel } from "./sales-panel";
import { RANGES, type RangeKey } from "./store-data";

/** Same accents and canvas as the default overview so the store reads as part of the product. */
const TONE_VARS = "[--tone-primary:var(--primary)] [--tone-secondary:var(--chart-2)]";

const PILL = "h-8 gap-1.5 rounded-full bg-card px-3.5 text-sm shadow-xs hover:bg-card";

export function StoreOverview() {
  const [range, setRange] = useState<RangeKey>("30d");

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col gap-4 overflow-y-auto bg-muted p-4 sm:p-5", TONE_VARS)}
      data-content-padding="false"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
        <div className="pl-10 md:pl-0">
          <h1 className="font-semibold text-2xl tracking-tight">Store</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">
            Sales, conversion, and fulfillment across every channel.
          </p>
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
          <Button asChild variant="ghost" className={PILL}>
            <Link href="/dashboard/orders">Orders</Link>
          </Button>
          <Button asChild className="h-8 rounded-full px-3.5">
            <Link href="/dashboard/products">
              <Plus data-icon="inline-start" />
              Add product
            </Link>
          </Button>
        </div>
      </header>

      <KpiStrip range={range} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SalesPanel range={range} />
        <div className="grid gap-4 md:grid-cols-2 xl:flex xl:flex-col">
          <ChannelPanel range={range} />
          <FunnelPanel range={range} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <RecentOrders />
        <div className="grid gap-4 md:grid-cols-2 xl:flex xl:flex-col">
          <BestSellers />
          <Inventory />
        </div>
      </div>
    </div>
  );
}
