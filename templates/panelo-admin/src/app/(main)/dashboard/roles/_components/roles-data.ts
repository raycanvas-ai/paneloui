import { users } from "../../users/_components/data";

export const ACTIONS = ["view", "create", "edit", "delete"] as const;
export type Action = (typeof ACTIONS)[number];

/** Each resource lists only the actions that make sense for it; the rest render as "—". */
export const RESOURCES: { key: string; label: string; hint: string; actions: Action[] }[] = [
  {
    key: "projects",
    label: "Projects",
    hint: "Boards, tasks, and docs",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    key: "members",
    label: "Members",
    hint: "Invite, remove, change roles",
    actions: ["view", "create", "edit", "delete"],
  },
  { key: "billing", label: "Billing", hint: "Plans, invoices, payment methods", actions: ["view", "edit"] },
  { key: "settings", label: "Workspace settings", hint: "Branding, domains, security", actions: ["view", "edit"] },
  {
    key: "api",
    label: "API & integrations",
    hint: "Keys, webhooks, connected apps",
    actions: ["view", "create", "edit", "delete"],
  },
  { key: "export", label: "Data export", hint: "CSV and audit log downloads", actions: ["view", "create"] },
];

export const ALL_PERMISSIONS = RESOURCES.flatMap((resource) =>
  resource.actions.map((action) => `${resource.key}.${action}`),
);

export interface Member {
  name: string;
  email: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  system: boolean;
  permissions: string[];
  members: Member[];
}

const grant = (spec: Record<string, Action[]>) =>
  Object.entries(spec).flatMap(([resource, actions]) => actions.map((action) => `${resource}.${action}`));

/** Members come straight from the users screen, so counts here match the role column there. */
const membersOf = (role: string): Member[] =>
  users.filter((user) => user.role === role).map(({ name, email }) => ({ name, email }));

export const initialRoles: Role[] = [
  {
    id: "owner",
    name: "Workspace Owner",
    description: "Full control of the workspace, including billing and deletion.",
    system: true,
    permissions: ALL_PERMISSIONS,
    members: membersOf("Workspace Owner"),
  },
  {
    id: "admin",
    name: "Admin",
    description: "Manages people, projects, and settings. Can't change billing.",
    system: true,
    permissions: grant({
      projects: ["view", "create", "edit", "delete"],
      members: ["view", "create", "edit", "delete"],
      billing: ["view"],
      settings: ["view", "edit"],
      api: ["view", "create", "edit", "delete"],
      export: ["view", "create"],
    }),
    members: membersOf("Admin"),
  },
  {
    id: "contributor",
    name: "Contributor",
    description: "Creates and edits project work. No access to people or billing.",
    system: true,
    permissions: grant({ projects: ["view", "create", "edit"], members: ["view"], api: ["view"], export: ["view"] }),
    members: membersOf("Contributor"),
  },
  {
    id: "read-only",
    name: "Read-only",
    description: "Can see projects and people, but can't change anything.",
    system: true,
    permissions: grant({ projects: ["view"], members: ["view"] }),
    members: membersOf("Read-only"),
  },
  {
    id: "guest",
    name: "Guest",
    description: "External collaborators limited to the projects they're invited to.",
    system: true,
    permissions: grant({ projects: ["view"] }),
    members: membersOf("Guest"),
  },
  {
    id: "billing-admin",
    name: "Billing Admin",
    description: "Finance team access to plans, invoices, and exports.",
    system: false,
    permissions: grant({
      projects: ["view"],
      members: ["view"],
      billing: ["view", "edit"],
      export: ["view", "create"],
    }),
    members: membersOf("Billing Admin"),
  },
  {
    id: "security-admin",
    name: "Security Admin",
    description: "Owns SSO, audit logs, and API key rotation.",
    system: false,
    permissions: grant({
      members: ["view", "edit"],
      settings: ["view", "edit"],
      api: ["view", "create", "edit", "delete"],
      export: ["view", "create"],
    }),
    members: membersOf("Security Admin"),
  },
  {
    id: "team-lead",
    name: "Team Lead",
    description: "Runs a team's projects and invites people into them.",
    system: false,
    permissions: grant({
      projects: ["view", "create", "edit", "delete"],
      members: ["view", "create"],
      export: ["view"],
    }),
    members: membersOf("Team Lead"),
  },
];

/** Granting any action implies view; removing view takes the rest of the row with it. */
export function togglePermission(current: string[], resource: string, action: Action, on: boolean) {
  const next = new Set(current);
  if (on) {
    next.add(`${resource}.${action}`);
    next.add(`${resource}.view`);
  } else if (action === "view") {
    for (const item of ACTIONS) next.delete(`${resource}.${item}`);
  } else {
    next.delete(`${resource}.${action}`);
  }
  return ALL_PERMISSIONS.filter((permission) => next.has(permission));
}
