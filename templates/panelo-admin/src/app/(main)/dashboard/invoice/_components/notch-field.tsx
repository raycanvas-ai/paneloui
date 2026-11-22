import type * as React from "react";

import { cn } from "cn";

/**
 * Outlined field with the label notched into the top border — the signature
 * control of this screen. Every input on the form sits inside one, so the
 * height, radius and focus ring are defined here once.
 */
export function NotchField({
  label,
  required,
  icon,
  htmlFor,
  className,
  children,
}: {
  readonly label: string;
  readonly required?: boolean;
  readonly icon?: React.ReactNode;
  readonly htmlFor?: string;
  readonly className?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card transition-colors",
        "focus-within:border-[var(--tone-primary)] focus-within:ring-[3px] focus-within:ring-[var(--tone-primary)]/15",
        className,
      )}
    >
      <label
        htmlFor={htmlFor}
        className="-top-2 absolute left-2.5 z-10 flex items-center gap-0.5 bg-card px-1 text-[11px] text-muted-foreground leading-none"
      >
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </label>
      <div className="flex h-11 min-w-0 items-center gap-2 px-3 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground">
        {icon}
        {children}
      </div>
    </div>
  );
}

/** Bare input that inherits the notch's box — no border, no ring of its own. */
export const notchInputClass =
  "h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground";

/** Same, for a Select whose trigger has to disappear into the notch. */
export const notchTriggerClass =
  "h-full w-full min-w-0 gap-2 border-0 bg-transparent p-0 text-sm shadow-none data-[size=default]:h-full focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent";
