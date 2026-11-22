import { cn } from "cn";

import { Chat } from "./_components/chat";
import { ChatHeader } from "./_components/chat-header";
import { conversations } from "./_components/data";

/** Same accents and canvas as the default overview so chat reads as part of the product. */
const TONE_VARS = "[--tone-primary:var(--primary)] [--tone-secondary:var(--chart-2)]";

export default function Page() {
  return (
    <div
      className={cn("flex h-full min-h-0 flex-col gap-4 overflow-hidden bg-muted p-4 sm:p-5", TONE_VARS)}
      data-content-padding="false"
    >
      <ChatHeader />
      <Chat conversations={conversations} />
    </div>
  );
}
