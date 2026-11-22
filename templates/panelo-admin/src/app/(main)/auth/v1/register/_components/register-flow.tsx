"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { rootUser } from "@/data/users";

import { AuthV1Shell } from "../../../_components/auth-v1-shell";
import { PasswordInput } from "../../../_components/password-input";
import { meetsPasswordRequirements, PasswordStrength } from "../../../_components/password-strength";
import { type SocialProvider, SocialSignIn } from "../../../_components/social-sign-in";

const LATENCY = 700;

const formSchema = z.object({
  name: z.string().trim().min(2, { message: "Enter your full name." }),
  email: z.email({ message: "Enter a valid work email." }),
  password: z.string().refine(meetsPasswordRequirements, { message: "Password doesn't meet every requirement." }),
  terms: z.boolean().refine(Boolean, { message: "Accept the terms to create your account." }),
});

type FormValues = z.infer<typeof formSchema>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const linkClass = "text-primary underline-offset-4 hover:underline";

export function RegisterFlow() {
  const router = useRouter();
  const [social, setSocial] = useState<SocialProvider | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", terms: false },
  });
  const password = useWatch({ control: form.control, name: "password" });
  const { isSubmitting } = form.formState;
  const busy = isSubmitting || social !== null;

  async function onSubmit(values: FormValues) {
    await wait(LATENCY);
    // The demo account already exists, which shows the "email taken" state without a backend.
    if (values.email.toLowerCase() === rootUser.email) {
      form.setError("email", { message: "An account already uses this email. Log in instead." }, { shouldFocus: true });
      return;
    }
    toast("Account created", { description: `We sent a 6-digit code to ${values.email}.` });
    router.push("/auth/v1/verify-email");
  }

  async function signUpWith(provider: SocialProvider) {
    setSocial(provider);
    await wait(LATENCY);
    toast(`Signed up with ${provider === "google" ? "Google" : "GitHub"}`);
    router.push("/dashboard/onboarding");
  }

  return (
    <AuthV1Shell
      panelIcon={Sparkles}
      panelSubtitle="Your workspace in two minutes"
      title="Create your account"
      description="Free for your first three teammates. No card needed."
      footer={
        <>
          Already have an account?{" "}
          <Link prefetch={false} href="/auth/v1/login" className="text-primary">
            Log in
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <SocialSignIn pending={social} disabled={isSubmitting} onSelect={signUpWith} />

        <FieldSeparator>or with email</FieldSeparator>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-name">Full name</FieldLabel>
                  <Input
                    {...field}
                    id="register-name"
                    placeholder="Alex Morgan"
                    autoComplete="name"
                    readOnly={busy}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? "register-name-error" : undefined}
                  />
                  {fieldState.invalid && <FieldError id="register-name-error" errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-email">Work email</FieldLabel>
                  <Input
                    {...field}
                    id="register-email"
                    type="email"
                    inputMode="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    // readOnly, not disabled: a taken email moves focus back here mid-submit.
                    readOnly={busy}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? "register-email-error" : undefined}
                  />
                  {fieldState.invalid && <FieldError id="register-email-error" errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-password">Password</FieldLabel>
                  <PasswordInput
                    {...field}
                    id="register-password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    readOnly={busy}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={`register-password-strength register-password-rules${fieldState.invalid ? " register-password-error" : ""}`}
                  />
                  <PasswordStrength id="register-password" password={password} />
                  {fieldState.invalid && <FieldError id="register-password-error" errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="terms"
              render={({ field, fieldState }) => (
                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                  <Checkbox
                    ref={field.ref}
                    id="register-terms"
                    name={field.name}
                    checked={field.value}
                    disabled={busy}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? "register-terms-error" : undefined}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="register-terms" className="font-normal">
                      I agree to the{" "}
                      <Link prefetch={false} href="/dashboard/help" className={linkClass}>
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link prefetch={false} href="/dashboard/help" className={linkClass}>
                        Privacy Policy
                      </Link>
                    </FieldLabel>
                    {fieldState.invalid && <FieldError id="register-terms-error" errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          <Button className="w-full" type="submit" disabled={busy} aria-busy={isSubmitting}>
            {isSubmitting ? <Spinner className="size-4" aria-hidden="true" /> : null}
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </div>
    </AuthV1Shell>
  );
}
