import { cn } from "cn";
import { Monitor, Smartphone, Tablet } from "lucide-react";

import { PANEL, PanelHead } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";

import { getDevices, type RangeKey } from "./analytics-data";

const ICONS = { Desktop: Monitor, Mobile: Smartphone, Tablet } as const;
const SWATCH = ["bg-[var(--tone-primary)]", "bg-[var(--tone-secondary)]", "bg-chart-3"];

export function DevicesPanel({ range }: { readonly range: RangeKey }) {
  const devices = getDevices(range);

  return (
    <div className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead icon={<Monitor className="size-4 text-muted-foreground" strokeWidth={1.8} />} title="Devices" />

      <div className="flex h-2.5 gap-1" role="img" aria-label="Visitors by device">
        {devices.map((device, index) => (
          <span
            key={device.name}
            className={cn("rounded-full", SWATCH[index])}
            style={{ width: `${device.share * 100}%` }}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {devices.map((device, index) => {
          const Icon = ICONS[device.name as keyof typeof ICONS];
          return (
            <li key={device.name} className="flex items-center gap-3 text-sm">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4 text-muted-foreground" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1 truncate">{device.name}</span>
              <span className="tabular-nums">{device.visitors.toLocaleString("en-US")}</span>
              <span className="flex w-12 items-center justify-end gap-1.5 font-medium tabular-nums">
                <span className={cn("size-2 rounded-full", SWATCH[index])} />
                {Math.round(device.share * 100)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
