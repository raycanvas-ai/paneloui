import type { ReactNode } from "react";

import { ChartNoAxesCombined, Rocket, Sparkles, TriangleAlert } from "lucide-react";

import { PanelLink } from "./overview-chrome";

const SHELL = "flex flex-col gap-3 rounded-xl border border-[var(--tone-secondary)]/45 bg-card p-4 shadow-xs";

function Insight({
  icon,
  title,
  lead,
  href,
  children,
}: {
  readonly icon: ReactNode;
  readonly title: string;
  readonly lead: string;
  readonly href: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={SHELL}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        <div className="-mr-1.5">
          <PanelLink href={href} label={`Open ${title}`} />
        </div>
      </div>

      <p className="flex gap-1.5 text-[var(--tone-secondary)] text-sm">
        <Sparkles className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
        {lead}
      </p>

      {children}
    </div>
  );
}

function Stat({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <div className="min-w-0">
      <p className="font-semibold text-xl tracking-tight">{value}</p>
      <p className="mt-1 text-sm">{label}</p>
    </div>
  );
}

const ICON = "size-[18px] shrink-0";

export function InsightCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Insight
        icon={<Rocket className={ICON} strokeWidth={1.8} />}
        title="Growth Opportunity"
        lead="Enterprise upgrade opportunity detected"
        href="/dashboard/companies"
      >
        <div className="mt-auto grid grid-cols-2 gap-4">
          <Stat value="42" label="Accounts reached" />
          <Stat value="90%" label="API quota" />
        </div>
      </Insight>

      <Insight
        icon={<ChartNoAxesCombined className={ICON} strokeWidth={1.8} />}
        title="Revenue Forecast"
        lead="Projected MRR next month"
        href="/dashboard/analytics"
      >
        <div className="mt-auto grid grid-cols-2 gap-4">
          <Stat value="$548,000" label="predicted" />
          <Stat value="14.2%" label="growth forecast" />
        </div>
      </Insight>

      <Insight
        icon={<TriangleAlert className={ICON} strokeWidth={1.8} />}
        title="Risk Alert"
        lead="Renewal risk detected"
        href="/dashboard/companies"
      >
        <p className="mt-auto text-sm leading-7">
          <span className="font-semibold text-2xl tracking-tight">12</span> enterprise accounts renew within 14 days
          with declining activity
        </p>
      </Insight>
    </div>
  );
}
