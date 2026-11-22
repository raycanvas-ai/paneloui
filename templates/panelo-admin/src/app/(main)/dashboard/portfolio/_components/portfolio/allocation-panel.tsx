import { cn } from "cn";
import { ArrowUpRight } from "lucide-react";

import { ghostPill, panelHead, ramp } from "./portfolio-chrome";
import { type Allocation, allocations } from "./portfolio-data";

/** Bar order runs largest-first; the tile grid keeps the reference's order. */
const segments = [...allocations].sort((a, b) => b.value - a.value);
const shade = (name: string) => ramp(1 - segments.findIndex((item) => item.name === name) / (segments.length - 1));

function Tile({ item, className }: { readonly item: Allocation; readonly className?: string }) {
  const Icon = item.icon;
  return (
    <div className={cn("flex items-center gap-3 px-4 py-3.5", className)}>
      <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-accent">
        <Icon className="size-[15px] text-foreground/80" strokeWidth={1.6} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="size-[7px] shrink-0 rounded-full" style={{ backgroundColor: shade(item.name) }} />
          <span className="truncate text-[17px]">{item.name}</span>
        </span>
        <span className="mt-1 block truncate text-[16px] text-muted-foreground tabular-nums">
          {item.amount}
          <span className="px-1.5 text-border">|</span>
          {item.pct}%
        </span>
      </span>
    </div>
  );
}

export function AllocationPanel() {
  return (
    <section className="min-w-0" aria-labelledby="portfolio-allocation">
      <div className={panelHead}>
        <h2 id="portfolio-allocation" className="font-semibold text-[20px] tracking-[-0.01em]">
          Portfolio Allocation
        </h2>
        <button type="button" aria-label="Open full allocation breakdown" className={ghostPill}>
          <ArrowUpRight className="size-[18px]" strokeWidth={1.7} />
        </button>
      </div>

      {/* One hue across the whole split — lightness carries the ranking. */}
      <ul className="flex gap-px px-5 pb-[18px]">
        {segments.map((item) => (
          <li
            key={item.name}
            className="h-[34px] rounded-[2px] first:rounded-l-[6px] last:rounded-r-[6px]"
            style={{ flexGrow: item.value, backgroundColor: shade(item.name) }}
          >
            <span className="sr-only">
              {item.name} {item.pct}%
            </span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 border-border border-t">
        {allocations.map((item, i) => (
          <Tile
            key={item.name}
            item={item}
            className={cn("border-border", i % 2 === 1 && "border-l", i < allocations.length - 2 && "border-b")}
          />
        ))}
      </div>
    </section>
  );
}
