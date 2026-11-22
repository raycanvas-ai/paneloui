import Link from "next/link";

import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { memberId } from "../../profile/_components/member-data";
import type { UserRow } from "./data";
import { LastActive, MemberAvatar, StatusBadge } from "./users-columns";

export function UsersGrid({
  rows,
  selected,
  onToggle,
}: {
  readonly rows: UserRow[];
  readonly selected: Set<string>;
  readonly onToggle: (email: string) => void;
}) {
  return (
    <ul className="grid gap-3 border-t px-4 pt-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((user) => {
        const isPicked = selected.has(user.email);
        return (
          <li
            key={user.email}
            className={cn(
              "flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors",
              isPicked && "border-[var(--tone-primary)]/50 bg-muted/40",
            )}
          >
            <div className="flex items-start gap-3">
              <MemberAvatar name={user.name} size="size-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{user.name}</p>
                <p className="truncate text-muted-foreground text-xs">{user.email}</p>
              </div>
              <Checkbox
                aria-label={`Select ${user.name}`}
                checked={isPicked}
                onCheckedChange={() => onToggle(user.email)}
              />
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="truncate text-right">{user.role}</dd>
              <dt className="text-muted-foreground">Team</dt>
              <dd className="truncate text-right">{user.team}</dd>
              <dt className="text-muted-foreground">Seen</dt>
              <dd className="flex justify-end">
                <LastActive minutes={user.lastActive} />
              </dd>
            </dl>

            <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
              <StatusBadge status={user.status} />
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={`/dashboard/profile?id=${memberId(user)}`}>View profile</Link>
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
