import { cn } from "cn";
import { format, parseISO } from "date-fns";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { formatCurrency } from "@/lib/utils";

import { transactions } from "./finance-data";

export function TransactionsPanel() {
  return (
    <div className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead
        icon={<ArrowLeftRight className="size-4 text-muted-foreground" strokeWidth={1.8} />}
        title="Recent transactions"
      >
        <PanelLink href="/dashboard/activity" label="Open all transactions" />
      </PanelHead>

      <ul className="flex flex-col gap-3.5">
        {transactions.map((item) => {
          const incoming = item.amount > 0;
          const Icon = incoming ? ArrowDownLeft : ArrowUpRight;
          return (
            <li key={`${item.name}-${item.date}`} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  incoming ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" strokeWidth={1.8} aria-label={incoming ? "Money in" : "Money out"} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{item.name}</p>
                <p className="truncate text-muted-foreground text-xs">
                  {item.category} · {format(parseISO(item.date), "MMM d")}
                </p>
              </div>
              <span className={cn("font-medium text-sm tabular-nums", incoming && "text-success")}>
                {incoming ? "+" : "−"}
                {formatCurrency(Math.abs(item.amount), { noDecimals: true })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
