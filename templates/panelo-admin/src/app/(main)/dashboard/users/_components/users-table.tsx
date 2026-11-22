"use client";

import Link from "next/link";

import { cn } from "cn";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, MoreHorizontal, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInitials } from "@/lib/utils";

import { memberId } from "../../profile/_components/member-data";
import { filters, type UserRow } from "./data";
import { LastActive, MemberAvatar, StatusBadge } from "./users-columns";

export type SortKey = "name" | "role" | "team" | "status" | "lastActive" | "joined";
export type Sort = { key: SortKey; desc: boolean };
export type OptionalColumn = "role" | "team" | "workspace" | "status" | "lastActive" | "joined";

export const OPTIONAL_COLUMNS: { key: OptionalColumn; label: string }[] = [
  { key: "role", label: "Role" },
  { key: "team", label: "Team" },
  { key: "workspace", label: "Workspaces" },
  { key: "status", label: "Status" },
  { key: "lastActive", label: "Last active" },
  { key: "joined", label: "Joined" },
];

const ROLE_CHOICES = filters.role.slice(1);

const CELL = "px-4 py-3 align-middle";

/** The shared Checkbox only draws a tick, so the mixed state swaps it for a dash. */
const MIXED =
  "flex items-center justify-center data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:after:h-0.5 data-[state=indeterminate]:after:w-2 data-[state=indeterminate]:after:rounded-full data-[state=indeterminate]:after:bg-primary-foreground data-[state=indeterminate]:[&_svg]:hidden";

const ariaSort = (sort: Sort) => (sort.desc ? "descending" : "ascending");

function SortableHeader({
  label,
  column,
  sort,
  onSort,
  className,
}: {
  readonly label: string;
  readonly column: SortKey;
  readonly sort: Sort;
  readonly onSort: (key: SortKey) => void;
  readonly className?: string;
}) {
  const active = sort.key === column;
  const direction = sort.desc ? ArrowDown : ArrowUp;
  const Icon = active ? direction : ChevronsUpDown;
  return (
    <th
      scope="col"
      aria-sort={active ? ariaSort(sort) : "none"}
      className={cn("px-4 py-2.5 text-left font-normal", className)}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "-mx-1.5 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-1 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
          active && "text-foreground",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !active && "opacity-50")} aria-hidden="true" />
      </button>
    </th>
  );
}

function Workspaces({ names }: { readonly names: string[] }) {
  const [first, ...rest] = names;
  if (!first) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5" title={names.join(", ")}>
      <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-[11px] text-muted-foreground">
        {getInitials(first)}
      </span>
      <span className="max-w-32 truncate text-sm">{first}</span>
      {rest.length > 0 ? <span className="text-muted-foreground text-xs">+{rest.length}</span> : null}
    </span>
  );
}

function RowActions({
  user,
  onRoleChange,
  onToggleStatus,
}: {
  readonly user: UserRow;
  readonly onRoleChange: (email: string, role: string) => void;
  readonly onToggleStatus: (email: string) => void;
}) {
  const deactivated = user.status === "Deactivated";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-muted-foreground"
          aria-label={`Actions for ${user.name}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/profile?id=${memberId(user)}`}>View profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/chat">Message</Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change role</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            <DropdownMenuRadioGroup value={user.role} onValueChange={(role) => onRoleChange(user.email, role)}>
              {ROLE_CHOICES.map((role) => (
                <DropdownMenuRadioItem key={role} value={role}>
                  {role}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant={deactivated ? "default" : "destructive"} onSelect={() => onToggleStatus(user.email)}>
          {deactivated ? "Reactivate member" : "Deactivate member"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MembersTableProps {
  readonly rows: UserRow[];
  readonly hidden: Set<OptionalColumn>;
  readonly sort: Sort;
  readonly onSort: (key: SortKey) => void;
  readonly selected: Set<string>;
  readonly onToggle: (email: string) => void;
  readonly onTogglePage: (select: boolean) => void;
  readonly onRoleChange: (email: string, role: string) => void;
  readonly onToggleStatus: (email: string) => void;
}

export function MembersTable({
  rows,
  hidden,
  sort,
  onSort,
  selected,
  onToggle,
  onTogglePage,
  onRoleChange,
  onToggleStatus,
}: MembersTableProps) {
  const show = (column: OptionalColumn) => !hidden.has(column);
  const pickedOnPage = rows.filter((user) => selected.has(user.email)).length;
  const pageState = pickedOnPage > 0 && pickedOnPage < rows.length ? "indeterminate" : pickedOnPage > 0;

  return (
    // Its own scroll box: wide tables scroll sideways inside the card and the header sticks while rows scroll.
    <div className="max-h-[36rem] overflow-auto border-t">
      <table className="w-full min-w-[56rem] border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-10 bg-card text-muted-foreground [&_th]:border-b">
          <tr>
            <th scope="col" className="w-10 px-4 py-2.5">
              <Checkbox
                aria-label="Select all members on this page"
                checked={pageState}
                onCheckedChange={() => onTogglePage(pageState !== true)}
                className={MIXED}
              />
            </th>
            <SortableHeader label="Member" column="name" sort={sort} onSort={onSort} />
            {show("role") ? <SortableHeader label="Role" column="role" sort={sort} onSort={onSort} /> : null}
            {show("team") ? <SortableHeader label="Team" column="team" sort={sort} onSort={onSort} /> : null}
            {show("workspace") ? (
              <th scope="col" className="px-4 py-2.5 text-left font-normal">
                Workspaces
              </th>
            ) : null}
            {show("status") ? <SortableHeader label="Status" column="status" sort={sort} onSort={onSort} /> : null}
            {show("lastActive") ? (
              <SortableHeader label="Last active" column="lastActive" sort={sort} onSort={onSort} />
            ) : null}
            {show("joined") ? <SortableHeader label="Joined" column="joined" sort={sort} onSort={onSort} /> : null}
            <th scope="col" className="w-12 px-4 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="[&_td]:border-border/60 [&_td]:border-b">
          {rows.map((user) => {
            const isPicked = selected.has(user.email);
            return (
              <tr
                key={user.email}
                aria-selected={isPicked}
                className={cn("transition-colors hover:bg-muted/40", isPicked && "bg-muted/50")}
              >
                <td className={CELL}>
                  <Checkbox
                    aria-label={`Select ${user.name}`}
                    checked={isPicked}
                    onCheckedChange={() => onToggle(user.email)}
                  />
                </td>
                <td className={CELL}>
                  <div className="flex min-w-0 items-center gap-3">
                    <MemberAvatar name={user.name} />
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/profile?id=${memberId(user)}`}
                        className="block truncate font-medium hover:underline"
                      >
                        {user.name}
                      </Link>
                      <p className="truncate text-muted-foreground text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                {show("role") ? (
                  <td className={CELL}>
                    <Link
                      href="/dashboard/roles"
                      className="whitespace-nowrap rounded-full bg-muted px-2.5 py-1 text-xs transition-colors hover:bg-muted/70"
                    >
                      {user.role}
                    </Link>
                  </td>
                ) : null}
                {show("team") ? <td className={cn(CELL, "whitespace-nowrap")}>{user.team}</td> : null}
                {show("workspace") ? (
                  <td className={CELL}>
                    <Workspaces names={user.workspace} />
                  </td>
                ) : null}
                {show("status") ? (
                  <td className={CELL}>
                    <StatusBadge status={user.status} />
                  </td>
                ) : null}
                {show("lastActive") ? (
                  <td className={CELL}>
                    <LastActive minutes={user.lastActive} />
                  </td>
                ) : null}
                {show("joined") ? (
                  <td className={cn(CELL, "whitespace-nowrap text-muted-foreground")}>
                    {user.joinedDate.split(",")[0]}
                  </td>
                ) : null}
                <td className={cn(CELL, "text-right")}>
                  <RowActions user={user} onRoleChange={onRoleChange} onToggleStatus={onToggleStatus} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function NoMembers({ onReset }: { readonly onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 border-t px-4 py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-5 text-muted-foreground" strokeWidth={1.8} />
      </span>
      <div>
        <p className="font-medium text-sm">Nobody matches these filters</p>
        <p className="mt-1 text-muted-foreground text-sm">Try another search, or reset the filters.</p>
      </div>
      <Button variant="outline" size="sm" className="rounded-full" onClick={onReset}>
        Reset filters
      </Button>
    </div>
  );
}

const PAGE_SIZES = [10, 25, 50];

export function MembersFooter({
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
}: {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly onPage: (page: number) => void;
  readonly onPageSize: (size: number) => void;
}) {
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  const first = total === 0 ? 0 : page * pageSize + 1;
  const last = Math.min((page + 1) * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4">
      <p className="text-muted-foreground text-sm tabular-nums">
        Showing {first}–{last} of {total}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="hidden sm:inline">Per page</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSize(Number(value))}>
            <SelectTrigger size="sm" className="w-18" aria-label="Members per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => onPage(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-16 text-center text-sm tabular-nums">
            {page + 1} / {pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            aria-label="Next page"
            disabled={page >= pages - 1}
            onClick={() => onPage(page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
