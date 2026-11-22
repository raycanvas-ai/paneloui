"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { rootUser } from "@/data/users";

const schema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters." }),
  email: z.email({ message: "Enter a valid email address." }),
  title: z.string().trim().max(60, { message: "Keep the title under 60 characters." }),
});

type ProfileValues = z.infer<typeof schema>;

export function ProfileForm() {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: rootUser.name, email: rootUser.email, title: "Head of Product" },
  });
  const { isDirty, isSubmitting } = form.formState;

  async function onSubmit(values: ProfileValues) {
    // ponytail: simulated request; swap for the real profile mutation.
    await new Promise((resolve) => setTimeout(resolve, 600));
    form.reset(values);
    toast.success("Profile updated", { description: "Your changes are visible to your team." });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How you appear to teammates across Panelo.</CardDescription>
      </CardHeader>

      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-(--card-spacing)">
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 after:border-0">
              <AvatarImage
                alt={rootUser.name}
                src={rootUser.avatar}
                className="outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
              />
              <AvatarFallback>PG</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline">
                  Upload photo
                </Button>
                <Button type="button" size="sm" variant="ghost" className="text-muted-foreground">
                  Remove
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">PNG or JPG, square, up to 2 MB.</p>
            </div>
          </div>

          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
                  <Input {...field} id="profile-name" autoComplete="name" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-title">Job title</FieldLabel>
                  <Input
                    {...field}
                    id="profile-title"
                    autoComplete="organization-title"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Field className="gap-1.5" data-disabled="true">
              <FieldLabel htmlFor="profile-role">Workspace role</FieldLabel>
              <NativeSelect id="profile-role" className="w-full" defaultValue="owner" disabled>
                <NativeSelectOption value="owner">Owner</NativeSelectOption>
              </NativeSelect>
              <FieldDescription className="text-xs">Only another owner can change your role.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            {isDirty ? "You have unsaved changes." : "All changes saved."}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" disabled={!isDirty || isSubmitting} onClick={() => form.reset()}>
              Discard
            </Button>
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              {isSubmitting ? "Saving" : "Save changes"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
