import type { ReactNode } from "react";

import { MousePointerClick, ReceiptText, ShoppingBag } from "lucide-react";

import { Delta, MoneyBag } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { formatCurrency } from "@/lib/utils";

import { getSummary, RANGES, type RangeKey } from "./store-data";

const ICON = "size-4 shrink-0 text-muted-foreground";

export function KpiStrip({ range }: { readonly range: RangeKey }) {
  const summary = getSummary(range);
  const days = RANGES.find((item) => item.key === range)?.days ?? 30;

  const cells: { label: string; icon: ReactNode; value: string; delta: number }[] = [
    {
      label: "Net sales",
      icon: <MoneyBag className={ICON} />,
      value: formatCurrency(summary.net, { noDecimals: true }),
      delta: summary.netDelta,
    },
    {
      label: "Orders",
      icon: <ShoppingBag className={ICON} strokeWidth={1.8} />,
      value: summary.orders.toLocaleString(),
      delta: summary.ordersDelta,
    },
    {
      label: "Average order value",
      icon: <ReceiptText className={ICON} strokeWidth={1.8} />,
      value: formatCurrency(summary.aov),
      delta: summary.aovDelta,
    },
    {
      label: "Conversion rate",
      icon: <MousePointerClick className={ICON} strokeWidth={1.8} />,
      value: `${summary.conversion}%`,
      delta: summary.conversionDelta,
    },
  ];

  return (
    // gap-px over a tinted ground draws hairline dividers that stay correct at every breakpoint.
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border shadow-xs sm:grid-cols-2 xl:grid-cols-4">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col gap-3 bg-card p-4">
          <div className="flex items-center gap-2">
            {cell.icon}
            <span className="text-muted-foreground text-sm">{cell.label}</span>
          </div>
          <div>
            <p className="font-semibold text-3xl tabular-nums tracking-tight">{cell.value}</p>
            <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 text-muted-foreground text-xs">
              <Delta value={cell.delta} />
              vs previous {days} days
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
