import type { ReactNode } from "react";

import Link from "next/link";

import { Command, type LucideIcon } from "lucide-react";

import { APP_CONFIG } from "@/config/app-config";

interface AuthV1ShellProps {
  /** Icon and line for the context chip above the heading, e.g. "Your session is paused". */
  panelIcon: LucideIcon;
  panelSubtitle: string;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Changing this replays the staged entrance, e.g. when a form swaps to its success state. */
  stateKey?: string;
}

const footerLink = "underline-offset-4 hover:text-foreground hover:underline";

// One card on the muted canvas, the same surface language as the dashboard screens.
export function AuthV1Shell({
  panelIcon: PanelIcon,
  panelSubtitle,
  title,
  description,
  children,
  footer,
  stateKey = "default",
}: AuthV1ShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted">
      <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-6">
        <Link
          prefetch={false}
          href="/"
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Command className="size-4" aria-hidden="true" />
          </span>
          <span className="font-semibold text-base tracking-tight">{APP_CONFIG.name}</span>
        </Link>
        <Link
          prefetch={false}
          href="/dashboard/help"
          className="text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
        >
          Need help?
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-card p-6 shadow-lg ring-1 ring-foreground/5 sm:p-8">
            {/* The live region outlives the keyed heading, so a swapped-in state gets announced. */}
            <div aria-live="polite">
              <div key={`${stateKey}-heading`} className="stage-0 flex animate-stage flex-col gap-3">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs">
                  <PanelIcon aria-hidden="true" className="size-3.5" />
                  {panelSubtitle}
                </span>
                <h1 className="text-balance font-semibold text-2xl tracking-tight">{title}</h1>
                <div className="text-muted-foreground text-sm">{description}</div>
              </div>
            </div>
            <div key={`${stateKey}-body`} className="stage-1 mt-6 animate-stage">
              {children}
            </div>
          </div>

          {footer && (
            <p
              key={`${stateKey}-footer`}
              className="stage-2 mt-5 animate-stage text-center text-muted-foreground text-sm"
            >
              {footer}
            </p>
          )}
        </div>
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 pb-6 text-muted-foreground text-xs">
        <span>{APP_CONFIG.copyright}</span>
        <Link prefetch={false} href="/dashboard/help" className={footerLink}>
          Terms
        </Link>
        <Link prefetch={false} href="/dashboard/help" className={footerLink}>
          Privacy
        </Link>
      </footer>
    </div>
  );
}
