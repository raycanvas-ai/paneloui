"use client";

import * as React from "react";

import { cn } from "cn";
import { Eye, EyeOff, Triangle } from "lucide-react";

import { DOT_UP } from "./portfolio-chrome";
import {
  CURSOR_INDEX,
  DEFAULT_RANGE,
  PRICE_DOMAIN,
  PRICE_POINTS,
  PRICE_TICKS,
  performance,
  priceSeries,
  RANGES,
  type Range,
  TIME_TICKS,
  timeAt,
  VOLUME_BARS,
  volumeSeries,
} from "./portfolio-data";

// Plot geometry. The SVG stretches (preserveAspectRatio="none") so every stroke
// carries vector-effect and all text lives in absolutely-positioned overlays.
const W = 1000;
const H = 300;
const VOLUME_H = 52;

const fractionOf = (i: number) => i / (PRICE_POINTS - 1);
const x = (i: number) => fractionOf(i) * W;
const y = (v: number) => H - ((v - PRICE_DOMAIN.min) / (PRICE_DOMAIN.max - PRICE_DOMAIN.min)) * H;
const yPct = (v: number) => (y(v) / H) * 100;

/** Stair path: hold each close, then step to the next — the reference's shape. */
const stepPath = priceSeries
  .map((v, i) => (i === 0 ? `M0 ${y(v).toFixed(1)}` : `H${x(i).toFixed(1)} V${y(v).toFixed(1)}`))
  .join(" ");

const areaPath = `${stepPath} V${H} H0 Z`;

function RangeFilter() {
  const [range, setRange] = React.useState<Range>(DEFAULT_RANGE);

  return (
    <fieldset className="flex shrink-0 items-center gap-2">
      <legend className="sr-only">Chart range</legend>
      {RANGES.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={range === item}
          onClick={() => setRange(item)}
          className={cn(
            "flex h-[32px] items-center rounded-full border px-3.5 text-[16px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            range === item
              ? "border-transparent bg-accent font-medium text-foreground"
              : "border-border text-muted-foreground hover:bg-card hover:text-foreground",
          )}
        >
          {item}
        </button>
      ))}
    </fieldset>
  );
}

function PriceChart() {
  const plot = React.useRef<HTMLDivElement>(null);
  const [hover, setHover] = React.useState<number | null>(null);

  // The crosshair rests at the reference index until the pointer takes over.
  const index = hover ?? CURSOR_INDEX;
  const price = priceSeries[index];
  const at = fractionOf(index);

  const clamp = (value: number) => Math.min(PRICE_POINTS - 1, Math.max(0, value));

  const track = (clientX: number) => {
    const el = plot.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    setHover(clamp(Math.round(((clientX - left) / width) * (PRICE_POINTS - 1))));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (!step) return;
    event.preventDefault();
    setHover((current) => clamp((current ?? CURSOR_INDEX) + step));
  };

  return (
    <div className="min-w-0">
      <div className="flex">
        <div
          ref={plot}
          // The crosshair is a value on the time axis, so the plot behaves as a slider:
          // pointer drags it, arrow keys nudge it, screen readers get the reading.
          role="slider"
          tabIndex={0}
          aria-label="Portfolio price history crosshair"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={PRICE_POINTS - 1}
          aria-valuenow={index}
          aria-valuetext={`${performance.date} ${timeAt(at)}, $${price.toFixed(2)}`}
          onPointerMove={(event) => track(event.clientX)}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKeyDown}
          onBlur={() => setHover(null)}
          className="relative h-[260px] min-w-0 flex-1 touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="size-full" aria-hidden="true">
            <defs>
              <linearGradient id="portfolio-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={DOT_UP} stopOpacity="0.22" />
                <stop offset="100%" stopColor={DOT_UP} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Volume histogram stays inert — direction is read off the line. */}
            {volumeSeries.map((v, i) => (
              <rect
                key={i}
                x={(i / VOLUME_BARS) * W}
                width={(W / VOLUME_BARS) * 0.42}
                y={H - v * VOLUME_H}
                height={v * VOLUME_H}
                fill="var(--muted)"
              />
            ))}

            <path d={areaPath} fill="url(#portfolio-area)" />
            <path
              d={stepPath}
              fill="none"
              stroke={DOT_UP}
              strokeWidth="1.6"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            <line
              x1="0"
              x2={W}
              y1={y(price)}
              y2={y(price)}
              className="stroke-border"
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={x(index)}
              x2={x(index)}
              y1="0"
              y2={H}
              className="stroke-muted-foreground/60"
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <span
            className="pointer-events-none absolute size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background"
            style={{ left: `${at * 100}%`, top: `${yPct(price)}%`, borderColor: DOT_UP }}
            aria-hidden="true"
          />

          <div
            // Clamped so the readout stays inside the plot at either end.
            className="pointer-events-none absolute top-4 hidden -translate-x-1/2 whitespace-nowrap rounded-[10px] border border-border bg-card px-3 py-2 sm:block"
            style={{ left: `${Math.min(86, Math.max(14, at * 100))}%` }}
          >
            <div className="flex items-baseline gap-4 text-[14px]">
              <span className="font-medium">{performance.date}</span>
              <span className="text-muted-foreground tabular-nums">{timeAt(at)}</span>
            </div>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Price: <span className="font-semibold text-foreground tabular-nums">${price.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Axis column: gridline labels plus the last-close and crosshair badges. */}
        <div className="relative ml-2 h-[260px] w-[52px] shrink-0">
          {PRICE_TICKS.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2 text-[13px] text-muted-foreground tabular-nums"
              style={{ top: `${yPct(tick)}%` }}
            >
              {tick.toFixed(2)}
            </span>
          ))}
          <span
            className="absolute -left-2 flex h-[21px] -translate-y-1/2 items-center rounded-[5px] px-1.5 font-medium text-[13px] text-black tabular-nums"
            style={{ top: `${yPct(performance.last)}%`, backgroundColor: DOT_UP }}
          >
            {performance.last.toFixed(2)}
          </span>
          <span
            className="absolute -left-2 flex h-[21px] -translate-y-1/2 items-center rounded-[5px] bg-foreground px-1.5 font-medium text-[13px] text-background tabular-nums"
            style={{ top: `${yPct(price)}%` }}
          >
            {price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="relative mr-[54px] mt-2 h-[22px] text-[13px] text-muted-foreground">
        {TIME_TICKS.map(([label, tickAt]) => (
          <span key={label} className="absolute -translate-x-1/2" style={{ left: `${tickAt * 100}%` }}>
            {label}
          </span>
        ))}
        <span
          className="absolute -top-[3px] flex h-[26px] -translate-x-1/2 items-center whitespace-nowrap rounded-full bg-accent px-3 font-medium text-[13px] text-foreground tabular-nums"
          style={{ left: `${Math.min(90, Math.max(10, at * 100))}%` }}
        >
          {performance.day} {timeAt(at)}
        </span>
      </div>
    </div>
  );
}

/** One flat cell of the summary strip — the companies table-header treatment. */
function SummaryCell({
  label,
  value,
  marker,
  className,
}: {
  readonly label: string;
  readonly value: string;
  readonly marker?: boolean;
  readonly className?: string;
}) {
  return (
    <div className={cn("flex flex-col justify-center gap-1.5 px-4 py-3", className)}>
      <span className="text-[16px] text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium text-[20px] tabular-nums">
        {marker && <Triangle className="size-[9px] shrink-0" style={{ fill: DOT_UP, color: DOT_UP }} />}
        {value}
      </span>
    </div>
  );
}

export function PerformancePanel() {
  const [visible, setVisible] = React.useState(true);

  return (
    <section className="border-border border-b px-5 pb-[26px]" aria-labelledby="portfolio-performance">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-[22px]">
        <h2 id="portfolio-performance" className="font-semibold text-[20px] tracking-[-0.01em]">
          Portfolio Performance
        </h2>
        <RangeFilter />
      </div>

      <div className="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="text-[16px] text-muted-foreground">Today investment value</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-semibold text-[38px] leading-none tracking-[-0.02em] tabular-nums">
              {visible ? performance.value : "••••••••"}
            </span>
            <button
              type="button"
              onClick={() => setVisible((prev) => !prev)}
              aria-label={visible ? "Hide portfolio value" : "Show portfolio value"}
              aria-pressed={!visible}
              className="flex size-[32px] shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {visible ? (
                <Eye className="size-[16px]" strokeWidth={1.6} />
              ) : (
                <EyeOff className="size-[16px]" strokeWidth={1.6} />
              )}
            </button>
          </div>
          <p className="mt-3 flex items-center gap-2 text-[16px] text-muted-foreground">
            <span className="size-[7px] shrink-0 rounded-full" style={{ backgroundColor: DOT_UP }} />
            Your portfolio is <span className="text-foreground">{performance.changePct}</span> today
          </p>

          <div className="mt-[22px] border-border border-y bg-muted/40">
            <SummaryCell label="Today's Gain" value={performance.gain} marker />
            <div className="grid grid-cols-2 border-border border-t">
              <SummaryCell label="Day Low" value={performance.dayLow} />
              <SummaryCell label="Day High" value={performance.dayHigh} className="border-border border-l" />
            </div>
          </div>
        </div>

        <PriceChart />
      </div>
    </section>
  );
}
