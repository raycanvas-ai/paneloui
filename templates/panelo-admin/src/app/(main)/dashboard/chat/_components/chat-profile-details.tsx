"use client";

import type { ReactNode } from "react";

import { cn } from "cn";
import { Calendar, Mail, PhoneCall, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

import type { Contact } from "./data";

/** Stage reads as a status dot, the same treatment as the default overview's table. */
const STAGE_DOT: Record<string, string> = {
  Customer: "bg-success-solid",
  Qualified: "bg-[var(--tone-primary)]",
  Lead: "bg-warning-solid",
  "At-Risk": "bg-destructive",
};

function Row({ label, value }: { readonly label: string; readonly value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{value}</dd>
    </div>
  );
}

interface ChatProfileDetailsProps {
  readonly contact: Contact;
  readonly onClose?: () => void;
  readonly className?: string;
}

export function ChatProfileDetails({ contact, onClose, className }: ChatProfileDetailsProps) {
  return (
    <aside aria-label="Contact profile" className={cn("flex h-full flex-col overflow-y-auto", className)}>
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-muted-foreground"
          aria-label="Close profile"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-3 px-5 pb-5 text-center">
        <Avatar className="size-16">
          <AvatarFallback className="text-lg">{getInitials(contact.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-base tracking-tight">{contact.name}</p>
          <p className="text-muted-foreground text-sm">
            {contact.role} at {contact.company}
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
          <span className={cn("size-2 rounded-full", STAGE_DOT[contact.status] ?? "bg-muted-foreground")} />
          {contact.status}
        </span>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href={`mailto:${contact.email}`}>
              <Mail data-icon="inline-start" />
              Email
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>
              <PhoneCall data-icon="inline-start" />
              Call
            </a>
          </Button>
          <Button variant="outline" size="icon" className="size-8 rounded-full" aria-label="Schedule meeting">
            <Calendar className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t px-5 py-5">
        <section className="flex flex-col gap-3">
          <h3 className="font-medium text-sm">Contact</h3>
          <dl className="flex flex-col gap-2.5">
            <Row label="Email" value={contact.email} />
            <Row label="Phone" value={contact.phone} />
            <Row label="Website" value={contact.website} />
            <Row label="Location" value={contact.location} />
            <Row label="Timezone" value={contact.timezone} />
          </dl>
        </section>

        <section className="flex flex-col gap-3 border-t pt-5">
          <h3 className="font-medium text-sm">Account</h3>
          <dl className="flex flex-col gap-2.5">
            <Row label="Company" value={contact.company} />
            <Row label="Qualified since" value={contact.qualifiedAt} />
          </dl>
        </section>

        <section className="flex flex-col gap-3 border-t pt-5">
          <h3 className="font-medium text-sm">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {contact.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
