import Link from "next/link";

import { cn } from "cn";
import { Ellipsis, Mail, MapPin, MessagesSquare, ShieldCheck } from "lucide-react";

import { PANEL } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { MemberAvatar, StatusBadge } from "@/app/(main)/dashboard/users/_components/users-columns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type Member, STATUS_NOTE } from "./member-data";

export function MemberHeader({ member }: { readonly member: Member }) {
  const { user } = member;
  // Rendered per request, so this is the member's wall clock when the page loads.
  const localTime = new Intl.DateTimeFormat("en-US", {
    timeZone: member.timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
  const note = STATUS_NOTE[user.status];

  return (
    <section aria-label={`${user.name} profile`} className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <div className="flex flex-wrap items-start gap-4">
        <MemberAvatar name={user.name} size="size-16 text-lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-semibold text-2xl tracking-tight">{user.name}</h1>
            <StatusBadge status={user.status} />
          </div>
          <p className="mt-0.5 truncate text-muted-foreground text-sm">
            {member.title} · {user.team}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <Link
              href="/dashboard/roles"
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs transition-colors hover:bg-muted/70"
            >
              <ShieldCheck className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {user.role}
            </Link>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              {member.city}
              <span aria-hidden="true">·</span>
              <time>{localTime} local time</time>
            </span>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button asChild className="h-8 flex-1 rounded-full px-3.5 sm:flex-none">
            <Link href="/dashboard/chat">
              <MessagesSquare data-icon="inline-start" />
              Message
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-8 flex-1 rounded-full px-3.5 sm:flex-none">
            <a href={`mailto:${user.email}`}>
              <Mail data-icon="inline-start" />
              Email
            </a>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0 rounded-full"
                aria-label={`More actions for ${user.name}`}
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/roles">Change role</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/security">Security settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/users">Back to all users</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {note ? (
        <p className="rounded-lg bg-muted px-3 py-2.5 text-muted-foreground text-sm" role="status">
          {note}
        </p>
      ) : null}
    </section>
  );
}
