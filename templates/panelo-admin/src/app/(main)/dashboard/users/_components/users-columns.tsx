import { cn } from "cn";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

import { statusMeta, type UserRow } from "./data";

// Small member visuals shared by the list, the grid and the profile screen.

const TINTS = [
  "bg-chart-1/15 text-chart-1",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

/** A stable tint per name, so the same person keeps one colour on every screen. */
function tintFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

const HOUR = 60;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

function presenceDot(minutes: number) {
  if (minutes < DAY) return "bg-success-solid";
  if (minutes < WEEK) return "bg-warning-solid";
  return "bg-muted-foreground/40";
}

/** `minutes` is time since the member was last seen; Infinity means they never signed in. */
export function describePresence(minutes: number) {
  if (!Number.isFinite(minutes)) return { label: "Never signed in", dot: "bg-muted-foreground/30" };
  if (minutes < 5) return { label: "Online now", dot: "bg-success-solid" };
  const dot = presenceDot(minutes);
  const steps: [limit: number, unit: number, suffix: string][] = [
    [HOUR, 1, "m"],
    [DAY, HOUR, "h"],
    [WEEK, DAY, "d"],
    [5 * WEEK, WEEK, "w"],
  ];
  const step = steps.find(([limit]) => minutes < limit);
  return step
    ? { label: `${Math.round(minutes / step[1])}${step[2]} ago`, dot }
    : { label: `${Math.round(minutes / (30 * DAY))}mo ago`, dot };
}

export function MemberAvatar({ name, size = "size-9" }: { readonly name: string; readonly size?: string }) {
  return (
    <Avatar className={cn("shrink-0", size)}>
      <AvatarFallback className={cn("font-medium text-xs", tintFor(name))}>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}

export function StatusBadge({ status }: { readonly status: UserRow["status"] }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 font-medium text-xs",
        meta.badgeClass,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dotClass)} aria-hidden="true" />
      {status}
    </span>
  );
}

export function LastActive({ minutes }: { readonly minutes: number }) {
  const { label, dot } = describePresence(minutes);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm">
      <span className={cn("size-1.5 shrink-0 rounded-full", dot)} aria-hidden="true" />
      {label}
    </span>
  );
}
