import { cn } from "cn";
import { Signpost } from "lucide-react";

import { PANEL, PanelHead } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";

import { getChannels, type RangeKey } from "./analytics-data";

export function ChannelsPanel({ range }: { readonly range: RangeKey }) {
  const channels = getChannels(range);
  const top = Math.max(...channels.map((channel) => channel.visitors));

  return (
    <div className={cn(PANEL, "flex min-w-0 flex-col gap-3 p-4 sm:p-5")}>
      <PanelHead icon={<Signpost className="size-4 text-muted-foreground" strokeWidth={1.8} />} title="Acquisition" />

      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-left text-muted-foreground text-xs">
              <th scope="col" className="px-1 pb-2 font-normal">
                Channel
              </th>
              <th scope="col" className="px-1 pb-2 text-right font-normal">
                Visitors
              </th>
              <th scope="col" className="px-1 pb-2 text-right font-normal">
                Conversion
              </th>
              <th scope="col" className="px-1 pb-2 text-right font-normal">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {channels.map((channel) => (
              <tr key={channel.name} className="border-t">
                <th scope="row" className="px-1 py-2.5 text-left font-normal">
                  <span className="block truncate">{channel.name}</span>
                  <span className="mt-1.5 block h-1 rounded-full bg-muted">
                    <span
                      className="block h-1 rounded-full bg-[var(--tone-primary)]"
                      style={{ width: `${(channel.visitors / top) * 100}%` }}
                    />
                  </span>
                </th>
                <td className="px-1 py-2.5 text-right tabular-nums">{channel.visitors.toLocaleString("en-US")}</td>
                <td className="px-1 py-2.5 text-right tabular-nums">{channel.conversion}%</td>
                <td
                  className={cn(
                    "px-1 py-2.5 text-right font-medium tabular-nums",
                    channel.change >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {channel.change >= 0 ? "↑" : "↓"}
                  {Math.abs(channel.change)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
