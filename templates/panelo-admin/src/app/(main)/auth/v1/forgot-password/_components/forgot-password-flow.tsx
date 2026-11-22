"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

import { AuthV1Shell } from "../../../_components/auth-v1-shell";
import { maskEmail, ResendButton } from "../../../_components/resend-button";

const formSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
});

const panel = {
  panelIcon: KeyRound,
  panelSubtitle: "We'll get you back in",
};

const backToLogin = (
  <Link prefetch={false} href="/auth/v1/login" className="inline-flex items-center gap-1 text-primary">
    <ArrowLeft aria-hidden="true" className="size-3" />
    Back to login
  </Link>
);

export function ForgotPasswordFlow() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  function onSubmit({ email }: z.infer<typeof formSchema>) {
    setSentTo(email);
    toast("Reset link sent", { description: `Check ${email} for a link to reset your password.` });
  }

  if (sentTo) {
    return (
      <AuthV1Shell
        {...panel}
        stateKey="sent"
        title="Check your inbox"
        description={
          <>
            We sent a reset link to <span className="font-medium text-foreground">{maskEmail(sentTo)}</span>. It expires
            in 30 minutes.
          </>
        }
        footer={backToLogin}
      >
        <div className="flex flex-col gap-4">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <MailCheck aria-hidden="true" className="size-6" />
          </div>
          <ResendButton onResend={() => toast("Reset link sent again", { description: maskEmail(sentTo) })} />
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setSentTo(null);
              requestAnimationFrame(() => form.setFocus("email"));
            }}
          >
            Use a different email
          </Button>
        </div>
      </AuthV1Shell>
    );
  }

  return (
    <AuthV1Shell
      {...panel}
      title="Forgot password"
      description="Enter the email you signed up with and we'll send you a link to set a new password."
      footer={backToLogin}
    >
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup className="gap-4">
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="forgot-email">Email Address</FieldLabel>
                <Input
                  {...field}
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <Button className="w-full" type="submit">
          Send reset link
        </Button>
      </form>
    </AuthV1Shell>
  );
}
