export type Status = "backlog" | "todo" | "progress" | "review" | "done";
export type Priority = "urgent" | "high" | "medium" | "low";
export type ProjectId = "atlas" | "orion" | "nimbus" | "helio";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project: ProjectId;
  priority: Priority;
  /** ISO date (yyyy-MM-dd), compared as a string against TODAY. */
  due?: string;
  assignees: string[];
  checklist: ChecklistItem[];
  comments: number;
}

/** Column key = status, so a task's status is wherever it sits on the board. */
export type Board = Record<Status, Task[]>;

/** Fixed "today" keeps server and client renders identical and matches the rest of the demo data. */
export const TODAY = "2026-09-15";

export const COLUMNS: { id: Status; title: string; dot: string; limit?: number }[] = [
  { id: "backlog", title: "Backlog", dot: "bg-muted-foreground/40" },
  { id: "todo", title: "To do", dot: "bg-chart-2" },
  { id: "progress", title: "In progress", dot: "bg-[var(--tone-primary)]", limit: 4 },
  { id: "review", title: "In review", dot: "bg-warning-solid", limit: 3 },
  { id: "done", title: "Done", dot: "bg-success-solid" },
];

export const PROJECTS: { id: ProjectId; name: string; short: string; dot: string }[] = [
  { id: "atlas", name: "Atlas CRM Revamp", short: "Atlas", dot: "bg-chart-1" },
  { id: "orion", name: "Orion API Gateway", short: "Orion", dot: "bg-chart-2" },
  { id: "nimbus", name: "Nimbus Dashboard", short: "Nimbus", dot: "bg-chart-3" },
  { id: "helio", name: "Helio Task System", short: "Helio", dot: "bg-chart-4" },
];

export const PEOPLE: { id: string; name: string; tone: string }[] = [
  { id: "maya", name: "Maya Chen", tone: "bg-chart-1/15 text-chart-1" },
  { id: "lucas", name: "Lucas Moreau", tone: "bg-chart-2/15 text-chart-2" },
  { id: "noah", name: "Noah Williams", tone: "bg-chart-3/15 text-chart-3" },
  { id: "ava", name: "Ava Patel", tone: "bg-chart-4/15 text-chart-4" },
  { id: "diego", name: "Diego Ramos", tone: "bg-chart-5/15 text-chart-5" },
];

export const PRIORITIES: { id: Priority; label: string; bars: number; tone: string }[] = [
  { id: "urgent", label: "Urgent", bars: 4, tone: "text-destructive" },
  { id: "high", label: "High", bars: 3, tone: "text-warning" },
  { id: "medium", label: "Medium", bars: 2, tone: "text-foreground" },
  { id: "low", label: "Low", bars: 1, tone: "text-muted-foreground" },
];

let sequence = 0;
/** Ids only need to be unique within the session. */
export const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(sequence++).toString(36)}`;

function steps(id: string, items: [string, boolean][]): ChecklistItem[] {
  return items.map(([text, done], index) => ({ id: `${id}-c${index}`, text, done }));
}

function task(
  id: string,
  fields: Omit<Task, "id" | "checklist" | "comments"> & Partial<Task>,
  checklist: [string, boolean][] = [],
): Task {
  return { comments: 0, ...fields, id, checklist: steps(id, checklist) };
}

export const initialBoard: Board = {
  backlog: [
    task("t-104", {
      title: "Nimbus inventory widget empty state",
      description: "Show a restock prompt when every product in a collection is out of stock.",
      project: "nimbus",
      priority: "medium",
      assignees: [],
    }),
    task("t-112", {
      title: "Bulk-archive closed deals",
      description: "Let sales ops archive closed-lost deals older than a year in one action.",
      project: "atlas",
      priority: "low",
      assignees: ["ava"],
    }),
    task("t-118", {
      title: "Recurring task templates",
      description: "Weekly and monthly templates that create tasks on a schedule.",
      project: "helio",
      priority: "low",
      assignees: [],
      comments: 2,
    }),
  ],
  todo: [
    task(
      "t-103",
      {
        title: "Add rate-limit alerts to Orion dashboards",
        description: "Page on-call when any key exceeds 90% of its quota for five minutes.",
        project: "orion",
        priority: "high",
        due: "2026-09-24",
        assignees: ["noah"],
        comments: 3,
      },
      [
        ["Define alert thresholds", true],
        ["Wire PagerDuty route", false],
        ["Dashboard panel", false],
      ],
    ),
    task("t-109", {
      title: "Currency switcher on store overview",
      description: "Report sales in the store currency or the viewer's local currency.",
      project: "nimbus",
      priority: "medium",
      due: "2026-09-26",
      assignees: ["diego"],
    }),
    task("t-114", {
      title: "Due-date reminders by email",
      description: "Daily digest of tasks due tomorrow, grouped by project.",
      project: "helio",
      priority: "medium",
      due: "2026-10-02",
      assignees: ["ava", "maya"],
      comments: 1,
    }),
  ],
  progress: [
    task(
      "t-101",
      {
        title: "Migrate Atlas contact import to the v2 API",
        description: "Batch imports over 10k rows time out. Stream rows and merge duplicates by email.",
        project: "atlas",
        priority: "urgent",
        due: "2026-09-19",
        assignees: ["maya"],
        comments: 8,
      },
      [
        ["Stream CSV parser", true],
        ["Duplicate merge by email", true],
        ["Progress events", false],
        ["Backfill job", false],
      ],
    ),
    task(
      "t-107",
      {
        title: "Rotate gateway signing keys",
        description: "Move JWT signing to KMS-managed keys with a 24h overlap window.",
        project: "orion",
        priority: "high",
        due: "2026-09-12",
        assignees: ["noah", "lucas"],
        comments: 5,
      },
      [
        ["KMS key ring", true],
        ["Dual-sign window", false],
      ],
    ),
    task("t-110", {
      title: "Refund rate chart on orders",
      description: "Trend refunds alongside net revenue so spikes are obvious.",
      project: "nimbus",
      priority: "medium",
      due: "2026-09-22",
      assignees: ["diego"],
    }),
  ],
  review: [
    task(
      "t-102",
      {
        title: "QA pipeline stage colours in dark mode",
        description: "Stage chips in Atlas lose contrast on the dark surface. Map them to the chart scale.",
        project: "atlas",
        priority: "medium",
        due: "2026-09-17",
        assignees: ["lucas"],
        comments: 4,
      },
      [
        ["Audit contrast", true],
        ["Swap to chart tokens", true],
        ["Screenshot review", false],
      ],
    ),
    task("t-111", {
      title: "Per-key usage export",
      description: "CSV export of request counts per API key for billing reconciliation.",
      project: "orion",
      priority: "low",
      due: "2026-09-14",
      assignees: ["noah"],
      comments: 1,
    }),
  ],
  done: [
    task(
      "t-105",
      {
        title: "Kanban keyboard navigation",
        description: "Pick up cards with Space, move with arrow keys, drop with Space.",
        project: "helio",
        priority: "high",
        assignees: ["ava"],
        comments: 6,
      },
      [
        ["Sensor config", true],
        ["Announcements", true],
      ],
    ),
    task("t-106", {
      title: "Pipeline value by stage",
      description: "Stacked bar of open pipeline value per stage on the CRM overview.",
      project: "atlas",
      priority: "medium",
      assignees: ["maya", "lucas"],
      comments: 2,
    }),
  ],
};
