import { cn } from "cn";
import { Store } from "lucide-react";

import {
  Delta,
  PANEL,
  PanelHead,
  PanelLink,
} from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { formatCurrency } from "@/lib/utils";

import { getChannels, type RangeKey } from "./store-data";

/** Fixed order so each channel keeps its colour across ranges. */
const SWATCH = ["bg-[var(--tone-primary)]", "bg-[var(--tone-secondary)]", "bg-chart-3"];

export function ChannelPanel({ range }: { readonly range: RangeKey }) {
  const channels = getChannels(range);

  return (
    <div className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead icon={<Store className="size-4 text-muted-foreground" strokeWidth={1.8} />} title="Sales by channel">
        <PanelLink href="/dashboard/orders" label="Open orders by channel" />
      </PanelHead>

      <div className="flex h-2.5 gap-1" role="img" aria-label="Share of net sales by channel">
        {channels.map((channel, index) => (
          <span
            key={channel.name}
            className={cn("rounded-full", SWATCH[index])}
            style={{ width: `${channel.share * 100}%` }}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {channels.map((channel, index) => (
          <li key={channel.name} className="flex items-center gap-3 text-sm">
            <span className={cn("size-2.5 shrink-0 rounded-full", SWATCH[index])} />
            <span className="min-w-0 flex-1 truncate">{channel.name}</span>
            <span className="font-medium tabular-nums">{formatCurrency(channel.amount, { noDecimals: true })}</span>
            <span className="w-14 text-right">
              <Delta value={channel.delta} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
