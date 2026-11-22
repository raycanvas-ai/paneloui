"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ShieldCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

import { AuthV1Shell } from "../../../_components/auth-v1-shell";
import { OtpCodeInput } from "../../../_components/otp-code-input";

// Demo credentials: this template has no backend to check codes against.
const DEMO_CODE = "123456";
const RECOVERY_CODE_PATTERN = /^[a-z0-9]{5}-[a-z0-9]{5}$/i;

interface FormValues {
  code: string;
  recovery: string;
  trust: boolean;
}

type Mode = "app" | "recovery";

const copy: Record<Mode, { title: string; description: string; toggle: string }> = {
  app: {
    title: "Two-factor authentication",
    description: "Open your authenticator app and enter the 6-digit code for this account.",
    toggle: "Use a recovery code instead",
  },
  recovery: {
    title: "Use a recovery code",
    description: "Enter one of the recovery codes you saved when you turned on two-factor authentication.",
    toggle: "Use authenticator app instead",
  },
};

export function TwoFactorFlow() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("app");
  const form = useForm<FormValues>({ defaultValues: { code: "", recovery: "", trust: false } });

  function onSubmit(values: FormValues) {
    if (mode === "app" && values.code !== DEMO_CODE) {
      form.setValue("code", "");
      form.setError("code", { message: "That code didn't work. Codes refresh every 30 seconds, try the latest one." });
      return;
    }
    if (mode === "recovery" && !RECOVERY_CODE_PATTERN.test(values.recovery.trim())) {
      form.setError("recovery", { message: "Recovery codes look like 4f7k2-9qd1m." });
      return;
    }
    toast("Signed in", {
      description: values.trust ? "We won't ask for a code on this device for 30 days." : "Welcome back.",
    });
    router.push("/dashboard/default");
  }

  const submit = form.handleSubmit(onSubmit);

  return (
    <AuthV1Shell
      panelIcon={ShieldCheck}
      panelSubtitle="Keeping your account yours"
      title={copy[mode].title}
      description={copy[mode].description}
      footer={
        <Link prefetch={false} href="/auth/v1/login" className="text-primary">
          Back to login
        </Link>
      }
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <FieldGroup className="gap-4">
          {mode === "app" ? (
            <Controller
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <Field className="items-center gap-2" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="two-factor-code" className="sr-only">
                    Authentication code
                  </FieldLabel>
                  <OtpCodeInput
                    {...field}
                    id="two-factor-code"
                    aria-invalid={fieldState.invalid}
                    onChange={(value) => {
                      field.onChange(value);
                      if (fieldState.invalid) form.clearErrors("code");
                    }}
                    // Submits as soon as the sixth digit lands, no button press needed.
                    onComplete={() => void submit()}
                  />
                  {fieldState.invalid ? (
                    <FieldError className="text-center" errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription className="text-center">
                      Demo code: <span className="font-medium text-foreground tabular-nums">{DEMO_CODE}</span>
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
          ) : (
            <Controller
              control={form.control}
              name="recovery"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="two-factor-recovery">Recovery code</FieldLabel>
                  <Input
                    {...field}
                    id="two-factor-recovery"
                    placeholder="xxxxx-xxxxx"
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono tabular-nums"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}

          <Controller
            control={form.control}
            name="trust"
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox
                  id="two-factor-trust"
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                />
                <FieldContent>
                  <FieldLabel htmlFor="two-factor-trust" className="font-normal">
                    Trust this device for 30 days
                  </FieldLabel>
                </FieldContent>
              </Field>
            )}
          />
        </FieldGroup>

        <Button className="w-full" type="submit">
          Verify
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            form.clearErrors();
            setMode(mode === "app" ? "recovery" : "app");
          }}
        >
          {copy[mode].toggle}
        </Button>
      </form>
    </AuthV1Shell>
  );
}
