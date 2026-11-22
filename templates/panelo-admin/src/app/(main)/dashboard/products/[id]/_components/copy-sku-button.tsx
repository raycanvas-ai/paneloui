"use client";

import { useEffect, useState } from "react";

import { cn } from "cn";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const iconSwap = "transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
const iconHidden = "scale-[0.25] opacity-0 blur-[4px]";

export function CopySkuButton({ sku }: { sku: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timeout);
  }, [copied]);

  function copy() {
    navigator.clipboard.writeText(sku).then(
      () => setCopied(true),
      () => toast.error("Couldn't copy the SKU. Select it and copy manually."),
    );
  }

  return (
    <Button variant="ghost" size="icon-xs" onClick={copy} aria-label={copied ? "SKU copied" : "Copy SKU"}>
      {/* Both icons stay mounted so the swap cross-fades in both directions. */}
      <span className="relative grid place-items-center">
        <Copy className={cn(iconSwap, copied && iconHidden)} />
        <Check className={cn("absolute text-success", iconSwap, !copied && iconHidden)} />
      </span>
    </Button>
  );
}
