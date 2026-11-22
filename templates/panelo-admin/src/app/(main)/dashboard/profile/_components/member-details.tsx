import type { ReactNode } from "react";

import Link from "next/link";

import { cn } from "cn";
import { Fingerprint, MonitorSmartphone, UserRound, UsersRound } from "lucide-react";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { LastActive, MemberAvatar } from "@/app/(main)/dashboard/users/_components/users-columns";

import { type Member, memberId } from "./member-data";

const ICON = "size-4 text-muted-foreground";

function Row({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

export function AboutPanel({ member }: { readonly member: Member }) {
  const { user, manager } = member;
  return (
    <section className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead icon={<UserRound className={ICON} strokeWidth={1.8} />} title="About" />
      <dl className="flex flex-col gap-2.5">
        <Row label="Email">
          <a href={`mailto:${user.email}`} className="hover:underline">
            {user.email}
          </a>
        </Row>
        <Row label="Phone">{member.phone}</Row>
        <Row label="Time zone">{member.timeZone.replace("_", " ")}</Row>
        <Row label="Joined">{user.joinedDate.split(",")[0]}</Row>
        <Row label="Workspaces">{user.workspace.join(", ")}</Row>
        <Row label="Reports to">
          {manager ? (
            <Link href={`/dashboard/profile?id=${memberId(manager)}`} className="hover:underline">
              {manager.name}
            </Link>
          ) : (
            "—"
          )}
        </Row>
      </dl>
    </section>
  );
}

export function TeamPanel({ member }: { readonly member: Member }) {
  const shown = member.teammates.slice(0, 5);
  return (
    <section className={cn(PANEL, "flex flex-col gap-3 p-4 sm:p-5")}>
      <PanelHead icon={<UsersRound className={ICON} strokeWidth={1.8} />} title={`${member.user.team} team`}>
        <PanelLink href="/dashboard/users" label="Open all users" />
      </PanelHead>
      {shown.length === 0 ? (
        <p className="text-muted-foreground text-sm">No one else is on this team yet.</p>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {shown.map((mate) => (
            <li key={mate.email}>
              <Link
                href={`/dashboard/profile?id=${memberId(mate)}`}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <MemberAvatar name={mate.name} size="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{mate.name}</p>
                  <p className="truncate text-muted-foreground text-xs">{mate.role}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {member.teammates.length > shown.length ? (
        <p className="text-muted-foreground text-xs">+{member.teammates.length - shown.length} more on this team</p>
      ) : null}
    </section>
  );
}

export function SecurityPanel({ member }: { readonly member: Member }) {
  const { security, user } = member;
  return (
    <section className={cn(PANEL, "flex flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead icon={<Fingerprint className={ICON} strokeWidth={1.8} />} title="Access & security">
        <PanelLink href="/dashboard/settings/security" label="Open security settings" />
      </PanelHead>
      <dl className="flex flex-col gap-2.5">
        <Row label="Role">{user.role}</Row>
        <Row label="Two-factor">
          <span className={security.twoFactor ? "text-success" : "text-warning"}>
            {security.twoFactor ? "Enabled" : "Not set up"}
          </span>
        </Row>
        <Row label="Last seen">
          <span className="inline-flex justify-end">
            <LastActive minutes={user.lastActive} />
          </span>
        </Row>
      </dl>

      <div className="flex flex-col gap-2 border-t pt-4">
        <p className="text-muted-foreground text-xs">Active sessions</p>
        {security.sessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active sessions.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {security.sessions.map((device, index) => (
              <li key={device} className="flex items-center gap-2.5 text-sm">
                <MonitorSmartphone className={ICON} strokeWidth={1.8} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{device}</span>
                {index === 0 ? <span className="text-success text-xs">This week</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
