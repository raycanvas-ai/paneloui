import { CreditCard, type LucideIcon, Rocket, ShieldAlert, TriangleAlert } from "lucide-react";

export type NotificationCategory = "mention" | "activity" | "system";

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  /** Person who triggered it. System notifications have no actor and use `icon` instead. */
  actor?: string;
  icon?: LucideIcon;
  iconTone?: string;
  action: string;
  target: string;
  project?: string;
  preview?: string;
  minutesAgo: number;
  unread: boolean;
  /** Access requests render Approve / Decline inline. */
  request?: boolean;
};

export const notifications: NotificationItem[] = [
  {
    id: "n-01",
    category: "mention",
    actor: "Maya Chen",
    action: "mentioned you in",
    target: "Contact import edge cases",
    project: "Atlas CRM Revamp",
    preview: "Can you confirm duplicate emails merge into the oldest record before we ship the importer?",
    minutesAgo: 4,
    unread: true,
  },
  {
    id: "n-02",
    category: "activity",
    actor: "Daniel Okafor",
    action: "requested edit access to",
    target: "Q3 Revenue Forecast",
    project: "Nimbus Dashboard",
    minutesAgo: 26,
    unread: true,
    request: true,
  },
  {
    id: "n-03",
    category: "system",
    icon: TriangleAlert,
    iconTone: "bg-warning/10 text-warning",
    action: "p95 latency crossed 800 ms on",
    target: "orion-gateway-prod",
    project: "Orion API Gateway",
    minutesAgo: 52,
    unread: true,
  },
  {
    id: "n-04",
    category: "activity",
    actor: "Priya Raman",
    action: "moved",
    target: "Webhook retry backoff",
    project: "Helio Task System",
    preview: "In review → Done",
    minutesAgo: 140,
    unread: false,
  },
  {
    id: "n-05",
    category: "mention",
    actor: "Lucas Moreau",
    action: "replied to your comment on",
    target: "Pipeline stage colours",
    project: "Atlas CRM Revamp",
    preview: "Agreed, let's map stages to the chart scale so they survive dark mode.",
    minutesAgo: 60 * 5,
    unread: false,
  },
  {
    id: "n-06",
    category: "system",
    icon: Rocket,
    iconTone: "bg-success/10 text-success",
    action: "Deployment succeeded for",
    target: "nimbus-web v2.8.0",
    project: "Nimbus Dashboard",
    minutesAgo: 60 * 27,
    unread: true,
  },
  {
    id: "n-07",
    category: "activity",
    actor: "Sofia Alvarez",
    action: "invited 3 people to",
    target: "Orion API Gateway",
    minutesAgo: 60 * 30,
    unread: false,
  },
  {
    id: "n-08",
    category: "system",
    icon: ShieldAlert,
    iconTone: "bg-info/10 text-info",
    action: "New sign-in from Chrome on macOS in",
    target: "Lisbon, Portugal",
    minutesAgo: 60 * 34,
    unread: false,
  },
  {
    id: "n-09",
    category: "mention",
    actor: "Noah Williams",
    action: "assigned you to",
    target: "Rate-limit dashboard alerts",
    project: "Orion API Gateway",
    minutesAgo: 60 * 24 * 3,
    unread: false,
  },
  {
    id: "n-10",
    category: "system",
    icon: CreditCard,
    iconTone: "bg-muted text-muted-foreground",
    action: "Invoice INV-2041 was paid for",
    target: "Panelo Team plan",
    minutesAgo: 60 * 24 * 5,
    unread: false,
  },
];
