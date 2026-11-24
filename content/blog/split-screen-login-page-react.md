---
title: "Split-Screen Login Page in React and Tailwind CSS"
description: "Build a split-screen login page in React with Tailwind CSS v4 and shadcn/ui: two-column layout, mobile collapse, autofill, reduced motion, free templates."
slug: split-screen-login-page-react
primaryKeyword: split screen login page react
secondaryKeywords:
  - split screen login page tailwind
  - login page with side image react
  - shadcn login page template
  - react login page template tailwind free
intent: commercial
cluster: Pages
date: 2026-11-24
status: draft
author: Raycanvas
wordCount: 1729
cta:
  free: [login-pages-1, login-pages-3]
  pro: [dashboard-pages-5, sidebars-1]
---

# Split-Screen Login Page in React and Tailwind CSS

A split-screen login page puts the form in one column and a brand panel (image, product shot or illustration) in the other. In Tailwind CSS v4 that is `grid min-h-svh lg:grid-cols-2`, with the panel `hidden lg:block` so phones get the form alone. Use real labels, `autocomplete` values and `motion-safe` for any animation.

> **Skip the build:** [Split Login Page](https://www.paneloui.com/components/login-pages-1) is a free, MIT-licensed shadcn/ui block with this layout: an email and password form with labels on one side, and a brand panel with an orbit of app logos that is hidden below the `lg` breakpoint. Add it with `npx shadcn@latest add @panelo/login-pages-1` ([registry setup](#get-this-working-in-your-app)), then change anything: the source is yours.

## What makes a good split-screen login page?

The form is the job. The panel is decoration, so it should never slow the form down, push it below the fold or confuse a screen reader. A good one gets five things right:

1. **The form comes first** in the DOM and on small screens. The panel appears from a set breakpoint up.
2. **The panel is decorative** to assistive tech unless it carries real content, such as a testimonial worth reading.
3. **Password managers work**, because each field has a visible label and the right `autocomplete` value.
4. **Motion is optional.** Anything that moves respects the user's reduced-motion setting.
5. **Both themes work.** The panel's colours come from the same tokens as the rest of the app, or the panel is explicitly dark in both themes.

## How do you build the layout with Tailwind CSS v4?

This uses shadcn/ui's `Button`, `Input` and `Field` components (`npx shadcn@latest add button input field`) and Next.js's `Image`. Replace `/login-art.jpg` with your own image in `public/`.

```tsx
// app/login/page.tsx
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <main className="flex flex-col gap-4 p-6 md:p-10">
        <Link href="/" className="font-medium">
          Acme
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <form method="post" action="/api/auth/login" className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold">Log in to Acme</h1>
            <p className="mt-1 text-sm text-muted-foreground">Use the email you signed up with.</p>

            <FieldGroup className="mt-8">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link href="/forgot-password" className="ms-auto text-sm underline-offset-4 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </Field>
              <Button type="submit" className="w-full">
                Log in
              </Button>
            </FieldGroup>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </main>

      <aside aria-hidden className="relative hidden overflow-hidden bg-muted lg:block">
        <Image
          src="/login-art.jpg"
          alt=""
          fill
          sizes="50vw"
          className="object-cover dark:brightness-[0.3] dark:grayscale"
        />
      </aside>
    </div>
  )
}
```

What each choice does:

- **`min-h-svh`** sizes the page to the small viewport height, so mobile browser toolbars do not cut off the button.
- **`hidden lg:block`** on the panel removes it below 1024px, so the form takes the full width on phones and tablets.
- **`sizes="50vw"`** tells the browser the image fills half the viewport, so it downloads a fitting size instead of the full-width one.
- **`aria-hidden` and `alt=""`** mark the panel as decoration. If your panel holds a customer quote, drop both and give it real text.
- **`ms-auto`** is a logical margin, so "Forgot password?" sits at the end of the row in both left-to-right and right-to-left layouts.

### Which side should the form go on?

Either works. Most templates put the form on the left because that is where the eye starts in left-to-right languages. In a right-to-left layout, the grid flips on its own when `<html dir="rtl">` is set, because CSS grid follows the writing direction. Do not hard-code the order with `order-*` classes unless you want the form on the same physical side in every language.

## Which autocomplete values should a login form use?

Autofill is the biggest usability win on a login page, and it costs one attribute per field.

| Field | `autocomplete` | Why |
|---|---|---|
| Email on login | `email` (or `username` if users sign in with a handle) | Lets the browser and password manager pair it with the saved password |
| Password on login | `current-password` | Tells password managers to fill, not generate |
| Password on sign-up or reset | `new-password` | Tells password managers to suggest a strong new one |
| Code from SMS or authenticator | `one-time-code` | Lets phones offer the code from a text message |

Also keep `type="email"` for the mobile keyboard, and never block paste on password fields.

## How do you animate the side panel without hurting accessibility?

An animated panel is fine as long as people can opt out. Tailwind's `motion-safe:` variant applies a class only when the user has not asked for reduced motion (it maps to `@media (prefers-reduced-motion: no-preference)`), and `motion-reduce:` does the opposite.

```tsx
<aside aria-hidden className="relative hidden place-items-center overflow-hidden bg-muted lg:grid">
  <div className="size-[28rem] rounded-full border border-primary/20 motion-safe:animate-spin motion-safe:[animation-duration:60s]" />
  <div className="absolute size-64 rounded-full bg-primary/10 blur-3xl" />
</aside>
```

A 60-second rotation reads as calm. Anything that flashes or moves fast near the form pulls attention away from the fields, which is the opposite of what you want on a login page.

For canvas or JavaScript animation, check `window.matchMedia("(prefers-reduced-motion: reduce)").matches` before starting the loop, and draw a still frame instead.

For a working example of that check, Panelo UI's free [Painted Login Page](https://www.paneloui.com/components/login-pages-3) paints its generated picture in only when reduced motion is off, and draws it still otherwise.

## Where can you get a ready-made split-screen login page?

If you would rather start from a finished page, these are the main free options for React and Tailwind CSS.

| Option | Licence and price | Built on | Install |
|---|---|---|---|
| [shadcn/ui `login-02`](https://ui.shadcn.com/blocks/login) | MIT, free | shadcn/ui, form left, cover image right on large screens | `npx shadcn@latest add login-02` |
| [shadcn/ui `signup-02`](https://ui.shadcn.com/blocks/signup) | MIT, free | Same split layout for sign-up | `npx shadcn@latest add signup-02` |
| [Untitled UI split login pages](https://www.untitledui.com/react/components/log-in-pages/login-split-quote-image-01) | Several free variants; others in Untitled UI PRO | React Aria and Tailwind CSS | `npx untitledui@latest add login-split-quote-image-01` |
| [Panelo UI Split Login Page](https://www.paneloui.com/components/login-pages-1) | MIT, free | shadcn/ui-style source, Vercel's UI SDK | `npx shadcn@latest add @panelo/login-pages-1` |
| [Panelo UI Painted Login Page](https://www.paneloui.com/components/login-pages-3) | MIT, free | shadcn/ui-style source, Vercel's UI SDK | `npx shadcn@latest add @panelo/login-pages-3` |

**shadcn/ui's `login-02`** is the natural default in a shadcn/ui app: plain, well-structured and already in your design tokens. Its image dims and goes grayscale in dark mode.

**Untitled UI** has the widest range of split layouts (with a quote, a carousel, a product mockup, a background image). Check each page's label: some are free and open source, and some versions say they need an Untitled UI PRO login. Its components use React Aria rather than shadcn/ui's primitives, so expect a different component API.

**Panelo UI** has two free login pages. The Split Login Page has an email and password form with show and hide password, remember me, and Google, Apple and Microsoft buttons on one side, and an orbit of app logos around your mark on the other. The Painted Login Page is different in style: an editorial login on a paper card over a pointillist painting that is generated in code (there is no image file to ship), and the painting only animates in when reduced motion is off. Both install into `components/panelo-ui`, beside your `components/ui`, after you add `"@panelo": "https://www.paneloui.com/r/{name}.json"` under `registries` in `components.json`. They are demos with placeholder brands, so you wire your own auth and copy.

## Get this working in your app

Add the Panelo registry under `registries` in `components.json`:

```json
"registries": {
  "@panelo": "https://www.paneloui.com/r/{name}.json"
}
```

Then install one or both pages:

```bash
npx shadcn@latest add @panelo/login-pages-1
npx shadcn@latest add @panelo/login-pages-3
```

Neither form sends anything yet: the Split Login Page stops the submit, and the Painted Login Page validates the fields and then simulates a sign-in. Point both at your auth route. The Split Login Page's inputs have no `autocomplete` attributes yet: add `email` and `current-password` from the table above. The Painted Login Page already sets both.

See it live: [Split Login Page](https://www.paneloui.com/components/login-pages-1) and [Painted Login Page](https://www.paneloui.com/components/login-pages-3).

After login comes the app. In Panelo Pro, the [Project Overview Dashboard](https://www.paneloui.com/components/dashboard-pages-5) is a project page with a collapsible sidebar, breadcrumb bar, project hero, section tabs and a two-column overview, and the [App Sidebar](https://www.paneloui.com/components/sidebars-1) is an icon rail and panel in five layouts, with a command menu, collapsible sections and projects. Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing).

## FAQ

### How do I make a split-screen login page responsive?

Use a one-column grid by default and switch to two columns at a breakpoint, for example `grid lg:grid-cols-2`, with the image panel `hidden lg:block`. The form then fills small screens on its own.

### Should the login image have alt text?

Only if it carries information. A decorative image should have `alt=""` (and the panel can be `aria-hidden`), so screen readers skip straight to the form.

### What autocomplete value should a login password use?

`current-password` on login, and `new-password` on sign-up and password reset. That tells password managers whether to fill a saved password or suggest a new one.

### Does shadcn/ui have a split-screen login template?

Yes. The `login-02` block puts the form on the left and a cover image on the right on large screens, and `signup-02` does the same for sign-up.

### How do I respect reduced motion in Tailwind CSS?

Prefix animation classes with `motion-safe:` so they apply only when the user has not asked for reduced motion, or use `motion-reduce:` to turn them off.

---

Need the sign-up that goes with it? See [building a multi-step sign-up form with shadcn/ui](/blog/shadcn-multi-step-signup-form), or browse all free pages in the [Panelo UI catalogue](https://www.paneloui.com/components). For logical properties like `ms-auto`, read [Tailwind RTL with logical properties](/blog/tailwind-rtl-logical-properties).

## Sources

- shadcn/ui login blocks (`login-01` to `login-05`): https://ui.shadcn.com/blocks/login
- shadcn/ui sign-up blocks (`signup-01` to `signup-05`): https://ui.shadcn.com/blocks/signup
- shadcn/ui Field component: https://ui.shadcn.com/docs/components/base/field
- Untitled UI split login page (free, React Aria and Tailwind CSS, CLI install): https://www.untitledui.com/react/components/log-in-pages/login-split-quote-image-01
- Untitled UI split login, marketing variant (PRO note): https://untitledui.com/react/marketing/log-in-pages/login-split-image
- MDN, HTML `autocomplete` attribute: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete
- MDN, `prefers-reduced-motion`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- Tailwind CSS `motion-safe` and `motion-reduce` variants: https://tailwindcss.com/docs/hover-focus-and-other-states
