import { Badge } from "@/components/ui/badge";

const kpis = [
  { label: "Orders", value: "1,284", note: "142 more than last month", change: "+12.4%", positive: true },
  { label: "Net revenue", value: "$96,420", note: "After discounts and refunds", change: "+8.1%", positive: true },
  {
    label: "Average order value",
    value: "$75.09",
    note: "$1.77 lower than last month",
    change: "-2.3%",
    positive: false,
  },
  { label: "Refund rate", value: "1.8%", note: "23 orders refunded", change: "-0.4%", positive: true },
];

export function OrdersKpis() {
  return (
    // gap-px over a tinted ground draws hairline dividers that stay correct at every breakpoint.
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-foreground/10 ring-1 ring-foreground/10 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="flex flex-col gap-5 bg-card p-4">
          <span className="text-sm">{kpi.label}</span>
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-3xl tabular-nums leading-none tracking-tight">{kpi.value}</span>
              <span className="text-muted-foreground text-xs">{kpi.note}</span>
            </div>
            <Badge
              className={
                kpi.positive
                  ? "bg-success/10 text-success tabular-nums"
                  : "bg-destructive/10 text-destructive tabular-nums"
              }
            >
              {kpi.change}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
