import { useSyncExternalStore } from "react";

/** At or above Tailwind's lg breakpoint (1024px). */
const QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const list = window.matchMedia(QUERY);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}

/** True on desktop-width viewports. Reads false on the server and during hydration, then follows the media query. */
export function useIsLg() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
