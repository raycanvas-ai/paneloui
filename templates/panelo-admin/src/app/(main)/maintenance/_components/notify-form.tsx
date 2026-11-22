"use client";

import { useState } from "react";

import { cn } from "cn";
import { BellRing, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

const ICON = "absolute inset-0 size-4 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
const SHOWN = "scale-100 opacity-100";
const HIDDEN = "scale-[0.25] opacity-0 blur-[4px]";

export function NotifyForm() {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (email) return;
        const value = String(new FormData(event.currentTarget).get("email"));
        setEmail(value);
        toast.success("You're on the list", { description: `We'll email ${value} as soon as we're back.` });
      }}
    >
      <label htmlFor="maintenance-email" className="font-medium text-sm">
        Get notified when we&apos;re back
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="maintenance-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          disabled={Boolean(email)}
        />
        <Button type="submit" aria-disabled={Boolean(email)} className="sm:w-32">
          <span className="relative size-4" aria-hidden="true">
            <BellRing className={cn(ICON, email ? HIDDEN : SHOWN)} />
            <Check className={cn(ICON, email ? SHOWN : HIDDEN)} />
          </span>
          {email ? "Subscribed" : "Notify me"}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs" aria-live="polite">
        {email ? `We'll send one email to ${email}.` : "One email when maintenance ends. Nothing else."}
      </p>
    </form>
  );
}
