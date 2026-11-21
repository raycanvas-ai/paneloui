"use client";

import { useEffect } from "react";

import { applyLook, LOOK_APPLIED, LOOK_MESSAGE, LOOK_READY, lookById, preloadLookFonts, type LookId, type LookMessage } from "@/components/application/docs/looks";

/** Inside /preview: wears the look the parent page sends (the parent does the cross-fade), or `?look=` full screen. */
export function LookReceiver() {
  useEffect(() => {
    const root = document.documentElement;
    const baseDark = root.classList.contains("dark");
    const apply = (id: LookId | null) => {
      if ((root.dataset.look ?? null) === id) return;
      // Transitions off for the swap, so every element lands on the new look in the same frame.
      root.setAttribute("data-look-switching", "");
      applyLook(root, id, baseDark);
      void getComputedStyle(root).color;
      requestAnimationFrame(() => requestAnimationFrame(() => root.removeAttribute("data-look-switching")));
    };

    const fromUrl = new URLSearchParams(window.location.search).get("look") as LookId | null;
    if (lookById(fromUrl)) apply(fromUrl);
    preloadLookFonts();

    const onMessage = (e: MessageEvent<LookMessage>) => {
      if (e.origin !== window.location.origin || e.data?.type !== LOOK_MESSAGE) return;
      apply(lookById(e.data.look)?.id ?? null);
      (e.source as Window | null)?.postMessage({ type: LOOK_APPLIED }, e.origin);
    };
    window.addEventListener("message", onMessage);
    if (window.parent !== window) window.parent.postMessage({ type: LOOK_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return null;
}
