import { format, parseISO } from "date-fns";

const TEAMS = ["Platform", "Product", "Design", "Data", "Sales", "Support", "Finance", "Security"] as const;
const ROLES = [
  "Workspace Owner",
  "Admin",
  "Billing Admin",
  "Security Admin",
  "Team Lead",
  "Contributor",
  "Guest",
  "Read-only",
] as const;
const STATUSES = ["Active", "Pending invite", "Deactivated", "Locked", "Suspended"] as const;

export type UserTeam = (typeof TEAMS)[number];
export type UserStatus = (typeof STATUSES)[number];

export type UserRow = {
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  team: UserTeam;
  workspace: string[];
  /** "dd MMM yyyy, h:mm a" — the users table parses it back for sorting. */
  joinedDate: string;
  /** Minutes since last seen; Infinity for people who never signed in. */
  lastActive: number;
};

/** Each email domain is a workspace; guests and contractors live outside Panelo HQ. */
const WORKSPACE_BY_DOMAIN: Record<string, string> = {
  "panelo.dev": "Panelo HQ",
  "northline.de": "Northline GmbH",
  "sandbox.dev": "Sandbox",
  "internal.tools": "Internal Tools",
};

const H = 60;
const D = 24 * H;

// name · email · role · status · team · joined (local ISO) · minutes since last seen
type Seed = [string, string, (typeof ROLES)[number], UserStatus, UserTeam, string, number];

const seeds: Seed[] = [
  ["Maya Chen", "maya.chen@panelo.dev", "Workspace Owner", "Active", "Platform", "2023-02-06T09:10", 2],
  ["Lucas Moreau", "lucas.moreau@panelo.dev", "Admin", "Active", "Product", "2023-03-14T11:42", 18],
  ["Hana Sato", "hana.sato@northline.de", "Guest", "Active", "Finance", "2025-11-03T15:05", 3 * D],
  ["Noah Williams", "noah.williams@panelo.dev", "Team Lead", "Active", "Platform", "2023-05-22T08:30", 7],
  ["Elena Petrova", "elena.petrova@sandbox.dev", "Contributor", "Active", "Data", "2024-08-19T13:15", 4 * H],
  [
    "Samuel Adeyemi",
    "samuel.adeyemi@panelo.dev",
    "Contributor",
    "Pending invite",
    "Support",
    "2026-09-12T10:20",
    Number.POSITIVE_INFINITY,
  ],
  ["Ines Duarte", "ines.duarte@internal.tools", "Read-only", "Active", "Security", "2025-01-27T16:48", 2 * D],
  ["Mateo Rivera", "mateo.rivera@northline.de", "Guest", "Deactivated", "Sales", "2024-02-11T09:55", 96 * D],
  ["Grace Kim", "grace.kim@panelo.dev", "Team Lead", "Active", "Design", "2023-09-04T10:00", 25],
  ["Oliver Brandt", "oliver.brandt@panelo.dev", "Billing Admin", "Active", "Finance", "2023-11-20T14:12", 55],
  ["Priyanka Das", "priyanka.das@internal.tools", "Contributor", "Suspended", "Data", "2024-06-03T12:37", 19 * D],
  ["Jonas Berg", "jonas.berg@panelo.dev", "Contributor", "Active", "Platform", "2024-01-15T09:05", 12],
  [
    "Leila Haddad",
    "leila.haddad@sandbox.dev",
    "Guest",
    "Pending invite",
    "Design",
    "2026-09-09T17:40",
    Number.POSITIVE_INFINITY,
  ],
  ["Ethan Brooks", "ethan.brooks@northline.de", "Read-only", "Active", "Sales", "2025-04-08T08:25", 6 * H],
  ["Yuki Tanaka", "yuki.tanaka@panelo.dev", "Security Admin", "Active", "Security", "2023-07-31T10:45", 40],
  ["Sofia Marino", "sofia.marino@internal.tools", "Contributor", "Active", "Support", "2024-10-21T13:00", 90],
  ["Arjun Mehta", "arjun.mehta@panelo.dev", "Admin", "Locked", "Platform", "2023-04-17T09:30", 8 * D],
  ["Clara Jensen", "clara.jensen@northline.de", "Billing Admin", "Active", "Finance", "2025-06-30T11:10", 1 * D],
  ["Diego Alvarez", "diego.alvarez@sandbox.dev", "Contributor", "Active", "Product", "2025-02-24T15:50", 3 * H],
  ["Nora Lindgren", "nora.lindgren@panelo.dev", "Team Lead", "Active", "Support", "2023-10-09T08:15", 33],
  ["Kwame Mensah", "kwame.mensah@panelo.dev", "Contributor", "Active", "Sales", "2024-03-18T10:40", 70],
  ["Isla Murphy", "isla.murphy@northline.de", "Read-only", "Locked", "Finance", "2025-08-12T09:20", 27 * D],
  [
    "Felix Wagner",
    "felix.wagner@internal.tools",
    "Security Admin",
    "Deactivated",
    "Security",
    "2024-05-06T14:05",
    140 * D,
  ],
  [
    "Zara Ahmed",
    "zara.ahmed@panelo.dev",
    "Contributor",
    "Pending invite",
    "Design",
    "2026-09-14T09:00",
    Number.POSITIVE_INFINITY,
  ],
  ["Ravi Iyer", "ravi.iyer@sandbox.dev", "Contributor", "Active", "Data", "2025-09-29T16:30", 5],
];

export const users: UserRow[] = seeds.map(([name, email, role, status, team, joined, lastActive]) => {
  const home = WORKSPACE_BY_DOMAIN[email.split("@")[1]];
  // Owners and admins can reach every workspace; everyone else sees their own plus the shared tools space.
  const workspace =
    role === "Workspace Owner" || role === "Admin"
      ? Object.values(WORKSPACE_BY_DOMAIN)
      : [...new Set([home, ...(home === "Panelo HQ" ? ["Internal Tools"] : [])])];
  return {
    name,
    email,
    role,
    status,
    team,
    workspace,
    joinedDate: format(parseISO(joined), "dd MMM yyyy, h:mm a"),
    lastActive,
  };
});

export const filters = {
  role: ["All", ...ROLES],
  team: ["All", ...TEAMS],
  status: ["All", ...STATUSES],
  workspace: ["All", ...Object.values(WORKSPACE_BY_DOMAIN)],
};

// Written out in full so Tailwind can see every class.
export const statusMeta: Record<UserStatus, { badgeClass: string; dotClass: string }> = {
  Active: { badgeClass: "border-success/20 bg-success/10 text-success", dotClass: "bg-success-solid" },
  "Pending invite": { badgeClass: "border-warning/20 bg-warning/10 text-warning", dotClass: "bg-warning-solid" },
  Deactivated: { badgeClass: "border-border bg-muted/50 text-muted-foreground", dotClass: "bg-muted-foreground" },
  Locked: { badgeClass: "border-destructive/20 bg-destructive/10 text-destructive", dotClass: "bg-destructive" },
  Suspended: { badgeClass: "border-info/20 bg-info/10 text-info", dotClass: "bg-info-solid" },
};
