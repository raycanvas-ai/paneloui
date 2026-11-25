"use client";

import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { cn } from "@/components/panelo/lib/utils";

import { CHANNELS, WORLD, type Channel, type Country } from "./data";
import { compact, Delta, focusRing, num, pct, ramp, SERIES } from "./parts";

/* ---------------------------------- Gauge ---------------------------------- */

const R = 120;
const r = 70;
/** The arc runs 212° clockwise, from 16° below the left horizontal to 16° below the right. */
const START = 196;
const SWEEP = 212;
/** Corners are rounded by stroking each segment in its own colour; the geometry is inset to match. */
const ROUND = 7;

const polar = (rad: number, deg: number) =>
  [
    rad * Math.cos((deg * Math.PI) / 180),
    -rad * Math.sin((deg * Math.PI) / 180),
  ] as const;

function sector(a0: number, a1: number) {
  const inset = (ROUND / 2 / ((R + r) / 2)) * (180 / Math.PI);
  const s = a0 - inset;
  const e = a1 + inset;
  if (s <= e) return "";
  const big = s - e > 180 ? 1 : 0;
  const Ro = R - ROUND / 2;
  const ri = r + ROUND / 2;
  const [x0, y0] = polar(Ro, s);
  const [x1, y1] = polar(Ro, e);
  const [x2, y2] = polar(ri, e);
  const [x3, y3] = polar(ri, s);
  return `M${x0} ${y0}A${Ro} ${Ro} 0 ${big} 1 ${x1} ${y1}L${x2} ${y2}A${ri} ${ri} 0 ${big} 0 ${x3} ${y3}Z`;
}

export type GaugePart = { id: Channel; value: number };

/** Today's tally against a goal: one segment per channel, hatching for what's left. */
export function Gauge({
  parts,
  goal,
  active,
  children,
  className,
}: {
  parts: GaugePart[];
  goal: number;
  active: Channel | null;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const total = parts.reduce((n, p) => n + p.value, 0);
  const scale = Math.max(goal, total);
  const GAP = 2.4;
  let at = START;
  const segments = [...parts]
    .sort((a, b) => b.value - a.value)
    .map((p) => {
      const span = (p.value / scale) * SWEEP;
      const seg = { ...p, d: sector(at, at - span + GAP) };
      at -= span;
      return seg;
    });
  const rest = total < goal ? sector(at, START - SWEEP) : "";
  return (
    <div
      className={cn("relative", className)}
      style={{ width: 2 * R + 10, height: R + 50 }}
    >
      <svg
        aria-hidden
        viewBox={`${-R - 5} ${-R - 5} ${2 * R + 10} ${R + 50}`}
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <pattern
            id={`${id}-hatch`}
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <rect
              width="6"
              height="6"
              style={{
                fill: "color-mix(in oklch, var(--foreground) 4%, var(--card))",
              }}
            />
            <rect
              width="1.7"
              height="6"
              style={{
                fill: "color-mix(in oklch, var(--foreground) 14%, var(--card))",
              }}
            />
          </pattern>
        </defs>
        {rest ? (
          <path
            d={rest}
            fill={`url(#${id}-hatch)`}
            stroke={`url(#${id}-hatch)`}
            strokeWidth={ROUND}
            strokeLinejoin="round"
          />
        ) : null}
        {segments.map((s) => (
          <path
            key={s.id}
            d={s.d}
            strokeWidth={ROUND}
            strokeLinejoin="round"
            className="transition-opacity duration-200"
            style={{
              fill: SERIES[s.id],
              stroke: SERIES[s.id],
              opacity: active && active !== s.id ? 0.3 : 1,
            }}
          />
        ))}
      </svg>
      <div
        className="absolute inset-x-0 flex flex-col items-center text-center"
        style={{ top: R - 36 }}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------- Shared chart bits ------------------------------- */

/** Monotone cubic (Fritsch–Carlson): smooth, never overshooting between points. */
function monotone(pts: [number, number][]) {
  const n = pts.length;
  if (n < 2) return "";
  const m = pts
    .slice(0, -1)
    .map(([x, y], i) => (pts[i + 1][1] - y) / (pts[i + 1][0] - x));
  const t = pts.map((_, i) =>
    i === 0
      ? m[0]
      : i === n - 1
        ? m[n - 2]
        : m[i - 1] * m[i] <= 0
          ? 0
          : (m[i - 1] + m[i]) / 2,
  );
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const s = a * a + b * b;
    if (s > 9) {
      t[i] = (3 / Math.sqrt(s)) * a * m[i];
      t[i + 1] = (3 / Math.sqrt(s)) * b * m[i];
    }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = (x1 - x0) / 3;
    d += `C${x0 + h},${y0 + t[i] * h} ${x1 - h},${y1 - t[i + 1] * h} ${x1},${y1}`;
  }
  return d;
}

/** A round top: 1, 2, 2.5 or 5 times a power of ten, split in `parts`. */
function niceMax(max: number, parts: number) {
  const raw = Math.max(1, max) / parts;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].find((k) => k * p >= raw)! * p;
  return { top: step * parts, step };
}

/** Draw-in once on mount; re-key a chart to replay it. */
function useReveal() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const f = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(f);
  }, []);
  return shown;
}

/* ---------------------------------- Lines ---------------------------------- */

export type LinePoint = { date: Date; values: Record<Channel, number> };

/** Engagement per channel over time. Hover or arrow keys move the readout; a highlighted channel lifts. */
export function LineChart({
  data,
  label,
  format,
  highlight,
  className,
}: {
  data: LinePoint[];
  label: string;
  format: (d: Date) => string;
  highlight: Channel | null;
  className?: string;
}) {
  const id = useId();
  const n = data.length;
  const totals = data.map((d) =>
    CHANNELS.reduce((s, c) => s + d.values[c.id], 0),
  );
  const peak = totals.indexOf(Math.max(...totals));
  const [active, setActive] = useState<number | null>(null);
  const shown = useReveal();
  const i = Math.min(active ?? peak, n - 1);
  const { top, step } = niceMax(
    Math.max(...data.flatMap((d) => CHANNELS.map((c) => d.values[c.id]))),
    6,
  );
  const ticks = Array.from({ length: 7 }, (_, k) => top - k * step);
  const fx = (k: number) => (n > 1 ? k / (n - 1) : 0.5);
  const fy = (v: number) => `${(1 - v / top) * 100}%`;
  const left = (f: number) => `${f * 100}%`;
  const total = totals[i];
  const before = totals[i - 1];
  const long = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const pick = (e: PointerEvent<HTMLDivElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    setActive(
      Math.max(
        0,
        Math.min(n - 1, Math.round(((e.clientX - b.left) / b.width) * (n - 1))),
      ),
    );
  };
  const keys = (e: KeyboardEvent) => {
    const next = { ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: n - 1 }[
      e.key
    ];
    if (next === undefined) return;
    e.preventDefault();
    setActive(Math.max(0, Math.min(n - 1, next)));
  };
  // The readout sits beside the guide, on whichever side has room.
  const flip = fx(i) > 0.55;

  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div className="flex min-h-0 flex-1">
        <div aria-hidden className="relative w-[44px] shrink-0">
          {ticks.map((t, k) => (
            <span
              key={t}
              className="absolute end-0 -translate-y-1/2 text-[13.5px] leading-5 text-muted-foreground tabular-nums"
              style={{ top: `${(k / 6) * 100}%` }}
            >
              {t ? `${t / 1000}k` : "0k"}
            </span>
          ))}
        </div>
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
            "relative ms-7 min-w-0 flex-1 cursor-crosshair touch-pan-y rounded-[4px]",
            focusRing,
          )}
        >
          {ticks.map((t, k) => (
            <span
              key={t}
              aria-hidden
              className="absolute -inset-x-1 border-t border-dashed border-foreground/[0.09]"
              style={{ top: `${(k / 6) * 100}%` }}
            />
          ))}
          <svg
            aria-hidden
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible transition-[clip-path] duration-700 ease-out motion-reduce:transition-none"
            style={{
              clipPath: shown
                ? "inset(-6px -6px -6px -6px)"
                : "inset(-6px 100% -6px -6px)",
            }}
          >
            {CHANNELS.map((c) => (
              <path
                key={c.id}
                d={monotone(
                  data.map((d, k) => [
                    fx(k) * 1000,
                    1000 - (d.values[c.id] / top) * 1000,
                  ]),
                )}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                className="transition-[opacity,stroke-width] duration-200"
                style={{
                  stroke: SERIES[c.id],
                  strokeWidth: highlight === c.id ? 2.75 : 2,
                  opacity: highlight && highlight !== c.id ? 0.25 : 1,
                }}
              />
            ))}
          </svg>
          {n ? (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute top-0 bottom-0 w-px -translate-x-1/2 transition-[left] duration-200 ease-out motion-reduce:transition-none"
                style={{
                  left: left(fx(i)),
                  background:
                    "color-mix(in oklch, var(--tone-blue-solid) 45%, transparent)",
                }}
              >
                <span
                  className="absolute -top-[5px] left-1/2 size-[11px] -translate-x-1/2 rounded-full ring-[3px] ring-card"
                  style={{ background: "var(--tone-blue-solid)" }}
                />
              </span>
              {CHANNELS.map((c) => (
                <span
                  key={c.id}
                  aria-hidden
                  className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card transition-[left,top,opacity] duration-200 ease-out motion-reduce:transition-none"
                  style={{
                    left: left(fx(i)),
                    top: fy(data[i].values[c.id]),
                    background: SERIES[c.id],
                    opacity: highlight && highlight !== c.id ? 0.25 : 1,
                  }}
                />
              ))}
              <div
                aria-hidden
                className="pointer-events-none absolute z-10 w-[215px] rounded-[12px] bg-popover px-[14px] pt-[13px] pb-[14px] text-popover-foreground shadow-[0_10px_30px_-10px_rgb(0_0_0/0.25),0_0_0_1px_color-mix(in_oklch,var(--foreground)_6%,transparent)] transition-[left] duration-200 ease-out motion-reduce:transition-none"
                // Beside the guide on the roomier side, and clamped so it never leaves the plot.
                style={{
                  left: `clamp(0px, calc(${left(fx(i))} ${flip ? "- 231px" : "+ 16px"}), calc(100% - 215px))`,
                  top: 64,
                }}
              >
                <p className="text-[13px] leading-4 font-semibold">
                  {long(data[i].date)}
                </p>
                <div className="mt-[11px] flex items-center gap-2">
                  <span className="text-[27px] leading-8 font-semibold tracking-[-0.02em] tabular-nums">
                    {compact(total)}
                  </span>
                  {before ? (
                    <Delta value={((total - before) / before) * 100} />
                  ) : null}
                  <span className="ms-auto w-14 text-[10.5px] leading-[13px] text-muted-foreground">
                    Total engaged
                  </span>
                </div>
                <div className="mt-[11px] flex h-2.5 gap-px overflow-hidden rounded-full">
                  {CHANNELS.map((c) => (
                    <span
                      key={c.id}
                      className="h-full transition-[flex-grow] duration-200"
                      style={{
                        flexGrow: data[i].values[c.id],
                        background: SERIES[c.id],
                      }}
                    />
                  ))}
                </div>
                <div className="mt-[10px] flex justify-between text-[12px] leading-4 tabular-nums">
                  {CHANNELS.map((c) => (
                    <span
                      key={c.id}
                      className="flex items-center gap-1.5 text-foreground/75"
                    >
                      <span
                        className="size-2 rounded-[2px]"
                        style={{ background: SERIES[c.id] }}
                      />
                      {pct((data[i].values[c.id] / total) * 100)}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : null}
          <p id={id} className="sr-only" aria-live="polite">
            {n
              ? `${format(data[i].date)}: ${num(total)} engagements. ${CHANNELS.map((c) => `${c.name} ${num(data[i].values[c.id])}`).join(", ")}.`
              : "No data"}
          </p>
        </div>
      </div>
      <div aria-hidden className="relative ms-[72px] mt-[11px] h-5">
        {data.map((d, k) => (
          <span
            key={k}
            className={cn(
              "absolute top-0 -translate-x-1/2 text-[13.5px] leading-5 whitespace-nowrap transition-colors",
              k === i
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
              k % 2 && k !== i && "hidden @md:block",
            )}
            style={{ left: left(fx(k)) }}
          >
            {format(d.date)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- Heatmap ---------------------------------- */

/** Cells are values (rows × columns); colour is a single-hue ramp. Hover or arrow keys read a cell. */
export function Heatmap({
  values,
  rows,
  cols,
  describe,
  className,
}: {
  values: number[][];
  rows: string[];
  cols: string[];
  describe: (row: number, col: number, value: number) => string;
  className?: string;
}) {
  const id = useId();
  const max = Math.max(1, ...values.flat());
  const min = Math.min(...values.flat());
  const [at, setAt] = useState<[number, number] | null>(null);
  const [cell, setCell] = useState<[number, number]>([0, 0]);
  const shown = useReveal();
  const [ar, ac] = at ?? cell;
  const keys = (e: KeyboardEvent) => {
    const move = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    }[e.key];
    if (!move) return;
    e.preventDefault();
    const next: [number, number] = [
      Math.max(0, Math.min(rows.length - 1, ar + move[0])),
      Math.max(0, Math.min(cols.length - 1, ac + move[1])),
    ];
    setCell(next);
    setAt(next);
  };
  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div
        tabIndex={0}
        role="group"
        aria-label="Activity by day and time. Use the arrow keys to read each slot."
        aria-describedby={id}
        onKeyDown={keys}
        onFocus={() => setAt(cell)}
        onBlur={() => setAt(null)}
        onPointerLeave={() => setAt(null)}
        className={cn(
          "relative grid min-h-0 flex-1 grid-cols-[30px_repeat(7,minmax(0,1fr))] gap-x-[6px] gap-y-[5px] rounded-[6px]",
          focusRing,
        )}
        style={{ gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))` }}
      >
        {values.map((row, ri) => (
          <div key={ri} className="contents">
            <span
              aria-hidden
              className="flex items-center text-[11.5px] leading-4 whitespace-nowrap text-muted-foreground tabular-nums"
            >
              {rows[ri]}
            </span>
            {row.map((v, ci) => {
              const on = at && at[0] === ri && at[1] === ci;
              return (
                <span
                  key={ci}
                  aria-hidden
                  onPointerEnter={() => (setAt([ri, ci]), setCell([ri, ci]))}
                  className={cn(
                    "relative rounded-[4px] transition-[background-color,box-shadow,opacity,transform] duration-300 ease-out motion-reduce:transition-none",
                    on &&
                      "z-10 shadow-[0_0_0_2px_var(--card),0_0_0_3.5px_var(--foreground)]",
                  )}
                  style={{
                    background: ramp((v - min) / Math.max(1, max - min)),
                    opacity: shown ? 1 : 0,
                    transitionDelay: shown ? `${(ri + ci) * 18}ms` : "0ms",
                  }}
                />
              );
            })}
          </div>
        ))}
        {at ? (
          <div
            aria-hidden
            className="pointer-events-none absolute z-20 rounded-[8px] bg-foreground px-2.5 py-1.5 text-[12px] leading-4 whitespace-nowrap text-background shadow-[0_8px_20px_-8px_rgb(0_0_0/0.35)]"
            style={{
              left: `calc(36px + (100% - 36px) * ${(ac + 0.5) / cols.length})`,
              top: `calc((100% + 5px) * ${ar / rows.length} - 6px)`,
              transform: `translate(${ac < 2 ? "-25%" : ac > 4 ? "-75%" : "-50%"}, -100%)`,
            }}
          >
            {describe(ar, ac, values[ar][ac])}
          </div>
        ) : null}
        <p id={id} className="sr-only" aria-live="polite">
          {at ? describe(ar, ac, values[ar][ac]) : ""}
        </p>
      </div>
      <div
        aria-hidden
        className="mt-[13px] grid grid-cols-[30px_repeat(7,minmax(0,1fr))] gap-x-[6px] border-t border-border/80 pt-[10px]"
      >
        <span />
        {cols.map((c, ci) => (
          <span
            key={c}
            className={cn(
              "text-center text-[13.5px] leading-5 transition-colors",
              at && at[1] === ci
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- Pie ---------------------------------- */

export type Slice = { label: string; share: number; color: string };

/** A pie with hairline gaps; labels sit inside slices big enough to hold them. */
export function Pie({
  slices,
  size,
  active,
  onActive,
  className,
}: {
  slices: Slice[];
  size: number;
  active: number | null;
  onActive: (i: number | null) => void;
  className?: string;
}) {
  const total = slices.reduce((n, s) => n + s.share, 0) || 1;
  const rad = size / 2;
  let a = -90;
  const arcs = slices.map((s) => {
    const span = (s.share / total) * 360;
    const a0 = a;
    a += span;
    const p = (deg: number, rr = rad) => [
      rad + rr * Math.cos((deg * Math.PI) / 180),
      rad + rr * Math.sin((deg * Math.PI) / 180),
    ];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a);
    const mid = a0 + span / 2;
    const [lx, ly] = p(mid, rad * 0.6);
    // A lone 100% slice is a full circle, which an arc path can't draw.
    const d =
      span >= 359.99
        ? `M${rad} 0A${rad} ${rad} 0 1 1 ${rad - 0.01} 0Z`
        : `M${rad} ${rad}L${x0} ${y0}A${rad} ${rad} 0 ${span > 180 ? 1 : 0} 1 ${x1} ${y1}Z`;
    return { ...s, d, lx, ly, span };
  });
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      onPointerLeave={() => onActive(null)}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="size-full overflow-visible"
        aria-hidden
      >
        {arcs.map((s, i) => (
          <path
            key={s.label}
            d={s.d}
            onPointerEnter={() => onActive(i)}
            className="origin-center transition-[opacity,transform] duration-200 ease-out"
            style={{
              fill: s.color,
              stroke: "var(--card)",
              strokeWidth: 2.5,
              strokeLinejoin: "round",
              opacity: active !== null && active !== i ? 0.35 : 1,
              transform: active === i ? "scale(1.025)" : undefined,
            }}
          />
        ))}
      </svg>
      {arcs.map((s, i) =>
        s.share >= 10 ? (
          <span
            key={s.label}
            aria-hidden
            className={cn(
              "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-semibold text-white tabular-nums transition-opacity duration-200",
              s.span > 120 ? "text-[19px]" : "text-[14px]",
              active !== null && active !== i && "opacity-40",
            )}
            style={{ left: s.lx, top: s.ly }}
          >
            {s.share}%
          </span>
        ) : null,
      )}
    </div>
  );
}

/* ---------------------------------- World ---------------------------------- */

const merc = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
/** Rows trimmed off the top (the high Arctic), so the map sits in a shorter box. */
const SKIP = 2;
const CELL = (2 * Math.PI) / WORLD.cols;
const ROWS = WORLD.rows.length - SKIP;
// Each land cell is a zero-length round-capped stroke: one path for the whole map.
const DOTS = WORLD.rows
  .slice(SKIP)
  .map((hex, row) => {
    let d = "";
    for (let half = 0; half < 2; half++) {
      const bits = parseInt(hex.slice(half * 8, half * 8 + 8), 16);
      for (let b = 0; b < 32; b++)
        if (bits & (1 << (31 - b)))
          d += `M${half * 32 + b + 0.5} ${row + 0.5}h0`;
    }
    return d;
  })
  .join("");

// Rounded, so the server and the browser (whose Math.log can differ in the last digit) agree on hydration.
const round = (v: number) => Math.round(v * 1000) / 1000;
const place = (c: Country) => ({
  x: round(((c.lon + 180) / 360) * WORLD.cols),
  y: round((merc(WORLD.top) - merc(c.lat)) / CELL - SKIP),
});

/** Dot-matrix world with a marker per country, sized by share. */
export function DotMap({
  countries,
  share,
  active,
  onActive,
  className,
}: {
  countries: Country[];
  share: (c: Country) => number;
  active: string | null;
  onActive: (code: string | null) => void;
  className?: string;
}) {
  const max = Math.max(1, ...countries.map(share));
  const shown = active ? countries.find((c) => c.code === active) : null;
  return (
    <div
      className={cn("relative", className)}
      style={{ aspectRatio: `${WORLD.cols} / ${ROWS}` }}
      onPointerLeave={() => onActive(null)}
    >
      <svg
        viewBox={`0 0 ${WORLD.cols} ${ROWS}`}
        className="absolute inset-0 size-full"
        aria-hidden
      >
        <path
          d={DOTS}
          strokeWidth={0.56}
          strokeLinecap="round"
          style={{
            stroke: "color-mix(in oklch, var(--foreground) 22%, var(--card))",
          }}
        />
        {countries.map((c) => {
          const { x, y } = place(c);
          const k = 0.55 + (share(c) / max) * 0.75;
          const on = active === c.code;
          return (
            <g
              key={c.code}
              transform={`translate(${x} ${y})`}
              onPointerEnter={() => onActive(c.code)}
              className="cursor-pointer"
            >
              <rect
                x={-1.6 * k}
                y={-1.6 * k}
                width={3.2 * k}
                height={3.2 * k}
                rx={0.6}
                className="transition-opacity duration-200"
                style={{
                  fill: "var(--tone-blue-solid)",
                  opacity: on ? 0.32 : 0.16,
                }}
              />
              <rect
                x={-0.62}
                y={-0.62}
                width={1.24}
                height={1.24}
                rx={0.25}
                style={{ fill: "var(--tone-blue-solid)" }}
              />
            </g>
          );
        })}
      </svg>
      {shown ? (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-[8px] bg-foreground px-2.5 py-1.5 text-[12px] leading-4 whitespace-nowrap text-background shadow-[0_8px_20px_-8px_rgb(0_0_0/0.35)]"
          style={{
            left: `${(place(shown).x / WORLD.cols) * 100}%`,
            top: `${(place(shown).y / ROWS) * 100}%`,
            transform: "translate(-50%, calc(-100% - 12px))",
          }}
        >
          <span className="font-semibold">{shown.name}</span> · {share(shown)}%
        </div>
      ) : null}
    </div>
  );
}
