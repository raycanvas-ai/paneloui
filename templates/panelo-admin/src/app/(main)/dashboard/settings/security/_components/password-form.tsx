"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { Check } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";

const rules = [
  { label: "12+ characters", test: (value: string) => value.length >= 12 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One number", test: (value: string) => /\d/.test(value) },
  { label: "One symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

const schema = z
  .object({
    current: z.string().min(1, { message: "Enter your current password." }),
    next: z.string().refine((value) => rules.every((rule) => rule.test(value)), {
      message: "Meet every requirement below.",
    }),
    confirm: z.string(),
  })
  .refine((values) => values.next === values.confirm, { message: "Passwords don't match.", path: ["confirm"] })
  .refine((values) => values.next !== values.current, {
    message: "Choose a password you haven't used here.",
    path: ["next"],
  });

type PasswordValues = z.infer<typeof schema>;

export function PasswordForm() {
  const form = useForm<PasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { current: "", next: "", confirm: "" },
  });
  const { errors, isSubmitting } = form.formState;
  const next = useWatch({ control: form.control, name: "next" });

  async function onSubmit() {
    // ponytail: simulated request; swap for the real password mutation.
    await new Promise((resolve) => setTimeout(resolve, 700));
    form.reset();
    toast.success("Password changed", { description: "Other sessions stay signed in until you revoke them." });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Last changed 94 days ago.</CardDescription>
      </CardHeader>

      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-(--card-spacing)">
        <CardContent>
          <FieldGroup className="gap-4">
            <Field className="gap-1.5 sm:max-w-sm" data-invalid={!!errors.current}>
              <FieldLabel htmlFor="password-current">Current password</FieldLabel>
              <Input
                id="password-current"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.current}
                {...form.register("current")}
              />
              <FieldError errors={[errors.current]} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field className="gap-1.5" data-invalid={!!errors.next}>
                <FieldLabel htmlFor="password-next">New password</FieldLabel>
                <Input
                  id="password-next"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.next}
                  aria-describedby="password-rules"
                  {...form.register("next")}
                />
                <FieldError errors={[errors.next]} />
              </Field>
              <Field className="gap-1.5" data-invalid={!!errors.confirm}>
                <FieldLabel htmlFor="password-confirm">Confirm new password</FieldLabel>
                <Input
                  id="password-confirm"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirm}
                  {...form.register("confirm")}
                />
                <FieldError errors={[errors.confirm]} />
              </Field>
            </div>

            <ul id="password-rules" className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
              {rules.map((rule) => {
                const met = rule.test(next);
                return (
                  <li
                    key={rule.label}
                    className={cn(
                      "flex items-center gap-2 transition-[color] duration-150 ease-out",
                      met ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    <Check aria-hidden="true" className={cn("size-3.5", !met && "opacity-40")} />
                    {rule.label}
                    <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
                  </li>
                );
              })}
            </ul>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? "Updating" : "Update password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
