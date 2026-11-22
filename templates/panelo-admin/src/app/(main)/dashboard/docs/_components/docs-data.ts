// Sizes below are measured off the 1179px-wide reference crop, whose content
// column is 1150px — the same width the dashboard inset gives us — so this
// screen is built 1:1 with no scaling knob.

export type DocKind = "doc" | "grid" | "deck";
export type PreviewKind = "invoices" | "integrations" | "customers" | "security" | "console" | "board";

export interface DocItem {
  id: string;
  title: string;
  kind: DocKind;
  preview: PreviewKind;
  owner: string;
  avatars: number[];
  daysAgo: number;
  mine: boolean;
  favorite: boolean;
  shared: boolean;
  deleted: boolean;
}

/** Flat identity fills for the stacked collaborator dots — one per person,
 *  drawn from the app scale so they agree with every other screen. */
export const AVATAR_TONES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--success-solid)",
  "var(--warning-solid)",
];

export const KIND_LABEL: Record<DocKind, string> = { doc: "Document", grid: "Whiteboard", deck: "Presentation" };

const seeds: { title: string; kind: DocKind; preview: PreviewKind }[] = [
  { title: "2023 Product Rollout Plan", kind: "doc", preview: "invoices" },
  { title: "2025 Product Rollout Plan", kind: "doc", preview: "integrations" },
  { title: "User Behavior Study Results", kind: "grid", preview: "customers" },
  { title: "Sales Projections Review Q4", kind: "deck", preview: "security" },
  { title: "Product Launch Strategy 2025", kind: "doc", preview: "board" },
  { title: "Customer Insights and Engagement", kind: "grid", preview: "console" },
  { title: "Market Trends Overview 2025", kind: "deck", preview: "customers" },
  { title: "Funding Round Update: Series B", kind: "doc", preview: "integrations" },
  { title: "Investor Update: Growth Metrics", kind: "deck", preview: "console" },
  { title: "Retention Deep Dive", kind: "doc", preview: "invoices" },
  { title: "Pricing Experiment Readout", kind: "grid", preview: "board" },
  { title: "Onboarding Revamp Brief", kind: "deck", preview: "security" },
];

export const owners = ["Sarah Johnson", "David Miller", "Priya Raman", "Tom Becker"];

/** Deterministic roster: 4 items land in the 7-day bucket, 8 in 30, 40 in 3mo. */
function make(count: number, dayFrom: number, dayTo: number, offset: number, prefix: string): DocItem[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = seeds[(index + offset) % seeds.length];
    const n = index + offset;
    return {
      ...seed,
      id: `${prefix}-${index}`,
      owner: owners[n % owners.length],
      avatars: [n, n + 2, n + 4].map((value) => value % AVATAR_TONES.length),
      daysAgo: dayFrom + (index % Math.max(dayTo - dayFrom, 1)),
      mine: n % 3 !== 0,
      favorite: n % 4 === 0,
      shared: n % 5 !== 0,
      deleted: false,
    };
  });
}

export const docs: DocItem[] = [
  ...make(4, 1, 7, 0, "d7"),
  ...make(8, 9, 29, 4, "d30"),
  ...make(40, 33, 88, 2, "d3m"),
  ...make(3, 5, 7, 7, "trash").map((doc) => ({ ...doc, deleted: true })),
];

export const DATE_BUCKETS = [
  { label: "Previous 7 days", max: 7 },
  { label: "Previous 30 days", max: 30 },
  { label: "Previous 3 months", max: 90 },
  { label: "Earlier", max: Number.POSITIVE_INFINITY },
];

export const quickActions = [
  {
    id: "note",
    title: "New quick note",
    description: "Create a quick note for you",
    kind: "doc" as DocKind,
    preview: "invoices" as PreviewKind,
    fill: "var(--success-solid)",
  },
  {
    id: "document",
    title: "New document",
    description: "Write a project document",
    kind: "doc" as DocKind,
    preview: "integrations" as PreviewKind,
    fill: "var(--chart-1)",
  },
  {
    id: "whiteboard",
    title: "New whiteboard",
    description: "Create a sharing whiteboard",
    kind: "grid" as DocKind,
    preview: "board" as PreviewKind,
    fill: "var(--chart-4)",
  },
  {
    id: "presentation",
    title: "New presentation",
    description: "Build a ppxt-like presentation",
    kind: "deck" as DocKind,
    preview: "console" as PreviewKind,
    fill: "var(--chart-3)",
  },
];

export const docTabs = ["All docs", "My docs", "Favorites", "Sharing", "Deleted"] as const;
export type DocTab = (typeof docTabs)[number];
export const groupByOptions = ["Date", "Type", "Owner"] as const;
export const sortOptions = ["Recent", "Name"] as const;
