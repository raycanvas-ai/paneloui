"use client";

import {
  createContext,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
} from "@keyline-icons/react";
import { CaretDown, CaretUp } from "@keyline-icons/react/fill";

import { cn } from "@/components/panelo/lib/utils";

import type { CoinId } from "./data";

/* -------------------------------------------------------------------------- */
/*  One accent (a warm orange from the theme), neutrals for structure, green   */
/*  and red only for change. Coin marks are monochrome glyphs.                */
/* -------------------------------------------------------------------------- */

export const ACCENT =
  "color-mix(in oklch, var(--tone-orange-solid) 78%, var(--destructive))";
/** The accent at a strength, over the card: for ramps, tints and hatching. */
export const accent = (pct: number) =>
  `color-mix(in oklch, ${ACCENT} ${pct}%, var(--card))`;
/** Text colours for change: deep enough to read on white, lifted on dark. */
export const UP =
  "color-mix(in oklch, var(--tone-green-solid) 74%, var(--foreground))";
export const DOWN =
  "color-mix(in oklch, var(--destructive) 86%, var(--foreground))";
/** Line colours for change, where a stroke needs less contrast than text. */
export const UP_LINE = "var(--tone-green-solid)";
export const DOWN_LINE = "var(--destructive)";

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";
export const press =
  "transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-150 active:scale-[0.97] motion-reduce:active:scale-100";

/* --------------------------------- Currency --------------------------------- */

export type Currency = "USD" | "EUR" | "GBP";
export const CURRENCIES: { id: Currency; rate: number }[] = [
  { id: "USD", rate: 1 },
  { id: "EUR", rate: 0.92 },
  { id: "GBP", rate: 0.79 },
];
export const CurrencyContext = createContext<Currency>("USD");

/** Money in the page's currency. Under a dollar gets four decimals; `compact` gives "$18.44B". */
export function useMoney() {
  const currency = useContext(CurrencyContext);
  const rate = CURRENCIES.find((c) => c.id === currency)!.rate;
  return (usd: number, o: { compact?: boolean; digits?: number } = {}) => {
    const v = usd * rate;
    const digits = o.digits ?? (Math.abs(v) < 1 ? 4 : 2);
    return v.toLocaleString("en-US", {
      style: "currency",
      currency,
      ...(o.compact
        ? { notation: "compact", maximumFractionDigits: 2 }
        : { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    });
  };
}
export const pct = (n: number, digits = 2) =>
  `${n > 0 ? "+" : ""}${Number(n.toFixed(digits))}%`;

/* ---------------------------------- Pieces ---------------------------------- */

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "relative min-w-0 rounded-[18px] bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-foreground/[0.04]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-[17.5px] leading-6 font-medium tracking-[-0.01em]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** Change with a solid caret, ticker style. */
export function Change({
  value,
  digits = 2,
  className,
}: {
  value: number;
  digits?: number;
  className?: string;
}) {
  const up = value >= 0;
  const I = up ? CaretUp : CaretDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium tabular-nums",
        className,
      )}
      style={{ color: up ? UP : DOWN }}
    >
      <I className="size-[11px]" aria-hidden />
      {pct(value, digits)}
      <span className="sr-only">{up ? "up" : "down"}</span>
    </span>
  );
}

/** Change with a trend arrow, for table cells. */
export function TrendChange({
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
        "inline-flex items-center gap-1.5 font-medium tabular-nums",
        className,
      )}
      style={{ color: up ? UP : DOWN }}
    >
      <I className="size-3.5" aria-hidden />
      {pct(value, 1)}
    </span>
  );
}

/** Small pill switch, for Week / Month and range pickers. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
  item,
}: {
  value: T;
  options: readonly T[] | { id: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
  className?: string;
  item?: string;
}) {
  const list = options.map((o) =>
    typeof o === "string" ? { id: o, label: o } : o,
  );
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex items-center rounded-[10px] bg-foreground/[0.045] p-[3px]",
        className,
      )}
    >
      {list.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "h-full cursor-pointer rounded-[7px] px-2.5 text-[12.5px] leading-4 text-muted-foreground transition-colors hover:text-foreground",
            value === o.id &&
              "bg-card font-medium text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)] ring-1 ring-foreground/[0.06]",
            focusRing,
            item,
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export type Sort<K extends string> = { key: K; dir: 1 | -1 } | null;

/** A header cell that sorts: first click descending, then ascending, then off. */
export function SortButton<K extends string>({
  k,
  sort,
  onSort,
  children,
  align = "start",
  className,
}: {
  k: K;
  sort: Sort<K>;
  onSort: (s: Sort<K>) => void;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const on = sort?.key === k;
  const next: Sort<K> = !on
    ? { key: k, dir: -1 }
    : sort!.dir === -1
      ? { key: k, dir: 1 }
      : null;
  return (
    <button
      type="button"
      onClick={() => onSort(next)}
      aria-label={`Sort by ${typeof children === "string" ? children : k}${on ? (sort!.dir === -1 ? ", descending" : ", ascending") : ""}`}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 rounded-[4px] whitespace-nowrap hover:text-foreground",
        align === "end" && "flex-row-reverse",
        on && "text-foreground",
        focusRing,
        className,
      )}
    >
      {children}
      {on ? (
        sort!.dir === -1 ? (
          <CaretDown className="size-2.5" aria-hidden />
        ) : (
          <CaretUp className="size-2.5" aria-hidden />
        )
      ) : (
        <ArrowUpDown className="size-3 opacity-60" aria-hidden />
      )}
    </button>
  );
}

/* -------------------------------- Coin marks -------------------------------- */
// Monochrome glyphs drawn on a 24 grid: simplified, recognisable shapes rather than official logos.

const GLYPH: Record<CoinId, { d: string; stroke?: boolean }> = {
  btc: {
    d: "M8.5 6.5h4.8a2.75 2.75 0 0 1 0 5.5H8.5zM8.5 12h5.4a2.75 2.75 0 0 1 0 5.5H8.5zM8.5 6.5v11M10.5 4.5v2M13.2 4.5v2M10.5 17.5v2M13.2 17.5v2M7 6.5h1.5M7 17.5h1.5",
    stroke: true,
  },
  eth: { d: "M12 3.2l5.6 9-5.6 3.3-5.6-3.3zM12 16.9l5.6-3.3L12 21l-5.6-7.4z" },
  sol: {
    d: "M7.3 6.2h11.4l-2 2.3H5.3zM5.3 10.85h11.4l2 2.3H7.3zM7.3 15.5h11.4l-2 2.3H5.3z",
  },
  xrp: {
    d: "M5.5 5.8l4.3 4.3a3.1 3.1 0 0 0 4.4 0l4.3-4.3M5.5 18.2l4.3-4.3a3.1 3.1 0 0 1 4.4 0l4.3 4.3",
    stroke: true,
  },
  ltc: { d: "M11 4.8L9 17.6h8.6M6.6 13.4l7.4-3", stroke: true },
};

export function CoinMark({
  coin,
  size = 38,
  className,
}: {
  coin: CoinId;
  size?: number;
  className?: string;
}) {
  const g = GLYPH[coin];
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-foreground/85 ring-1 ring-foreground/[0.05] ring-inset",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        style={{ width: size * 0.56, height: size * 0.56 }}
      >
        <path
          d={g.d}
          fill={g.stroke ? "none" : "currentColor"}
          stroke={g.stroke ? "currentColor" : "none"}
          strokeWidth={g.stroke ? 2 : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
