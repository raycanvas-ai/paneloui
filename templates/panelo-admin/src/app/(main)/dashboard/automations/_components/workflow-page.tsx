"use client";
import * as React from "react";

import { cn } from "cn";
import {
  ArrowDown,
  ArrowUp,
  CircleCheckBig,
  CircleX,
  Copy,
  EllipsisVertical,
  Hourglass,
  ListFilter,
  Mail,
  Pencil,
  Smartphone,
  Trash2,
  UserPlus,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";

import {
  DELAY_MINUTES,
  DELAY_UNITS,
  FILTER_FIELDS,
  FILTER_OPERATORS,
  initialNodes,
  JOIN_OPERATORS,
  type LibraryItem,
  NODE_TONE,
  TONE_TILE,
  TRIGGER_SUBJECTS,
  type WorkflowNode,
} from "./workflow-data";
import { BodyField, ChipInput, ChipSelect } from "./workflow-fields";
import { WorkflowLibrary } from "./workflow-library";

// Sizes are measured off the 1458px-wide reference; this trims the canvas to
// the inset without re-deriving them.
const UI_SCALE = 0.8;
const STORAGE_KEY = "panelo:workflow";

const CARD = "relative rounded-[14px] border border-border bg-card dark:bg-card";
const NODE_ICON = { trigger: UserPlus, delay: Hourglass, email: Mail, sms: Smartphone, task: CircleCheckBig } as const;

interface Draft {
  name: string;
  description: string;
  active: boolean;
  nodes: WorkflowNode[];
}

const initialDraft: Draft = {
  name: "Welcome New Users",
  description: "",
  active: false,
  nodes: initialNodes,
};

function Tile({ kind }: { readonly kind: WorkflowNode["kind"] }) {
  const Icon = NODE_ICON[kind];
  return (
    <span
      className={cn("flex size-[38px] shrink-0 items-center justify-center rounded-[11px]", TONE_TILE[NODE_TONE[kind]])}
    >
      <Icon className="size-[21px]" strokeWidth={1.7} />
    </span>
  );
}

/** Body copy carries {{token}} placeholders that render as inline chips. */
function Tokenized({ text }: { readonly text: string }) {
  return (
    <>
      {text.split(/(\{\{[^}]+\}\})/).map((part, index) =>
        part.startsWith("{{") ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: split output has no stable id
          <span key={index} className="rounded-[5px] bg-foreground/10 px-[6px] py-[1px] font-medium">
            {part.slice(2, -2)}
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: split output has no stable id
          <React.Fragment key={index}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

/** Reads as the reference's message block until you click into it. */
function EditableBody({
  value,
  onChange,
  label,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label: string;
}) {
  const [editing, setEditing] = React.useState(false);

  if (editing) {
    return (
      <BodyField
        value={value}
        onChange={onChange}
        label={label}
        className="min-h-[80px] rounded-[6px] bg-card/70 p-[6px] outline-1 outline-border dark:bg-background/40"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="block w-full cursor-text space-y-[10px] text-left text-[15px] leading-[20px]"
    >
      {value.split("\n\n").map((line) => (
        <span key={line} className="block">
          <Tokenized text={line} />
        </span>
      ))}
    </button>
  );
}

function NodeToolbar({
  onMove,
  onDuplicate,
  onDelete,
  canUp,
  canDown,
}: {
  readonly onMove: (direction: -1 | 1) => void;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
  readonly canUp: boolean;
  readonly canDown: boolean;
}) {
  const button =
    "flex size-[26px] cursor-pointer items-center justify-center rounded-[7px] text-foreground/75 hover:bg-muted disabled:cursor-default disabled:opacity-30";
  return (
    <div className="absolute top-[10px] right-[10px] flex items-center gap-[2px] rounded-[9px] border border-border bg-card opacity-0 shadow-sm transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 dark:bg-card">
      <button type="button" className={button} onClick={() => onMove(-1)} disabled={!canUp} aria-label="Move step up">
        <ArrowUp className="size-[15px]" />
      </button>
      <button
        type="button"
        className={button}
        onClick={() => onMove(1)}
        disabled={!canDown}
        aria-label="Move step down"
      >
        <ArrowDown className="size-[15px]" />
      </button>
      <button type="button" className={button} onClick={onDuplicate} aria-label="Duplicate step">
        <Copy className="size-[14px]" />
      </button>
      <button
        type="button"
        className={cn(button, "hover:text-destructive")}
        onClick={onDelete}
        aria-label="Delete step"
      >
        <Trash2 className="size-[14px]" />
      </button>
    </div>
  );
}

export function WorkflowPage() {
  const [draft, setDraft] = React.useState<Draft>(initialDraft);
  const [saved, setSaved] = React.useState(() => JSON.stringify(initialDraft));
  const [editingName, setEditingName] = React.useState(false);

  // Drafts survive a reload; the builder is otherwise a black hole.
  React.useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Draft;
      if (Array.isArray(parsed.nodes)) {
        setDraft(parsed);
        setSaved(raw);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const dirty = JSON.stringify(draft) !== saved;
  const { nodes } = draft;
  const patch = (next: Partial<Draft>) => setDraft((previous) => ({ ...previous, ...next }));
  const setNodes = (next: WorkflowNode[]) => patch({ nodes: next });
  const updateNode = (id: string, changes: Partial<WorkflowNode>) =>
    setNodes(nodes.map((node) => (node.id === id ? { ...node, ...changes } : node)));

  const totalDelay = nodes
    .filter((node) => node.kind === "delay")
    .reduce((sum, node) => sum + Number(node.amount ?? 0) * (DELAY_MINUTES[node.unit ?? "minutes"] ?? 1), 0);

  const delayLabel = () => {
    if (totalDelay === 0) return "no delay";
    const days = Math.floor(totalDelay / 1440);
    const hours = Math.floor((totalDelay % 1440) / 60);
    const minutes = totalDelay % 60;
    return [days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(" ");
  };

  function persist(next: Draft, message: string) {
    const payload = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, payload);
    setDraft(next);
    setSaved(payload);
    toast.success(message);
  }

  function save() {
    persist(draft, "Workflow saved");
  }

  function saveAndActivate() {
    const hasTrigger = nodes.some((node) => node.kind === "trigger");
    const hasAction = nodes.some((node) => node.kind === "email" || node.kind === "sms" || node.kind === "task");
    if (!hasTrigger || !hasAction) {
      toast.error("Add at least one trigger and one action before activating.");
      return;
    }
    persist({ ...draft, active: true }, "Workflow saved and activated");
  }

  function addFromLibrary(item: LibraryItem) {
    const id = `n-${Date.now()}`;
    const node: WorkflowNode =
      item.adds === "delay"
        ? { id, kind: "delay", amount: "1", unit: "hours" }
        : item.adds === "trigger"
          ? { id, kind: "trigger", lead: "New", chip: "Any user", tail: "appears in the workspace", filters: [] }
          : {
              id,
              kind: item.adds,
              title: item.adds === "email" ? "Send email to the user" : "Send SMS to the user",
              subject: item.adds === "email" ? "New message subject" : undefined,
              body: "Write your message here.",
            };
    setNodes([...nodes, node]);
    toast.success(`${item.title} added`);
  }

  function moveNode(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= nodes.length) return;
    const next = [...nodes];
    [next[index], next[target]] = [next[target], next[index]];
    setNodes(next);
  }

  const removeFilter = (nodeId: string, filterId: string) => {
    const node = nodes.find((item) => item.id === nodeId);
    updateNode(nodeId, { filters: node?.filters?.filter((row) => row.id !== filterId) });
  };

  const addFilter = (nodeId: string) => {
    const node = nodes.find((item) => item.id === nodeId);
    updateNode(nodeId, {
      filters: [
        ...(node?.filters ?? []),
        {
          id: `f-${Date.now()}`,
          join: (node?.filters?.length ?? 0) > 0 ? "AND" : undefined,
          field: FILTER_FIELDS[0],
          operator: FILTER_OPERATORS[0],
          value: "",
        },
      ],
    });
  };

  function renderNode(node: WorkflowNode, index: number) {
    const toolbar = (
      <NodeToolbar
        canUp={index > 0}
        canDown={index < nodes.length - 1}
        onMove={(direction) => moveNode(index, direction)}
        onDuplicate={() =>
          setNodes([...nodes.slice(0, index + 1), { ...node, id: `n-${Date.now()}` }, ...nodes.slice(index + 1)])
        }
        onDelete={() => setNodes(nodes.filter((item) => item.id !== node.id))}
      />
    );

    if (node.kind === "trigger") {
      return (
        <div className={cn(CARD, "group")}>
          {toolbar}
          <div className="flex items-center gap-[16px] px-[19px] py-[19px]">
            <Tile kind={node.kind} />
            <p className="flex flex-wrap items-center gap-[8px] text-[15px]">
              {node.lead}
              <ChipSelect
                label="Trigger subject"
                value={node.chip ?? TRIGGER_SUBJECTS[0]}
                options={TRIGGER_SUBJECTS}
                onChange={(value) => updateNode(node.id, { chip: value })}
              />
              {node.tail}
            </p>
          </div>

          <div className="flex gap-[26px] rounded-b-[13px] border-border border-t bg-background px-[28px] pt-[14px] pb-[16px]">
            <ListFilter className="mt-[6px] size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
            <div className="min-w-0 flex-1">
              {(node.filters ?? []).map((row, rowIndex) => (
                <div key={row.id} className="mb-[9px] flex flex-wrap items-center gap-[8px] text-[15px] last:mb-0">
                  {rowIndex > 0 ? (
                    <ChipSelect
                      label="Join"
                      value={row.join ?? "AND"}
                      options={JOIN_OPERATORS}
                      onChange={(value) =>
                        updateNode(node.id, {
                          filters: node.filters?.map((item) => (item.id === row.id ? { ...item, join: value } : item)),
                        })
                      }
                    />
                  ) : null}
                  <ChipSelect
                    label="Filter field"
                    value={row.field}
                    options={FILTER_FIELDS}
                    onChange={(value) =>
                      updateNode(node.id, {
                        filters: node.filters?.map((item) => (item.id === row.id ? { ...item, field: value } : item)),
                      })
                    }
                  />
                  <ChipSelect
                    label="Filter operator"
                    value={row.operator}
                    options={FILTER_OPERATORS}
                    onChange={(value) =>
                      updateNode(node.id, {
                        filters: node.filters?.map((item) =>
                          item.id === row.id ? { ...item, operator: value } : item,
                        ),
                      })
                    }
                  />
                  <ChipInput
                    label="Filter value"
                    value={row.value}
                    onChange={(value) =>
                      updateNode(node.id, {
                        filters: node.filters?.map((item) => (item.id === row.id ? { ...item, value } : item)),
                      })
                    }
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${row.field} filter`}
                    onClick={() => removeFilter(node.id, row.id)}
                    className="ml-[4px] cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <CircleX className="size-[18px]" strokeWidth={1.6} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addFilter(node.id)}
                className="mt-[14px] cursor-pointer text-muted-foreground text-[15px] leading-[20px] transition-colors hover:text-foreground"
              >
                Add another filter...
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (node.kind === "delay") {
      return (
        <div className={cn(CARD, "group flex items-center gap-[16px] px-[19px] py-[19px]")}>
          {toolbar}
          <Tile kind={node.kind} />
          <p className="flex items-center gap-[8px] text-[15px]">
            After
            <ChipInput
              label="Delay amount"
              value={node.amount ?? ""}
              placeholder="0"
              onChange={(value) => updateNode(node.id, { amount: value.replace(/\D/g, "") })}
            />
            <ChipSelect
              label="Delay unit"
              value={node.unit ?? DELAY_UNITS[0]}
              options={DELAY_UNITS}
              onChange={(value) => updateNode(node.id, { unit: value })}
            />
          </p>
        </div>
      );
    }

    return (
      <div className={cn(CARD, "group flex gap-[16px] px-[19px] py-[19px]")}>
        {toolbar}
        <Tile kind={node.kind} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[15px] leading-[20px]">{node.title}</p>
          <div className="mt-[11px] overflow-hidden rounded-[8px] bg-muted">
            {node.kind === "email" ? (
              <input
                value={node.subject ?? ""}
                aria-label="Email subject"
                placeholder="Subject"
                onChange={(event) => updateNode(node.id, { subject: event.target.value })}
                className="w-full border-border border-b bg-transparent px-[14px] py-[13px] font-semibold text-[15px] outline-none placeholder:text-muted-foreground"
              />
            ) : null}
            <div className="px-[14px] py-[13px]">
              <EditableBody
                label={`${node.title} body`}
                value={node.body ?? ""}
                onChange={(value) => updateNode(node.id, { body: value })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row" style={{ zoom: UI_SCALE }} data-content-padding="false">
      <div className="min-w-0 flex-1 overflow-y-auto bg-background pt-[28px] pr-[24px] pb-[48px] pl-[24px] xl:pl-[122px]">
        <div className="max-w-[723px]">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-[12px]">
                {editingName ? (
                  // biome-ignore lint/a11y/noAutofocus: the field replaces the heading on an explicit click
                  <input
                    value={draft.name}
                    onChange={(event) => patch({ name: event.target.value })}
                    onBlur={() => setEditingName(false)}
                    onKeyDown={(event) => event.key === "Enter" && setEditingName(false)}
                    aria-label="Workflow name"
                    className="w-full min-w-0 bg-transparent font-bold text-[24px] leading-[32px] outline-none"
                  />
                ) : (
                  <>
                    <h1 className="truncate font-bold text-[24px] leading-[32px]">{draft.name}</h1>
                    <button
                      type="button"
                      aria-label="Rename workflow"
                      onClick={() => setEditingName(true)}
                      className="cursor-pointer text-foreground/75 transition-colors hover:text-foreground"
                    >
                      <Pencil className="size-[19px]" strokeWidth={1.7} />
                    </button>
                  </>
                )}
              </div>
              <input
                value={draft.description}
                onChange={(event) => patch({ description: event.target.value })}
                placeholder="Add description"
                aria-label="Workflow description"
                className="mt-[6px] w-full bg-transparent text-[15px] italic leading-[20px] outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="mt-[8px] flex shrink-0 items-center gap-[16px]">
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Workflow actions"
                  className="cursor-pointer rounded-md p-1 text-foreground/75 hover:text-foreground"
                >
                  <EllipsisVertical className="size-[19px]" strokeWidth={2} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditingName(true)}>Rename</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => patch({ active: !draft.active })}>
                    {draft.active ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      window.localStorage.removeItem(STORAGE_KEY);
                      setDraft(initialDraft);
                      setSaved(JSON.stringify(initialDraft));
                      toast.success("Reset to the starter workflow");
                    }}
                  >
                    Reset to starter
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => setNodes([])}>
                    Clear all steps
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                type="button"
                onClick={() => patch({ active: !draft.active })}
                className="flex h-[43px] cursor-pointer items-center gap-[10px] rounded-[12px] border border-border bg-card px-[18px] text-[15px] transition-colors hover:bg-background dark:bg-card"
              >
                <span
                  className={cn("size-[10px] rounded-full", draft.active ? "bg-success-solid" : "bg-destructive")}
                />
                <span className="text-foreground/75">Status:</span>
                <span className="font-medium">{draft.active ? "Active" : "Inactive"}</span>
              </button>
            </div>
          </div>

          <div className="mt-[24px]">
            {nodes.map((node, index) => (
              <div key={node.id}>
                {index > 0 ? <span className="mx-auto block h-[36px] w-[2px] bg-foreground/20" /> : null}
                {renderNode(node, index)}
              </div>
            ))}
            {nodes.length === 0 ? (
              <p className="rounded-[14px] border border-border border-dashed py-[48px] text-center text-muted-foreground text-[15px]">
                Pick a trigger from the right to start this workflow.
              </p>
            ) : null}
          </div>

          <div className="mt-[28px] flex flex-wrap items-center gap-[8px]">
            <button
              type="button"
              onClick={save}
              className="flex h-[41px] cursor-pointer items-center gap-[8px] rounded-[10px] bg-success-solid px-[24px] font-medium text-[15px] text-white transition-colors hover:bg-success-solid"
            >
              Save
              {dirty ? <span className="size-[7px] rounded-full bg-card/80" /> : null}
            </button>
            <button
              type="button"
              onClick={saveAndActivate}
              className="flex h-[41px] cursor-pointer items-center rounded-[10px] border border-border bg-card px-[24px] text-[15px] transition-colors hover:bg-background dark:bg-card"
            >
              Save &amp; Activate
            </button>
            <span className="ml-[8px] text-muted-foreground text-[15px]">
              {nodes.length} {nodes.length === 1 ? "step" : "steps"} · {delayLabel()} total delay
              {dirty ? " · unsaved changes" : ""}
            </span>
          </div>
        </div>
      </div>

      <WorkflowLibrary onAdd={addFromLibrary} />
    </div>
  );
}
