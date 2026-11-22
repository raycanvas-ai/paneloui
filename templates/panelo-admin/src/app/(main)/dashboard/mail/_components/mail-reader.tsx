"use client";

import { type ReactNode, useRef, useState } from "react";

import { cn } from "cn";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowUp,
  FileText,
  Forward,
  MailOpen,
  MailQuestion,
  Reply,
  Star,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";

import { type Email, fullTime, LABELS, me } from "./mail-data";

const ROUND = "size-8 rounded-full text-muted-foreground hover:text-foreground";

function Action({
  label,
  onClick,
  children,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className={ROUND} aria-label={label} onClick={onClick}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

interface MailReaderProps {
  readonly email: Email | null;
  readonly onBack: () => void;
  readonly onToggleStar: (email: Email) => void;
  readonly onArchive: (email: Email) => void;
  readonly onDelete: (email: Email) => void;
  readonly onMarkUnread: (email: Email) => void;
  readonly onReply: (email: Email, body: string) => void;
  readonly onForward: (email: Email) => void;
  readonly className?: string;
}

export function MailReader({
  email,
  onBack,
  onToggleStar,
  onArchive,
  onDelete,
  onMarkUnread,
  onReply,
  onForward,
  className,
}: MailReaderProps) {
  const [reply, setReply] = useState("");
  const replyRef = useRef<HTMLTextAreaElement>(null);

  if (!email) {
    return (
      <section
        aria-label="Message"
        className={cn("flex flex-col items-center justify-center gap-2 p-6 text-center", className)}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MailQuestion className="size-5" strokeWidth={1.8} />
        </span>
        <p className="font-medium text-sm">No message selected</p>
        <p className="text-muted-foreground text-xs">Pick a conversation from the list to read it here.</p>
      </section>
    );
  }

  // Reply goes to the last person who wasn't you; on mail you started, that's the first recipient.
  const replyTo =
    email.messages.findLast((message) => message.from.email !== me.email)?.from ??
    email.to.find((person) => person.email !== me.email) ??
    email.to[0];

  const sendReply = () => {
    const body = reply.trim();
    if (!body) return;
    onReply(email, body);
    setReply("");
  };

  return (
    <section aria-label={email.subject} className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          className={cn(ROUND, "md:hidden")}
          aria-label="Back to messages"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="ml-auto flex items-center">
          <Action label="Reply" onClick={() => replyRef.current?.focus()}>
            <Reply className="size-4" />
          </Action>
          <Action label="Forward" onClick={() => onForward(email)}>
            <Forward className="size-4" />
          </Action>
          <Action label={email.folder === "archive" ? "Move to Inbox" : "Archive"} onClick={() => onArchive(email)}>
            {email.folder === "archive" ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
          </Action>
          <Action label={email.folder === "trash" ? "Delete forever" : "Delete"} onClick={() => onDelete(email)}>
            <Trash2 className="size-4" />
          </Action>
          <Action label="Mark as unread" onClick={() => onMarkUnread(email)}>
            <MailOpen className="size-4" />
          </Action>
          <Action label={email.starred ? "Unstar" : "Star"} onClick={() => onToggleStar(email)}>
            <Star className={cn("size-4", email.starred && "fill-warning-solid text-warning-solid")} />
          </Action>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-balance font-semibold text-xl leading-snug tracking-tight">{email.subject}</h2>
            {email.labels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {email.labels.map((id) => {
                  const label = LABELS.find((item) => item.id === id);
                  return (
                    <span key={id} className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs">
                      <span className={cn("size-1.5 rounded-full", label?.dot)} />
                      {label?.label}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>

          <ol className="flex flex-col gap-3">
            {email.messages.map((message, index) => {
              const latest = index === email.messages.length - 1;
              return (
                <li
                  key={message.id}
                  className={cn("rounded-xl p-4", latest ? "bg-card ring-1 ring-border" : "bg-muted/50")}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          message.from.email === me.email && "bg-[var(--tone-primary)] text-primary-foreground",
                        )}
                      >
                        {getInitials(message.from.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="truncate font-medium text-sm">
                          {message.from.email === me.email ? "You" : message.from.name}
                          <span className="ml-1.5 font-normal text-muted-foreground text-xs">{message.from.email}</span>
                        </p>
                        <time dateTime={message.at} className="shrink-0 text-muted-foreground text-xs">
                          {fullTime(message.at)}
                        </time>
                      </div>
                      {index === 0 ? (
                        <p className="truncate text-muted-foreground text-xs">
                          To {email.to.map((person) => (person.email === me.email ? "you" : person.name)).join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6">{message.body}</p>
                </li>
              );
            })}
          </ol>

          {email.attachments.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs">
                {email.attachments.length} {email.attachments.length === 1 ? "attachment" : "attachments"}
              </p>
              <ul className="flex flex-wrap gap-2">
                {email.attachments.map((file) => (
                  <li
                    key={file.name}
                    className="flex items-center gap-2.5 rounded-lg bg-muted/60 py-2 pr-3.5 pl-2.5 ring-1 ring-border"
                  >
                    <span className="flex size-8 items-center justify-center rounded-md bg-card text-muted-foreground">
                      <FileText className="size-4" strokeWidth={1.8} />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-medium text-xs">{file.name}</span>
                      <span className="text-muted-foreground text-xs">{file.size}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {email.folder !== "trash" && email.folder !== "spam" ? (
        <form
          className="p-3 pt-0"
          onSubmit={(event) => {
            event.preventDefault();
            sendReply();
          }}
        >
          <div className="rounded-xl bg-muted p-2 focus-within:ring-2 focus-within:ring-ring/40">
            <label htmlFor="mail-reply" className="sr-only">
              Reply to {replyTo?.name}
            </label>
            <textarea
              id="mail-reply"
              ref={replyRef}
              rows={2}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              onKeyDown={(event) => {
                // ⌘/Ctrl+Enter sends; plain Enter keeps writing, as mail expects.
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  sendReply();
                }
              }}
              placeholder={`Reply to ${replyTo?.name ?? "sender"}…`}
              className="block w-full resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-muted-foreground text-xs">⌘ + Enter to send</span>
              <Button
                type="submit"
                size="icon"
                disabled={!reply.trim()}
                className="size-8 rounded-full"
                aria-label="Send reply"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  );
}
