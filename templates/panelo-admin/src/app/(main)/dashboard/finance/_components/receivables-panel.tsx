import Link from "next/link";

import { cn } from "cn";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { FileClock } from "lucide-react";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { formatCurrency } from "@/lib/utils";

import { AS_OF, aging, compact, receivables } from "./finance-data";

const outstanding = aging.reduce((sum, bucket) => sum + bucket.amount, 0);

function dueLabel(due: string) {
  const days = differenceInCalendarDays(AS_OF, parseISO(due));
  if (days <= 0) return { text: `Due ${format(parseISO(due), "MMM d")}`, tone: "text-muted-foreground" };
  return { text: `${days} days overdue`, tone: days > 60 ? "text-destructive" : "text-warning" };
}

export function ReceivablesPanel() {
  return (
    <div className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead icon={<FileClock className="size-4 text-muted-foreground" strokeWidth={1.8} />} title="Receivables">
        <PanelLink href="/dashboard/invoice" label="Open invoices" />
      </PanelHead>

      <div>
        <p className="font-semibold text-2xl tabular-nums tracking-tight">
          {compact(outstanding)} <span className="font-normal text-base text-muted-foreground">outstanding</span>
        </p>
        <div className="mt-3 flex h-2 gap-1" role="img" aria-label="Outstanding invoices by age">
          {aging.map((bucket) => (
            <span
              key={bucket.label}
              className={cn("rounded-full", bucket.tone)}
              style={{ width: `${(bucket.amount / outstanding) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {aging.map((bucket) => (
            <span key={bucket.label} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", bucket.tone)} />
              <span className="text-muted-foreground">{bucket.label}</span>
              <span className="ml-auto font-medium tabular-nums">{compact(bucket.amount)}</span>
            </span>
          ))}
        </div>
      </div>

      <ul className="-mx-2 flex flex-col border-t pt-2">
        {receivables.map((invoice) => {
          const due = dueLabel(invoice.due);
          return (
            <li key={invoice.number}>
              <Link
                href="/dashboard/invoice"
                className="flex items-center gap-3 rounded-lg px-2 py-2 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{invoice.client}</p>
                  <p className="truncate text-xs">
                    <span className="text-muted-foreground">{invoice.number} · </span>
                    <span className={due.tone}>{due.text}</span>
                  </p>
                </div>
                <span className="font-medium text-sm tabular-nums">
                  {formatCurrency(invoice.amount, { noDecimals: true })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
