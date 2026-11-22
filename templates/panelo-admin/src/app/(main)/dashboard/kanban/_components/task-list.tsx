"use client";

import { cn } from "cn";

import { COLUMNS, type Status, type Task } from "./board-data";
import { Avatars, DueLabel, PriorityBars, ProjectChip } from "./task-bits";

interface TaskListProps {
  readonly groups: { status: Status; tasks: Task[] }[];
  readonly onOpen: (task: Task) => void;
  readonly onMove: (task: Task, status: Status) => void;
}

export function TaskList({ groups, onOpen, onMove }: TaskListProps) {
  const empty = groups.every((group) => group.tasks.length === 0);

  if (empty) {
    return (
      <div className="grid flex-1 place-items-center rounded-xl bg-card p-10 text-center shadow-xs">
        <p className="text-muted-foreground text-sm">No tasks match these filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups
        .filter((group) => group.tasks.length > 0)
        .map((group) => {
          const column = COLUMNS.find((item) => item.id === group.status) ?? COLUMNS[0];
          return (
            <section
              key={group.status}
              aria-labelledby={`list-${group.status}`}
              className="rounded-xl bg-card shadow-xs"
            >
              <header className="flex items-center gap-2 border-b px-4 py-2.5">
                <span className={cn("size-2 rounded-full", column.dot)} />
                <h2 id={`list-${group.status}`} className="font-medium text-sm">
                  {column.title}
                </h2>
                <span className="text-muted-foreground text-xs tabular-nums">{group.tasks.length}</span>
              </header>
              <ul className="divide-y">
                {group.tasks.map((task) => {
                  const checked = task.checklist.filter((item) => item.done).length;
                  return (
                    <li key={task.id} className="flex items-center gap-3 px-4 py-2.5">
                      <PriorityBars priority={task.priority} className="shrink-0" />
                      <button
                        type="button"
                        onClick={() => onOpen(task)}
                        className={cn(
                          "min-w-0 flex-1 truncate rounded text-left text-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50",
                          group.status === "done" && "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </button>
                      <span className="hidden md:inline-flex">
                        <ProjectChip project={task.project} />
                      </span>
                      {task.checklist.length > 0 ? (
                        <span className="hidden w-10 text-muted-foreground text-xs tabular-nums lg:inline">
                          {checked}/{task.checklist.length}
                        </span>
                      ) : (
                        <span className="hidden w-10 lg:inline" />
                      )}
                      <span className="hidden w-16 text-xs sm:inline">
                        <DueLabel due={task.due} done={group.status === "done"} />
                      </span>
                      <Avatars ids={task.assignees} size="size-6" />
                      <label className="sr-only" htmlFor={`status-${task.id}`}>
                        Status for {task.title}
                      </label>
                      <select
                        id={`status-${task.id}`}
                        value={group.status}
                        onChange={(event) => onMove(task, event.target.value as Status)}
                        className="h-7 shrink-0 cursor-pointer rounded-full bg-muted px-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        {COLUMNS.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
    </div>
  );
}
