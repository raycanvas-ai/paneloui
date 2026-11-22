"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "cn";
import { ListChecks, MessageSquare } from "lucide-react";

import type { Status, Task } from "./board-data";
import { Avatars, DueLabel, PriorityBars, ProjectChip } from "./task-bits";

interface TaskTileProps {
  readonly task: Task;
  readonly status: Status;
  readonly index: number;
  readonly onOpen: (task: Task) => void;
}

export function TaskTile({ task, status, index, onOpen }: TaskTileProps) {
  const { ref, isDragging } = useSortable({ id: task.id, index, group: status, type: "task", accept: "task" });
  const done = status === "done";
  const checked = task.checklist.filter((item) => item.done).length;

  return (
    // Space picks the card up and Enter opens it. A native <button> would also fire a click on the
    // Space key-up that ends a keyboard drop, so this stays a div with button semantics.
    // biome-ignore lint/a11y/useSemanticElements: see above.
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`${task.title}. Press Enter to open, Space to move.`}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen(task);
      }}
      className={cn(
        "group flex cursor-grab touch-none select-none flex-col gap-2.5 rounded-lg bg-card p-3 text-left shadow-xs outline-none ring-1 ring-foreground/5 transition-[box-shadow,opacity] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring/60 active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <ProjectChip project={task.project} />
        <PriorityBars priority={task.priority} />
      </div>

      <p
        className={cn(
          "line-clamp-2 text-sm leading-5",
          done && "text-muted-foreground line-through decoration-muted-foreground/50",
        )}
      >
        {task.title}
      </p>

      {task.checklist.length > 0 ? (
        <div
          className="flex items-center gap-2"
          role="img"
          aria-label={`${checked} of ${task.checklist.length} subtasks done`}
        >
          <div className="h-1 flex-1 rounded-full bg-muted">
            <div
              className={cn(
                "h-1 rounded-full",
                checked === task.checklist.length ? "bg-success-solid" : "bg-[var(--tone-primary)]",
              )}
              style={{ width: `${(checked / task.checklist.length) * 100}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-3 text-xs">
        <DueLabel due={task.due} done={done} />
        {task.checklist.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground tabular-nums">
            <ListChecks className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            {checked}/{task.checklist.length}
          </span>
        ) : null}
        {task.comments > 0 ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground tabular-nums">
            <MessageSquare className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            {task.comments}
            <span className="sr-only">comments</span>
          </span>
        ) : null}
        <span className="ml-auto">
          <Avatars ids={task.assignees} size="size-5" />
        </span>
      </div>
    </div>
  );
}
