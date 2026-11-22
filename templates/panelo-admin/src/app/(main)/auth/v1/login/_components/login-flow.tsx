"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, LogIn } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { rootUser } from "@/data/users";

import { AuthV1Shell } from "../../../_components/auth-v1-shell";
import { PasswordInput } from "../../../_components/password-input";
import { type SocialProvider, SocialSignIn } from "../../../_components/social-sign-in";

// Demo credentials: this template has no backend, so one account signs in and anything else is rejected.
const DEMO = { email: rootUser.email, password: "Panelo#2026" };
const LATENCY = 700;

const formSchema = z.object({
  email: z.email({ message: "Enter the email you signed up with." }),
  password: z.string().min(1, { message: "Enter your password." }),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function LoginFlow() {
  const router = useRouter();
  const [social, setSocial] = useState<SocialProvider | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", remember: true },
  });
  const { isSubmitting, errors } = form.formState;
  const busy = isSubmitting || social !== null;

  async function onSubmit(values: FormValues) {
    await wait(LATENCY);
    if (values.email.toLowerCase() !== DEMO.email || values.password !== DEMO.password) {
      form.setError("root", { message: "That email and password don't match an account." });
      form.resetField("password", { keepError: true });
      form.setFocus("password");
      return;
    }
    toast("Password accepted", { description: "One more step: confirm it's you." });
    router.push("/auth/v1/two-factor");
  }

  async function signInWith(provider: SocialProvider) {
    setSocial(provider);
    await wait(LATENCY);
    toast(`Signed in with ${provider === "google" ? "Google" : "GitHub"}`);
    router.push("/dashboard/default");
  }

  return (
    <AuthV1Shell
      panelIcon={LogIn}
      panelSubtitle="Your workspace is waiting"
      title="Log in to Panelo"
      description="Use your work email, or continue with a provider you've linked."
      footer={
        <>
          New to Panelo?{" "}
          <Link prefetch={false} href="/auth/v1/register" className="text-primary">
            Create an account
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <SocialSignIn pending={social} disabled={isSubmitting} onSelect={signInWith} />

        <FieldSeparator>or with email</FieldSeparator>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {errors.root ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive text-sm"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {errors.root.message}
            </div>
          ) : null}

          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-email">Work email</FieldLabel>
                  <Input
                    {...field}
                    id="login-email"
                    type="email"
                    inputMode="email"
                    placeholder="you@company.com"
                    autoComplete="username"
                    readOnly={busy}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? "login-email-error" : undefined}
                  />
                  {fieldState.invalid && <FieldError id="login-email-error" errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel htmlFor="login-password">Password</FieldLabel>
                    <Link
                      prefetch={false}
                      href="/auth/v1/forgot-password"
                      className="text-primary text-xs underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordInput
                    {...field}
                    id="login-password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    // readOnly, not disabled: a failed attempt moves focus back here mid-submit.
                    readOnly={busy}
                    aria-invalid={fieldState.invalid || Boolean(errors.root)}
                    aria-describedby={fieldState.invalid ? "login-password-error" : "login-demo"}
                  />
                  {fieldState.invalid ? (
                    <FieldError id="login-password-error" errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription id="login-demo">
                      Demo: <span className="font-medium text-foreground">{DEMO.email}</span> /{" "}
                      <span className="font-medium text-foreground">{DEMO.password}</span>{" "}
                      <button
                        type="button"
                        className="cursor-pointer text-primary underline-offset-4 hover:underline"
                        onClick={() => {
                          form.clearErrors();
                          form.setValue("email", DEMO.email);
                          form.setValue("password", DEMO.password);
                        }}
                      >
                        Fill in
                      </button>
                    </FieldDescription>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="remember"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id="login-remember"
                    name={field.name}
                    checked={field.value}
                    disabled={busy}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  <FieldLabel htmlFor="login-remember" className="font-normal">
                    Keep me signed in on this device
                  </FieldLabel>
                </Field>
              )}
            />
          </FieldGroup>

          <Button className="w-full" type="submit" disabled={busy} aria-busy={isSubmitting}>
            {isSubmitting ? <Spinner className="size-4" aria-hidden="true" /> : null}
            {isSubmitting ? "Checking…" : "Log in"}
          </Button>
        </form>
      </div>
    </AuthV1Shell>
  );
}
