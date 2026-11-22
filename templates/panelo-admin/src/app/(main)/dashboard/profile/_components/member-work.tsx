import Link from "next/link";

import { cn } from "cn";
import {
  Bot,
  CircleCheck,
  FileText,
  History,
  KeyRound,
  ListTodo,
  type LucideIcon,
  MessagesSquare,
  ReceiptText,
} from "lucide-react";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";

import type { ActivityKind, Member, WorkStatus } from "./member-data";

const ICON = "size-4 text-muted-foreground";

const STATUS_DOT: Record<WorkStatus, string> = {
  Todo: "bg-muted-foreground/40",
  "In progress": "bg-[var(--tone-primary)]",
  "In review": "bg-warning-solid",
  Done: "bg-success-solid",
};

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  task: CircleCheck,
  chat: MessagesSquare,
  invoice: ReceiptText,
  automation: Bot,
  doc: FileText,
  security: KeyRound,
};

export function MemberStats({ member }: { readonly member: Member }) {
  const cells = [
    { label: "Tasks closed this quarter", value: member.stats ? String(member.stats.tasksClosed) : "—" },
    { label: "Median first response", value: member.stats ? `${member.stats.responseHours}h` : "—" },
    { label: "Active projects", value: member.stats ? String(member.stats.projects) : "—" },
  ];
  return (
    // gap-px over a tinted ground draws hairline dividers that stay correct at every breakpoint.
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border shadow-xs sm:grid-cols-3">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-card p-4">
          <p className="text-muted-foreground text-sm">{cell.label}</p>
          <p className="mt-1.5 font-semibold text-3xl tabular-nums tracking-tight">{cell.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AssignedWork({ member }: { readonly member: Member }) {
  return (
    <section className={cn(PANEL, "flex flex-col gap-3 p-4 sm:p-5")}>
      <PanelHead icon={<ListTodo className={ICON} strokeWidth={1.8} />} title="Assigned work">
        <PanelLink href="/dashboard/kanban" label="Open the board" />
      </PanelHead>
      {member.work.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground text-sm">Nothing assigned right now.</p>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {member.work.map((task) => (
            <li key={task.title}>
              <Link
                href="/dashboard/kanban"
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 rounded-lg px-2 py-2.5 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 sm:grid-cols-[minmax(0,1fr)_7.5rem_4rem]"
              >
                <div className="min-w-0">
                  <p className={cn("truncate text-sm", task.status === "Done" && "text-muted-foreground line-through")}>
                    {task.title}
                  </p>
                  <p className="truncate text-muted-foreground text-xs">{task.project}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs">
                  <span className={cn("size-1.5 rounded-full", STATUS_DOT[task.status])} />
                  {task.status}
                </span>
                <span className="hidden text-right text-muted-foreground text-xs tabular-nums sm:block">
                  {task.due}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function MemberActivity({ member }: { readonly member: Member }) {
  const days = Map.groupBy(member.activity, (event) => event.day);
  return (
    <section className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead icon={<History className={ICON} strokeWidth={1.8} />} title="Recent activity">
        <PanelLink href="/dashboard/activity" label="Open activity log" />
      </PanelHead>
      {member.activity.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground text-sm">No activity yet.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {[...days].map(([day, events]) => (
            <div key={day}>
              <h3 className="mb-2 text-muted-foreground text-xs">{day}</h3>
              <ol className="relative flex flex-col gap-1 before:absolute before:top-4 before:bottom-4 before:left-[15px] before:w-px before:bg-border">
                {events.map((event) => {
                  const Icon = KIND_ICON[event.kind];
                  return (
                    <li key={`${day}-${event.time}`}>
                      <Link
                        href={event.href}
                        className="relative flex items-center gap-3 rounded-lg py-1.5 pr-2 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-card ring-1 ring-border">
                          <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">{event.text}</span>
                        <time className="shrink-0 text-muted-foreground text-xs tabular-nums">{event.time}</time>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
