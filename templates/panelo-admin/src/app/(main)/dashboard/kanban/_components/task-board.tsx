"use client";

import { useRef, useState } from "react";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider, KeyboardSensor, PointerSensor } from "@dnd-kit/react";
import { cn } from "cn";
import { Check, ChevronDown, Columns3, List, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";

import { BoardColumn } from "./board-column";
import {
  type Board,
  COLUMNS,
  initialBoard,
  nextId,
  PEOPLE,
  PRIORITIES,
  PROJECTS,
  type Priority,
  type ProjectId,
  type Status,
  type Task,
} from "./board-data";
import { initials, isOverdue } from "./task-bits";
import { TaskList } from "./task-list";
import { type Draft, TaskSheet } from "./task-sheet";

/** Same accents and canvas as the default overview so the board reads as part of the product. */
const TONE_VARS = "[--tone-primary:var(--primary)] [--tone-secondary:var(--chart-2)]";
const PILL = "h-8 gap-1.5 rounded-full bg-card px-3.5 text-sm shadow-xs hover:bg-card";

// Space picks a card up so Enter stays free to open it.
const SENSORS = [
  PointerSensor,
  KeyboardSensor.configure({ keyboardCodes: { ...KeyboardSensor.defaults.keyboardCodes, start: ["Space"] } }),
];

const statuses = COLUMNS.map((column) => column.id);

interface Filters {
  project: ProjectId | "all";
  query: string;
  people: string[];
  priorities: Priority[];
}

function matcher({ project, query, people, priorities }: Filters) {
  const needle = query.trim().toLowerCase();
  return (task: Task) =>
    (project === "all" || task.project === project) &&
    (people.length === 0 || task.assignees.some((id) => people.includes(id))) &&
    (priorities.length === 0 || priorities.includes(task.priority)) &&
    (needle === "" || task.title.toLowerCase().includes(needle) || task.description.toLowerCase().includes(needle));
}

function visibleBoard(board: Board, match: (task: Task) => boolean) {
  return Object.fromEntries(statuses.map((status) => [status, board[status].filter(match)])) as Board;
}

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
}

function withoutTask(board: Board, id: string) {
  return Object.fromEntries(
    statuses.map((status) => [status, board[status].filter((task) => task.id !== id)]),
  ) as Board;
}

export function TaskBoard() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [view, setView] = useState<"board" | "list">("board");
  const [filters, setFilters] = useState<Filters>({ project: "all", query: "", people: [], priorities: [] });
  const [draft, setDraft] = useState<Draft | null>(null);
  const snapshot = useRef(board);
  // A drop ends with a click on the card; this swallows it so dragging never opens the sheet.
  const dragging = useRef(false);

  const match = matcher(filters);
  const visible = visibleBoard(board, match);
  const filtered = filters.query !== "" || filters.people.length > 0 || filters.priorities.length > 0;
  const projectName =
    filters.project === "all" ? "All projects" : PROJECTS.find((item) => item.id === filters.project)?.name;

  const scoped = statuses.flatMap((status) =>
    board[status]
      .filter((task) => filters.project === "all" || task.project === filters.project)
      .map((task) => ({ task, status })),
  );
  const overdue = scoped.filter(({ task, status }) => isOverdue(task.due, status === "done")).length;
  const inReview = scoped.filter(({ status }) => status === "review").length;

  const open = (task: Task) => {
    if (dragging.current) return;
    const status = statuses.find((key) => board[key].some((item) => item.id === task.id)) ?? "todo";
    setDraft({ task, status, isNew: false });
  };

  const create = (status: Status = "todo") =>
    setDraft({
      status,
      isNew: true,
      task: {
        id: nextId("t"),
        title: "",
        description: "",
        project: filters.project === "all" ? "atlas" : filters.project,
        priority: "medium",
        assignees: [],
        checklist: [],
        comments: 0,
      },
    });

  const save = (task: Task, status: Status) => {
    setBoard((current) => {
      const index = current[status].findIndex((item) => item.id === task.id);
      const next = withoutTask(current, task.id);
      // Keep its place when only details changed; otherwise it lands on top of the new column.
      next[status] = index >= 0 ? next[status].toSpliced(index, 0, task) : [task, ...next[status]];
      return next;
    });
    if (draft?.isNew) toast.success("Task created", { description: task.title });
    setDraft(null);
  };

  const remove = (task: Task) => {
    const before = board;
    setBoard((current) => withoutTask(current, task.id));
    setDraft(null);
    toast("Task deleted", { description: task.title, action: { label: "Undo", onClick: () => setBoard(before) } });
  };

  const moveTo = (task: Task, status: Status) =>
    setBoard((current) => {
      const next = withoutTask(current, task.id);
      next[status] = [task, ...next[status]];
      return next;
    });

  const quickAdd = (status: Status, title: string) =>
    setBoard((current) => ({
      ...current,
      [status]: [
        ...current[status],
        {
          id: nextId("t"),
          title,
          description: "",
          project: filters.project === "all" ? "atlas" : filters.project,
          priority: "medium",
          assignees: [],
          checklist: [],
          comments: 0,
        },
      ],
    }));

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col gap-4 overflow-hidden bg-muted p-4 sm:p-5", TONE_VARS)}
      data-content-padding="false"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
        <div className="min-w-0 pl-10 md:pl-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="-mx-1.5 flex items-center gap-1.5 rounded-lg px-1.5 outline-none hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring/50">
              <h1 className="truncate font-semibold text-2xl tracking-tight">{projectName}</h1>
              <ChevronDown className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Switch project</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Project</DropdownMenuLabel>
              {[{ id: "all" as const, name: "All projects", dot: "bg-foreground/30" }, ...PROJECTS].map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onSelect={() => setFilters((current) => ({ ...current, project: project.id }))}
                >
                  <span className={cn("size-2 rounded-full", project.dot)} />
                  {project.name}
                  {filters.project === project.id ? <Check className="ml-auto size-4" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="mt-0.5 text-muted-foreground text-sm">
            <span className="font-medium text-foreground tabular-nums">{scoped.length}</span> tasks ·{" "}
            <span className="font-medium text-foreground tabular-nums">{inReview}</span> in review ·{" "}
            <span className={cn("font-medium tabular-nums", overdue > 0 ? "text-destructive" : "text-foreground")}>
              {overdue}
            </span>{" "}
            overdue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-card p-0.5 shadow-xs" role="tablist" aria-label="View">
            {(
              [
                { key: "board", label: "Board", icon: Columns3 },
                { key: "list", label: "List", icon: List },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={view === item.key}
                onClick={() => setView(item.key)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors",
                  view === item.key
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
          <Button className="h-8 rounded-full px-3.5" onClick={() => create()}>
            <Plus data-icon="inline-start" />
            New task
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-8 w-full items-center gap-2 rounded-full bg-card px-3.5 text-sm shadow-xs focus-within:ring-2 focus-within:ring-ring/50 sm:w-60">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Search tasks</span>
          <input
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder="Search tasks"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>

        <fieldset className="flex items-center gap-1 rounded-full bg-card p-1 shadow-xs">
          <legend className="sr-only">Filter by assignee</legend>
          {PEOPLE.map((person) => {
            const active = filters.people.includes(person.id);
            return (
              <button
                key={person.id}
                type="button"
                title={person.name}
                aria-label={person.name}
                aria-pressed={active}
                onClick={() => setFilters((current) => ({ ...current, people: toggle(current.people, person.id) }))}
                className={cn(
                  "grid size-6 place-items-center rounded-full font-medium text-[10px] outline-none transition focus-visible:ring-2 focus-visible:ring-ring/60",
                  person.tone,
                  active ? "ring-2 ring-[var(--tone-primary)]" : filters.people.length > 0 && "opacity-40",
                )}
              >
                {initials(person.name)}
              </button>
            );
          })}
        </fieldset>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={PILL}>
              {filters.priorities.length > 0 ? `Priority: ${filters.priorities.length}` : "Priority"}
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PRIORITIES.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority.id}
                checked={filters.priorities.includes(priority.id)}
                onCheckedChange={() =>
                  setFilters((current) => ({ ...current, priorities: toggle(current.priorities, priority.id) }))
                }
              >
                {priority.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {filtered ? (
          <Button
            variant="ghost"
            className="h-8 rounded-full px-3 text-muted-foreground text-sm"
            onClick={() => setFilters((current) => ({ ...current, query: "", people: [], priorities: [] }))}
          >
            <X data-icon="inline-start" />
            Clear filters
          </Button>
        ) : null}
      </div>

      {view === "board" ? (
        <DragDropProvider
          sensors={SENSORS}
          onDragStart={() => {
            snapshot.current = board;
            dragging.current = true;
          }}
          onDragOver={(event) =>
            setBoard((current) => {
              const moved = move(visibleBoard(current, match), event);
              // ponytail: hidden (filtered-out) tasks are appended after the visible ones in each column;
              // keep a rank per task if hidden order ever needs to survive a filtered drag.
              return Object.fromEntries(
                statuses.map((status) => [
                  status,
                  [...moved[status], ...current[status].filter((task) => !match(task))],
                ]),
              ) as Board;
            })
          }
          onDragEnd={(event) => {
            if (event.canceled) setBoard(snapshot.current);
            setTimeout(() => {
              dragging.current = false;
            });
          }}
        >
          <div className="-mx-4 min-h-0 flex-1 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
            <div className="flex h-full gap-3">
              {statuses.map((status) => (
                <BoardColumn
                  key={status}
                  status={status}
                  tasks={visible[status]}
                  total={board[status].length}
                  onOpen={open}
                  onQuickAdd={quickAdd}
                />
              ))}
            </div>
          </div>
        </DragDropProvider>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TaskList
            groups={statuses.map((status) => ({ status, tasks: visible[status] }))}
            onOpen={open}
            onMove={moveTo}
          />
        </div>
      )}

      <TaskSheet draft={draft} onClose={() => setDraft(null)} onSave={save} onDelete={remove} />
    </div>
  );
}
