import type { ReactNode } from "react";

import { SettingsNav } from "./_components/settings-nav";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your profile, security, notifications, and billing for the Panelo workspace.
        </p>
      </div>

      <SettingsNav />

      {/* Forms read best at a measured width; the nav above stays full-bleed. */}
      <div className="w-full max-w-4xl">{children}</div>
    </div>
  );
}
