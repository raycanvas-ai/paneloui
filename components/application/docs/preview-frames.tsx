"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Numeric scale, measured with JavaScript. The CSS-only `scale(calc(tan(atan2(…))))`
 * resolves in Blink but not in iOS WebKit, so it is only the first paint's best effort.
 */
function useMeasuredScale(compute: (available: number, sm: boolean) => number) {
  const ref = useRef<HTMLDivElement>(null);
  const computeRef = useRef(compute);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    computeRef.current = compute;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = window.matchMedia("(min-width: 640px)");
    const measure = () => {
      const available = el.clientWidth;
      if (available > 0) setScale(computeRef.current(available, media.matches));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    media.addEventListener("change", measure);
    measure();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", measure);
    };
  }, []);

  return { ref, scale };
}

// Literal class strings so Tailwind generates them; add a width here before passing it to `Scaled`.
const SCALED_FIT: Record<number, string> = {
  720: "[--sc-fit:min(calc((100cqw_-_16px)*0.92),720px)] sm:[--sc-fit:min(calc((100cqw_-_16px)*1),720px)]",
};

/** Scales a full-size card into a preview area, padded on the start and bleeding off the end. */
export function Scaled({ width, children }: { width: number; children: ReactNode }) {
  const { ref, scale } = useMeasuredScale((available, sm) => Math.min(sm ? available : Math.max(available - 16, 1), width) / width);

  return (
    <div ref={ref} className="absolute inset-y-0 top-4 start-4 end-0 overflow-hidden">
      <div
        className={`origin-top-left rtl:origin-top-right ${SCALED_FIT[width] ?? ""}`}
        style={{ width, transform: scale === null ? `scale(calc(tan(atan2(var(--sc-fit), ${width}px))))` : `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A whole screen centred and scaled into a preview: a 1280×855 desktop canvas, or a
 * 390×844 phone below `sm` so the screen lays itself out as a phone.
 */
export function TemplateFrame({ children }: { children: ReactNode }) {
  const { ref, scale } = useMeasuredScale((available, sm) => (sm ? (available - 24) / 1280 : Math.min(available - 24, 300) / 390));

  return (
    <div ref={ref} className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className={
          "shrink-0 overflow-hidden rounded-[34px] border-[3px] border-border-button-default " +
          "h-[844px] w-[390px] [--tpl-w:390px] [--tpl-fit:min(calc(100cqw_-_24px),300px)] [--template-preview-height:844px] " +
          "sm:h-[855px] sm:w-[1280px] sm:[--tpl-w:1280px] sm:[--tpl-fit:calc(100cqw_-_24px)] sm:[--template-preview-height:855px]"
        }
        style={{ transform: scale === null ? "scale(calc(tan(atan2(var(--tpl-fit), var(--tpl-w)))))" : `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

/** A desktop screen (1280×855 unless sized) scaled to fill its box edge to edge; the box sets the aspect. */
export function ScreenFrame({ width = 1280, height = 855, children }: { width?: number; height?: number; children: ReactNode }) {
  const { ref, scale } = useMeasuredScale((available) => available / width);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden [container-type:inline-size]">
      <div
        className="origin-top-left rtl:origin-top-right"
        style={{ width, height, transform: scale === null ? `scale(calc(tan(atan2(100cqw, ${width}px))))` : `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

/** Card sizing for screen previews: the preview area is exactly the scaled canvas plus 12px around it. */
export const TEMPLATE_CARD = {
  className: "h-auto xl:h-auto",
  previewClassName:
    "h-[calc(min(100cqw-24px,300px)*844/390+24px)] sm:h-[calc((100cqw-24px)*855/1280+24px)] xl:h-[calc((100cqw-24px)*855/1280+24px)]",
};
