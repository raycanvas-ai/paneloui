"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";

const schema = z.object({
  name: z.string().trim().min(2, { message: "Workspace name must be at least 2 characters." }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{3,32}$/, { message: "Use 3–32 lowercase letters, numbers, or hyphens." }),
  language: z.string(),
  timezone: z.string(),
});

type WorkspaceValues = z.infer<typeof schema>;

const languages = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "de-DE", label: "Deutsch" },
  { value: "fr-FR", label: "Français" },
  { value: "ja-JP", label: "日本語" },
];

const timezones = [
  { value: "America/Los_Angeles", label: "(GMT−07:00) Pacific Time" },
  { value: "America/New_York", label: "(GMT−04:00) Eastern Time" },
  { value: "Europe/London", label: "(GMT+01:00) London" },
  { value: "Europe/Berlin", label: "(GMT+02:00) Berlin" },
  { value: "Asia/Kolkata", label: "(GMT+05:30) India Standard Time" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
];

export function WorkspaceForm() {
  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "Panelo Studio", slug: "panelo-studio", language: "en-US", timezone: "Asia/Kolkata" },
  });
  const { errors, isDirty, isSubmitting } = form.formState;

  async function onSubmit(values: WorkspaceValues) {
    // ponytail: simulated request; swap for the real workspace mutation.
    await new Promise((resolve) => setTimeout(resolve, 600));
    form.reset(values);
    toast.success("Workspace updated");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription>Shared defaults for everyone in Panelo Studio.</CardDescription>
      </CardHeader>

      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-(--card-spacing)">
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field className="gap-1.5" data-invalid={!!errors.name}>
              <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
              <Input id="workspace-name" aria-invalid={!!errors.name} {...form.register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field className="gap-1.5" data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="workspace-slug">Workspace URL</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>panelo.app/</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="workspace-slug"
                  spellCheck={false}
                  aria-invalid={!!errors.slug}
                  {...form.register("slug")}
                />
              </InputGroup>
              {errors.slug ? (
                <FieldError errors={[errors.slug]} />
              ) : (
                <FieldDescription className="text-xs">Changing this breaks existing shared links.</FieldDescription>
              )}
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="workspace-language">Language</FieldLabel>
              <NativeSelect id="workspace-language" className="w-full" {...form.register("language")}>
                {languages.map((language) => (
                  <NativeSelectOption key={language.value} value={language.value}>
                    {language.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor="workspace-timezone">Timezone</FieldLabel>
              <NativeSelect id="workspace-timezone" className="w-full" {...form.register("timezone")}>
                {timezones.map((timezone) => (
                  <NativeSelectOption key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="ghost" disabled={!isDirty || isSubmitting} onClick={() => form.reset()}>
            Discard
          </Button>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? "Saving" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
