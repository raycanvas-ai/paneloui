"use client";

import * as React from "react";

import { cn } from "cn";
import { ChevronsUpDown, Search, SlidersHorizontal } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { PANEL, PanelLink, PanelMenu } from "./overview-chrome";
import { currency, type Deal, deals, type Risk } from "./overview-data";

type SortKey = "customer" | "plan" | "arr" | "health" | "renewalInDays" | "risk" | "usage" | "expansion" | "owner";

const columns: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "customer", label: "Customers" },
  { key: "plan", label: "Plan" },
  { key: "arr", label: "ARR", align: "right" },
  { key: "health", label: "Health Score" },
  { key: "renewalInDays", label: "Renewal Date" },
  { key: "risk", label: "Payment Risk" },
  { key: "usage", label: "Product Usage" },
  { key: "expansion", label: "Expansion" },
  { key: "owner", label: "Owner" },
];

const RISK_ORDER: Record<Risk, number> = { Low: 0, Medium: 1, High: 2 };

const RISK_DOT: Record<Risk, string> = {
  High: "bg-destructive",
  Medium: "bg-warning-solid",
  Low: "bg-success-solid",
};

function healthDot(health: number) {
  if (health < 60) return "bg-destructive";
  if (health < 75) return "bg-warning-solid";
  return "bg-success-solid";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function value(deal: Deal, key: SortKey) {
  if (key === "risk" || key === "expansion") return RISK_ORDER[deal[key]];
  return deal[key];
}

function toCsv(rows: Deal[]) {
  const head = ["Customer", "Plan", "Region", "ARR", "Health", "Renewal", "Risk", "Usage", "Expansion", "Owner"];
  const body = rows.map((deal) =>
    [
      deal.customer,
      deal.plan,
      deal.region,
      deal.arr,
      deal.health,
      deal.renewal,
      deal.risk,
      deal.usage,
      deal.expansion,
      deal.owner,
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(","),
  );
  return [head.join(","), ...body].join("\n");
}

export function DealsTable({
  plans,
  regions,
  owners,
}: {
  readonly plans: string[];
  readonly regions: string[];
  readonly owners: string[];
}) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: SortKey; desc: boolean }>({ key: "arr", desc: true });
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(["apex"]));
  const [visible, setVisible] = React.useState<SortKey[]>(() => columns.map((column) => column.key));

  const rows = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = deals.filter(
      (deal) =>
        (plans.length === 0 || plans.includes(deal.plan)) &&
        (regions.length === 0 || regions.includes(deal.region)) &&
        (owners.length === 0 || owners.includes(deal.owner)) &&
        (needle === "" ||
          deal.customer.toLowerCase().includes(needle) ||
          deal.owner.toLowerCase().includes(needle) ||
          deal.plan.toLowerCase().includes(needle)),
    );
    return [...filtered].sort((a, b) => {
      const left = value(a, sort.key);
      const right = value(b, sort.key);
      const order =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return sort.desc ? -order : order;
    });
  }, [owners, plans, query, regions, sort]);

  const allSelected = rows.length > 0 && rows.every((deal) => selected.has(deal.id));

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((deal) => deal.id)));

  const toggleRow = (id: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exportCsv = () => {
    const chosen = rows.filter((deal) => selected.size === 0 || selected.has(deal.id));
    const url = URL.createObjectURL(new Blob([toCsv(chosen)], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "top-deals.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const shown = columns.filter((column) => visible.includes(column.key));

  return (
    <div className={cn(PANEL, "p-4 sm:p-5")}>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-semibold text-sm">Top Deals</h2>
        <div className="relative min-w-0 flex-1 sm:max-w-64">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search deal, company..."
            aria-label="Search deals"
            className="h-8 rounded-[10px] pr-9"
          />
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 size-4 text-muted-foreground" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="size-8 rounded-[10px]" aria-label="Toggle columns">
              <SlidersHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visible.includes(column.key)}
                onCheckedChange={(checked) =>
                  setVisible((previous) =>
                    checked ? [...previous, column.key] : previous.filter((key) => key !== column.key),
                  )
                }
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="-mr-1.5 ml-auto flex items-center">
          <PanelMenu links={[{ label: "Open companies", href: "/dashboard/companies" }]}>
            <button
              type="button"
              onClick={exportCsv}
              className="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
            >
              Export CSV
            </button>
          </PanelMenu>
          <PanelLink href="/dashboard/companies" label="Open all deals" />
        </div>
      </div>

      <Table className="mt-4">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all deals" />
            </TableHead>
            {shown.map((column) => (
              <TableHead key={column.key} className={cn("whitespace-nowrap", column.align === "right" && "text-right")}>
                <button
                  type="button"
                  onClick={() =>
                    setSort((previous) => ({
                      key: column.key,
                      desc: previous.key === column.key ? !previous.desc : true,
                    }))
                  }
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 hover:text-foreground",
                    sort.key === column.key && "text-foreground",
                  )}
                >
                  {column.label}
                  <ChevronsUpDown className="size-3.5" />
                </button>
              </TableHead>
            ))}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((deal) => (
            <TableRow key={deal.id} data-state={selected.has(deal.id) ? "selected" : undefined}>
              <TableCell>
                <Checkbox
                  checked={selected.has(deal.id)}
                  onCheckedChange={() => toggleRow(deal.id)}
                  aria-label={`Select ${deal.customer}`}
                />
              </TableCell>
              {shown.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn("whitespace-nowrap", column.align === "right" && "text-right")}
                >
                  {column.key === "customer" ? deal.customer : null}
                  {column.key === "plan" ? <span className="font-semibold">{deal.plan}</span> : null}
                  {column.key === "arr" ? currency(deal.arr) : null}
                  {column.key === "health" ? (
                    <span className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", healthDot(deal.health))} />
                      {deal.health}/100
                    </span>
                  ) : null}
                  {column.key === "renewalInDays" ? (
                    <span className="block leading-5">
                      {deal.renewal}
                      <span className="block text-muted-foreground">({deal.renewalInDays} Days)</span>
                    </span>
                  ) : null}
                  {column.key === "risk" ? (
                    <span className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", RISK_DOT[deal.risk])} />
                      {deal.risk}
                    </span>
                  ) : null}
                  {column.key === "usage" ? (
                    <span className="block leading-5">
                      {deal.usage}%<span className="block text-muted-foreground">Active users</span>
                    </span>
                  ) : null}
                  {column.key === "expansion" ? deal.expansion : null}
                  {column.key === "owner" ? (
                    <span className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">{initials(deal.owner)}</AvatarFallback>
                      </Avatar>
                      {deal.owner}
                    </span>
                  ) : null}
                </TableCell>
              ))}
              <TableCell>
                <PanelMenu
                  links={[
                    { label: "Open company", href: "/dashboard/companies" },
                    { label: "Open invoice", href: "/dashboard/invoice" },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={shown.length + 2} className="h-24 text-center text-muted-foreground">
                No deals match the current filters.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <p className="mt-3 text-muted-foreground text-sm">
        {selected.size} of {rows.length} deals selected
      </p>
    </div>
  );
}
