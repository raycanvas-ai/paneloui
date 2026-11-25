"use client";

import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { cn } from "@/components/panelo/lib/utils";

import {
  ACCENT,
  accent,
  DOWN_LINE,
  focusRing,
  pct,
  UP_LINE,
  useMoney,
} from "./parts";

/* -------------------------------------------------------------------------- */
/*  Portfolio line: buckets (days, hours, weeks) as columns, a jagged line     */
/*  with a soft glow, and a readout that follows the pointer or the arrow     */
/*  keys. The column under the readout is hatched; a scrubber marks it below. */
/*  Everything is placed by percentage, so it needs no measuring.             */
/* -------------------------------------------------------------------------- */

type Point = { at: Date; value: number };

export function PortfolioChart({
  points,
  buckets,
  btcPrice,
  label,
  format,
  className,
}: {
  points: Point[];
  buckets: { label: string; long: string }[];
  btcPrice: number;
  label: string;
  format: (d: Date) => string;
  className?: string;
}) {
  const id = useId();
  const money = useMoney();
  const n = points.length;
  const per = Math.max(1, Math.round(n / buckets.length));
  const values = points.map((p) => p.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = (hi - lo) * 0.35 || 1;
  const top = hi + pad * 0.6;
  const bottom = lo - pad;
  const peak = values.indexOf(hi);
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const f = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(f);
  }, []);
  const i = Math.min(active ?? peak, n - 1);
  const bucket = Math.min(buckets.length - 1, Math.floor(i / per));
  const fx = (k: number) => (k + 0.5) / n;
  const fy = (v: number) => (top - v) / (top - bottom);
  const line = points
    .map((p, k) => `${k ? "L" : "M"}${fx(k) * 1000},${fy(p.value) * 1000}`)
    .join("");
  const change = ((values[i] - values[0]) / values[0]) * 100;
  const flip = fx(i) > 0.62;

  const pick = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setActive(
      Math.max(
        0,
        Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n)),
      ),
    );
  };
  const keys = (e: KeyboardEvent) => {
    const next = {
      ArrowLeft: i - 1,
      ArrowRight: i + 1,
      Home: 0,
      End: n - 1,
      PageUp: i - per,
      PageDown: i + per,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActive(Math.max(0, Math.min(n - 1, next)));
  };

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label={`${label}. Use the arrow keys to read each point.`}
      aria-describedby={id}
      onPointerMove={pick}
      onPointerLeave={() => setActive(null)}
      onKeyDown={keys}
      onBlur={() => setActive(null)}
      className={cn(
        "relative flex cursor-crosshair touch-pan-y flex-col rounded-[6px] select-none",
        focusRing,
        className,
      )}
    >
      {/* Columns: hairlines between buckets, the active one hatched. */}
      <div
        aria-hidden
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
        }}
      >
        {buckets.map((b, k) => (
          <span
            key={k}
            className="border-s border-foreground/[0.07] last:border-e"
            style={
              k === bucket
                ? {
                    backgroundImage: `repeating-linear-gradient(135deg, ${accent(16)} 0 6px, transparent 6px 12px)`,
                  }
                : undefined
            }
          />
        ))}
      </div>

      {/* The line, its glow, the guide and the point. */}
      <div className="relative min-h-0 flex-1">
        <svg
          aria-hidden
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible transition-[clip-path] duration-700 ease-out motion-reduce:transition-none"
          style={{
            clipPath: shown
              ? "inset(-12px -12px -12px -12px)"
              : "inset(-12px 100% -12px -12px)",
          }}
        >
          <path
            d={line}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeWidth={6}
            strokeLinejoin="round"
            style={{ stroke: ACCENT, opacity: 0.14 }}
          />
          <path
            d={line}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeWidth={1.75}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ stroke: ACCENT }}
          />
        </svg>
        <span
          aria-hidden
          className="pointer-events-none absolute -top-2 bottom-0 w-px -translate-x-1/2 transition-[left] duration-150 ease-out motion-reduce:transition-none"
          style={{ left: `${fx(i) * 100}%`, background: ACCENT }}
        >
          <span
            className="absolute -top-[3px] left-1/2 size-[7px] -translate-x-1/2 rounded-full"
            style={{ background: ACCENT }}
          />
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-[2.5px] ring-card transition-[left,top] duration-150 ease-out motion-reduce:transition-none"
          style={{
            left: `${fx(i) * 100}%`,
            top: `${fy(values[i]) * 100}%`,
            background: ACCENT,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 w-[168px] rounded-[10px] bg-foreground px-3 pt-2.5 pb-3 text-background shadow-[0_12px_28px_-10px_rgb(0_0_0/0.45)] transition-[left] duration-150 ease-out motion-reduce:transition-none"
          style={{
            left: `clamp(0px, calc(${fx(i) * 100}% ${flip ? "- 184px" : "+ 16px"}), calc(100% - 168px))`,
            top: 34,
          }}
        >
          <p className="text-[11.5px] leading-4 text-background/60">
            {format(points[i].at)}
          </p>
          <p className="mt-1.5 font-mono text-[17px] leading-6 font-medium tracking-[-0.02em] tabular-nums">
            {money(values[i])}
          </p>
          <p className="mt-1.5 flex items-center justify-between text-[11.5px] leading-4 tabular-nums">
            <span className="flex items-center gap-1.5">
              <span
                className="size-1.5 rounded-full"
                style={{ background: change >= 0 ? UP_LINE : DOWN_LINE }}
              />
              {pct(change)}
            </span>
            <span className="font-mono text-background/70">
              {(values[i] / btcPrice).toFixed(3)} BTC
            </span>
          </p>
        </div>
      </div>

      {/* Scrubber: a dash per bucket, the active one in the accent with a knob at the guide. */}
      <div
        aria-hidden
        className="relative mt-[13px] grid h-2"
        style={{
          gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
        }}
      >
        {buckets.map((_, k) => (
          <span key={k} className="relative flex items-center px-[7px]">
            <span
              className="h-[5px] w-full rounded-full transition-colors duration-200"
              style={{
                background:
                  k === bucket
                    ? ACCENT
                    : "color-mix(in oklch, var(--foreground) 7%, var(--card))",
              }}
            />
            {k ? (
              <span className="absolute start-0 size-[7px] -translate-x-1/2 rotate-45 rounded-[1.5px] bg-foreground/[0.08] rtl:translate-x-1/2" />
            ) : null}
          </span>
        ))}
        <span
          className="absolute top-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2.5px] ring-2 ring-card transition-[left] duration-150 ease-out motion-reduce:transition-none"
          style={{ left: `${fx(i) * 100}%`, background: ACCENT }}
        />
      </div>
      <div
        aria-hidden
        className="relative grid pt-[13px] pb-[3px]"
        style={{
          gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
        }}
      >
        {buckets.map((b, k) => (
          <span
            key={k}
            className={cn(
              "truncate px-1 text-center text-[13px] leading-5 transition-colors",
              k === bucket ? "font-medium" : "text-muted-foreground",
              k % 2 && "max-[30rem]:invisible",
            )}
            style={k === bucket ? { color: ACCENT } : undefined}
          >
            {b.label}
          </span>
        ))}
      </div>
      <p id={id} className="sr-only" aria-live="polite">
        {`${format(points[i].at)}: ${money(values[i])}, ${pct(change)} since the start of the range`}
      </p>
    </div>
  );
}

/** A small trend line, coloured by direction. */
export function Sparkline({
  values,
  up,
  className,
}: {
  values: number[];
  up: boolean;
  className?: string;
}) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const d = values
    .map(
      (v, k) =>
        `${k ? "L" : "M"}${(k / (values.length - 1)) * 100},${4 + (1 - (v - lo) / (hi - lo || 1)) * 22}`,
    )
    .join("");
  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("overflow-visible", className)}
    >
      <path
        d={d}
        fill="none"
        vectorEffect="non-scaling-stroke"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ stroke: up ? UP_LINE : DOWN_LINE }}
      />
    </svg>
  );
}
