"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/sonner";

import { AuthV1Shell } from "../../../_components/auth-v1-shell";
import { PasswordInput } from "../../../_components/password-input";
import { meetsPasswordRequirements, PasswordStrength } from "../../../_components/password-strength";

const formSchema = z
  .object({
    password: z.string().refine(meetsPasswordRequirements, { message: "Password doesn't meet every requirement." }),
    confirm: z.string().min(1, { message: "Please confirm your new password." }),
  })
  .refine((data) => data.password === data.confirm, { message: "Passwords don't match.", path: ["confirm"] });

const panel = {
  panelIcon: LockKeyhole,
  panelSubtitle: "Pick something memorable",
};

export function ResetPasswordFlow() {
  const [done, setDone] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirm: "" },
  });
  const password = useWatch({ control: form.control, name: "password" });

  function onSubmit() {
    setDone(true);
    toast("Password updated", { description: "You can sign in with your new password now." });
  }

  if (done) {
    return (
      <AuthV1Shell
        {...panel}
        stateKey="done"
        title="Password updated"
        description="Your password has been changed and other sessions were signed out."
      >
        <div className="flex flex-col gap-4">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-success/10 text-success">
            <ShieldCheck aria-hidden="true" className="size-6" />
          </div>
          <Button asChild className="w-full">
            <Link prefetch={false} href="/auth/v1/login">
              Back to login
            </Link>
          </Button>
        </div>
      </AuthV1Shell>
    );
  }

  return (
    <AuthV1Shell
      {...panel}
      title="Set a new password"
      description="Choose a password you haven't used on this account before."
      footer={
        <>
          Remembered it?{" "}
          <Link prefetch={false} href="/auth/v1/login" className="text-primary">
            Login
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup className="gap-4">
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reset-password">New password</FieldLabel>
                <PasswordInput
                  {...field}
                  id="reset-password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  aria-describedby="reset-password-strength reset-password-rules"
                />
                <PasswordStrength id="reset-password" password={password} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="confirm"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reset-confirm">Confirm password</FieldLabel>
                <PasswordInput
                  {...field}
                  id="reset-confirm"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <Button className="w-full" type="submit">
          Update password
        </Button>
      </form>
    </AuthV1Shell>
  );
}
