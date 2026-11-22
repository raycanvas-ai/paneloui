import Link from "next/link";

import { cn } from "cn";
import { ArrowLeft, UserX } from "lucide-react";

import { PANEL } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { Button } from "@/components/ui/button";

import { getMember } from "./_components/member-data";
import { AboutPanel, SecurityPanel, TeamPanel } from "./_components/member-details";
import { MemberHeader } from "./_components/member-header";
import { AssignedWork, MemberActivity, MemberStats } from "./_components/member-work";

/** Same accents and canvas as the default overview so the profile reads as part of the product. */
const TONE_VARS = "[--tone-primary:var(--primary)] [--tone-secondary:var(--chart-2)]";

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const { id } = await searchParams;
  const member = getMember(Array.isArray(id) ? id[0] : id);

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col gap-4 overflow-y-auto bg-muted p-4 sm:p-5", TONE_VARS)}
      data-content-padding="false"
    >
      {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
      <Link
        href="/dashboard/users"
        className="ml-10 inline-flex w-fit items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground md:ml-0"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Users
      </Link>

      {member ? (
        <>
          <MemberHeader member={member} />
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="flex flex-col gap-4">
              <AboutPanel member={member} />
              <TeamPanel member={member} />
              <SecurityPanel member={member} />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <MemberStats member={member} />
              <AssignedWork member={member} />
              <MemberActivity member={member} />
            </div>
          </div>
        </>
      ) : (
        <div className={cn(PANEL, "flex flex-col items-center gap-3 px-6 py-16 text-center")}>
          <UserX className="size-8 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="font-semibold text-xl tracking-tight">We couldn&apos;t find that member</h1>
          <p className="max-w-sm text-muted-foreground text-sm">
            They may have been removed from the workspace, or the link is out of date.
          </p>
          <Button asChild className="mt-2 rounded-full">
            <Link href="/dashboard/users">Back to users</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
