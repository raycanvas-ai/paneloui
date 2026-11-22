"use client";

import { type ReactNode, useState } from "react";

import { cn } from "cn";
import {
  ArrowLeft,
  ArrowUp,
  BellOff,
  CircleCheck,
  Clock3,
  Ellipsis,
  Mail,
  PanelRight,
  Paperclip,
  Smile,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { toast } from "@/components/ui/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";

import { type Message as ChatMessage, type Conversation, currentUser } from "./data";

const ROUND = "size-8 rounded-full text-muted-foreground hover:text-foreground";

type Mode = "reply" | "note";

interface ChatThreadProps {
  readonly conversation: Conversation;
  readonly profileOpen: boolean;
  readonly onToggleContact: () => void;
  readonly onBack?: () => void;
  readonly className?: string;
}

function IconAction({
  label,
  children,
  onClick,
}: {
  readonly label: string;
  readonly children: ReactNode;
  readonly onClick?: () => void;
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

export function ChatThread({ conversation, profileOpen, onToggleContact, onBack, className }: ChatThreadProps) {
  const { contact } = conversation;
  // Sent messages live here for the demo; the parent remounts this per conversation.
  const [messages, setMessages] = useState<(ChatMessage & { note?: boolean })[]>(conversation.messages);
  const [resolved, setResolved] = useState(false);
  const [assignee, setAssignee] = useState<string | null>(null);
  const firstName = contact.name.split(" ")[0];

  return (
    <section aria-label={`Conversation with ${contact.name}`} className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Only the stacked mobile layout needs a way back to the list. */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(ROUND, "md:hidden")}
            aria-label="Back to conversations"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Avatar className="size-9">
            <AvatarFallback className="text-xs">{getInitials(contact.name)}</AvatarFallback>
            {conversation.isOnline ? <AvatarBadge className="bg-success-solid" /> : null}
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium text-sm">{conversation.subject}</p>
            <p className="truncate text-muted-foreground text-xs">
              {contact.name} · {contact.company}
              {conversation.isOnline ? <span className="text-success"> · Active now</span> : null}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {resolved ? (
            <span className="mr-1 hidden rounded-full bg-success/10 px-2 py-0.5 font-medium text-success text-xs sm:inline">
              Resolved
            </span>
          ) : null}
          <IconAction
            label={resolved ? "Reopen conversation" : "Mark as resolved"}
            onClick={() => {
              setResolved((value) => !value);
              toast.success(resolved ? `Reopened ${firstName}'s conversation` : `Resolved ${firstName}'s conversation`);
            }}
          >
            <CircleCheck className={cn("size-4", resolved && "text-success")} />
          </IconAction>
          <IconAction label={profileOpen ? "Hide profile" : "Show profile"} onClick={onToggleContact}>
            <PanelRight className={cn("size-4", profileOpen && "text-[var(--tone-primary)]")} />
          </IconAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={ROUND} aria-label="Conversation options">
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                {assignee ? `Assigned to ${assignee}` : "Unassigned"}
              </DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={() => {
                  setAssignee(currentUser.name);
                  toast.success("Assigned to you");
                }}
              >
                <UserRoundCheck />
                Assign to me
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toast(`Snoozed until tomorrow, 9:00 AM`)}>
                <Clock3 />
                Snooze until tomorrow
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toast(`Notifications muted for ${firstName}`)}>
                <BellOff />
                Mute notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`mailto:${contact.email}`}>
                  <Mail />
                  Email {firstName}
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <MessageScrollerProvider autoScroll>
        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-6 px-4 py-6">
              <Marker variant="separator">
                <MarkerContent>{conversation.group === "Yesterday" ? "Yesterday" : "Today"}</MarkerContent>
              </Marker>

              {messages.map((message) => {
                const outbound = message.align === "end";
                const sender = outbound ? currentUser.name : contact.name;
                return (
                  <MessageScrollerItem key={message.id} messageId={String(message.id)} scrollAnchor={outbound}>
                    <Message align={message.align}>
                      <MessageAvatar>
                        <Avatar>
                          <AvatarFallback
                            className={cn("text-xs", outbound && "bg-[var(--tone-primary)] text-primary-foreground")}
                          >
                            {getInitials(sender)}
                          </AvatarFallback>
                        </Avatar>
                      </MessageAvatar>
                      <MessageContent>
                        <BubbleGroup>
                          <Bubble
                            variant={outbound && !message.note ? "default" : "muted"}
                            align={message.align}
                            className={cn(message.note && "bg-warning/10 text-foreground ring-1 ring-warning/25")}
                          >
                            <BubbleContent>{message.text}</BubbleContent>
                            {message.reaction ? (
                              <BubbleReactions
                                aria-label={`Reaction: ${message.reaction}`}
                                align={outbound ? "start" : "end"}
                              >
                                <span>{message.reaction}</span>
                              </BubbleReactions>
                            ) : null}
                          </Bubble>
                        </BubbleGroup>
                        <MessageFooter>{message.note ? `Internal note · ${message.time}` : message.time}</MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <Composer
        contactName={contact.name.split(" ")[0]}
        onSend={(text, mode) =>
          setMessages((current) => [
            ...current,
            { id: Date.now(), align: "end", text, time: "Just now", note: mode === "note" },
          ])
        }
      />
    </section>
  );
}

function Composer({
  contactName,
  onSend,
}: {
  readonly contactName: string;
  readonly onSend: (text: string, mode: Mode) => void;
}) {
  const [mode, setMode] = useState<Mode>("reply");
  const [text, setText] = useState("");

  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value, mode);
    setText("");
  };

  return (
    <form
      className="p-3 pt-0"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <div
        className={cn(
          "rounded-xl p-2 transition-colors focus-within:ring-2 focus-within:ring-ring/40",
          mode === "note" ? "bg-warning/10" : "bg-muted",
        )}
      >
        <label htmlFor="chat-composer" className="sr-only">
          {mode === "note" ? "Internal note" : `Reply to ${contactName}`}
        </label>
        <textarea
          id="chat-composer"
          rows={2}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends, Shift+Enter keeps the newline.
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              send();
            }
          }}
          placeholder={mode === "note" ? "Only your team sees internal notes…" : `Reply to ${contactName}…`}
          className="block w-full resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center gap-1">
          <div
            className="mr-1 flex items-center rounded-full bg-card p-0.5 shadow-xs"
            role="tablist"
            aria-label="Message type"
          >
            {(["reply", "note"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => setMode(item)}
                className={cn(
                  "cursor-pointer rounded-full px-2.5 py-1 text-xs transition-colors",
                  mode === item
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item === "reply" ? "Reply" : "Note"}
              </button>
            ))}
          </div>
          <IconAction label="Attach file">
            <Paperclip className="size-4" />
          </IconAction>
          <IconAction label="Emoji">
            <Smile className="size-4" />
          </IconAction>
          <IconAction label="Draft with AI">
            <Sparkles className="size-4" />
          </IconAction>
          <Button
            type="submit"
            size="icon"
            disabled={!text.trim()}
            className="ml-auto size-8 rounded-full"
            aria-label={mode === "note" ? "Add note" : "Send reply"}
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
