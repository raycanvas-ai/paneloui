"use client";

import { useState } from "react";

import { cn } from "cn";
import { Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import {
  COLUMNS,
  nextId,
  PEOPLE,
  PRIORITIES,
  PROJECTS,
  type Priority,
  type ProjectId,
  type Status,
  type Task,
} from "./board-data";
import { initials } from "./task-bits";

export interface Draft {
  task: Task;
  status: Status;
  isNew: boolean;
}

interface TaskSheetProps {
  readonly draft: Draft | null;
  readonly onClose: () => void;
  readonly onSave: (task: Task, status: Status) => void;
  readonly onDelete: (task: Task) => void;
}

export function TaskSheet({ draft, onClose, onSave, onDelete }: TaskSheetProps) {
  return (
    <Sheet open={draft !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        {/* Keyed so each opened task starts from its own saved values. */}
        {draft ? (
          <Editor key={draft.task.id} draft={draft} onClose={onClose} onSave={onSave} onDelete={onDelete} />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Editor({ draft, onClose, onSave, onDelete }: TaskSheetProps & { readonly draft: Draft }) {
  const [task, setTask] = useState(draft.task);
  const [status, setStatus] = useState(draft.status);
  const [step, setStep] = useState("");
  const update = (patch: Partial<Task>) => setTask((current) => ({ ...current, ...patch }));
  const done = task.checklist.filter((item) => item.done).length;

  const addStep = () => {
    const text = step.trim();
    if (!text) return;
    update({ checklist: [...task.checklist, { id: nextId("c"), text, done: false }] });
    setStep("");
  };

  return (
    <form
      className="flex h-full min-h-0 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        if (task.title.trim()) onSave({ ...task, title: task.title.trim() }, status);
      }}
    >
      <SheetHeader className="border-b p-5">
        <SheetTitle>{draft.isNew ? "New task" : "Edit task"}</SheetTitle>
        <SheetDescription>
          {draft.isNew ? "Add it to the board." : `${task.id.toUpperCase()} · ${task.comments} comments`}
        </SheetDescription>
      </SheetHeader>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor="task-title">Title</FieldLabel>
            <Input
              id="task-title"
              required
              value={task.title}
              onChange={(event) => update({ title: event.target.value })}
              placeholder="What needs doing?"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="task-description">Description</FieldLabel>
            <Textarea
              id="task-description"
              rows={3}
              value={task.description}
              onChange={(event) => update({ description: event.target.value })}
              placeholder="Add context, links, acceptance criteria…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="task-status">Status</FieldLabel>
              <NativeSelect
                id="task-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as Status)}
              >
                {COLUMNS.map((column) => (
                  <NativeSelectOption key={column.id} value={column.id}>
                    {column.title}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
              <NativeSelect
                id="task-priority"
                value={task.priority}
                onChange={(event) => update({ priority: event.target.value as Priority })}
              >
                {PRIORITIES.map((priority) => (
                  <NativeSelectOption key={priority.id} value={priority.id}>
                    {priority.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="task-project">Project</FieldLabel>
              <NativeSelect
                id="task-project"
                value={task.project}
                onChange={(event) => update({ project: event.target.value as ProjectId })}
              >
                {PROJECTS.map((project) => (
                  <NativeSelectOption key={project.id} value={project.id}>
                    {project.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="task-due">Due date</FieldLabel>
              <Input
                id="task-due"
                type="date"
                value={task.due ?? ""}
                onChange={(event) => update({ due: event.target.value || undefined })}
              />
            </Field>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-medium text-sm">Assignees</legend>
            <div className="flex flex-wrap gap-1.5">
              {PEOPLE.map((person) => {
                const active = task.assignees.includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      update({
                        assignees: active
                          ? task.assignees.filter((id) => id !== person.id)
                          : [...task.assignees, person.id],
                      })
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 text-xs outline-none ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring/60",
                      active
                        ? "bg-muted ring-foreground/20"
                        : "text-muted-foreground ring-foreground/10 hover:bg-muted/60",
                    )}
                  >
                    <span
                      className={cn("grid size-5 place-items-center rounded-full font-medium text-[9px]", person.tone)}
                    >
                      {initials(person.name)}
                    </span>
                    {person.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 flex w-full items-center justify-between font-medium text-sm">
              Checklist
              {task.checklist.length > 0 ? (
                <span className="font-normal text-muted-foreground text-xs tabular-nums">
                  {done}/{task.checklist.length} done
                </span>
              ) : null}
            </legend>
            <ul className="flex flex-col gap-1">
              {task.checklist.map((item) => (
                <li key={item.id} className="group flex items-center gap-2.5 rounded-md px-1 py-1 hover:bg-muted/60">
                  <Checkbox
                    id={item.id}
                    checked={item.done}
                    onCheckedChange={(checked) =>
                      update({
                        checklist: task.checklist.map((entry) =>
                          entry.id === item.id ? { ...entry, done: checked === true } : entry,
                        ),
                      })
                    }
                  />
                  <label
                    htmlFor={item.id}
                    className={cn("flex-1 text-sm", item.done && "text-muted-foreground line-through")}
                  >
                    {item.text}
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                    aria-label={`Remove ${item.text}`}
                    onClick={() => update({ checklist: task.checklist.filter((entry) => entry.id !== item.id) })}
                  >
                    <X className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <label htmlFor="task-step" className="sr-only">
                New checklist item
              </label>
              <Input
                id="task-step"
                value={step}
                onChange={(event) => setStep(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addStep();
                  }
                }}
                placeholder="Add a step"
              />
              <Button type="button" variant="outline" size="icon" aria-label="Add step" onClick={addStep}>
                <Plus className="size-4" />
              </Button>
            </div>
          </fieldset>
        </FieldGroup>
      </div>

      <SheetFooter className="flex-row items-center border-t p-4">
        {draft.isNew ? null : (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(task)}
          >
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!task.title.trim()}>
            {draft.isNew ? "Create task" : "Save changes"}
          </Button>
        </div>
      </SheetFooter>
    </form>
  );
}
