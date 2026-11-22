import { cn } from "cn";
import { ArrowUpRight } from "lucide-react";

import { SimpleIcon } from "@/components/simple-icon";

import { DOT_DOWN, DOT_UP, ghostPill, panelHead, ramp } from "./portfolio-chrome";
import { SPARK_BARS, sparkline, type WatchlistRow, watchlist } from "./portfolio-data";

const headers = ["Asset", "Price", "Change", "Market Cap", "Volume", "Trends"];

/** Bar sparkline on one hue, exactly as the companies activity column draws it. */
function Sparkline({ id, up }: { readonly id: string; readonly up: boolean }) {
  return (
    <div className="flex h-[22px] items-end gap-px" aria-hidden="true">
      {sparkline(id, up).map((v, i) => (
        <span
          key={i}
          className="w-[6px] rounded-[1px]"
          style={{ height: `${Math.round(v * 22)}px`, backgroundColor: ramp(v, up) }}
        />
      ))}
    </div>
  );
}

function Row({ row }: { readonly row: WatchlistRow }) {
  return (
    <tr
      className={cn(
        "border-border border-b text-[20px] [&>td]:h-[58px] [&>td]:px-[13px] [&>td]:align-middle",
        row.active ? "bg-accent/50" : "hover:bg-accent/40",
      )}
    >
      <td>
        <div className="flex items-center gap-2.5">
          <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-accent">
            <SimpleIcon icon={row.icon} className="size-[13px] fill-foreground/80" />
          </span>
          <span className="min-w-0">
            <span className="block truncate">{row.name}</span>
            <span className="block truncate text-[15px] text-muted-foreground">{row.sector}</span>
          </span>
        </div>
      </td>
      <td className="tabular-nums">{row.price}</td>
      <td>
        {/* Direction reads off the dot, so the figure itself stays neutral. */}
        <span className="flex items-center gap-2 whitespace-nowrap tabular-nums">
          <span className="size-[7px] shrink-0 rounded-full" style={{ backgroundColor: row.up ? DOT_UP : DOT_DOWN }} />
          {row.change}
          <span className="sr-only">{row.up ? "up" : "down"}</span>
        </span>
      </td>
      <td className="tabular-nums">{row.marketCap}</td>
      <td className="tabular-nums">{row.volume}</td>
      <td>
        <Sparkline id={row.id} up={row.up} />
      </td>
    </tr>
  );
}

export function WatchlistPanel() {
  return (
    <section className="min-w-0 border-border border-b xl:border-r xl:border-b-0" aria-labelledby="watchlist">
      <div className={panelHead}>
        <h2 id="watchlist" className="font-semibold text-[20px] tracking-[-0.01em]">
          Watchlist
        </h2>
        <button type="button" aria-label="Open full watchlist" className={ghostPill}>
          <ArrowUpRight className="size-[18px]" strokeWidth={1.7} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="h-[52px] bg-muted/40 text-[17px] text-muted-foreground">
              {headers.map((header) => (
                // `flex` here would drop the cells out of table layout and stack them.
                <th key={header} scope="col" className="h-[52px] px-[13px] text-left font-normal">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {watchlist.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
