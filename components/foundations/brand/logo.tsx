import { cx } from "@/utils/cx";

/**
 * Panelo UI mark: the four-point star, drawn as a mask in the current text colour,
 * so it is ink on the light theme and near-white on the dark one.
 */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label="Panelo UI"
      className={cx("inline-block shrink-0 bg-current text-site-ink", className)}
      style={{
        width: size,
        height: size,
        maskImage: "url(/brand/panelo-mark.png)",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}
