"use client";

import { cn } from "cn";
import { ChevronDown, Inbox, Paperclip, SearchX, Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials } from "@/lib/utils";

import type { MailTab } from "./mail";
import { type Email, FOLDERS, inView, LABELS, lastMessage, listTime, type View, viewLabel } from "./mail-data";
import { folderCount } from "./mail-folders";

/** Sent and drafts read better by who they went to. */
function counterpart(email: Email) {
  if (email.folder === "sent" || email.folder === "drafts") {
    return `To: ${email.to.map((person) => person.name).join(", ")}`;
  }
  return lastMessage(email).from.name;
}

function emptyHint(query: string, tab: MailTab) {
  if (query) return `Try a different word than “${query}”.`;
  return tab === "unread" ? "You're all caught up." : "New mail will land here.";
}

interface MailListProps {
  readonly emails: Email[];
  readonly emailsForCounts: Email[];
  readonly view: View;
  readonly onViewChange: (view: View) => void;
  readonly tab: MailTab;
  readonly onTabChange: (tab: MailTab) => void;
  readonly query: string;
  readonly selectedId: string | null;
  readonly onOpen: (email: Email) => void;
  readonly onToggleStar: (email: Email) => void;
  readonly className?: string;
}

export function MailList({
  emails,
  emailsForCounts,
  view,
  onViewChange,
  tab,
  onTabChange,
  query,
  selectedId,
  onOpen,
  onToggleStar,
  className,
}: MailListProps) {
  const inThisView = emailsForCounts.filter((email) => inView(email, view));
  const counts = { all: inThisView.length, unread: inThisView.filter((email) => email.unread).length };

  return (
    <section aria-label={`${viewLabel(view)} messages`} className={cn("flex flex-col", className)}>
      <div className="flex flex-col gap-3 p-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="hidden font-semibold text-base tracking-tight lg:block">{viewLabel(view)}</h2>
          {/* Below lg the folder card is hidden, so the view switcher moves here. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="-ml-2 h-8 gap-1.5 rounded-full px-2.5 font-semibold text-base lg:hidden"
              >
                {viewLabel(view)}
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuRadioGroup value={view} onValueChange={(value) => onViewChange(value as View)}>
                <DropdownMenuLabel>Folders</DropdownMenuLabel>
                {FOLDERS.map((folder) => (
                  <DropdownMenuRadioItem key={folder.id} value={folder.id}>
                    <span className="flex-1">{folder.label}</span>
                    {folderCount(emailsForCounts, folder.id) > 0 ? (
                      <span className="text-muted-foreground text-xs">{folderCount(emailsForCounts, folder.id)}</span>
                    ) : null}
                  </DropdownMenuRadioItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Labels</DropdownMenuLabel>
                {LABELS.map((label) => (
                  <DropdownMenuRadioItem key={label.id} value={`label:${label.id}`}>
                    <span className={cn("size-2 rounded-full", label.dot)} />
                    {label.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center rounded-full bg-muted p-0.5" role="tablist" aria-label="Filter messages">
            {(["all", "unread"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                onClick={() => onTabChange(item)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sm capitalize transition-colors",
                  tab === item
                    ? "bg-card font-medium text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item}
                <span className="text-muted-foreground text-xs tabular-nums">{counts[item]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Radix wraps content in a display:table div that grows to fit the longest line; block lets rows truncate. */}
      <ScrollArea type="hover" className="[&_[data-slot=scroll-area-viewport]>div]:block! min-h-0 flex-1">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {query ? (
                <SearchX className="size-5" strokeWidth={1.8} />
              ) : (
                <Inbox className="size-5" strokeWidth={1.8} />
              )}
            </span>
            <p className="font-medium text-sm">{query ? "No messages match" : `Nothing in ${viewLabel(view)}`}</p>
            <p className="text-muted-foreground text-xs">{emptyHint(query, tab)}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5 px-2 pb-3">
            {emails.map((email) => {
              const selected = email.id === selectedId;
              const last = lastMessage(email);
              return (
                <li
                  key={email.id}
                  className={cn(
                    "relative flex items-start gap-1 rounded-lg transition-colors",
                    selected ? "bg-muted" : "hover:bg-muted/60",
                  )}
                >
                  {selected ? (
                    <span
                      className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full bg-[var(--tone-primary)]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <button
                    type="button"
                    aria-current={selected ? "true" : undefined}
                    onClick={() => onOpen(email)}
                    className="flex min-w-0 flex-1 items-start gap-3 rounded-lg py-2.5 pl-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback className={cn("text-xs", selected && "bg-card")}>
                        {getInitials(counterpart(email).replace("To: ", ""))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("truncate text-sm", email.unread && "font-semibold")}>
                          {counterpart(email)}
                          {email.messages.length > 1 ? (
                            <span className="ml-1 font-normal text-muted-foreground text-xs">
                              {email.messages.length}
                            </span>
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-xs tabular-nums",
                            email.unread ? "font-medium text-[var(--tone-primary)]" : "text-muted-foreground",
                          )}
                        >
                          {listTime(last.at)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "truncate text-xs leading-5",
                          email.unread ? "font-medium" : "text-foreground/90",
                        )}
                      >
                        {email.folder === "drafts" ? <span className="text-destructive">Draft · </span> : null}
                        {email.subject}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="min-w-0 flex-1 truncate text-muted-foreground text-xs">
                          {last.body.replace(/\s+/g, " ")}
                        </p>
                        {email.attachments.length > 0 ? (
                          <Paperclip className="size-3 shrink-0 text-muted-foreground" aria-label="Has attachments" />
                        ) : null}
                        {email.labels.map((id) => (
                          <span
                            key={id}
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              LABELS.find((label) => label.id === id)?.dot,
                            )}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleStar(email)}
                    aria-pressed={email.starred}
                    aria-label={email.starred ? `Unstar ${email.subject}` : `Star ${email.subject}`}
                    className="mt-2 mr-1 flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <Star
                      className={cn("size-3.5", email.starred && "fill-warning-solid text-warning-solid")}
                      strokeWidth={1.8}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </section>
  );
}
