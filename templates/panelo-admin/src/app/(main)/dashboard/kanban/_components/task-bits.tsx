import { cn } from "cn";
import { format, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";

import { PEOPLE, PRIORITIES, PROJECTS, type Priority, type ProjectId, TODAY } from "./board-data";

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

/** Signal-strength bars: more filled bars, more urgent. */
export function PriorityBars({ priority, className }: { readonly priority: Priority; readonly className?: string }) {
  const meta = PRIORITIES.find((item) => item.id === priority) ?? PRIORITIES[2];
  return (
    <span
      className={cn("inline-flex h-3 items-end gap-px", meta.tone, className)}
      role="img"
      aria-label={`${meta.label} priority`}
    >
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className={cn("w-[3px] rounded-[1px]", bar <= meta.bars ? "bg-current" : "bg-current opacity-20")}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </span>
  );
}

export function Avatars({ ids, size = "size-6" }: { readonly ids: string[]; readonly size?: string }) {
  if (ids.length === 0) {
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-full border border-dashed text-[10px] text-muted-foreground",
          size,
        )}
        role="img"
        aria-label="Unassigned"
      >
        ?
      </span>
    );
  }
  return (
    <span className="flex shrink-0 -space-x-1.5">
      {ids.map((id) => {
        const person = PEOPLE.find((item) => item.id === id);
        if (!person) return null;
        return (
          <span
            key={id}
            title={person.name}
            className={cn(
              "grid place-items-center rounded-full font-medium text-[10px] ring-2 ring-card",
              size,
              person.tone,
            )}
          >
            {initials(person.name)}
          </span>
        );
      })}
    </span>
  );
}

export function isOverdue(due: string | undefined, done: boolean) {
  return Boolean(due && !done && due < TODAY);
}

export function DueLabel({ due, done }: { readonly due?: string; readonly done: boolean }) {
  if (!due) return null;
  const overdue = isOverdue(due, done);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 tabular-nums",
        overdue ? "text-destructive" : "text-muted-foreground",
      )}
    >
      <CalendarDays className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
      {format(parseISO(due), "MMM d")}
      {overdue ? <span className="sr-only">(overdue)</span> : null}
    </span>
  );
}

export function ProjectChip({ project }: { readonly project: ProjectId }) {
  const meta = PROJECTS.find((item) => item.id === project);
  if (!meta) return null;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
      <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
      <span className="truncate">{meta.short}</span>
    </span>
  );
}
