"use client";

import { useEffect } from "react";

/**
 * Inside a preview frame (a catalogue card or the component page's device stage), the page's own scrollbar
 * goes: phones and tablets draw overlay scrollbars, and a classic bar would poke out of the device's
 * rounded corner. Wheel, touch and keyboard scrolling are untouched; opened full screen, nothing changes.
 */
export function EmbeddedFrame() {
  useEffect(() => {
    if (window.self === window.top) return;
    document.documentElement.style.scrollbarWidth = "none";
  }, []);
  return null;
}
