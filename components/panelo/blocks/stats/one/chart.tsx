"use client";

import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { cn } from "@/components/panelo/lib/utils";

import { DATA, focusRing, money } from "./parts";

/* -------------------------------------------------------------------------- */
/*  Area chart for one series. The SVG stretches to the box (non-scaling      */
/*  stroke); labels, marker and readout are HTML placed by percentage, so it  */
/*  needs no measuring. Hover, or focus it and use the arrow keys.            */
/* -------------------------------------------------------------------------- */

type Point = { date: Date; value: number };

/** Monotone cubic (Fritsch–Carlson): smooth, and never overshoots the data between points. */
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

/** A round top for the axis: 1, 2, 2.5 or 5 times a power of ten, split in five. */
function niceMax(max: number) {
  const raw = Math.max(1, max) / 5;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].find((k) => k * p >= raw)! * p;
  return { top: step * 5, step };
}

const W = 1000;
const H = 1000;
/** Points sit this far in from the plot's edges. */
const INSET = 6;

export function AreaChart({
  data,
  label,
  height = 258,
  className,
}: {
  data: Point[];
  label: string;
  height?: number;
  className?: string;
}) {
  const id = useId();
  const n = data.length;
  const [active, setActive] = useState<number | null>(null);
  // The line draws itself in once; the chart is re-keyed when its series changes, so it redraws then too.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // At rest the readout sits on the last full day; today is still filling up.
  const i = Math.min(active ?? Math.max(0, n - 2), n - 1);
  const { top, step } = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = Array.from({ length: 6 }, (_, k) => top - k * step);
  const fx = (k: number) => (n > 1 ? k / (n - 1) : 0.5);
  const fy = (v: number) => `${(1 - v / top) * 100}%`;
  const line = monotone(
    data.map((d, k) => [fx(k) * W, H - (d.value / top) * H]),
  );
  const left = (f: number) =>
    `calc(${INSET}px + (100% - ${INSET * 2}px) * ${f})`;
  const day = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const long = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  // Seven labels at most; the first and last always show.
  const every = Math.max(1, Math.ceil(n / 7));
  const labelled = data
    .map((_, k) => k)
    .filter((k) => k % every === 0 || k === n - 1)
    .filter((k, j, all) => k === n - 1 || all[j + 1] - k >= every * 0.75);

  const pick = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = (e.clientX - r.left - INSET) / Math.max(1, r.width - INSET * 2);
    setActive(Math.max(0, Math.min(n - 1, Math.round(f * (n - 1)))));
  };
  const keys = (e: KeyboardEvent) => {
    const next = { ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: n - 1 }[
      e.key
    ];
    if (next === undefined) return;
    e.preventDefault();
    setActive(Math.max(0, Math.min(n - 1, next)));
  };
  const shift = fx(i) < 0.12 ? "-18%" : fx(i) > 0.88 ? "-82%" : "-50%";
  const glide =
    "transition-[left,top] duration-200 ease-out motion-reduce:transition-none";

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex" style={{ height }}>
        <div aria-hidden className="relative w-[52px] shrink-0">
          {ticks.map((t, k) => (
            <span
              key={t}
              className="absolute end-0 -translate-y-1/2 text-[14.5px] leading-5 text-muted-foreground tabular-nums"
              style={{ top: `${(k / 5) * 100}%` }}
            >
              {money(t)}
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
            "relative ms-[17px] min-w-0 flex-1 cursor-crosshair touch-pan-y rounded-[4px]",
            focusRing,
          )}
        >
          {ticks.map((t, k) => (
            <span
              key={t}
              aria-hidden
              className={cn(
                "absolute inset-x-0 border-t",
                k === 5
                  ? "border-border"
                  : "border-dashed border-foreground/[0.08]",
              )}
              style={{ top: `${(k / 5) * 100}%` }}
            />
          ))}
          <svg
            aria-hidden
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute inset-y-0 overflow-visible transition-[clip-path] duration-700 ease-out motion-reduce:transition-none"
            style={{
              insetInline: INSET,
              width: `calc(100% - ${INSET * 2}px)`,
              height: "100%",
              clipPath: shown
                ? "inset(-4px -4px -4px -4px)"
                : "inset(-4px 100% -4px -4px)",
            }}
          >
            <defs>
              <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0"
                  style={{ stopColor: DATA, stopOpacity: 0.16 }}
                />
                <stop offset="1" style={{ stopColor: DATA, stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            {n > 1 ? (
              <path d={`${line}L${W},${H}L0,${H}Z`} fill={`url(#${id}-fill)`} />
            ) : null}
            <path
              d={line}
              fill="none"
              strokeWidth={1.75}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ stroke: DATA }}
            />
          </svg>
          {n ? (
            <>
              {/* A guide down to the axis while reading, so the value lines up with its day. */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-0 border-s border-dashed border-foreground/20 transition-opacity duration-150",
                  glide,
                  active === null ? "opacity-0" : "opacity-100",
                )}
                style={{ left: left(fx(i)), top: fy(data[i].value) }}
              />
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-card",
                  glide,
                )}
                style={{
                  left: left(fx(i)),
                  top: fy(data[i].value),
                  borderColor: DATA,
                  boxShadow: `0 0 0 5px color-mix(in oklch, ${DATA} 14%, transparent)`,
                }}
              />
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute z-10 flex min-w-[112px] flex-col items-center rounded-[9px] bg-foreground px-3 py-[7px] text-center text-background shadow-[0_8px_20px_-8px_rgb(0_0_0/0.35)]",
                  glide,
                )}
                style={{
                  left: left(fx(i)),
                  top: fy(data[i].value),
                  transform: `translate(${shift}, calc(-100% - 19px))`,
                }}
              >
                <span className="text-[12px] leading-4 whitespace-nowrap text-background/60">
                  {long(data[i].date)}
                </span>
                <span className="mt-0.5 text-[15px] leading-5 font-semibold tabular-nums">
                  {money(data[i].value)}
                </span>
              </div>
            </>
          ) : null}
          <p id={id} className="sr-only" aria-live="polite">
            {n ? `${long(data[i].date)}: ${money(data[i].value)}` : "No data"}
          </p>
        </div>
      </div>
      <div aria-hidden className="relative ms-[69px] mt-[17px] h-5">
        {labelled.map((k, j) => (
          <span
            key={k}
            // Narrow screens keep every third label (and the last) so they never collide.
            className={cn(
              "absolute top-0 text-[14.5px] leading-5 whitespace-nowrap text-muted-foreground transition-colors",
              k === i && active !== null && "text-foreground",
              j % 3 && k !== n - 1 && "hidden @xl:block",
            )}
            style={{
              left: left(fx(k)),
              transform: `translateX(${k === 0 ? "0%" : k === n - 1 ? "-100%" : "-50%"})`,
            }}
          >
            {day(data[k].date)}
          </span>
        ))}
      </div>
    </div>
  );
}
