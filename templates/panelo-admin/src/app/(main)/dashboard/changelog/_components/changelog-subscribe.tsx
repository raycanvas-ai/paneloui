"use client";

import { useState } from "react";

import { cn } from "cn";
import { Check, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

export function ChangelogSubscribe() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get release notes by email</CardTitle>
        <CardDescription>One short email per release. No marketing.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (subscribed) return;
            const email = new FormData(event.currentTarget).get("email");
            setSubscribed(true);
            toast.success(`Subscribed ${email} to release notes`);
          }}
        >
          <label htmlFor="changelog-email" className="sr-only">
            Email address
          </label>
          <Input
            id="changelog-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            disabled={subscribed}
          />
          <Button type="submit" aria-disabled={subscribed}>
            <span className="relative size-4" aria-hidden="true">
              <Mail className={cn(ICON, subscribed ? HIDDEN : SHOWN)} />
              <Check className={cn(ICON, subscribed ? SHOWN : HIDDEN)} />
            </span>
            <span aria-live="polite">{subscribed ? "Subscribed" : "Subscribe"}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const ICON = "absolute inset-0 size-4 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
const SHOWN = "scale-100 opacity-100";
const HIDDEN = "scale-[0.25] opacity-0 blur-[4px]";
