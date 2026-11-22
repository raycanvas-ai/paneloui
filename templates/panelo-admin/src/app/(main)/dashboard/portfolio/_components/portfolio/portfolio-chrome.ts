// Shared skin for the home screen, lifted from the companies screen so both
// pages read as one system: flat surfaces, hairline rules, pill controls, and
// colour spent only on 7px status dots, one green ramp, and a single CTA.

/** Status dots read from the app scale, so this screen agrees with every other. */
export const DOT_UP = "var(--success-solid)";
export const DOT_DOWN = "var(--destructive)";
/** The single saturated control on the screen is bg-primary hover:bg-primary/90. */

/** One hue, varying weight — the companies WinBar/sparkline technique, except
 *  the hue now comes from the theme instead of being frozen into the file. */
export function ramp(t: number, up = true) {
  const token = up ? "var(--success-solid)" : "var(--destructive)";
  return `color-mix(in oklab, ${token} ${Math.round(100 - t * 45)}%, transparent)`;
}

export const iconPill =
  "flex size-[38px] shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const ghostPill =
  "flex size-[30px] shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Section heading row: same rhythm as the companies toolbar. */
export const panelHead = "flex items-center justify-between gap-3 px-5 py-[18px]";
