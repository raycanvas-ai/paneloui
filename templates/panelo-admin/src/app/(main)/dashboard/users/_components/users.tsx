"use client";

import { useMemo, useState } from "react";

import { cn } from "cn";
import { parse } from "date-fns";
import { Columns3, Download, LayoutGrid, Rows3, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

import { filters, type UserRow } from "./data";
import { InviteUserDialog } from "./invite-user-dialog";
import { UsersGrid } from "./users-grid";
import { UsersStats } from "./users-stats";
import {
  MembersFooter,
  MembersTable,
  NoMembers,
  OPTIONAL_COLUMNS,
  type OptionalColumn,
  type Sort,
  type SortKey,
} from "./users-table";

/** Same two accents as the overview screen, so the shell reads as one system. */
const TONE_VARS = "[--tone-primary:var(--primary)] [--tone-secondary:var(--chart-2)]";

type Facet = "role" | "team" | "workspace";
const FACETS: { key: Facet; label: string; options: string[] }[] = [
  { key: "role", label: "Role", options: filters.role },
  { key: "team", label: "Team", options: filters.team },
  { key: "workspace", label: "Workspace", options: filters.workspace },
];
const ANY = "All";

const joinedAt = (user: UserRow) => parse(user.joinedDate, "dd MMM yyyy, h:mm a", new Date()).getTime();

function compare(a: UserRow, b: UserRow, key: SortKey) {
  if (key === "lastActive") return a.lastActive - b.lastActive || 0;
  if (key === "joined") return joinedAt(a) - joinedAt(b);
  return a[key].localeCompare(b[key]);
}

function saveCsv(rows: UserRow[], filename: string) {
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const lines = [
    "Name,Email,Role,Team,Workspaces,Status,Joined",
    ...rows.map((user) =>
      [user.name, user.email, user.role, user.team, user.workspace.join(" / "), user.status, user.joinedDate]
        .map(quote)
        .join(","),
    ),
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}

export function Users({ initialRoster }: { readonly initialRoster: UserRow[] }) {
  const [roster, setRoster] = useState(initialRoster);
  const [view, setView] = useState<"list" | "grid">("list");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(ANY);
  const [facets, setFacets] = useState<Record<Facet, string>>({ role: ANY, team: ANY, workspace: ANY });
  const [sort, setSort] = useState<Sort>({ key: "joined", desc: true });
  const [hidden, setHidden] = useState<Set<OptionalColumn>>(() => new Set(["team"]));
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Everything except the status tab, so each tab's count reflects the other filters.
  const scoped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return roster.filter(
      (user) =>
        (facets.role === ANY || user.role === facets.role) &&
        (facets.team === ANY || user.team === facets.team) &&
        (facets.workspace === ANY || user.workspace.includes(facets.workspace)) &&
        (!needle || `${user.name} ${user.email}`.toLowerCase().includes(needle)),
    );
  }, [roster, query, facets]);

  const matches = useMemo(() => {
    const rows = status === ANY ? scoped : scoped.filter((user) => user.status === status);
    const direction = sort.desc ? -1 : 1;
    return [...rows].sort((a, b) => compare(a, b, sort.key) * direction);
  }, [scoped, status, sort]);

  const lastPage = Math.max(Math.ceil(matches.length / pageSize) - 1, 0);
  const current = Math.min(page, lastPage);
  const pageRows = matches.slice(current * pageSize, (current + 1) * pageSize);
  const picked = roster.filter((user) => selected.has(user.email));

  const refilter = () => setPage(0);
  const setFacet = (key: Facet, value: string) => {
    setFacets((previous) => ({ ...previous, [key]: value }));
    refilter();
  };
  const resetFilters = () => {
    setQuery("");
    setStatus(ANY);
    setFacets({ role: ANY, team: ANY, workspace: ANY });
    refilter();
  };

  const toggleSort = (key: SortKey) =>
    setSort((previous) => ({ key, desc: previous.key === key ? !previous.desc : key === "joined" }));

  const toggleOne = (email: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (!next.delete(email)) next.add(email);
      return next;
    });

  const togglePage = (select: boolean) =>
    setSelected((previous) => {
      const next = new Set(previous);
      for (const user of pageRows) {
        if (select) next.add(user.email);
        else next.delete(user.email);
      }
      return next;
    });

  const update = (emails: Set<string>, change: Partial<UserRow>) =>
    setRoster((previous) => previous.map((user) => (emails.has(user.email) ? { ...user, ...change } : user)));

  const changeRole = (email: string, role: string) => {
    update(new Set([email]), { role });
    toast.success(`${roster.find((user) => user.email === email)?.name ?? "Member"} is now ${role}`);
  };

  const toggleStatus = (email: string) => {
    const user = roster.find((member) => member.email === email);
    if (!user) return;
    const next = user.status === "Deactivated" ? "Active" : "Deactivated";
    update(new Set([email]), { status: next });
    toast.success(`${user.name} ${next === "Active" ? "reactivated" : "deactivated"}`);
  };

  const bulkRole = (role: string) => {
    update(selected, { role });
    toast.success(`${selected.size} members moved to ${role}`);
    setSelected(new Set());
  };

  const bulkDeactivate = () => {
    update(selected, { status: "Deactivated" });
    toast.success(`${selected.size} members deactivated`);
    setSelected(new Set());
  };

  function renderMembers() {
    if (pageRows.length === 0) return <NoMembers onReset={resetFilters} />;
    if (view === "grid") return <UsersGrid rows={pageRows} selected={selected} onToggle={toggleOne} />;
    return (
      <MembersTable
        rows={pageRows}
        hidden={hidden}
        sort={sort}
        onSort={toggleSort}
        selected={selected}
        onToggle={toggleOne}
        onTogglePage={togglePage}
        onRoleChange={changeRole}
        onToggleStatus={toggleStatus}
      />
    );
  }

  const chips = [
    query ? { label: `“${query}”`, clear: () => setQuery("") } : null,
    ...FACETS.filter((facet) => facets[facet.key] !== ANY).map((facet) => ({
      label: `${facet.label}: ${facets[facet.key]}`,
      clear: () => setFacet(facet.key, ANY),
    })),
  ].filter((chip) => chip !== null);

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col gap-4 overflow-y-auto bg-muted p-4 sm:p-5", TONE_VARS)}
      data-content-padding="false"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
        <div className="pl-10 md:pl-0">
          <h1 className="font-semibold text-2xl tracking-tight">Team</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">
            Everyone in the organisation, their roles and the workspaces they can reach.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-1.5 rounded-full bg-card px-3.5 shadow-xs hover:bg-card">
                <Download className="size-4 text-muted-foreground" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => saveCsv(matches, "team-filtered.csv")}>
                {matches.length} matching members
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => saveCsv(roster, "team-all.csv")}>
                All {roster.length} members
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <InviteUserDialog
            taken={roster.map((user) => user.email)}
            onInvite={(user) => setRoster((previous) => [user, ...previous])}
          />
        </div>
      </header>

      <UsersStats users={roster} />

      <section aria-label="Members" className="flex flex-col gap-4 rounded-xl bg-card py-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div
            className="flex max-w-full items-center overflow-x-auto rounded-full bg-muted p-0.5"
            role="tablist"
            aria-label="Filter by status"
          >
            {filters.status.map((option) => {
              const count = option === ANY ? scoped.length : scoped.filter((user) => user.status === option).length;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={status === option}
                  onClick={() => {
                    setStatus(option);
                    refilter();
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors",
                    status === option
                      ? "bg-card font-medium text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option === ANY ? "Everyone" : option}
                  <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex h-8 w-full items-center gap-2 rounded-full bg-muted px-3 text-sm focus-within:ring-2 focus-within:ring-ring/50 sm:w-60">
              <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Search members</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  refilter();
                }}
                placeholder="Search name or email"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-8 rounded-full" aria-label="Choose columns">
                  <Columns3 className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                {OPTIONAL_COLUMNS.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={!hidden.has(column.key)}
                    onCheckedChange={(checked) =>
                      setHidden((previous) => {
                        const next = new Set(previous);
                        if (checked) next.delete(column.key);
                        else next.add(column.key);
                        return next;
                      })
                    }
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <fieldset className="flex items-center rounded-full bg-muted p-0.5">
              <legend className="sr-only">Layout</legend>
              {(
                [
                  { key: "list", icon: Rows3, label: "List view" },
                  { key: "grid", icon: LayoutGrid, label: "Grid view" },
                ] as const
              ).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={view === option.key}
                  onClick={() => setView(option.key)}
                  className={cn(
                    "flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors",
                    view === option.key
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <option.icon className="size-4" />
                </button>
              ))}
            </fieldset>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4">
          {FACETS.map((facet) => (
            <Select key={facet.key} value={facets[facet.key]} onValueChange={(value) => setFacet(facet.key, value)}>
              <SelectTrigger size="sm" className="rounded-full" aria-label={`Filter by ${facet.label.toLowerCase()}`}>
                <span className="text-muted-foreground">{facet.label}:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                {facet.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                chip.clear();
                refilter();
              }}
              aria-label={`Remove filter ${chip.label}`}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs hover:text-foreground"
            >
              {chip.label}
              <X className="size-3" aria-hidden="true" />
            </button>
          ))}
          {chips.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          ) : null}
        </div>

        {picked.length > 0 ? (
          <div className="mx-4 flex flex-wrap items-center gap-2 rounded-lg bg-[var(--tone-primary)]/8 px-3 py-2 ring-1 ring-[var(--tone-primary)]/25">
            <span className="font-medium text-sm tabular-nums">{picked.length} selected</span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Change role
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {filters.role.slice(1).map((role) => (
                    <DropdownMenuItem key={role} onSelect={() => bulkRole(role)}>
                      {role}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => saveCsv(picked, "team-selection.csv")}
              >
                Export
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={bulkDeactivate}>
                Deactivate
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        ) : null}

        {renderMembers()}

        <MembersFooter
          page={current}
          pageSize={pageSize}
          total={matches.length}
          onPage={setPage}
          onPageSize={(size) => {
            setPageSize(size);
            refilter();
          }}
        />
      </section>
    </div>
  );
}
