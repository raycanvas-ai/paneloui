import Link from "next/link";

import { Clock, Lock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { rootUser } from "@/data/users";

import { AuthV1Shell } from "../../_components/auth-v1-shell";
import { IdleSince, LockScreenForm } from "./_components/lock-screen-form";

export default function LockScreenV1() {
  const initials = rootUser.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <AuthV1Shell
      panelIcon={Lock}
      panelSubtitle="Your session is paused"
      title="Session locked"
      description="Enter your password to pick up where you left off."
      footer={
        <>
          Not you?{" "}
          <Link prefetch={false} href="/auth/v1/login" className="text-primary">
            Sign in as a different user
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar className="size-16 after:hidden">
            <AvatarImage
              src={rootUser.avatar}
              alt=""
              className="outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
            />
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="font-medium">{rootUser.name}</p>
            <p className="text-muted-foreground text-sm">{rootUser.email}</p>
          </div>
          <p className="inline-flex items-center gap-1.5 rounded-md border bg-muted/70 px-2 py-1 text-muted-foreground text-xs">
            <Clock aria-hidden="true" className="size-3.5" />
            <IdleSince minutes={15} />
          </p>
        </div>
        <LockScreenForm username={rootUser.email} />
      </div>
    </AuthV1Shell>
  );
}
