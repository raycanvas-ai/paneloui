import { cn } from "cn";

/** The workspace mark — a clover on a deep green disc, used in the form and on the paper. */
export function ClientMark({ name, className }: { readonly name?: string; readonly className?: string }) {
  return (
    <span title={name} className={cn("grid size-7 shrink-0 place-items-center rounded-full bg-primary", className)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[55%] text-primary-foreground" fill="currentColor">
        <circle cx="12" cy="7.4" r="3.3" />
        <circle cx="16.6" cy="12" r="3.3" />
        <circle cx="12" cy="16.6" r="3.3" />
        <circle cx="7.4" cy="12" r="3.3" />
        <circle cx="12" cy="12" r="2.1" />
      </svg>
    </span>
  );
}
