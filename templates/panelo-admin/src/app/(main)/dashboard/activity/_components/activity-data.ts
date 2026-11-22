import { setHours, setMinutes, startOfDay, subMinutes } from "date-fns";
import { CreditCard, FolderKanban, KeyRound, LogIn, type LucideIcon, Settings, UserPlus } from "lucide-react";

export const EVENT_TYPES = {
  auth: { label: "Authentication", icon: LogIn, tone: "bg-info/10 text-info" },
  members: { label: "Members", icon: UserPlus, tone: "bg-primary/10 text-primary" },
  projects: { label: "Projects", icon: FolderKanban, tone: "bg-muted text-muted-foreground" },
  billing: { label: "Billing", icon: CreditCard, tone: "bg-success/10 text-success" },
  apiKeys: { label: "API keys", icon: KeyRound, tone: "bg-warning/10 text-warning" },
  settings: { label: "Settings", icon: Settings, tone: "bg-muted text-muted-foreground" },
} satisfies Record<string, { label: string; icon: LucideIcon; tone: string }>;

export type EventType = keyof typeof EVENT_TYPES;

export type ActivityEvent = {
  id: string;
  type: EventType;
  actor: string;
  action: string;
  resource: string;
  at: Date;
  ip: string;
  device: string;
  location: string;
  /** Destructive events get a red tile regardless of type. */
  destructive?: boolean;
  changes?: { field: string; from: string; to: string }[];
};

// Anchored to a fixed time of day: the server caches this module, so a live clock renders different HH:mm on the
// client and fails hydration. ponytail: still mismatches if server and client straddle midnight.
const now = setMinutes(setHours(startOfDay(new Date()), 16), 30);
const ago = (minutes: number) => subMinutes(now, minutes);

export const ACTORS = ["Maya Chen", "Daniel Okafor", "Priya Raman", "Sofia Alvarez", "Noah Williams"];

export const activityEvents: ActivityEvent[] = [
  {
    id: "evt_9f21",
    type: "apiKeys",
    actor: "Noah Williams",
    action: "rotated API key",
    resource: "orion-gateway-prod",
    at: ago(12),
    ip: "84.21.160.9",
    device: "Chrome 139 · macOS",
    location: "Lisbon, PT",
    changes: [
      { field: "key_prefix", from: "pk_live_7Hq2…", to: "pk_live_Xa91…" },
      { field: "expires_at", from: "2026-10-01", to: "2027-03-01" },
    ],
  },
  {
    id: "evt_9f1c",
    type: "members",
    actor: "Sofia Alvarez",
    action: "changed role for",
    resource: "Daniel Okafor",
    at: ago(47),
    ip: "102.89.34.201",
    device: "Safari 19 · iPadOS",
    location: "Lagos, NG",
    changes: [{ field: "role", from: "Viewer", to: "Editor" }],
  },
  {
    id: "evt_9f0a",
    type: "auth",
    actor: "Maya Chen",
    action: "signed in with SSO",
    resource: "Okta",
    at: ago(95),
    ip: "73.158.12.44",
    device: "Arc 1.62 · macOS",
    location: "San Francisco, US",
  },
  {
    id: "evt_9ef3",
    type: "projects",
    actor: "Priya Raman",
    action: "archived project",
    resource: "Helio Task System (legacy)",
    at: ago(60 * 3 + 10),
    ip: "49.207.52.18",
    device: "Firefox 142 · Windows",
    location: "Bengaluru, IN",
    destructive: true,
    changes: [{ field: "status", from: "active", to: "archived" }],
  },
  {
    id: "evt_9ea8",
    type: "billing",
    actor: "Sofia Alvarez",
    action: "upgraded plan to",
    resource: "Team (25 seats)",
    at: ago(60 * 26),
    ip: "102.89.34.201",
    device: "Chrome 139 · Windows",
    location: "Lagos, NG",
    changes: [
      { field: "plan", from: "Starter", to: "Team" },
      { field: "seats", from: "10", to: "25" },
      { field: "monthly_total", from: "$190.00", to: "$475.00" },
    ],
  },
  {
    id: "evt_9e61",
    type: "settings",
    actor: "Maya Chen",
    action: "enforced two-factor auth for",
    resource: "Panelo workspace",
    at: ago(60 * 29),
    ip: "73.158.12.44",
    device: "Arc 1.62 · macOS",
    location: "San Francisco, US",
    changes: [{ field: "require_2fa", from: "false", to: "true" }],
  },
  {
    id: "evt_9e02",
    type: "auth",
    actor: "Daniel Okafor",
    action: "failed to sign in with",
    resource: "password (3 attempts)",
    at: ago(60 * 31),
    ip: "185.220.101.4",
    device: "Unknown · Linux",
    location: "Frankfurt, DE",
    destructive: true,
  },
  {
    id: "evt_9d7b",
    type: "members",
    actor: "Sofia Alvarez",
    action: "invited",
    resource: "lucas.moreau@panelo.dev",
    at: ago(60 * 52),
    ip: "102.89.34.201",
    device: "Chrome 139 · Windows",
    location: "Lagos, NG",
  },
  {
    id: "evt_9d10",
    type: "projects",
    actor: "Noah Williams",
    action: "created environment",
    resource: "Orion API Gateway / staging-eu",
    at: ago(60 * 75),
    ip: "84.21.160.9",
    device: "Chrome 139 · macOS",
    location: "Lisbon, PT",
    changes: [
      { field: "region", from: "", to: "eu-west-1" },
      { field: "instances", from: "", to: "2" },
    ],
  },
];
