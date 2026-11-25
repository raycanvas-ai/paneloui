"use client";

import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ReactNode,
  type SVGProps,
} from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
} from "@keyline-icons/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/panelo/ui/select";
import { cn } from "@/components/panelo/lib/utils";

import { PLATFORMS, type Platform } from "./data";

/* -------------------------------------------------------------------------- */
/*  The colour system is deliberately small:                                   */
/*  - neutrals for everything structural (surfaces, text, selection),         */
/*  - one data colour, Panelo's blue, for every series and bar,               */
/*  - green and red only on numbers that rose or fell.                        */
/*  Brand marks are monochrome unless `brandColors` is set on the page.       */
/* -------------------------------------------------------------------------- */

// Panelo's own blue ships with the block (panelo-theme), so the data colour survives any install;
// a default --chart-1 is often a light grey meant for fills, too faint for a line.
export const DATA = "var(--tone-blue-solid)";
export const UP = "var(--tone-green-fg)";
export const DOWN =
  "color-mix(in oklch, var(--destructive) 88%, var(--foreground))";

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";

/** "684.21K", "14.82K", "980". */
export const compact = (n: number) =>
  n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 });
/** "6,148", with a sign when asked: "+6,148", "-1,942". */
export const count = (n: number, signed = false) =>
  `${signed && n > 0 ? "+" : n < 0 ? "-" : ""}${Math.abs(n).toLocaleString("en-US")}`;
export const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
export const percent = (n: number, digits = 2) =>
  `${n > 0 ? "+" : ""}${Number(n.toFixed(digits))}%`;

/* ---------------------------------- Pieces ---------------------------------- */

/** A panel: white, a hairline and a breath of shadow. */
export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-[14px] border border-border/70 bg-card shadow-[0_1px_2px_rgb(0_0_0/0.03)]",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-[20.25px] leading-7 font-semibold tracking-[-0.012em]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** Change as a quiet pill: the pill stays neutral, only the figure carries the direction. */
export function Delta({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const up = value >= 0;
  const I = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-foreground/[0.05] ps-1.5 pe-2 text-[11.5px] leading-none font-medium tabular-nums",
        className,
      )}
      style={{ color: up ? UP : DOWN }}
    >
      <I className="size-3.5" aria-hidden />
      {percent(value)}
      <span className="sr-only">{up ? "up" : "down"}</span>
    </span>
  );
}

/** Rise or fall as plain text, for tables. */
export function Change({
  value,
  digits = 2,
  className,
}: {
  value: number;
  digits?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("font-medium tabular-nums", className)}
      style={{ color: value >= 0 ? UP : DOWN }}
    >
      {percent(value, digits)}
    </span>
  );
}

/** A bar on a neutral track: one data colour, length carries the meaning. */
export function Bar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block h-1.5 overflow-hidden rounded-full bg-foreground/[0.07]",
        className,
      )}
    >
      <span
        className="block h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: DATA,
        }}
      />
    </span>
  );
}

// Field-like buttons share one look; select triggers trade the primitive's up-down glyph for a chevron.
export const fieldButton = cn(
  "h-[46px] w-auto cursor-pointer gap-2.5 rounded-[10px] border border-border/90 bg-card px-3.5 text-[14.5px] leading-5 shadow-[0_1px_2px_rgb(0_0_0/0.03)] transition-colors hover:bg-muted/60 dark:bg-card dark:hover:bg-muted/60",
  focusRing,
);
export const selectTrigger = cn(fieldButton, "[&>svg:last-child]:hidden");

export function PlatformSelect({
  value,
  onChange,
  label,
}: {
  value: Platform;
  onChange: (p: Platform) => void;
  label: string;
}) {
  const p = PLATFORMS.find((x) => x.id === value)!;
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v as Platform)}>
      <SelectTrigger
        aria-label={label}
        className={cn(selectTrigger, "w-[155px] justify-between ps-[13px]")}
      >
        {/* The trigger line-clamps its span children; keep this one a row. */}
        <span className="flex! items-center gap-2.5">
          <BrandIcon platform={p.id} className="size-[18px]" />
          {p.name}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </SelectTrigger>
      <SelectContent>
        {PLATFORMS.map((x) => (
          <SelectItem key={x.id} value={x.id}>
            <BrandIcon platform={x.id} className="size-4" />
            {x.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------- Brand marks ------------------------------- */
// Inline so the block installs on its own. Monochrome glyphs are single even-odd paths (real cut-outs,
// not painted holes), so they sit cleanly on any surface; brand colours are opt-in.

export const BrandColors = createContext(false);

const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;
const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 -${2 * r} 0z`;
const PLAY = "M9.75 8.6v6.8L15.6 12z";
const X_MARK =
  "M15.6 6.5h1.8l-3.94 4.5 4.64 6.14h-3.63l-2.84-3.72-3.25 3.72H6.57l4.21-4.82L6.33 6.5h3.72l2.57 3.4zm-.63 9.56h1L9.6 7.53H8.52z";
const F_MARK =
  "M9.1 23.69v-7.98H6.63v-3.67H9.1v-1.58c0-4.08 1.85-5.98 5.86-5.98.4 0 .96.04 1.47.1.38.04.76.11 1.14.2v3.32a8.6 8.6 0 0 0-1.39-.04c-.7 0-1.26.1-1.67.31a1.7 1.7 0 0 0-.68.62c-.26.42-.38 1-.38 1.75v1.3h3.92l-.39 2.1-.28 1.57h-3.25v8.24C19.4 23.24 24 18.18 24 12.04c0-6.63-5.37-12-12-12s-12 5.37-12 12c0 5.63 3.87 10.35 9.1 11.65Z";
const MONO: Record<Platform, string> = {
  youtube: rr(1, 4.5, 22, 15, 4.2) + PLAY,
  instagram:
    rr(1.5, 1.5, 21, 21, 6) +
    rr(5.2, 5.2, 13.6, 13.6, 4) +
    rr(6.9, 6.9, 10.2, 10.2, 2.6) +
    ring(12, 12, 3.7) +
    ring(12, 12, 2.05) +
    ring(15.75, 8.25, 0.95),
  facebook: F_MARK,
  x: ring(12, 12, 11.5) + X_MARK,
};

export function BrandIcon({
  platform,
  ...props
}: SVGProps<SVGSVGElement> & { platform: Platform }) {
  const id = useId();
  const colour = useContext(BrandColors);
  if (!colour || platform === "x")
    return (
      <svg viewBox="0 0 24 24" aria-hidden {...props}>
        <path fillRule="evenodd" fill="currentColor" d={MONO[platform]} />
      </svg>
    );
  if (platform === "youtube")
    return (
      <svg viewBox="0 0 24 24" aria-hidden {...props}>
        <rect x="1" y="4.5" width="22" height="15" rx="4.2" fill="#FF0033" />
        <path d={PLAY} fill="#fff" />
      </svg>
    );
  if (platform === "facebook")
    return (
      <svg viewBox="0 0 24 24" aria-hidden {...props}>
        <path fill="#0866FF" d={F_MARK} />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <defs>
        <radialGradient id={id} cx="0.28" cy="1.05" r="1.25">
          <stop offset="0" stopColor="#FFD600" />
          <stop offset="0.3" stopColor="#FF7A00" />
          <stop offset="0.55" stopColor="#FF0069" />
          <stop offset="0.8" stopColor="#D300C5" />
          <stop offset="1" stopColor="#7638FA" />
        </radialGradient>
      </defs>
      <path fillRule="evenodd" fill={`url(#${id})`} d={MONO.instagram} />
    </svg>
  );
}
