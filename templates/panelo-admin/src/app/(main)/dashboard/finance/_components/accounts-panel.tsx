import { cn } from "cn";
import { Percent, Wallet } from "lucide-react";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { formatCurrency } from "@/lib/utils";

import { accounts, cashOnHand, monthlyInterest } from "./finance-data";

const SWATCH = ["bg-[var(--tone-primary)]", "bg-[var(--tone-secondary)]", "bg-chart-3", "bg-chart-5"];

export function AccountsPanel() {
  return (
    <div className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead icon={<Wallet className="size-4 text-muted-foreground" strokeWidth={1.8} />} title="Accounts">
        <PanelLink href="/dashboard/settings/billing" label="Manage accounts" />
      </PanelHead>

      <div className="flex h-2.5 gap-1" role="img" aria-label="Cash split by account">
        {accounts.map((account, index) => (
          <span
            key={account.last4}
            className={cn("rounded-full", SWATCH[index])}
            style={{ width: `${(account.balance / cashOnHand) * 100}%` }}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-3.5">
        {accounts.map((account, index) => (
          <li key={account.last4} className="flex items-center gap-3">
            <span className={cn("size-2.5 shrink-0 rounded-full", SWATCH[index])} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{account.name}</p>
              <p className="truncate text-muted-foreground text-xs">
                {account.bank} ····{account.last4}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm tabular-nums">
                {formatCurrency(account.balance, { noDecimals: true })}
              </p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {account.note ?? `${Math.round((account.balance / cashOnHand) * 100)}% of cash`}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center gap-2.5 rounded-lg bg-success/10 px-3 py-2.5 text-sm text-success">
        <Percent className="size-4 shrink-0" strokeWidth={1.8} />
        <span>
          Treasury earned <span className="font-semibold tabular-nums">{formatCurrency(monthlyInterest)}</span> in
          interest this month
        </span>
      </div>
    </div>
  );
}
