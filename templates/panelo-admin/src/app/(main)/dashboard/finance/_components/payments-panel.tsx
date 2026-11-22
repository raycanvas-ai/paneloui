import { cn } from "cn";
import { format, parseISO } from "date-fns";
import { CalendarClock } from "lucide-react";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { formatCurrency } from "@/lib/utils";

import { compact, upcomingPayments } from "./finance-data";

const total = upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0);

export function PaymentsPanel() {
  return (
    <div className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead
        icon={<CalendarClock className="size-4 text-muted-foreground" strokeWidth={1.8} />}
        title="Upcoming payments"
      >
        <PanelLink href="/dashboard/calendar" label="Open payment calendar" />
      </PanelHead>

      <p className="font-semibold text-2xl tabular-nums tracking-tight">
        {compact(total)} <span className="font-normal text-base text-muted-foreground">due in 30 days</span>
      </p>

      <ol className="flex flex-col gap-3">
        {upcomingPayments.map((payment) => {
          const date = parseISO(payment.due);
          return (
            <li key={payment.payee} className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted leading-none">
                <span className="text-[10px] text-muted-foreground uppercase">{format(date, "MMM")}</span>
                <span className="mt-0.5 font-semibold text-sm tabular-nums">{format(date, "d")}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{payment.payee}</p>
                <p className="truncate text-muted-foreground text-xs">{payment.detail}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-medium text-sm tabular-nums">
                  {formatCurrency(payment.amount, { noDecimals: true })}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[10px]",
                    payment.auto ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
                  )}
                >
                  {payment.auto ? "Auto-pay" : "Needs approval"}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
