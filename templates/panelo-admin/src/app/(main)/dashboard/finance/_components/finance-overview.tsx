"use client";

import { useState } from "react";

import Link from "next/link";

import { cn } from "cn";
import { Download, FilePlus2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AccountsPanel } from "./accounts-panel";
import { BudgetPanel } from "./budget-panel";
import { CashPanel } from "./cash-panel";
import { months, RANGES, type RangeKey } from "./finance-data";
import { PaymentsPanel } from "./payments-panel";
import { PnlPanel } from "./pnl-panel";
import { ReceivablesPanel } from "./receivables-panel";
import { TransactionsPanel } from "./transactions-panel";

/** Same accents and canvas as the default overview so finance reads as part of the product. */
const TONE_VARS = "[--tone-primary:var(--primary)] [--tone-secondary:var(--chart-2)]";

const PILL = "h-8 gap-1.5 rounded-full bg-card px-3.5 text-sm shadow-xs hover:bg-card";

/** Monthly P&L as CSV; built client-side so the export works without a backend. */
function exportCsv() {
  const rows = [
    ["Month", "Revenue", "Expenses", "Net burn"],
    ...months.map((month) => [month.label, month.revenue, month.expenses, month.burn]),
  ];
  const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: "panelo-finance.csv" });
  link.click();
  URL.revokeObjectURL(url);
}

export function FinanceOverview() {
  const [range, setRange] = useState<RangeKey>("12m");

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col gap-4 overflow-y-auto bg-muted p-4 sm:p-5", TONE_VARS)}
      data-content-padding="false"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
        <div className="pl-10 md:pl-0">
          <h1 className="font-semibold text-2xl tracking-tight">Finance</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">Cash, burn, and runway across every account.</p>
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
          <Button variant="ghost" className={PILL} onClick={exportCsv}>
            <Download className="size-4 text-muted-foreground" />
            Export
          </Button>
          <Button asChild className="h-8 rounded-full px-3.5">
            <Link href="/dashboard/invoice">
              <FilePlus2 data-icon="inline-start" />
              Create invoice
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <CashPanel range={range} />
        <AccountsPanel />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PnlPanel range={range} />
        <BudgetPanel />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ReceivablesPanel />
        <PaymentsPanel />
        <TransactionsPanel />
      </div>
    </div>
  );
}
