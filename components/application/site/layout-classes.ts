import { cx } from "@/utils/cx";

// One column, one gutter, one rhythm: every row of the page starts on the same edge.
export const CONTAINER = "mx-auto w-full max-w-[1152px] px-6";
export const SECTION = "py-20 sm:py-28";
export const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";
export const TEXT_LINK = cx("rounded-sm text-site-muted transition-colors duration-150 hover:text-site-ink", FOCUS);
