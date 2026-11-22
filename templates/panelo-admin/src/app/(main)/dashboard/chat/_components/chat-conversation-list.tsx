"use client";

import { useState } from "react";

import { cn } from "cn";
import { Pin, Search } from "lucide-react";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials } from "@/lib/utils";

import type { Conversation } from "./data";

const FILTERS = [
  { key: "all", label: "All", match: () => true },
  { key: "unread", label: "Unread", match: (conversation: Conversation) => conversation.isUnread },
  { key: "online", label: "Online", match: (conversation: Conversation) => conversation.isOnline },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

interface ChatConversationListProps {
  readonly conversations: Conversation[];
  readonly selectedId: Conversation["id"];
  readonly onSelect: (conversation: Conversation) => void;
  readonly className?: string;
}

export function ChatConversationList({ conversations, selectedId, onSelect, className }: ChatConversationListProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const match = FILTERS.find((item) => item.key === filter)?.match ?? (() => true);
  const visible = conversations.filter(
    (conversation) =>
      match(conversation) &&
      (needle === "" ||
        conversation.name.toLowerCase().includes(needle) ||
        conversation.subject.toLowerCase().includes(needle) ||
        conversation.contact.company.toLowerCase().includes(needle)),
  );
  const groups = Map.groupBy(visible, (conversation) => conversation.group);

  return (
    <section aria-label="Conversations" className={cn("flex flex-col", className)}>
      <div className="flex flex-col gap-3 p-4 pb-3">
        <label className="flex h-9 items-center gap-2 rounded-full bg-muted px-3.5 text-sm focus-within:ring-2 focus-within:ring-ring/50">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Search conversations</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people, topics, companies"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="flex items-center rounded-full bg-muted p-0.5" role="tablist" aria-label="Filter conversations">
          {FILTERS.map((item) => {
            const count = conversations.filter(item.match).length;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={filter === item.key}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                  filter === item.key
                    ? "bg-card font-medium text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Radix wraps content in a display:table div that grows to fit the longest line; block lets rows truncate. */}
      <ScrollArea type="hover" className="min-h-0 flex-1 [&_[data-slot=scroll-area-viewport]>div]:block!">
        <div className="flex flex-col gap-4 px-2 pb-3">
          {visible.length === 0 ? (
            <p className="px-3 py-10 text-center text-muted-foreground text-sm">No conversations match.</p>
          ) : null}

          {[...groups].map(([group, items]) => (
            <div key={group} className="flex flex-col gap-0.5">
              <p className="px-3 pb-1.5 text-muted-foreground text-xs">{group}</p>
              {items.map((conversation) => {
                const selected = selectedId === conversation.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    aria-current={selected ? "true" : undefined}
                    onClick={() => onSelect(conversation)}
                    className={cn(
                      "relative flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                      selected ? "bg-muted" : "hover:bg-muted/60",
                    )}
                  >
                    {selected ? (
                      <span
                        className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full bg-[var(--tone-primary)]"
                        aria-hidden="true"
                      />
                    ) : null}
                    <Avatar className="size-9 shrink-0 **:data-[slot=avatar-badge]:size-2.5">
                      <AvatarFallback className={cn("text-xs", selected && "bg-card")}>
                        {getInitials(conversation.name)}
                      </AvatarFallback>
                      {conversation.isOnline ? <AvatarBadge className="bg-success-solid" /> : null}
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("truncate text-sm", conversation.isUnread && "font-semibold")}>
                          {conversation.name}
                        </span>
                        <span className="shrink-0 text-muted-foreground text-xs">{conversation.time}</span>
                      </div>
                      <p className="truncate text-foreground/90 text-xs leading-5">{conversation.subject}</p>
                      <div className="flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-muted-foreground text-xs">{conversation.preview}</p>
                        {conversation.group === "Pinned" ? (
                          <Pin className="size-3 shrink-0 fill-current text-muted-foreground" aria-label="Pinned" />
                        ) : null}
                        {conversation.isUnread ? (
                          <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--tone-primary)] px-1 font-medium text-[11px] text-primary-foreground tabular-nums">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}
