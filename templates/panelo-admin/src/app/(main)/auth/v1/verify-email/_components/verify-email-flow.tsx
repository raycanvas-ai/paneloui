"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Mail, MailCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { toast } from "@/components/ui/sonner";
import { rootUser } from "@/data/users";

import { AuthV1Shell } from "../../../_components/auth-v1-shell";
import { OtpCodeInput } from "../../../_components/otp-code-input";
import { maskEmail, ResendButton } from "../../../_components/resend-button";

const formSchema = z.object({
  code: z.string().length(6, { message: "Enter all 6 digits from the email." }),
});

const panel = {
  panelIcon: MailCheck,
  panelSubtitle: "One quick check",
};

const email = maskEmail(rootUser.email);

export function VerifyEmailFlow() {
  const [verified, setVerified] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "" },
  });

  function onSubmit() {
    setVerified(true);
    toast("Email verified", { description: `${email} is confirmed.` });
  }

  if (verified) {
    return (
      <AuthV1Shell
        {...panel}
        stateKey="verified"
        title="Email verified"
        description={
          <>
            Thanks, <span className="font-medium text-foreground">{email}</span> is confirmed. Your workspace is ready.
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-success/10 text-success">
            <BadgeCheck aria-hidden="true" className="size-6" />
          </div>
          <Button asChild className="w-full">
            <Link prefetch={false} href="/dashboard/default">
              Continue to dashboard
            </Link>
          </Button>
        </div>
      </AuthV1Shell>
    );
  }

  return (
    <AuthV1Shell
      {...panel}
      title="Verify your email"
      description={
        <>
          We sent a verification link to <span className="font-medium text-foreground">{email}</span>. Click it, or
          enter the 6-digit code from the same email.
        </>
      }
      footer={
        <>
          Wrong address?{" "}
          <Link prefetch={false} href="/auth/v1/register" className="text-primary">
            Change email
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Mail aria-hidden="true" className="size-6" />
        </div>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <Field className="items-center gap-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="verify-code" className="sr-only">
                  Verification code
                </FieldLabel>
                <OtpCodeInput {...field} id="verify-code" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError className="text-center" errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Button className="w-full" type="submit">
            Verify email
          </Button>
        </form>

        <FieldSeparator>or</FieldSeparator>

        <ResendButton onResend={() => toast("Verification email sent", { description: email })} />
      </div>
    </AuthV1Shell>
  );
}
