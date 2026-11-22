"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiGithubFill, RiGoogleFill } from "@remixicon/react";

import { authPost } from "@/components/application/site/auth";
import { pill } from "@/components/application/site/site-ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/panelo/ui/dialog";
import { cx } from "@/utils/cx";

type Me = { name: string | null; email: string | null; image: string | null };

/** The header's account control: "Sign in" opens the sign-in dialog in place; signed in, it's your avatar. */
export function AuthButton({ className }: { className?: string }) {
  const [me, setMe] = useState<Me | null | "out">(null);

  useEffect(() => {
    fetch("/api/account")
      .then(async (r) => setMe(r.ok ? ((await r.json()) as { user: Me }).user : "out"))
      .catch(() => setMe("out"));
  }, []);

  // Holds its width while loading, so the header doesn't jump.
  if (me === null) return <span aria-hidden className={cx("h-7 w-[66px]", className)} />;

  if (me !== "out") {
    const initial = (me.name ?? me.email ?? "?").trim().charAt(0).toUpperCase();
    return (
      <Link href="/account" aria-label="Your account" className={cx(pill("secondary"), "gap-2 ps-1", className)}>
        {me.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- a 20px provider avatar; next/image adds nothing here.
          <img src={me.image} alt="" className="size-5 rounded-full" />
        ) : (
          <span aria-hidden className="grid size-5 place-items-center rounded-full bg-site-ink text-site-chip text-site-page">
            {initial}
          </span>
        )}
        Account
      </Link>
    );
  }

  return (
    <Dialog>
      <DialogTrigger className={cx(pill("secondary"), className)}>Sign in</DialogTrigger>
      <DialogContent className="gap-0 rounded-2xl bg-site-surface p-7 text-site-ink ring-site-hairline sm:max-w-[380px]">
        <DialogTitle className="text-site-section text-site-ink">Sign in to Panelo</DialogTitle>
        <DialogDescription className="mt-2 text-site-body text-pretty text-site-muted">
          Your Pro licences and keys live in your account. Bought before signing in? Use the email you paid with.
        </DialogDescription>
        <SignInButtons callbackUrl={typeof window === "undefined" ? "/account" : window.location.href} className="mt-6" />
      </DialogContent>
    </Dialog>
  );
}

const PROVIDERS = [
  { id: "github", label: "Continue with GitHub", icon: RiGithubFill },
  { id: "google", label: "Continue with Google", icon: RiGoogleFill },
] as const;

/** One button per provider this deploy has an OAuth app for (Auth.js lists them), so none leads to an error. */
export function SignInButtons({ callbackUrl, className }: { callbackUrl: string; className?: string }) {
  const [ids, setIds] = useState<string[] | null>(null);
  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((p: Record<string, unknown> | null) => setIds(Object.keys(p ?? {})))
      .catch(() => setIds([]));
  }, []);
  if (ids === null) return <div aria-hidden className={cx("h-[88px]", className)} />;
  const shown = PROVIDERS.filter((p) => ids.includes(p.id));
  if (!shown.length) return <p className={cx("text-site-body text-site-muted", className)}>Sign-in opens shortly. Licences bought meanwhile are kept for your email.</p>;
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {shown.map(({ id, label, icon: Icon }, i) => (
        <button key={id} type="button" onClick={() => authPost(`signin/${id}`, { callbackUrl })} className={pill(i === 0 ? "primary" : "secondary", "lg", "w-full")}>
          <Icon aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
