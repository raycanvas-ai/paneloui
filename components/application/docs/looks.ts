"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";
import { flushSync } from "react-dom";

/**
 * Looks: whole-theme customisations every Panelo component picks up for free, because
 * components only read tokens. Each look is a `[data-look]` block in styles/globals.css
 * (colours, chart series, radius and font). This file is the list, a tiny shared store,
 * and the messaging that carries a look into /preview iframes.
 */

export type LookId = "light" | "dark" | "sand" | "ocean" | "forest" | "grape" | "terminal" | "editorial";

export type Look = { id: LookId; name: string; dark: boolean; /** ground, ink, accent — for the picker dot. */ swatch: [string, string, string] };

export const LOOKS: Look[] = [
  { id: "light", name: "Light", dark: false, swatch: ["oklch(0.985 0.002 268)", "oklch(0.145 0 0)", "oklch(0.545 0.196 268)"] },
  { id: "dark", name: "Dark", dark: true, swatch: ["oklch(0.176 0.004 268)", "oklch(0.985 0 0)", "oklch(0.7 0.16 268)"] },
  { id: "sand", name: "Sand", dark: false, swatch: ["oklch(0.972 0.009 75)", "oklch(0.24 0.03 45)", "oklch(0.6 0.15 42)"] },
  { id: "ocean", name: "Ocean", dark: false, swatch: ["oklch(0.975 0.008 235)", "oklch(0.26 0.07 258)", "oklch(0.58 0.17 250)"] },
  { id: "forest", name: "Forest", dark: true, swatch: ["oklch(0.19 0.018 165)", "oklch(0.96 0.015 150)", "oklch(0.78 0.15 155)"] },
  { id: "grape", name: "Grape", dark: false, swatch: ["oklch(0.975 0.01 305)", "oklch(0.25 0.09 295)", "oklch(0.56 0.22 295)"] },
  { id: "terminal", name: "Terminal", dark: true, swatch: ["oklch(0.13 0 0)", "oklch(0.93 0.02 130)", "oklch(0.86 0.2 128)"] },
  { id: "editorial", name: "Editorial", dark: false, swatch: ["oklch(0.965 0.012 88)", "oklch(0.2 0.01 60)", "oklch(0.5 0.18 27)"] },
];

export const lookById = (id: LookId | null) => LOOKS.find((l) => l.id === id) ?? null;

/* One look per page, shared by the player and every preview on it. null = untouched. */
let current: LookId | null = null;
const listeners = new Set<() => void>();
export function setLook(id: LookId | null) {
  if (id === current) return;
  current = id;
  listeners.forEach((l) => l());
}
export const getLook = () => current;
const subscribe = (fn: () => void) => (listeners.add(fn), () => listeners.delete(fn));
export const useLook = () => useSyncExternalStore(subscribe, getLook, () => null);

export const LOOK_MESSAGE = "panelo:look";
export const LOOK_READY = "panelo:look-ready";
export const LOOK_APPLIED = "panelo:look-applied";
export type LookMessage = { type: typeof LOOK_MESSAGE; look: LookId | null };

/** Sends a look into a /preview frame and resolves once the frame has put it on (or after 300ms). */
function send(frame: HTMLIFrameElement, look: LookId | null) {
  const win = frame.contentWindow;
  if (!win || frame.dataset.lookReady !== "1") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      window.clearTimeout(timer);
      window.removeEventListener("message", onAck);
      resolve();
    };
    const onAck = (e: MessageEvent) => {
      if (e.source === win && e.data?.type === LOOK_APPLIED) done();
    };
    const timer = window.setTimeout(done, 300);
    window.addEventListener("message", onAck);
    win.postMessage({ type: LOOK_MESSAGE, look } satisfies LookMessage, window.location.origin);
  });
}

/** Marks an iframe as a look target and keeps it in step: when it loads, when it says it is ready, and on reset. */
export function useLookFrame(ref: RefObject<HTMLIFrameElement | null>) {
  const look = useLook();
  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    frame.dataset.lookFrame = "";
    const ready = () => {
      frame.dataset.lookReady = "1";
      send(frame, getLook());
    };
    const onReady = (e: MessageEvent) => {
      if (e.source === frame.contentWindow && e.data?.type === LOOK_READY) ready();
    };
    window.addEventListener("message", onReady);
    frame.addEventListener("load", ready);
    send(frame, look);
    return () => {
      window.removeEventListener("message", onReady);
      frame.removeEventListener("load", ready);
    };
  }, [ref, look]);
}

/**
 * Changes the page's look in one clean step: element transitions are paused so nothing
 * changes piece by piece, every frame swaps before the page is captured, and the whole page
 * cross-fades once (a view transition) where the browser has them and motion is welcome.
 */
export function transitionTo(id: LookId | null) {
  const root = document.documentElement;
  const swap = async () => {
    root.setAttribute("data-look-switching", "");
    flushSync(() => setLook(id));
    await Promise.all([...document.querySelectorAll<HTMLIFrameElement>("iframe[data-look-frame]")].map((frame) => send(frame, id)));
  };
  const settle = () =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        root.removeAttribute("data-look-switching");
        root.removeAttribute("data-look-vt");
      }),
    );
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition && !calm) {
    root.setAttribute("data-look-vt", "");
    document.startViewTransition(swap).finished.finally(settle);
  } else swap().then(settle);
}

/** Puts a look on an element (a /preview iframe's <html>). `baseDark` is its own dark state. */
export function applyLook(el: HTMLElement, id: LookId | null, baseDark: boolean) {
  const look = lookById(id);
  if (look) el.dataset.look = look.id;
  else delete el.dataset.look;
  el.classList.toggle("dark", look ? look.dark : baseDark);
}

/** Loads the looks' fonts ahead of time, so a font change never lands after the colours. */
export function preloadLookFonts() {
  const style = getComputedStyle(document.documentElement);
  for (const name of ["--font-inter", "--font-mono-source", "--font-geist"]) {
    const family = style.getPropertyValue(name).trim();
    if (family) for (const weight of [400, 500, 600, 700]) document.fonts.load(`${weight} 16px ${family}`).catch(() => {});
  }
}
