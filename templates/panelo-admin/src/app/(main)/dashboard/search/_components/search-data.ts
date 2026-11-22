import { FileText, FolderKanban, type LucideIcon, SquareCheckBig, User } from "lucide-react";

export type ResultKind = "projects" | "tasks" | "docs" | "people";

export const RESULT_KINDS: Record<ResultKind, { label: string; icon: LucideIcon }> = {
  projects: { label: "Projects", icon: FolderKanban },
  tasks: { label: "Tasks", icon: SquareCheckBig },
  docs: { label: "Docs", icon: FileText },
  people: { label: "People", icon: User },
};

export type SearchResult = {
  id: string;
  kind: ResultKind;
  title: string;
  description: string;
  path: string;
  meta: string;
  href: string;
};

export const searchIndex: SearchResult[] = [
  {
    id: "p-atlas",
    kind: "projects",
    title: "Atlas CRM Revamp",
    description: "Rebuild of contact, pipeline and deal views on the new Atlas data model.",
    path: "Projects",
    meta: "42 open tasks · Updated 2h ago",
    href: "/dashboard/companies",
  },
  {
    id: "p-nimbus",
    kind: "projects",
    title: "Nimbus Dashboard",
    description: "Storefront analytics dashboard with revenue, traffic and inventory widgets.",
    path: "Projects",
    meta: "18 open tasks · Updated yesterday",
    href: "/dashboard/ecommerce",
  },
  {
    id: "p-orion",
    kind: "projects",
    title: "Orion API Gateway",
    description: "Edge gateway handling auth, rate limits and routing for public APIs.",
    path: "Projects",
    meta: "9 open tasks · Updated 5h ago",
    href: "/dashboard/kanban",
  },
  {
    id: "p-helio",
    kind: "projects",
    title: "Helio Task System",
    description: "Kanban and sprint planning for the platform team.",
    path: "Projects",
    meta: "27 open tasks · Updated 3d ago",
    href: "/dashboard/kanban",
  },
  {
    id: "t-1",
    kind: "tasks",
    title: "Migrate Atlas contact import to the v2 API",
    description: "Batch imports over 10k rows time out. Stream rows and merge duplicates by email.",
    path: "Atlas CRM Revamp / In progress",
    meta: "Assigned to Maya Chen · Due Sep 19",
    href: "/dashboard/kanban",
  },
  {
    id: "t-2",
    kind: "tasks",
    title: "QA pipeline stage colours in dark mode",
    description: "Stage chips in Atlas lose contrast on the dark surface. Map them to the chart scale.",
    path: "Atlas CRM Revamp / In review",
    meta: "Assigned to Lucas Moreau · Due Sep 17",
    href: "/dashboard/kanban",
  },
  {
    id: "t-3",
    kind: "tasks",
    title: "Add rate-limit alerts to Orion dashboards",
    description: "Page on-call when any key exceeds 90% of its quota for five minutes.",
    path: "Orion API Gateway / Todo",
    meta: "Assigned to Noah Williams · Due Sep 24",
    href: "/dashboard/kanban",
  },
  {
    id: "t-4",
    kind: "tasks",
    title: "Nimbus inventory widget empty state",
    description: "Show a restock prompt when every product in a collection is out of stock.",
    path: "Nimbus Dashboard / Backlog",
    meta: "Unassigned",
    href: "/dashboard/kanban",
  },
  {
    id: "d-1",
    kind: "docs",
    title: "Atlas CRM Revamp: kickoff brief",
    description: "Goals, scope and success metrics for the Atlas rebuild, signed off by product and sales.",
    path: "Docs / Product",
    meta: "Edited by Sofia Alvarez · Aug 28",
    href: "/dashboard/docs",
  },
  {
    id: "d-2",
    kind: "docs",
    title: "Atlas data model and migration plan",
    description: "Entity diagram, field mapping from the legacy CRM and the rollback procedure.",
    path: "Docs / Engineering",
    meta: "Edited by Priya Raman · Sep 9",
    href: "/dashboard/docs",
  },
  {
    id: "d-3",
    kind: "docs",
    title: "Orion incident runbook",
    description: "Steps for gateway latency spikes, certificate expiry and upstream outages.",
    path: "Docs / Operations",
    meta: "Edited by Noah Williams · Sep 2",
    href: "/dashboard/docs",
  },
  {
    id: "u-1",
    kind: "people",
    title: "Maya Chen",
    description: "Engineering lead, Atlas CRM Revamp",
    path: "Platform team",
    meta: "maya.chen@panelo.dev",
    href: "/dashboard/users",
  },
  {
    id: "u-2",
    kind: "people",
    title: "Lucas Moreau",
    description: "Product designer, Atlas CRM Revamp and Nimbus Dashboard",
    path: "Growth team",
    meta: "lucas.moreau@panelo.dev",
    href: "/dashboard/users",
  },
  {
    id: "u-3",
    kind: "people",
    title: "Noah Williams",
    description: "Site reliability engineer, Orion API Gateway",
    path: "Platform team",
    meta: "noah.williams@panelo.dev",
    href: "/dashboard/users",
  },
];

export function searchWorkspace(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return searchIndex.filter((r) =>
    [r.title, r.description, r.path, r.meta].some((field) => field.toLowerCase().includes(needle)),
  );
}
