import Link from "next/link";

import { SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";

import { conversations } from "./data";

const PILL = "h-8 gap-1.5 rounded-full bg-card px-3.5 text-sm shadow-xs hover:bg-card";

const unread = conversations.filter((conversation) => conversation.isUnread).length;
const online = conversations.filter((conversation) => conversation.isOnline).length;

const metrics = [
  { label: "open", value: conversations.length },
  { label: "unread", value: unread },
  { label: "customers online", value: online },
  { label: "avg. first reply", value: "4m" },
];

export function ChatHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
      <div className="flex min-w-0 items-center gap-3 pl-10 md:pl-0">
        <div className="min-w-0">
          <h1 className="font-semibold text-2xl tracking-tight">Inbox</h1>
          <p className="flex flex-wrap items-center gap-x-3 text-muted-foreground text-sm">
            {metrics.map((metric) => (
              <span key={metric.label} className="whitespace-nowrap">
                <span className="font-medium text-foreground tabular-nums">{metric.value}</span> {metric.label}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className={PILL}>
          <Link href="/dashboard/help">Help center</Link>
        </Button>
        <Button className="h-8 rounded-full px-3.5">
          <SquarePen data-icon="inline-start" />
          New message
        </Button>
      </div>
    </header>
  );
}
