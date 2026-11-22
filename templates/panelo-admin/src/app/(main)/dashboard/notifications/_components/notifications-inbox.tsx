"use client";

import { useState } from "react";

import Link from "next/link";

import { cn } from "cn";
import { Check, CheckCheck, EllipsisVertical, Inbox, Settings2, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/utils";

import { type NotificationItem, notifications as seed } from "./notifications-data";

type Resolution = "approved" | "declined";
type Row = NotificationItem & { resolution?: Resolution };

const TABS = [
  { value: "all", label: "All", filter: () => true },
  { value: "unread", label: "Unread", filter: (n: Row) => n.unread },
  { value: "mentions", label: "Mentions", filter: (n: Row) => n.category === "mention" },
  { value: "system", label: "System", filter: (n: Row) => n.category === "system" },
] as const;

const GROUPS = [
  { label: "Today", test: (m: number) => m < 60 * 24 },
  { label: "Yesterday", test: (m: number) => m >= 60 * 24 && m < 60 * 48 },
  { label: "Earlier", test: (m: number) => m >= 60 * 48 },
];

function timeAgo(minutes: number) {
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / (60 * 24))}d ago`;
}

export function NotificationsInbox() {
  const [rows, setRows] = useState<Row[]>(seed);
  const unreadCount = rows.filter((n) => n.unread).length;

  const update = (id: string, patch: Partial<Row>) =>
    setRows((current) => current.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const markAllRead = () => {
    setRows((current) => current.map((n) => ({ ...n, unread: false })));
    toast.success(`Marked ${unreadCount} notifications as read`);
  };

  return (
    <Tabs defaultValue="all" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="scrollbar-none -mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <TabsList variant="line">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                <Badge variant="secondary" className="h-4.5 min-w-4.5 px-1 tabular-nums">
                  {rows.filter(tab.filter).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck data-icon="inline-start" />
            Mark all as read
          </Button>
          <Button size="icon-sm" variant="outline" asChild>
            <Link prefetch={false} href="/dashboard/settings/notifications" aria-label="Notification settings">
              <Settings2 />
            </Link>
          </Button>
        </div>
      </div>

      {TABS.map((tab) => {
        const visible = rows.filter(tab.filter);
        return (
          <TabsContent key={tab.value} value={tab.value} className="flex flex-col gap-5">
            {visible.length === 0 ? (
              <InboxEmpty tab={tab.value} />
            ) : (
              GROUPS.map((group) => {
                const items = visible.filter((n) => group.test(n.minutesAgo));
                if (items.length === 0) return null;
                const headingId = `${tab.value}-${group.label.toLowerCase()}`;
                return (
                  <section key={group.label} aria-labelledby={headingId} className="flex flex-col gap-2">
                    <h2 id={headingId} className="font-medium text-muted-foreground text-xs">
                      {group.label}
                    </h2>
                    <Card className="gap-0 divide-y divide-border py-0">
                      {items.map((n) => (
                        <NotificationRow
                          key={n.id}
                          item={n}
                          onToggleRead={() => update(n.id, { unread: !n.unread })}
                          onResolve={(resolution) => {
                            update(n.id, { resolution, unread: false });
                            toast(`${resolution === "approved" ? "Approved" : "Declined"} ${n.actor}'s request`);
                          }}
                          onRemove={() => setRows((current) => current.filter((row) => row.id !== n.id))}
                        />
                      ))}
                    </Card>
                  </section>
                );
              })
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function NotificationRow({
  item,
  onToggleRead,
  onResolve,
  onRemove,
}: {
  item: Row;
  onToggleRead: () => void;
  onResolve: (resolution: Resolution) => void;
  onRemove: () => void;
}) {
  const Icon = item.icon;

  return (
    <article
      className={cn(
        "flex gap-3 px-4 py-3 transition-[background-color] duration-150 ease-out hover:bg-muted/40",
        item.unread && "bg-primary/[0.03]",
      )}
    >
      {item.actor ? (
        <Avatar className="outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10">
          <AvatarFallback className="font-medium text-xs">{getInitials(item.actor)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg", item.iconTone)}>
          {Icon && <Icon className="size-4" aria-hidden="true" />}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className={cn("text-sm leading-snug", item.unread ? "text-foreground" : "text-muted-foreground")}>
          {item.actor && <span className="font-medium text-foreground">{item.actor} </span>}
          {item.action} <span className="font-medium text-foreground">{item.target}</span>
        </p>

        {item.preview && (
          <p className="mt-1.5 line-clamp-2 rounded-md bg-muted/60 px-2.5 py-1.5 text-muted-foreground text-sm">
            {item.preview}
          </p>
        )}

        <p className="mt-1 text-muted-foreground text-xs tabular-nums">
          {item.project && <span>{item.project} · </span>}
          {timeAgo(item.minutesAgo)}
        </p>

        {item.request &&
          (item.resolution ? (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1 font-medium text-xs",
                item.resolution === "approved" ? "text-success" : "text-muted-foreground",
              )}
            >
              {item.resolution === "approved" ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              {item.resolution === "approved" ? "Access granted" : "Request declined"}
            </p>
          ) : (
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={() => onResolve("approved")}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => onResolve("declined")}>
                Decline
              </Button>
            </div>
          ))}
      </div>

      <div className="flex shrink-0 items-start gap-1">
        <span
          className={cn(
            "mt-2.5 size-2 rounded-full bg-primary transition-[opacity,scale] duration-150 ease-out",
            item.unread ? "scale-100 opacity-100" : "scale-[0.25] opacity-0",
          )}
        >
          {item.unread && <span className="sr-only">Unread</span>}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost" aria-label="Notification options">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={onToggleRead}>
              {item.unread ? "Mark as read" : "Mark as unread"}
            </DropdownMenuItem>
            {item.project && (
              <DropdownMenuItem onSelect={() => toast(`Muted ${item.project} for 24 hours`)}>
                Mute {item.project}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onRemove}>
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

function InboxEmpty({ tab }: { tab: string }) {
  const caughtUp = tab === "unread";
  return (
    <Card className="py-0">
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="animate-stage stage-0">
            {caughtUp ? <CheckCheck /> : <Inbox />}
          </EmptyMedia>
          <EmptyTitle className="animate-stage stage-1">
            {caughtUp ? "You're all caught up" : "Nothing here yet"}
          </EmptyTitle>
          <EmptyDescription className="animate-stage stage-2">
            {caughtUp
              ? "New mentions, requests and alerts will show up here as they arrive."
              : "Notifications in this category will appear here."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Card>
  );
}
