import { cn } from "cn";

import { Mail } from "./_components/mail";

/** Same accents and canvas as the default overview so mail reads as part of the product. */
const TONE_VARS = "[--tone-primary:var(--primary)] [--tone-secondary:var(--chart-2)]";

export default function Page() {
  return (
    <div
      className={cn("flex h-full min-h-0 flex-col overflow-hidden bg-muted p-4 sm:p-5", TONE_VARS)}
      data-content-padding="false"
    >
      <Mail />
    </div>
  );
}
