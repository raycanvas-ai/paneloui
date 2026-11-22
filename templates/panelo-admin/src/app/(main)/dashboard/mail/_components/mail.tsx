"use client";

import { useMemo, useState } from "react";

import { cn } from "cn";
import { Search, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

import { type ComposeDraft, MailCompose } from "./mail-compose";
import { type Email, initialEmails, inView, lastMessage, me, NOW, type View, viewLabel } from "./mail-data";
import { MailFolders } from "./mail-folders";
import { MailList } from "./mail-list";
import { MailReader } from "./mail-reader";

export const PANEL = "min-h-0 min-w-0 overflow-hidden rounded-xl bg-card shadow-xs";

export type MailTab = "all" | "unread";

function toPeople(value: string) {
  return value
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((email) => ({ name: email.split("@")[0], email }));
}

export function Mail() {
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [view, setView] = useState<View>("inbox");
  const [tab, setTab] = useState<MailTab>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("m5");
  // Below md the list and reader share one cell; this decides which one is in front.
  const [reading, setReading] = useState(false);
  const [draft, setDraft] = useState<ComposeDraft | null>(null);

  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      emails
        .filter((email) => inView(email, view))
        .filter((email) => tab === "all" || email.unread)
        .filter(
          (email) =>
            needle === "" ||
            email.subject.toLowerCase().includes(needle) ||
            email.messages.some(
              (message) =>
                message.body.toLowerCase().includes(needle) || message.from.name.toLowerCase().includes(needle),
            ),
        )
        .sort((a, b) => lastMessage(b).at.localeCompare(lastMessage(a).at)),
    [emails, view, tab, needle],
  );

  const selected = emails.find((email) => email.id === selectedId) ?? null;
  const unread = emails.filter((email) => email.folder === "inbox" && email.unread).length;
  const starred = emails.filter((email) => inView(email, "starred")).length;
  const drafts = emails.filter((email) => email.folder === "drafts").length;

  const update = (id: string, patch: Partial<Email>) =>
    setEmails((current) => current.map((email) => (email.id === id ? { ...email, ...patch } : email)));

  /** After mail leaves the view, the next message in the list takes its place. */
  const selectNext = (id: string) => {
    const index = visible.findIndex((email) => email.id === id);
    const next = visible[index + 1] ?? visible[index - 1];
    setSelectedId(next && next.id !== id ? next.id : null);
    if (!next) setReading(false);
  };

  const open = (email: Email) => {
    if (email.folder === "drafts") {
      const body = lastMessage(email).body;
      setDraft({ id: email.id, to: email.to.map((person) => person.email).join(", "), subject: email.subject, body });
      return;
    }
    setSelectedId(email.id);
    setReading(true);
    if (email.unread) update(email.id, { unread: false });
  };

  const move = (email: Email, folder: Email["folder"], message: string) => {
    selectNext(email.id);
    update(email.id, { folder });
    toast.success(message);
  };

  const remove = (email: Email) => {
    if (email.folder !== "trash") return move(email, "trash", "Moved to Trash");
    selectNext(email.id);
    setEmails((current) => current.filter((item) => item.id !== email.id));
    toast.success("Deleted forever");
  };

  const reply = (email: Email, body: string) => {
    update(email.id, {
      messages: [...email.messages, { id: `${email.id}-${email.messages.length + 1}`, from: me, at: NOW, body }],
    });
    toast.success("Reply sent");
  };

  const send = (value: ComposeDraft, asDraft: boolean) => {
    const email: Email = {
      id: value.id ?? crypto.randomUUID(),
      folder: asDraft ? "drafts" : "sent",
      subject: value.subject.trim() || "(no subject)",
      to: toPeople(value.to),
      unread: false,
      starred: false,
      labels: [],
      attachments: [],
      messages: [{ id: "first", from: me, at: NOW, body: value.body }],
    };
    setEmails((current) => [email, ...current.filter((item) => item.id !== email.id)]);
    setDraft(null);
    toast.success(asDraft ? "Draft saved" : "Message sent", {
      description: asDraft ? undefined : `To ${email.to.map((person) => person.email).join(", ")}`,
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
        <div className="min-w-0 pl-10 md:pl-0">
          <h1 className="font-semibold text-2xl tracking-tight">Mail</h1>
          <p className="flex flex-wrap gap-x-3 text-muted-foreground text-sm">
            <span>
              <span className="font-medium text-foreground tabular-nums">{unread}</span> unread
            </span>
            <span>
              <span className="font-medium text-foreground tabular-nums">{starred}</span> starred
            </span>
            <span>
              <span className="font-medium text-foreground tabular-nums">{drafts}</span> drafts
            </span>
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-3.5 text-sm shadow-xs focus-within:ring-2 focus-within:ring-ring/50 sm:w-64 sm:flex-none">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Search mail</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${viewLabel(view).toLowerCase()}`}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
          <Button className="h-8 rounded-full px-3.5" onClick={() => setDraft({ to: "", subject: "", body: "" })}>
            <SquarePen data-icon="inline-start" />
            Compose
          </Button>
        </div>
      </header>

      <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-4 max-md:overflow-hidden md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[200px_320px_minmax(0,1fr)] xl:grid-cols-[220px_360px_minmax(0,1fr)]">
        <MailFolders
          emails={emails}
          view={view}
          onViewChange={(next) => {
            setView(next);
            setReading(false);
          }}
          className={cn(PANEL, "hidden lg:flex")}
        />
        {/* Mobile stacks list and reader in one cell and slides between them. */}
        <MailList
          emails={visible}
          emailsForCounts={emails}
          view={view}
          onViewChange={setView}
          tab={tab}
          onTabChange={setTab}
          query={needle}
          selectedId={selectedId}
          onOpen={open}
          onToggleStar={(email) => update(email.id, { starred: !email.starred })}
          className={cn(
            PANEL,
            "transition-transform duration-300 ease-out max-md:col-start-1 max-md:row-start-1",
            reading && "max-md:pointer-events-none max-md:-translate-x-[110%]",
          )}
        />
        <MailReader
          key={selected?.id ?? "empty"}
          email={selected}
          onBack={() => setReading(false)}
          onToggleStar={(email) => update(email.id, { starred: !email.starred })}
          onArchive={(email) =>
            email.folder === "archive" ? move(email, "inbox", "Moved to Inbox") : move(email, "archive", "Archived")
          }
          onDelete={remove}
          onMarkUnread={(email) => {
            update(email.id, { unread: true });
            setSelectedId(null);
            setReading(false);
          }}
          onReply={reply}
          onForward={(email) =>
            setDraft({
              to: "",
              subject: email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`,
              body: `\n\n---------- Forwarded message ----------\nFrom: ${lastMessage(email).from.name} <${lastMessage(email).from.email}>\nSubject: ${email.subject}\n\n${lastMessage(email).body}`,
            })
          }
          className={cn(
            PANEL,
            "transition-transform duration-300 ease-out max-md:col-start-1 max-md:row-start-1",
            !reading && "max-md:pointer-events-none max-md:translate-x-[110%]",
          )}
        />
      </div>

      <MailCompose draft={draft} onClose={() => setDraft(null)} onSend={send} />
    </div>
  );
}
