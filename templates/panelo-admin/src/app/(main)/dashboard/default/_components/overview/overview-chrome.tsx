import type { ReactNode } from "react";

import Link from "next/link";

import { cn } from "cn";
import { ArrowRight, Ellipsis } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Two accents carry the whole page, both drawn from the app scale so this
 *  screen cannot drift from the rest of the product. The tokens already flip
 *  with the theme, so light and dark point at the same variable. */
const BRAND = "var(--chart-1)";
const COMPARE = "var(--chart-2)";
const GHOST = "color-mix(in oklab, var(--foreground) 22%, transparent)";

export const TONE = {
  primary: { light: BRAND, dark: BRAND },
  secondary: { light: COMPARE, dark: COMPARE },
  ghost: { light: GHOST, dark: GHOST },
} as const;

export const PANEL = "rounded-xl bg-card shadow-xs";

export function PanelMenu({
  links,
  children,
}: {
  readonly links: { label: string; href: string }[];
  readonly children?: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label="Panel actions">
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PanelLink({ href, label }: { readonly href: string; readonly label: string }) {
  return (
    <Button asChild variant="ghost" size="icon" className="size-7 text-muted-foreground">
      <Link href={href} aria-label={label}>
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}

export function PanelHead({
  icon,
  title,
  className,
  children,
}: {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly className?: string;
  readonly children?: ReactNode;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <span className="truncate text-muted-foreground text-sm">{title}</span>
      </div>
      <div className="-mr-1.5 flex shrink-0 items-center">{children}</div>
    </div>
  );
}

export function Delta({ value, suffix }: { readonly value: number; readonly suffix?: string }) {
  const up = value >= 0;
  return (
    <span className={cn("font-medium text-sm", up ? "text-success" : "text-destructive")}>
      {up ? "↑" : "↓"}
      {Math.abs(value)}%{suffix ? ` ${suffix}` : ""}
    </span>
  );
}

/** Lucide has no money bag; this is the reference icon traced at a 24px box. */
export function MoneyBag({ className }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9.2 2h5.6l-1.4 2.6a1 1 0 0 0 .28 1.24C16.5 7.7 19 10.9 19 14.4 19 18.6 15.9 21 12 21s-7-2.4-7-6.6c0-3.5 2.5-6.7 5.32-8.56a1 1 0 0 0 .28-1.24L9.2 2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M13.6 11.1c-.3-.7-1-1.1-1.8-1.1-1 0-1.8.6-1.8 1.4 0 2 3.8.9 3.8 3 0 .9-.9 1.5-2 1.5-.9 0-1.7-.4-2-1.2M12 8.7v.9m0 6.4v.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------- Tooltips */

export interface TooltipSlice {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  payload?: Record<string, string | number | null>;
}

interface TooltipShell {
  readonly active?: boolean;
  readonly payload?: TooltipSlice[];
  readonly label?: string | number;
}

const PILL = "w-fit whitespace-nowrap rounded-full px-2.5 py-1 font-medium text-[11px] shadow-md";

/** The mock's single dark chip — recharts injects active/payload on hover. */
export function PillTooltip({
  active,
  payload,
  format,
}: TooltipShell & { readonly format: (slice: TooltipSlice) => string }) {
  if (!active || !payload?.length) return null;
  return <div className={cn(PILL, "bg-foreground text-background")}>{format(payload[0])}</div>;
}

/** One chip per series: the brand series is filled, the rest stay on card. */
export function SeriesPillTooltip({
  active,
  payload,
  brandKey,
  format,
}: TooltipShell & { readonly brandKey: string; readonly format: (slice: TooltipSlice) => string }) {
  if (!active || !payload?.length) return null;
  // Brand series leads, as in the reference.
  const slices = [...payload].sort((a, b) => Number(b.dataKey === brandKey) - Number(a.dataKey === brandKey));
  return (
    <div className="flex flex-col items-start gap-1.5">
      {slices.map((slice) => (
        <span
          key={String(slice.dataKey)}
          className={cn(PILL, slice.dataKey === brandKey ? "text-white" : "border bg-card text-foreground")}
          style={slice.dataKey === brandKey ? { backgroundColor: "var(--tone-primary)" } : undefined}
        >
          {format(slice)}
        </span>
      ))}
    </div>
  );
}
