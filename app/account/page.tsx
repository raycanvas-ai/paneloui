"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";

import { authPost } from "@/components/application/site/auth";
import { SignInButtons } from "@/components/application/site/auth-button";
import { pill } from "@/components/application/site/site-ui";
import { Logo } from "@/components/foundations/brand/logo";
import { cx } from "@/utils/cx";

type License = { id: string; plan: "year" | "lifetime" | "startups"; seats: number; keyHint: string | null; updatesUntil: string | null; revoked: boolean; createdAt: string };
type Account = { user: { name: string | null; email: string | null; image: string | null }; licenses: License[] };

const PLAN_NAMES: Record<License["plan"], string> = { year: "1 Year of Updates", lifetime: "Lifetime Access", startups: "Unlimited for Startups" };

// Auth.js errors land here as ?error=…; the ones a person can act on get words.
const AUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "That email already signed in with another provider. Use the one you used first.",
  AccessDenied: "Sign-in was refused. Google accounts need a verified email.",
};

const postJson = (url: string, body: unknown) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

function CopyBlock({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-xl bg-site-pill p-4 pe-12 font-mono text-body-2-regular text-site-ink">{text}</pre>
      <button
        type="button"
        aria-label={copied ? "Copied" : label}
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute top-2.5 end-2.5 grid size-7 cursor-pointer place-items-center rounded-lg text-site-muted outline-none hover:bg-site-pill-hover hover:text-site-ink focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        {copied ? <RiCheckLine className="size-3.5" aria-hidden /> : <RiFileCopyLine className="size-3.5" aria-hidden />}
      </button>
    </div>
  );
}

function LicenseCard({ license }: { license: License }) {
  const [key, setKey] = useState<string | null>(null);
  const [hint, setHint] = useState(license.keyHint);
  const [error, setError] = useState<string | null>(null);
  const expired = license.updatesUntil !== null && new Date(license.updatesUntil) < new Date();
  const status = license.revoked
    ? "Revoked"
    : license.updatesUntil
      ? `${expired ? "Updates ended" : "Updates until"} ${new Date(license.updatesUntil).toLocaleDateString(undefined, { dateStyle: "medium" })}`
      : "Updates forever";

  const generate = async () => {
    if (hint && !window.confirm("Make a new key? The current one stops working immediately.")) return;
    const response = await postJson("/api/account/key", { licenseId: license.id });
    const data = (await response.json()) as { key?: string; error?: string };
    setError(data.error ?? null);
    setKey(data.key ?? null);
    if (data.key) setHint(data.key.slice(-4));
  };

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return (
    <li className="rounded-2xl bg-site-surface p-6 ring-1 ring-site-hairline">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-site-plan text-site-ink">{PLAN_NAMES[license.plan]}</h2>
          <p className="mt-1 text-site-body text-site-muted">
            {license.seats} {license.seats === 1 ? "seat" : "seats"} · {status}
          </p>
        </div>
        {!license.revoked && (
          <button type="button" onClick={generate} className={pill(hint ? "secondary" : "primary")}>
            {hint ? "Regenerate key" : "Generate key"}
          </button>
        )}
      </div>
      {hint && !key && (
        <p className="mt-4 text-site-body text-site-muted">
          Key ending in <span className="font-mono text-site-ink">{hint}</span>
        </p>
      )}
      {error && <p className="mt-4 text-site-body text-text-error-primary">{error}</p>}
      {key && (
        <div className="mt-5 flex flex-col gap-3">
          <p className="text-site-body text-site-ink">Your key. Copy it now: it is shown once, and only its fingerprint is stored.</p>
          <CopyBlock label="Copy the key" text={`PANELO_LICENSE_KEY=${key}`} />
          <p className="text-site-body text-site-muted">
            Put that line in <span className="font-mono text-site-ink">.env.local</span>, add the registry to <span className="font-mono text-site-ink">components.json</span>, then
            run <span className="font-mono text-site-ink">npx shadcn@latest add @panelo-pro/&lt;item&gt;</span>.
          </p>
          <CopyBlock
            label="Copy the registry entry"
            text={`"registries": {\n  "@panelo-pro": {\n    "url": "${origin}/r/pro/{name}.json",\n    "headers": { "Authorization": "Bearer \${PANELO_LICENSE_KEY}" }\n  }\n}`}
          />
        </div>
      )}
    </li>
  );
}

/** /account: sign in, see what you own, and make the key the Pro registry asks for. */
export default function AccountPage() {
  const [account, setAccount] = useState<Account | null | "out">(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/account");
    setAccount(response.ok ? ((await response.json()) as Account) : "out");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) setNotice(AUTH_ERRORS[error] ?? "Sign-in didn't work. Try again.");
    const paymentId = params.get("payment_id");
    // Back from Dodo: record the licence now, from the payment itself, then drop the query string.
    const sync = paymentId && params.get("status") === "succeeded" ? postJson("/api/account/sync", { paymentId }) : Promise.resolve(null);
    if (paymentId) setNotice(params.get("status") === "succeeded" ? "Payment received. Your licence is below." : "The payment didn't go through, so nothing was charged.");
    if (error || paymentId) window.history.replaceState(null, "", "/account");
    void sync.then(load);
  }, [load]);

  return (
    <div className="min-h-dvh bg-site-page font-sans text-site-ink">
      <header className="border-b border-site-hairline">
        <div className="mx-auto flex h-14 w-full max-w-[880px] items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
            <Logo size={18} />
            <span className="text-site-body-medium text-site-ink">Panelo UI</span>
          </Link>
          {account && account !== "out" && (
            <button type="button" onClick={() => authPost("signout", { callbackUrl: "/" })} className={pill("ghost")}>
              Sign out
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-[880px] px-6 py-16">
        {notice && <p className="mb-8 rounded-xl bg-site-pill px-4 py-3 text-site-body text-site-ink">{notice}</p>}
        {account === null && <p className="text-site-body text-site-muted">Loading…</p>}
        {account === "out" && (
          <div className="max-w-[420px]">
            <h1 className="text-site-heading text-site-ink">Sign in to Panelo</h1>
            <p className="mt-3 text-site-text text-pretty text-site-muted">
              Your Pro licences and keys live here. Bought before signing in? Use the email you paid with and the licence appears.
            </p>
            <SignInButtons callbackUrl="/account" className="mt-8" />
          </div>
        )}
        {account && account !== "out" && (
          <>
            <h1 className="text-site-heading text-site-ink">{account.user.name ?? "Your account"}</h1>
            <p className="mt-1 text-site-body text-site-muted">{account.user.email}</p>
            <h2 className="mt-12 text-site-body-medium text-site-muted">Licences</h2>
            {account.licenses.length === 0 ? (
              <p className={cx("mt-4 text-site-body text-site-muted")}>
                No Pro licence on this account yet.{" "}
                <Link href="/#pricing" className="text-site-ink underline underline-offset-4">
                  See plans
                </Link>
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {account.licenses.map((license) => (
                  <LicenseCard key={license.id} license={license} />
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
