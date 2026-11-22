"use client";

import { useEffect, useState } from "react";

import { cn } from "cn";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

const swap = "transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
const hidden = "scale-[0.25] opacity-0 blur-[4px]";
const shown = "scale-100 opacity-100 blur-[0px]";

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className={cn(copied && "text-success hover:text-success", className)}
    >
      {/* Both icons stay mounted so the swap cross-fades in both directions. */}
      <span className="relative grid size-4 place-items-center">
        <Copy aria-hidden="true" className={cn("col-start-1 row-start-1", swap, copied ? hidden : shown)} />
        <Check aria-hidden="true" className={cn("col-start-1 row-start-1", swap, copied ? shown : hidden)} />
      </span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </Button>
  );
}
