"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, subMinutes } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/sonner";

import { PasswordInput } from "../../../_components/password-input";

const formSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function IdleSince({ minutes }: { minutes: number }) {
  // Set after mount: a prerendered timestamp would show the build server's clock and timezone.
  const [lockedAt, setLockedAt] = useState<Date | null>(null);
  useEffect(() => setLockedAt(subMinutes(new Date(), minutes)), [minutes]);

  return (
    <>
      Locked after {minutes} min idle
      {lockedAt && (
        <>
          , since{" "}
          <time dateTime={lockedAt.toISOString()} className="text-foreground tabular-nums">
            {format(lockedAt, "h:mm a")}
          </time>
        </>
      )}
    </>
  );
}

export function LockScreenForm({ username }: { username: string }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "" },
  });

  function onSubmit() {
    toast("Unlocked", { description: "Picking up where you left off." });
    router.push("/dashboard/default");
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Lets password managers match the saved credential for this account. */}
      <input type="text" name="username" autoComplete="username" value={username} readOnly hidden />
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="lock-password">Password</FieldLabel>
              <PasswordInput
                {...field}
                id="lock-password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button className="w-full" type="submit">
        Unlock
      </Button>
    </form>
  );
}
