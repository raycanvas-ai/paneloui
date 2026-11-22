import type { ComponentProps } from "react";

import { cn } from "cn";
import type { SimpleIcon as BrandIcon } from "simple-icons";

/** Draws a simple-icons brand glyph; the brand's title doubles as the accessible name. */
export function SimpleIcon({ icon, className, ...rest }: { icon: BrandIcon } & ComponentProps<"svg">) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      aria-label={icon.title}
      className={cn("size-5 fill-foreground", className)}
      {...rest}
    >
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  );
}
