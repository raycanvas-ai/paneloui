"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

/** "hello@paneloguy.com" -> "h••••@paneloguy.com" */
export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return domain ? `${name.charAt(0)}${"•".repeat(Math.max(name.length - 1, 3))}@${domain}` : email;
}

function formatSeconds(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ResendButton({ cooldown = 60, onResend }: { cooldown?: number; onResend: () => void }) {
  const [remaining, setRemaining] = useState(cooldown);
  const waiting = remaining > 0;

  useEffect(() => {
    if (remaining <= 0) return;
    const timeout = setTimeout(() => setRemaining((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timeout);
  }, [remaining]);

  return (
    // aria-disabled instead of disabled keeps focus on the button while the cooldown runs.
    <Button
      type="button"
      variant="outline"
      className="w-full aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
      aria-disabled={waiting}
      onClick={() => {
        if (waiting) return;
        onResend();
        setRemaining(cooldown);
      }}
    >
      {waiting ? (
        <span>
          Resend available in <span className="tabular-nums">{formatSeconds(remaining)}</span>
        </span>
      ) : (
        "Resend email"
      )}
    </Button>
  );
}
