import { cn } from "cn";
import { PieChart } from "lucide-react";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";

import { budgets, compact } from "./finance-data";

const spent = budgets.reduce((sum, row) => sum + row.spent, 0);
const planned = budgets.reduce((sum, row) => sum + row.budget, 0);

function barTone(ratio: number) {
  if (ratio > 1) return "bg-destructive";
  if (ratio > 0.95) return "bg-warning-solid";
  return "bg-[var(--tone-primary)]";
}

export function BudgetPanel() {
  const over = budgets.filter((row) => row.spent > row.budget).length;

  return (
    <div className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead icon={<PieChart className="size-4 text-muted-foreground" strokeWidth={1.8} />} title="Spend vs budget">
        <PanelLink href="/dashboard/analytics" label="Open budget report" />
      </PanelHead>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-2xl tabular-nums tracking-tight">
          {compact(spent)} <span className="font-normal text-base text-muted-foreground">of {compact(planned)}</span>
        </p>
        {over > 0 ? (
          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 font-medium text-destructive text-xs">
            {over} over budget
          </span>
        ) : null}
      </div>

      <ul className="flex flex-col gap-3.5">
        {budgets.map((row) => {
          const ratio = row.spent / row.budget;
          const isOver = ratio > 1;
          return (
            <li key={row.category}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{row.category}</span>
                <span className="shrink-0 tabular-nums">
                  <span className={cn("font-medium", isOver && "text-destructive")}>{compact(row.spent)}</span>
                  <span className="text-muted-foreground"> / {compact(row.budget)}</span>
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 rounded-full bg-muted"
                role="img"
                aria-label={`${row.category}: ${compact(row.spent)} of ${compact(row.budget)}`}
              >
                <div
                  className={cn("h-1.5 rounded-full", barTone(ratio))}
                  style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
