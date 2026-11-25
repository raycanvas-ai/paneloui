"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { RiComputerLine, RiSmartphoneLine, RiTabletLine } from "@remixicon/react";
import { SegmentedControl, SegmentedControlItem } from "@ui-sdk/react/segmented-control";

import { useLookFrame } from "@/components/application/docs/looks";
import { cx } from "@/utils/cx";

export type Device = "desktop" | "tablet" | "mobile";

/**
 * The canvas each device gives the component: a real viewport of this width, so the component's own
 * breakpoints and container queries respond exactly as they would on the device. Tablet sits on
 * Tailwind's `md` (768px) boundary; mobile is a 390×844 phone.
 */
export const DEVICES: Record<Device, { label: string; width: number; height: number; icon: ComponentType<{ className?: string }>; radius: number }> = {
  desktop: { label: "Desktop", width: 1440, height: 900, icon: RiComputerLine, radius: 0 },
  tablet: { label: "Tablet", width: 768, height: 1024, icon: RiTabletLine, radius: 22 },
  mobile: { label: "Mobile", width: 390, height: 844, icon: RiSmartphoneLine, radius: 34 },
};
const ORDER: Device[] = ["desktop", "tablet", "mobile"];
const KEY = "panelo:preview-device";
/** Room around a tablet or phone on its stage. */
const PAD = 28;

/** The chosen device, remembered across component pages. Desktop until the browser says otherwise. */
export function usePreviewDevice() {
  const [device, setDevice] = useState<Device>("desktop");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && saved in DEVICES) setDevice(saved as Device);
    } catch {
      // Storage blocked: the choice just isn't remembered.
    }
  }, []);
  const choose = (next: Device) => {
    setDevice(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  };
  return [device, choose] as const;
}

/** Desktop / Tablet / Mobile, in the same segmented style as the catalogue's tier filter. */
export function DeviceSwitcher({ device, onChange, className }: { device: Device; onChange: (device: Device) => void; className?: string }) {
  return (
    <div className={cx("flex items-center", className)}>
      <SegmentedControl
        aria-label="Preview size"
        value={device}
        onValueChange={(value: string | null) => value && onChange(value as Device)}
        className="flex h-7 items-center gap-0.5 rounded-full bg-site-pill p-0.5"
      >
        {ORDER.map((id) => {
          const { label, icon: Icon, width: w } = DEVICES[id];
          return (
            <SegmentedControlItem
              key={id}
              value={id}
              aria-label={`${label}, ${w} pixels wide`}
              title={`${label} · ${w}px`}
              className={cx(
                "grid h-6 w-8 cursor-pointer place-items-center rounded-full text-site-muted transition-colors duration-150 outline-none",
                "hover:text-site-ink data-checked:bg-site-surface data-checked:text-site-ink data-checked:shadow-site-raised",
                "focus-visible:ring-2 focus-visible:ring-border-focus-ring",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </SegmentedControlItem>
          );
        })}
      </SegmentedControl>
    </div>
  );
}

/**
 * A live preview at a device's size. One iframe for every device, so switching keeps the component's
 * state: its real width is the device's, and it's scaled to fit the column (and, for a tablet or phone,
 * the window's height). Desktop fills the box edge to edge; a tablet or phone sits framed on a stage.
 */
export function DeviceStage({ device, src, title }: { device: Device; src: string; title: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  useLookFrame(frame);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  // Sizes animate only once the page has settled, so a remembered phone appears as a phone, not a shrinking desktop.
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => (second = requestAnimationFrame(() => setAnimate(true))));
    return () => (cancelAnimationFrame(first), cancelAnimationFrame(second));
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setBox({ width: el.clientWidth, height: window.innerHeight });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const spec = DEVICES[device];
  const desktop = device === "desktop";
  // Desktop: as wide as the box. Tablet and phone: never upscaled, and short enough to see whole on screen.
  const scale = !box
    ? null
    : desktop
      ? box.width / spec.width
      : Math.min(1, (box.width - PAD * 2) / spec.width, Math.max(520, box.height - 200) / spec.height);
  const stageHeight = scale === null ? undefined : desktop ? spec.height * scale : spec.height * scale + PAD * 2;

  return (
    <div
      ref={stage}
      style={{ height: stageHeight }}
      className={cx(
        "relative w-full overflow-hidden rounded-2xl border border-site-hairline [container-type:inline-size]",
        animate && "transition-[height,background-color] duration-300 ease-out motion-reduce:transition-none",
        desktop ? "bg-site-surface" : "bg-site-preview",
        // Before the first measure, hold the desktop shape so the page doesn't jump.
        scale === null && "aspect-[1440/900]",
      )}
    >
      <div
        className={cx(
          "absolute start-1/2 -translate-x-1/2 overflow-hidden bg-site-surface rtl:translate-x-1/2",
          animate && "transition-[width,height,top,border-radius,box-shadow,clip-path] duration-300 ease-out motion-reduce:transition-none",
          !desktop && "shadow-site-raised ring-1 ring-site-hairline",
        )}
        style={{
          top: desktop ? 0 : PAD,
          width: scale === null ? "100%" : spec.width * scale,
          height: scale === null ? "100%" : spec.height * scale,
          borderRadius: spec.radius * (scale ?? 1),
          // Clips the iframe too: Chrome doesn't round a composited iframe with overflow and radius alone.
          clipPath: `inset(0 round ${spec.radius * (scale ?? 1)}px)`,
        }}
      >
        <div
          className="origin-top-left rtl:origin-top-right"
          style={{
            width: spec.width,
            height: spec.height,
            transform: scale === null ? `scale(calc(tan(atan2(100cqw, ${spec.width}px))))` : `scale(${scale})`,
          }}
        >
          <iframe ref={frame} src={src} title={`${title} preview, ${spec.label.toLowerCase()}`} className="size-full border-0" />
        </div>
      </div>
    </div>
  );
}
