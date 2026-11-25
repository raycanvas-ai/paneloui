"use client";

import type { ComponentProps, ReactNode, SVGProps } from "react";
import { ArrowDown, ArrowUp, ChevronDown } from "@keyline-icons/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/panelo/ui/select";
import { cn } from "@/components/panelo/lib/utils";

import type { Channel } from "./data";

/* -------------------------------------------------------------------------- */
/*  One calm family for data: blue, azure and a slate teal, all from the       */
/*  theme's tones, plus a single-hue ramp for intensity. Everything else is   */
/*  neutral; green and red only mark change.                                  */
/* -------------------------------------------------------------------------- */

export const SERIES: Record<Channel, string> = {
  instagram: "var(--tone-blue-solid)",
  x: "color-mix(in oklch, var(--tone-cyan-solid) 72%, var(--tone-blue-solid))",
  // A soft teal-mint; mixing with --muted keeps it light on light and lifted on dark.
  facebook:
    "color-mix(in oklch, color-mix(in oklch, var(--tone-cyan-solid) 60%, var(--tone-green-solid)) 62%, var(--muted))",
};
export const OTHERS = "color-mix(in oklch, var(--foreground) 10%, var(--card))";
/** Intensity, 0–1, as a tint of the theme blue over the card. */
/** Five steps, so a heatmap reads as levels rather than a wash; most cells sit on the palest. */
const STEPS = [8, 24, 44, 70, 100];
export const ramp = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  const level = c < 0.42 ? 0 : c < 0.6 ? 1 : c < 0.74 ? 2 : c < 0.87 ? 3 : 4;
  return `color-mix(in oklch, var(--tone-blue-solid) ${STEPS[level]}%, var(--card))`;
};
export const UP = "var(--tone-green-fg)";
export const DOWN =
  "color-mix(in oklch, var(--destructive) 88%, var(--foreground))";
/** Hatching for "not yet": the rest of a goal, the rest of a bar. */
export const HATCH =
  "repeating-linear-gradient(135deg, color-mix(in oklch, var(--foreground) 11%, transparent) 0 1.5px, transparent 1.5px 5px)";

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";
export const press =
  "transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-150 active:scale-[0.97] motion-reduce:active:scale-100";

export const num = (n: number) => n.toLocaleString("en-US");
export const compact = (n: number) =>
  n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });
export const pct = (n: number, digits = 1) => `${Number(n.toFixed(digits))}%`;

/* ---------------------------------- Pieces ---------------------------------- */

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "relative min-w-0 rounded-[16px] bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-foreground/[0.04]",
        className,
      )}
      {...props}
    />
  );
}

/** Title (and an optional line under it) with a control on the right, centred on the title. */
export function CardHeader({
  title,
  sub,
  children,
  className,
}: {
  title: string;
  sub?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0 pt-[7px]">
        <h2 className="line-clamp-2 text-[18.5px] leading-6 font-medium tracking-[-0.01em] text-balance @xl:truncate">
          {title}
        </h2>
        {sub ? (
          <p className="mt-[5px] truncate text-[12.5px] leading-4 text-muted-foreground">
            {sub}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Rise or fall, as text with an arrow after it. */
export function Delta({
  value,
  short = false,
  className,
}: {
  value: number;
  /** Arrow first, no sign: for tight spots. */
  short?: boolean;
  className?: string;
}) {
  const up = value >= 0;
  const I = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11.5px] leading-4 font-semibold tabular-nums",
        className,
      )}
      style={{ color: up ? UP : DOWN }}
    >
      {short ? <I className="size-3" aria-label={up ? "up" : "down"} /> : null}
      {short ? "" : up ? "+" : ""}
      {pct(short ? Math.abs(value) : value)}
      {short ? null : <I className="size-3" aria-label={up ? "up" : "down"} />}
    </span>
  );
}

export const fieldButton = cn(
  "h-[41px] w-auto cursor-pointer gap-2 rounded-[10px] border border-border/90 bg-card px-[14px] text-[14.5px] leading-5 font-medium shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:bg-muted/60 dark:bg-card dark:hover:bg-muted/60",
  press,
  focusRing,
);

/** A pill select: value, then a chevron. */
export function Pick<T extends string>({
  value,
  options,
  onChange,
  label,
  icon,
  className,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v as T)}>
      <SelectTrigger
        aria-label={label}
        className={cn(
          fieldButton,
          "shrink-0 [&>svg:last-child]:hidden",
          className,
        )}
      >
        {/* The trigger line-clamps its span children; keep this one a row. */}
        <span className="flex! items-center gap-2">
          {icon}
          {options.find((o) => o.id === value)?.label}
        </span>
        <ChevronDown className="size-4 text-foreground/70" aria-hidden />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------- Brand marks ------------------------------- */
// Monochrome glyphs as single even-odd paths (real cut-outs), so they sit on any surface.

const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;
const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 -${2 * r} 0z`;
const GLYPHS: Record<string, string> = {
  facebook:
    "M9.1 23.69v-7.98H6.63v-3.67H9.1v-1.58c0-4.08 1.85-5.98 5.86-5.98.4 0 .96.04 1.47.1.38.04.76.11 1.14.2v3.32a8.6 8.6 0 0 0-1.39-.04c-.7 0-1.26.1-1.67.31a1.7 1.7 0 0 0-.68.62c-.26.42-.38 1-.38 1.75v1.3h3.92l-.39 2.1-.28 1.57h-3.25v8.24C19.4 23.24 24 18.18 24 12.04c0-6.63-5.37-12-12-12s-12 5.37-12 12c0 5.63 3.87 10.35 9.1 11.65Z",
  x:
    ring(12, 12, 11.5) +
    "M15.6 6.5h1.8l-3.94 4.5 4.64 6.14h-3.63l-2.84-3.72-3.25 3.72H6.57l4.21-4.82L6.33 6.5h3.72l2.57 3.4zm-.63 9.56h1L9.6 7.53H8.52z",
  instagram:
    rr(1.5, 1.5, 21, 21, 6) +
    rr(5.2, 5.2, 13.6, 13.6, 4) +
    rr(6.9, 6.9, 10.2, 10.2, 2.6) +
    ring(12, 12, 3.7) +
    ring(12, 12, 2.05) +
    ring(15.75, 8.25, 0.95),
  youtube: rr(1, 4.5, 22, 15, 4.2) + "M9.75 8.6v6.8L15.6 12z",
  linkedin:
    rr(2, 2, 20, 20, 4.5) +
    "M6.3 9.7h2.6V18H6.3z" +
    ring(7.6, 6.9, 1.5) +
    "M10.7 9.7h2.5v1.2c.5-.8 1.4-1.4 2.6-1.4 2 0 3.1 1.3 3.1 3.7V18h-2.6v-4.4c0-1.2-.5-1.9-1.5-1.9s-1.6.7-1.6 1.9V18h-2.5z",
  threads:
    ring(12, 12, 10.5) +
    ring(12, 12, 8.6) +
    ring(12, 12, 4.2) +
    ring(12, 12, 2.4) +
    "M15.3 10.3h1.9v3.4c0 1 .5 1.5 1.2 1.5V17c-1.9 0-3.1-1.1-3.1-3.2z",
};

export function Glyph({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fillRule="evenodd" fill="currentColor" d={GLYPHS[name]} />
    </svg>
  );
}

/* ---------------------------------- Flags ---------------------------------- */
// Simplified national flags (imagery, so their own colours), drawn at 30 × 20.

export function Flag({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const body = {
    US: (
      <>
        <rect width="30" height="20" fill="#B22234" />
        {[1, 3, 5, 7, 9, 11].map((k) => (
          <rect
            key={k}
            y={(k * 20) / 13}
            width="30"
            height={20 / 13}
            fill="#fff"
          />
        ))}
        <rect width="13" height={(7 * 20) / 13} fill="#3C3B6E" />
      </>
    ),
    GB: (
      <>
        <rect width="30" height="20" fill="#012169" />
        <path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
        <path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.5" />
        <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
        <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.4" />
      </>
    ),
    DE: (
      <>
        <rect width="30" height="6.67" fill="#000" />
        <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
        <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
      </>
    ),
    JP: (
      <>
        <rect width="30" height="20" fill="#fff" />
        <circle cx="15" cy="10" r="6" fill="#BC002D" />
      </>
    ),
  }[code];
  if (!body) return null;
  return (
    <svg
      viewBox="0 0 30 20"
      aria-hidden
      className={cn(
        "shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10",
        className,
      )}
    >
      {body}
    </svg>
  );
}
