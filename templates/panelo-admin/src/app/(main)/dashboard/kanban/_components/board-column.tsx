"use client";

import { useRef, useState } from "react";

import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { cn } from "cn";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { COLUMNS, type Status, type Task } from "./board-data";
import { TaskTile } from "./task-tile";

interface BoardColumnProps {
  readonly status: Status;
  readonly tasks: Task[];
  /** Tasks in this column across every filter, for the count and WIP limit. */
  readonly total: number;
  readonly onOpen: (task: Task) => void;
  readonly onQuickAdd: (status: Status, title: string) => void;
}

export function BoardColumn({ status, tasks, total, onOpen, onQuickAdd }: BoardColumnProps) {
  const column = COLUMNS.find((item) => item.id === status) ?? COLUMNS[0];
  const { ref, isDropTarget } = useDroppable({
    id: status,
    type: "column",
    accept: "task",
    collisionPriority: CollisionPriority.Low,
  });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const overLimit = column.limit !== undefined && total > column.limit;

  // Enter submits and unmounts the field, which can fire a trailing blur; this keeps it to one add.
  const closed = useRef(false);
  const start = () => {
    closed.current = false;
    setAdding(true);
  };
  const close = (value?: string) => {
    if (closed.current) return;
    closed.current = true;
    if (value?.trim()) onQuickAdd(status, value.trim());
    setTitle("");
    setAdding(false);
  };
  const submit = () => close(title);

  return (
    <section
      aria-labelledby={`column-${status}`}
      className={cn(
        "flex min-h-0 w-[280px] shrink-0 flex-col rounded-xl bg-foreground/[0.03] transition-colors sm:w-[300px] dark:bg-foreground/[0.04]",
        isDropTarget && "bg-[var(--tone-primary)]/[0.06]",
      )}
    >
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className={cn("size-2 rounded-full", column.dot)} />
        <h2 id={`column-${status}`} className="font-medium text-sm">
          {column.title}
        </h2>
        <span className={cn("text-xs tabular-nums", overLimit ? "font-medium text-warning" : "text-muted-foreground")}>
          {column.limit ? `${total}/${column.limit}` : total}
          {overLimit ? <span className="sr-only"> over the work-in-progress limit</span> : null}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto size-7 rounded-full text-muted-foreground"
          aria-label={`Add task to ${column.title}`}
          onClick={start}
        >
          <Plus className="size-4" />
        </Button>
      </header>

      <div ref={ref} className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {tasks.map((task, index) => (
          <TaskTile key={task.id} task={task} status={status} index={index} onOpen={onOpen} />
        ))}

        {tasks.length === 0 && !adding ? (
          <p className="grid min-h-20 place-items-center rounded-lg border border-dashed text-muted-foreground text-xs">
            Drop tasks here
          </p>
        ) : null}

        {adding ? (
          <form
            className="rounded-lg bg-card p-2 shadow-xs ring-1 ring-foreground/5"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <label htmlFor={`quick-add-${status}`} className="sr-only">
              New task title
            </label>
            <textarea
              id={`quick-add-${status}`}
              // biome-ignore lint/a11y/noAutofocus: the field appears because the user asked to add a task.
              autoFocus
              rows={2}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={submit}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
                if (event.key === "Escape") close();
              }}
              placeholder="Task title… Enter to add"
              className="block w-full resize-none bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={start}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-muted-foreground text-sm outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Plus className="size-3.5" />
            Add task
          </button>
        )}
      </div>
    </section>
  );
}
