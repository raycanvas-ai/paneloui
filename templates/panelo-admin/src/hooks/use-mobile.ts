import { useSyncExternalStore } from "react";

/** Below Tailwind's md breakpoint (768px). */
const QUERY = "(max-width: 767px)";

function subscribe(onChange: () => void) {
  const list = window.matchMedia(QUERY);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}

/** True on phone-width viewports. Reads false on the server and during hydration, then follows the media query. */
export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
