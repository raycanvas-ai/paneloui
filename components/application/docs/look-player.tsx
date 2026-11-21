"use client";

import { useEffect, useMemo, useState } from "react";
import { RiPlayFill, RiRestartLine, RiStopFill } from "@remixicon/react";

import { LOOKS, preloadLookFonts, setLook, transitionTo, useLook, type Look } from "@/components/application/docs/looks";
import { cx } from "@/utils/cx";

/** How long each theme stays on screen during the preview. */
const DWELL = 2400;
const ring = "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";

/** A theme as a dot: its ground with its accent in the middle. */
function Swatch({ look }: { look: Look }) {
  const [ground, , accent] = look.swatch;
  return (
    <span aria-hidden className="grid size-4 shrink-0 place-items-center rounded-full ring-1 ring-black/10 ring-inset" style={{ background: ground }}>
      <span className="size-1.5 rounded-full" style={{ background: accent }} />
    </span>
  );
}

/**
 * "Preview themes": shows the components on the page in every theme, once, then puts them back.
 * While it runs the bar shows which theme is up and how far through it is; any segment can be
 * clicked to stop on that theme, and reset returns to the original.
 */
export function LookPlayer({ className }: { className?: string }) {
  const look = useLook();
  const [base, setBase] = useState<"light" | "dark">("light");
  const [step, setStep] = useState<number | null>(null);
  const playing = step !== null;
  // The page's own theme is the starting point, so the tour skips its twin.
  const tour = useMemo(() => LOOKS.filter((l) => l.id !== base), [base]);
  // While a cross-fade is starting the store still holds the old look; show where the tour is going.
  const current = LOOKS.find((l) => l.id === look) ?? (step !== null ? tour[step] : undefined);

  useEffect(() => {
    setBase(document.documentElement.classList.contains("dark") ? "dark" : "light");
    preloadLookFonts();
    return () => setLook(null);
  }, []);

  useEffect(() => {
    if (step === null) return;
    const timer = window.setTimeout(() => {
      if (step + 1 < tour.length) {
        setStep(step + 1);
        transitionTo(tour[step + 1].id);
      } else {
        setStep(null);
        transitionTo(null);
      }
    }, DWELL);
    return () => window.clearTimeout(timer);
  }, [step, tour]);

  const start = () => {
    setStep(0);
    transitionTo(tour[0].id);
  };
  const stop = () => {
    setStep(null);
    transitionTo(null);
  };
  const pick = (l: Look) => {
    setStep(null);
    if (l.id !== look) transitionTo(l.id);
  };

  const shell = "inline-flex h-9 items-center rounded-full bg-site-surface shadow-site-raised ring-1 ring-site-hairline";
  const round = cx("grid size-6 shrink-0 cursor-pointer place-items-center rounded-full bg-site-ink text-site-surface transition-transform duration-150 hover:scale-105 active:scale-95", ring);

  if (!current) {
    return (
      <button type="button" onClick={start} className={cx(shell, "group cursor-pointer gap-2.5 ps-2 pe-1.5 transition-shadow duration-150 hover:ring-site-ring", ring, className)}>
        {/* A little palette: four of the themes' accents, fanning out on hover. */}
        <span aria-hidden className="flex">
          {["dark", "sand", "ocean", "forest"].map((id, i) => {
            const l = LOOKS.find((x) => x.id === id)!;
            return <span key={id} className={cx("size-[18px] rounded-full ring-2 ring-site-surface transition-[margin] duration-200 ease-out", i > 0 && "-ms-1.5 group-hover:-ms-0.5")} style={{ background: id === "dark" ? l.swatch[0] : l.swatch[2] }} />;
          })}
        </span>
        <span className="text-site-body-medium text-site-ink">Preview themes</span>
        <span aria-hidden className="grid size-6 place-items-center rounded-full bg-site-ink text-site-surface transition-transform duration-150 group-hover:scale-105">
          <RiPlayFill className="size-3 translate-x-px" />
        </span>
      </button>
    );
  }

  return (
    <div role="group" aria-label="Theme preview" className={cx(shell, "gap-3 ps-1.5 pe-2", className)}>
      {playing ? (
        <button type="button" aria-label="Stop the theme preview" title="Stop" onClick={stop} className={round}>
          <RiStopFill className="size-3" aria-hidden />
        </button>
      ) : (
        <button type="button" aria-label="Preview all themes again" title="Play again" onClick={start} className={round}>
          <RiPlayFill className="size-3 translate-x-px" aria-hidden />
        </button>
      )}

      <span aria-live="polite" className="flex w-[88px] items-center gap-2 text-site-body-medium text-site-ink">
        <Swatch look={current} />
        <span className="truncate">{current.name}</span>
      </span>

      <span className="flex items-center">
        {tour.map((l, i) => {
          const done = playing ? i < step : l.id === look;
          const now = playing && i === step;
          return (
            <button key={l.id} type="button" aria-label={`Show the ${l.name} theme`} aria-pressed={l.id === look} title={l.name} onClick={() => pick(l)} className={cx("group/seg grid h-6 w-[18px] cursor-pointer place-items-center rounded-sm", ring)}>
              <span className="relative h-1 w-3.5 overflow-hidden rounded-full bg-site-pill-hover">
                {done ? <span className="absolute inset-0 rounded-full bg-site-ink" /> : null}
                {now ? <span key={step} className="absolute inset-0 origin-left rounded-full bg-site-ink [animation:look-progress_var(--dwell)_linear_forwards]" style={{ ["--dwell" as string]: `${DWELL}ms` }} /> : null}
                {!done && !now ? <span className="absolute inset-0 rounded-full bg-site-ink opacity-0 transition-opacity group-hover/seg:opacity-30" /> : null}
              </span>
            </button>
          );
        })}
      </span>

      {playing ? (
        <span className="w-7 text-end text-site-count text-site-faint tabular-nums">
          {step + 1}/{tour.length}
        </span>
      ) : (
        <button type="button" aria-label="Back to the original theme" title="Reset" onClick={stop} className={cx("grid size-6 cursor-pointer place-items-center rounded-full text-site-muted hover:bg-site-pill hover:text-site-ink", ring)}>
          <RiRestartLine className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}
