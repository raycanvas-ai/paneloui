---
title: "shadcn Multi-Step Form: A 3-Step Sign-Up in React"
description: "Build a multi-step sign-up form with shadcn/ui, React Hook Form and Zod: per-step validation, a progress bar, focus on step change, and a live workspace URL."
slug: shadcn-multi-step-signup-form
primaryKeyword: shadcn multi step form
secondaryKeywords:
  - shadcn signup form
  - multi step signup form react
  - multi step form nextjs shadcn
  - react hook form multi step zod
intent: informational
cluster: shadcn blocks
date: 2026-11-24
status: draft
author: Raycanvas
cta:
  free: [login-pages-2]
  pro: [dashboard-pages-5, sidebars-1]
wordCount: 2367
---

# shadcn Multi-Step Form: A 3-Step Sign-Up in React

To build a multi-step form with shadcn/ui, keep one React Hook Form instance and one Zod schema for the whole flow, render only the current step's fields, and call `trigger()` with that step's field names before moving on. Move focus to the new step's heading, and validate the full schema again on the server.

> **Skip the build:** [Sign Up Flow](https://www.paneloui.com/components/login-pages-2) is a free, MIT-licensed shadcn/ui block that is this three-step sign-up, already built: account with validation, a workspace step whose URL follows the name until you edit it, and a profile step, beside an art panel that tracks progress, with focus moved to each new step's heading. Add it with `npx shadcn@latest add @panelo/login-pages-2` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## Does shadcn/ui have a multi-step form component?

No. shadcn/ui gives you the parts: `Field`, `FieldLabel`, `FieldError` and friends for layout and errors, plus guides for [React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form), TanStack Form and Formisch. Its five sign-up blocks are single-page forms, one of them split-screen. There is no stepper.

So you compose one. The pattern below uses React Hook Form and Zod because the shadcn/ui docs use them, but the same ideas work with TanStack Form.

## How should you split a sign-up into steps?

Split by what the user is thinking about, not by field count. A common three-step sign-up:

1. **Account:** email and password. The only step you truly need before creating a user.
2. **Workspace:** team or company name and its URL.
3. **Profile:** name, role, avatar.

Keep the first step short. Every field you move later is a field that cannot block someone from getting an account. If a step could be skipped, let it be skipped.

## How do you validate one step at a time?

Install the pieces first:

```bash
npx shadcn@latest add field input button
npm install react-hook-form zod @hookform/resolvers
```

Then define one schema for the whole flow and list which fields belong to each step. React Hook Form's `trigger()` accepts an array of field names and returns a `Promise<boolean>`, which is exactly what a Continue button needs.

```ts
// lib/sign-up-schema.ts (shared by the form and the server)
import * as z from "zod"

export const signUpSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  workspace: z.string().trim().min(1, "Name your workspace."),
  slug: z.string().regex(/^[a-z0-9-]{3,32}$/, "Use 3 to 32 lowercase letters, numbers or dashes."),
  fullName: z.string().trim().min(1, "Enter your name."),
})
export type SignUpValues = z.infer<typeof signUpSchema>
```

```tsx
// components/sign-up-form.tsx
"use client"

import { useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, type FieldPath } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUpSchema, type SignUpValues as Values } from "@/lib/sign-up-schema"
import { cn } from "@/lib/utils"

type Name = FieldPath<Values>

const STEPS: { title: string; fields: Name[] }[] = [
  { title: "Create your account", fields: ["email", "password"] },
  { title: "Set up your workspace", fields: ["workspace", "slug"] },
  { title: "Set up your profile", fields: ["fullName"] },
]

const INPUTS: Record<Name, { label: string; type?: string; autoComplete: string; hint?: string }> = {
  email: { label: "Email", type: "email", autoComplete: "email" },
  password: { label: "Password", type: "password", autoComplete: "new-password", hint: "At least 8 characters." },
  workspace: { label: "Workspace name", autoComplete: "organization" },
  slug: { label: "Workspace URL", autoComplete: "off", hint: "Lowercase letters, numbers and dashes." },
  fullName: { label: "Full name", autoComplete: "name" },
}

export function SignUpForm() {
  const [step, setStep] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const form = useForm<Values>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", workspace: "", slug: "", fullName: "" },
  })
  const last = step === STEPS.length - 1

  const goTo = (next: number) => {
    setStep(next)
    // Land keyboard and screen-reader users on the new step.
    requestAnimationFrame(() => heading.current?.focus())
  }

  const next = async () => {
    const ok = await form.trigger(STEPS[step].fields, { shouldFocus: true })
    if (ok) goTo(step + 1)
  }

  const finish = form.handleSubmit(async (values) => {
    const res = await fetch("/api/signup", { method: "POST", body: JSON.stringify(values) })
    if (!res.ok) form.setError("email", { message: "We couldn't create that account. Try again." })
  })

  return (
    <form
      noValidate
      onSubmit={(e) => (last ? finish(e) : (e.preventDefault(), next()))}
      className="mx-auto flex w-full max-w-sm flex-col gap-6"
    >
      <ol aria-label="Sign-up progress" className="flex gap-2">
        {STEPS.map((s, i) => (
          <li key={s.title} aria-current={i === step ? "step" : undefined} className="flex-1">
            <span aria-hidden className={cn("block h-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
            <span className="sr-only">
              Step {i + 1} of {STEPS.length}: {s.title}
              {i < step ? ", done" : ""}
            </span>
          </li>
        ))}
      </ol>

      <h1 ref={heading} tabIndex={-1} className="text-2xl font-semibold outline-none">
        {STEPS[step].title}
      </h1>

      <FieldGroup>
        {STEPS[step].fields.map((name) => (
          <Controller
            key={name}
            name={name}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{INPUTS[name].label}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type={INPUTS[name].type}
                  autoComplete={INPUTS[name].autoComplete}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : INPUTS[name].hint ? (
                  <FieldDescription>{INPUTS[name].hint}</FieldDescription>
                ) : null}
              </Field>
            )}
          />
        ))}
      </FieldGroup>

      <div className="flex gap-3">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => goTo(step - 1)}>
            Back
          </Button>
        ) : null}
        <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
          {last ? "Create account" : "Continue"}
        </Button>
      </div>
    </form>
  )
}
```

Why it is built this way:

- **One form, not three.** Values from earlier steps survive Back and Continue, because React Hook Form keeps values for unmounted fields by default.
- **Enter works on every step.** The form's submit handler runs `next()` until the last step, so pressing Enter in a field behaves like Continue.
- **`shouldFocus: true`** sends focus to the first invalid field when a step fails.
- **`mode: "onTouched"`** shows an error after someone leaves a field, then re-checks on every keystroke, so the message clears as soon as it is fixed.

## How do you make a live workspace URL field?

A nice touch on the workspace step: the URL follows the name until the user edits the URL by hand. React Hook Form tracks that for you, because a field you change with `setValue` (without `shouldDirty`) stays clean, while typing into it marks it dirty.

```tsx
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)

// In the workspace field's render prop:
<Input
  {...field}
  onChange={(e) => {
    field.onChange(e)
    if (!form.getFieldState("slug").isDirty) form.setValue("slug", slugify(e.target.value))
  }}
/>
```

Show the result next to the input as `northwind.example.com`, and put that preview in a `dir="ltr"` element so it reads correctly in right-to-left layouts.

The free [Sign Up Flow](https://www.paneloui.com/components/login-pages-2) applies the same rule with a plain `slugTouched` flag instead of React Hook Form's dirty state, if you want to compare the two.

## How do you make step changes accessible?

When the step changes, everything under the progress bar is replaced. Without help, a screen reader announces nothing and keyboard focus falls back to the page body.

- **Move focus to the new heading.** The heading has `tabIndex={-1}` so it can take focus without becoming a tab stop.
- **Mark the current step** with `aria-current="step"`, and give each step a text label ("Step 2 of 3: Set up your workspace, done") rather than only a coloured bar.
- **Tie errors to inputs.** shadcn/ui's `Field` plus `aria-invalid` on the input does the visual side; keep each message short and specific ("Use at least 8 characters", not "Invalid").
- **Use the right `autocomplete` values.** `new-password` on the sign-up password lets password managers offer a strong one; `email`, `name` and `organization` fill the rest.

## How do you validate on the server?

The client schema is for speed, not security. Reuse the same schema in your route handler, then check what only the server knows: whether the email or the workspace URL is already taken.

```ts
// app/api/signup/route.ts
import { signUpSchema } from "@/lib/sign-up-schema"

export async function POST(request: Request) {
  const parsed = signUpSchema.safeParse(await request.json())
  if (!parsed.success) return Response.json({ errors: parsed.error.issues }, { status: 400 })
  // Create the user, then the workspace. Return 409 if the slug is taken.
  return Response.json({ ok: true })
}
```

Return field-level errors and map them back with `form.setError`, so a taken URL shows up under the URL field, not in a toast.

## What edge cases should a multi-step sign-up handle?

The happy path is the easy part. These are the cases that come up once real people use the form:

- **A server error belongs to an earlier step.** If the email is taken, the user is on step 3 and the email field is not on screen. Calling `setError("email", …)` alone shows nothing. Go back to the step that owns the field first, then set the error, so the message appears under the input that needs fixing. Keep a lookup from field name to step index, built from `STEPS`.
- **The page reloads.** State held in React is gone after a refresh. If losing it would hurt, save the values to `sessionStorage` on each step change. MDN says it is scoped to the tab, survives reloads and is cleared when the tab closes. Never save the password there; ask for it again instead.
- **The browser Back button.** People expect Back to go to the previous step, not leave the page. If that matters for your flow, put the step in the URL (`?step=2`) and read it on load. Then guard it: someone who opens `?step=3` directly should land on the first step that is not yet valid.
- **Double submission.** The example disables the final button while `isSubmitting` is true. Do the same on the server: make account creation idempotent, or reject a second request for the same email, because a slow network can still send two.
- **Long or pasted input.** Trim whitespace in the schema, as `workspace` and `fullName` do above, so a pasted name with a trailing space does not fail a later uniqueness check.

## When should you not use a multi-step form?

Steps add clicks. They pay off when the questions fall into clear groups or later questions depend on earlier answers. They do not pay off for a form with two or three fields: an email and password sign-up should be one screen. Avoid steps too when people need to compare or edit answers across groups, such as a settings page, where one long form with section headings works better.

A useful test: if you cannot give each step a heading that describes what it is about, the split is arbitrary. Merge the steps.

## Is there a free shadcn/ui multi-step sign-up page?

Panelo UI's [Sign Up Flow](https://www.paneloui.com/components/login-pages-2) is a free, MIT-licensed three-step sign-up page that follows the patterns above. A violet art panel on the left lists the steps and tracks progress; you can click back to a finished step. The steps are account (with validation that appears after the first submit and clears as you fix each field), workspace (with a live URL that follows the name until you edit it), and profile (with a role picker and a preview card). On small screens the art panel becomes a "Step 1 of 3" bar above the form.

It manages state with plain React rather than React Hook Form, and the save is simulated, so you wire in your own API. Install it into a shadcn/ui project with:

```bash
npx shadcn@latest add @panelo/login-pages-2
```

after adding `"@panelo": "https://www.paneloui.com/r/{name}.json"` under `registries` in `components.json`. If you also need a matching sign-in page, see our post on [split-screen login pages in React](/blog/split-screen-login-page-react).

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install the page:

```bash
npx shadcn@latest add @panelo/login-pages-2
```

Its save is a timeout in `components/panelo-ui/blocks/login-pages/two/index.tsx` (the `save` function). Replace it with a call to the `/api/signup` route above, and map server errors back to the step that owns the field.

- **See it live:** [Sign Up Flow](https://www.paneloui.com/components/login-pages-2).
- **Where people land next, in Panelo Pro:** [Project Overview Dashboard](https://www.paneloui.com/components/dashboard-pages-5) is a project dashboard with a collapsible sidebar, breadcrumb bar, project hero, section tabs and a two-column overview. [App Sidebar](https://www.paneloui.com/components/sidebars-1) is an icon rail and panel in five layouts, with a command menu, collapsible sections and projects. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### Does shadcn/ui include a stepper or multi-step form?

No. shadcn/ui provides form fields and validation guides, and its sign-up blocks are single-page. You build steps by rendering a subset of fields per step from one form.

### How do I validate only the current step with React Hook Form?

Call `form.trigger(["email", "password"])` with the current step's field names. It returns a promise that resolves to `true` when those fields pass.

### Should each step be a separate form?

Usually not. One form with one schema keeps values across steps and lets you validate everything once more on the final submit.

### How do I keep values when the user goes back a step?

React Hook Form keeps values of unmounted fields by default (`shouldUnregister` is false), so rendering only the current step's fields does not lose earlier input.

### Where should focus go after Continue?

To the new step's heading. Give it `tabIndex={-1}` and call `focus()` after the step renders, so screen-reader users hear the new step's title.

### What happens to the form if the user refreshes the page?

Values held only in React state are lost. Save non-sensitive values to `sessionStorage` on each step change and restore them on load; leave the password out.

---

Browse more free pages, including two login layouts, in the [Panelo UI catalogue](https://www.paneloui.com/components).

## Sources

- shadcn/ui Forms overview (React Hook Form, TanStack Form, Formisch): https://ui.shadcn.com/docs/forms
- shadcn/ui React Hook Form guide (Controller, Field, FieldError, `data-invalid`): https://ui.shadcn.com/docs/forms/react-hook-form
- shadcn/ui Field component (subcomponents, `FieldError` errors prop): https://ui.shadcn.com/docs/components/base/field
- shadcn/ui sign-up blocks: https://ui.shadcn.com/blocks/signup
- React Hook Form `trigger` API: https://react-hook-form.com/docs/useform/trigger
- React Hook Form `useForm` (`shouldUnregister`, `mode: "onTouched"`): https://react-hook-form.com/docs/useform
- React Hook Form `setValue` (does not mark fields dirty by default): https://react-hook-form.com/docs/useform/setvalue
- MDN, HTML `autocomplete` attribute values: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete
- MDN, `Window.sessionStorage` (per tab, survives reloads, cleared when the tab closes): https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
- `@hookform/resolvers` exports (`/zod`, supports Zod 4): https://www.npmjs.com/package/@hookform/resolvers
