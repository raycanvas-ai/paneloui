"use client";

import { useState } from "react";

import { cn } from "cn";
import { Lock, Search } from "lucide-react";

import { PANEL } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

import type { Role } from "./roles-data";

const FILTERS = [
  { key: "all", label: "All", match: () => true },
  { key: "system", label: "System", match: (role: Role) => role.system },
  { key: "custom", label: "Custom", match: (role: Role) => !role.system },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

interface RoleListProps {
  readonly roles: Role[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
}

export function RoleList({ roles, selectedId, onSelect }: RoleListProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const needle = query.trim().toLowerCase();
  const match = FILTERS.find((item) => item.key === filter)?.match ?? (() => true);
  const visible = roles.filter(
    (role) =>
      match(role) &&
      (needle === "" ||
        role.name.toLowerCase().includes(needle) ||
        role.members.some((member) => member.name.toLowerCase().includes(needle))),
  );

  return (
    <section aria-label="Roles" className={cn(PANEL, "flex flex-col lg:max-h-[calc(100svh-9rem)]")}>
      <div className="flex flex-col gap-3 p-4 pb-3">
        <label className="flex h-9 items-center gap-2 rounded-full bg-muted px-3.5 text-sm focus-within:ring-2 focus-within:ring-ring/50">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Search roles or people</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search roles or people"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="flex items-center rounded-full bg-muted p-0.5" role="tablist" aria-label="Filter roles">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={filter === item.key}
              onClick={() => setFilter(item.key)}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                filter === item.key
                  ? "bg-card font-medium text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              <span className="text-muted-foreground text-xs tabular-nums">{roles.filter(item.match).length}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-3">
        {visible.length === 0 ? (
          <li className="px-3 py-10 text-center text-muted-foreground text-sm">No roles match.</li>
        ) : null}
        {visible.map((role) => {
          const selected = role.id === selectedId;
          return (
            <li key={role.id}>
              <button
                type="button"
                aria-current={selected ? "true" : undefined}
                onClick={() => onSelect(role.id)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                  selected ? "bg-muted" : "hover:bg-muted/60",
                )}
              >
                {selected ? (
                  <span
                    className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full bg-[var(--tone-primary)]"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm">
                    <span className="truncate font-medium">{role.name}</span>
                    {role.system ? (
                      <Lock className="size-3 shrink-0 text-muted-foreground" aria-label="System role" />
                    ) : null}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {role.members.length} {role.members.length === 1 ? "member" : "members"} ·{" "}
                    {role.system ? "System" : "Custom"}
                  </p>
                </div>
                <div className="flex shrink-0 -space-x-2" aria-hidden="true">
                  {role.members.slice(0, 3).map((member) => (
                    <Avatar key={member.email} className="size-7 ring-2 ring-card">
                      <AvatarFallback className="text-[10px]">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
