"use client";

import { type ChangeEvent, useState } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ComposeDraft {
  /** Set when editing a saved draft, so sending replaces it. */
  id?: string;
  to: string;
  subject: string;
  body: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function invalidRecipients(to: string) {
  return to
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter((part) => part && !EMAIL.test(part));
}

function recipientError(to: string) {
  if (to.trim() === "") return "Add at least one recipient.";
  const invalid = invalidRecipients(to);
  return invalid.length ? `Check ${invalid.join(", ")}.` : null;
}

interface MailComposeProps {
  readonly draft: ComposeDraft | null;
  readonly onClose: () => void;
  readonly onSend: (draft: ComposeDraft, asDraft: boolean) => void;
}

export function MailCompose({ draft, onClose, onSend }: MailComposeProps) {
  return (
    <Dialog open={draft !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        {/* Keyed so each open starts from the draft it was given. */}
        {draft ? <ComposeForm key={draft.id ?? draft.subject} draft={draft} onSend={onSend} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function ComposeForm({ draft, onSend }: { readonly draft: ComposeDraft; readonly onSend: MailComposeProps["onSend"] }) {
  const [value, setValue] = useState(draft);
  const [touched, setTouched] = useState(false);

  const error = recipientError(value.to);

  const field = (key: keyof ComposeDraft) => ({
    value: value[key] ?? "",
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValue((current) => ({ ...current, [key]: event.target.value })),
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setTouched(true);
        if (!error) onSend(value, false);
      }}
    >
      <DialogHeader>
        <DialogTitle>{draft.id ? "Edit draft" : "New message"}</DialogTitle>
        <DialogDescription>Separate multiple recipients with commas.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="compose-to">To</Label>
        <Input
          id="compose-to"
          autoFocus={!draft.to}
          placeholder="name@company.com"
          aria-invalid={touched && Boolean(error)}
          aria-describedby={touched && error ? "compose-to-error" : undefined}
          {...field("to")}
        />
        {touched && error ? (
          <p id="compose-to-error" className="text-destructive text-xs">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="compose-subject">Subject</Label>
        <Input id="compose-subject" placeholder="What's this about?" {...field("subject")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="compose-body">Message</Label>
        <Textarea
          id="compose-body"
          rows={8}
          autoFocus={Boolean(draft.to)}
          className="resize-none"
          placeholder="Write your message…"
          {...field("body")}
        />
      </div>

      <DialogFooter className="gap-2 sm:justify-between">
        <Button type="button" variant="ghost" className="rounded-full" onClick={() => onSend(value, true)}>
          Save draft
        </Button>
        <Button type="submit" className="rounded-full">
          <Send data-icon="inline-start" />
          Send
        </Button>
      </DialogFooter>
    </form>
  );
}
