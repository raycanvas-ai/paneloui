import { cn } from "cn";
import { CreditCard, Mail, UserCheck, Users as UsersIcon } from "lucide-react";

import type { UserRow } from "./data";

/** Seats on the plan — the only number here that isn't derived from the roster. */
const SEATS = 50;

const TILE = "flex flex-col gap-3 rounded-xl bg-card p-4 shadow-xs";

function Tile({
  icon,
  label,
  value,
  foot,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
  readonly foot: React.ReactNode;
}) {
  return (
    <div className={TILE}>
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="font-semibold text-2xl tabular-nums tracking-tight">{value}</p>
      <div className="mt-auto text-muted-foreground text-sm">{foot}</div>
    </div>
  );
}

const ICON = "size-4 shrink-0";

export function UsersStats({ users }: { readonly users: UserRow[] }) {
  const active = users.filter((user) => user.status === "Active").length;
  const pending = users.filter((user) => user.status === "Pending invite").length;
  const teams = new Set(users.map((user) => user.team)).size;
  const activeShare = users.length === 0 ? 0 : Math.round((active / users.length) * 100);
  const seatShare = Math.min(Math.round((users.length / SEATS) * 100), 100);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Tile
        icon={<UsersIcon className={ICON} strokeWidth={1.8} />}
        label="Total members"
        value={String(users.length)}
        foot={`Across ${teams} teams`}
      />
      <Tile
        icon={<UserCheck className={ICON} strokeWidth={1.8} />}
        label="Active"
        value={String(active)}
        foot={`${activeShare}% of the roster`}
      />
      <Tile
        icon={<Mail className={ICON} strokeWidth={1.8} />}
        label="Pending invites"
        value={String(pending)}
        foot={pending === 0 ? "Nothing awaiting acceptance" : "Awaiting acceptance"}
      />
      <Tile
        icon={<CreditCard className={ICON} strokeWidth={1.8} />}
        label="Seats used"
        value={`${users.length} / ${SEATS}`}
        foot={
          <div className="flex items-center gap-3">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className={cn(
                  "block h-full rounded-full",
                  seatShare > 90 ? "bg-destructive" : "bg-[var(--tone-primary)]",
                )}
                style={{ width: `${seatShare}%` }}
              />
            </span>
            <span className="tabular-nums">{seatShare}%</span>
          </div>
        }
      />
    </div>
  );
}
