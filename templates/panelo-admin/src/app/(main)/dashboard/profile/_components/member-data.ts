import { type UserRow, type UserStatus, users } from "../../users/_components/data";

/** Email local parts are unique across the directory, so they double as a readable URL id. */
export const memberId = (user: Pick<UserRow, "email">) => user.email.split("@")[0];

const TITLES: Record<string, string> = {
  "Workspace Owner": "Head of Platform",
  Admin: "Engineering Manager",
  "Billing Admin": "Finance Operations Lead",
  "Security Admin": "Security Engineer",
  "Team Lead": "Team Lead",
  Contributor: "Product Engineer",
  Guest: "External Consultant",
  "Read-only": "Auditor",
};

const PLACES = [
  { city: "San Francisco, US", timeZone: "America/Los_Angeles" },
  { city: "London, UK", timeZone: "Europe/London" },
  { city: "New York, US", timeZone: "America/New_York" },
  { city: "Berlin, DE", timeZone: "Europe/Berlin" },
  { city: "Bengaluru, IN", timeZone: "Asia/Kolkata" },
  { city: "Toronto, CA", timeZone: "America/Toronto" },
  { city: "Lisbon, PT", timeZone: "Europe/Lisbon" },
  { city: "Singapore", timeZone: "Asia/Singapore" },
];

const DEVICES = ["MacBook Pro · Chrome", "iPhone 15 · Safari", "Windows 11 · Edge", "iPad Air · Safari"];

/** Anything other than Active gets one line explaining why the account looks quiet. */
export const STATUS_NOTE: Partial<Record<UserStatus, string>> = {
  "Pending invite": "Invitation sent, waiting for them to accept.",
  Locked: "Locked after repeated failed sign-ins. A Security Admin can unlock it.",
  Suspended: "Suspended by an admin. Access to every workspace is paused.",
  Deactivated: "Deactivated. History is kept, but they can no longer sign in.",
};

export type WorkStatus = "Todo" | "In progress" | "In review" | "Done";

const WORK = [
  {
    title: "Migrate Atlas contact import to the v2 API",
    project: "Atlas CRM Revamp",
    status: "In progress",
    due: "Sep 19",
  },
  { title: "QA pipeline stage colours in dark mode", project: "Atlas CRM Revamp", status: "In review", due: "Sep 17" },
  { title: "Add rate-limit alerts to Orion dashboards", project: "Orion API Gateway", status: "Todo", due: "Sep 24" },
  { title: "Inventory widget empty state", project: "Nimbus Store", status: "Todo", due: "Sep 26" },
  { title: "Rotate production API keys", project: "Security", status: "Done", due: "Sep 12" },
  { title: "Draft Q4 hiring plan", project: "People Ops", status: "In progress", due: "Sep 30" },
] as const;

const EVENTS = [
  { text: "Closed task “Rotate production API keys”", href: "/dashboard/kanban", kind: "task" },
  { text: "Replied to a customer conversation", href: "/dashboard/chat", kind: "chat" },
  { text: "Sent invoice INV-2041 to Bright Enterprises", href: "/dashboard/invoice", kind: "invoice" },
  { text: "Published the “Welcome series” automation", href: "/dashboard/automations", kind: "automation" },
  { text: "Commented on “Atlas CRM Revamp: kickoff brief”", href: "/dashboard/docs", kind: "doc" },
  { text: "Signed in from a new device", href: "/dashboard/settings/security", kind: "security" },
  { text: "Moved “Inventory widget empty state” to Todo", href: "/dashboard/kanban", kind: "task" },
] as const;

const DAYS = ["Today", "Today", "Yesterday", "Yesterday", "Sep 12", "Sep 11"];
const TIMES = ["10:42 AM", "9:15 AM", "4:30 PM", "11:05 AM", "2:48 PM", "8:20 AM"];

export type ActivityKind = (typeof EVENTS)[number]["kind"];

export function getMember(id: string | undefined) {
  const index = id ? users.findIndex((user) => memberId(user) === id) : 0;
  if (index === -1) return undefined;

  const user = users[index];
  const active = user.status === "Active";
  const place = PLACES[index % PLACES.length];
  const manager =
    user.role === "Workspace Owner"
      ? undefined
      : (users.find((other) => other !== user && other.team === user.team && /Lead|Admin|Owner/.test(other.role)) ??
        users[0]);

  return {
    user,
    id: memberId(user),
    title: user.role === "Team Lead" ? `Team Lead, ${user.team}` : TITLES[user.role],
    phone: `+1 (415) 555-01${String(index).padStart(2, "0")}`,
    ...place,
    manager,
    teammates: users.filter((other) => other !== user && other.team === user.team),
    security: {
      twoFactor: active && index % 4 !== 3,
      sessions: active ? DEVICES.slice(0, 1 + (index % 3)) : [],
    },
    // Members who never accepted, or lost access, have nothing to show for this quarter.
    stats: active
      ? { tasksClosed: 14 + ((index * 7) % 38), responseHours: 1 + ((index * 5) % 8), projects: 1 + (index % 4) }
      : undefined,
    work: active ? [0, 1, 2, 3].map((offset) => WORK[(index + offset) % WORK.length]) : [],
    activity: active
      ? DAYS.map((day, offset) => ({ ...EVENTS[(index + offset) % EVENTS.length], day, time: TIMES[offset] }))
      : [],
  };
}

export type Member = NonNullable<ReturnType<typeof getMember>>;
