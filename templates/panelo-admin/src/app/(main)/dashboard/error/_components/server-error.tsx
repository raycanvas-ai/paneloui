"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "cn";
import { ArrowUpRight, Check, Copy, House, RotateCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const REQUEST_ID = "req_01J8ZK4M7Q2F9X3T6B";

const ICON = "absolute inset-0 size-3.5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
const SHOWN = "scale-100 opacity-100";
const HIDDEN = "scale-[0.25] opacity-0 blur-[4px]";

export function ServerError() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  // Clipboard is unavailable outside secure contexts; the ID stays selectable as a fallback.
  const copyRequestId = () => navigator.clipboard?.writeText(REQUEST_ID).then(() => setCopied(true));

  return (
    <div className="flex h-full min-h-[32rem] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="animate-stage stage-0 flex flex-col items-center gap-3">
          <Badge variant="destructive">Error 500</Badge>
          <p
            aria-hidden="true"
            className="font-medium text-7xl text-muted-foreground/30 leading-none tracking-tighter tabular-nums sm:text-8xl"
          >
            500
          </p>
        </div>

        <div className="animate-stage stage-1 flex flex-col gap-2">
          <h1 className="text-balance font-medium text-2xl leading-tight tracking-tight sm:text-3xl">
            Something went wrong on our end
          </h1>
          <p className="text-muted-foreground text-sm">
            The server couldn&apos;t complete your request. Our on-call engineer has been notified. Try again in a
            moment, and if it keeps happening, share the request ID below with support.
          </p>
        </div>

        <button
          type="button"
          onClick={copyRequestId}
          className="animate-stage stage-2 inline-flex items-center gap-2 rounded-lg border bg-muted/50 py-1.5 pr-2.5 pl-3 font-mono text-muted-foreground text-xs outline-none transition-[scale,background-color] duration-150 ease-out hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]"
        >
          <span className="tabular-nums">{REQUEST_ID}</span>
          <span className="relative size-3.5" aria-hidden="true">
            <Copy className={cn(ICON, copied ? HIDDEN : SHOWN)} />
            <Check className={cn(ICON, "text-success", copied ? SHOWN : HIDDEN)} />
          </span>
          <span className="sr-only" aria-live="polite">
            {copied ? "Request ID copied" : "Copy request ID"}
          </span>
        </button>

        <div className="animate-stage stage-3 flex flex-wrap items-center justify-center gap-2">
          <Button onClick={() => router.refresh()}>
            <RotateCw data-icon="inline-start" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link prefetch={false} href="/dashboard/default">
              <House data-icon="inline-start" />
              Go to dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link prefetch={false} href="/dashboard/help#status">
              System status
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
