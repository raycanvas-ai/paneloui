"use client";

import { useState } from "react";
import Link from "next/link";
import { RiArrowLeftLine, RiArrowRightUpLine, RiCalendarEventLine, RiCheckLine } from "@remixicon/react";

import { ArrowLink, CONTAINER, CopyCommand, FOCUS, Heading, SECTION, SiteFooter, SiteHeader, TEXT_LINK } from "@/components/application/landing/landing-page";
import { Chip, pill, ProTag } from "@/components/application/site/site-ui";
import { downloadCommand, type Template, TEMPLATES, TEMPLATES_LAUNCH } from "@/components/application/site/templates";
import { cx } from "@/utils/cx";

const shot = (t: Template, file: string) => `/templates/${t.slug}/${file}.webp`;

const { open, date, count } = TEMPLATES_LAUNCH;

function Tier({ t }: { t: Template }) {
  return (
    <>
      {t.tier === "pro" ? <ProTag /> : <Chip>Free</Chip>}
      {!open && <Chip>{date}</Chip>}
    </>
  );
}

/** A screenshot on the same mat as the landing page's product windows. */
function Frame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cx("rounded-2xl bg-site-surface p-1.5 shadow-site-raised ring-1 ring-site-hairline", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size screenshots, already WebP at display size. */}
      <img src={src} alt={alt} width={1440} height={900} className="aspect-[16/10] w-full rounded-[10px] bg-site-preview object-cover object-top ring-1 ring-site-hairline" />
    </div>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-site-page font-sans text-site-ink">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** /templates: every whole-app template, cover first. */
export function TemplatesIndex() {
  return (
    <Page>
      <section className={cx(CONTAINER, SECTION)}>
        <Heading
          title="Templates."
          body={open ? "Whole apps, not parts: download one, run it, make it yours." : `${count} whole apps arrive ${date}, one of them free. Try two of them live now.`}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {TEMPLATES.map((t) => (
            <Link key={t.slug} href={`/templates/${t.slug}`} className={cx("group flex flex-col gap-5 rounded-3xl", FOCUS)}>
              <Frame src={shot(t, t.shots[0].file)} alt={`${t.name}, ${t.shots[0].label}`} className="transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
              <div className="flex flex-col gap-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-site-section text-site-ink">{t.name}</span>
                  <Tier t={t} />
                </div>
                <p className="text-site-body text-pretty text-site-muted">{t.tagline}</p>
                <p className="text-site-body text-site-faint">{t.pages} pages · Next.js 16 · Tailwind CSS v4</p>
              </div>
            </Link>
          ))}
          {!open && TEMPLATES.length < count && (
            // Holds the third template's place until launch day, the same size as a real card.
            <div className="flex flex-col gap-5">
              <div className="grid aspect-[16/10] place-items-center rounded-2xl border border-dashed border-site-ring bg-site-surface p-1.5">
                <span className="flex items-center gap-2 text-site-body text-site-muted">
                  <RiCalendarEventLine className="size-4" aria-hidden />
                  Revealed {date}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 px-1">
                <span className="text-site-section text-site-ink">One more template</span>
                <p className="text-site-body text-pretty text-site-muted">Launches with the other two. Pro plans bought now include it.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </Page>
  );
}

/** /templates/<slug>: what it is, a look at every area, and the command that gets it. */
export function TemplateDetail({ slug }: { slug: string }) {
  const t = TEMPLATES.find((x) => x.slug === slug)!;
  const [active, setActive] = useState(t.shots[0].file);
  const steps = [
    {
      title: "Download",
      body: !open
        ? `From ${date}: one command${t.tier === "pro" ? ", with the licence key from your account page" : ", no sign-up"}.`
        : t.tier === "pro"
          ? "Set PANELO_LICENSE_KEY from your account page, then run the command above."
          : "Run the command above. No sign-up.",
    },
    { title: "Run it", body: "npm install, then npm run dev. Sample data is built in, so every screen works at once." },
    { title: "Make it yours", body: "Name and links in src/config/app-config.ts, themes in src/styles/presets, data in src/data: swap it for your API." },
  ];

  return (
    <Page>
      <section className={cx(CONTAINER, "pt-12 sm:pt-16")}>
        <Link href="/templates" className={cx(TEXT_LINK, "inline-flex items-center gap-1 text-site-body")}>
          <RiArrowLeftLine className="size-4 rtl:rotate-180" aria-hidden />
          Templates
        </Link>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <h1 className="text-site-display-sm text-balance text-site-ink">{t.name}</h1>
          <Tier t={t} />
        </div>
        <p className="mt-4 max-w-[620px] text-site-lead text-pretty text-site-muted">{t.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {t.tier === "pro" && (
            <Link href="/#pricing" className={pill("primary", "lg")}>
              Get Pro, from $129
            </Link>
          )}
          <a href={t.demo} target="_blank" rel="noreferrer" className={pill(t.tier === "pro" ? "secondary" : "primary", "lg")}>
            Open the live demo
            <RiArrowRightUpLine aria-hidden />
          </a>
        </div>
        <div className="mt-6 max-w-[860px]">
          {open ? (
            <CopyCommand command={downloadCommand(t)} />
          ) : (
            <p className="flex items-center gap-2 text-site-body text-site-muted">
              <RiCalendarEventLine className="size-4 shrink-0" aria-hidden />
              {t.tier === "pro"
                ? `Downloads open ${date}. Every Pro plan includes it, so buying now gets it on launch day.`
                : `Downloads open ${date}, free. The live demo is open now.`}
            </p>
          )}
          {open && t.tier === "pro" && (
            <p className="mt-3 text-site-body text-site-muted">
              Already Pro? Your key is on your{" "}
              <Link href="/account" className={cx(TEXT_LINK, "text-site-ink underline underline-offset-4")}>
                account page
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section className={cx(CONTAINER, "mt-14")}>
        <Frame src={shot(t, active)} alt={`${t.name}, ${t.shots.find((s) => s.file === active)?.label}`} />
        <div role="tablist" aria-label="Screens" className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {t.shots.map((s) => (
            <button
              key={s.file}
              type="button"
              role="tab"
              aria-selected={active === s.file}
              onClick={() => setActive(s.file)}
              className={cx("flex cursor-pointer flex-col gap-2 rounded-xl text-start", FOCUS)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail of the same WebP. */}
              <img
                src={shot(t, s.file)}
                alt=""
                className={cx(
                  "aspect-[16/10] w-full rounded-lg object-cover object-top ring-1 transition-[box-shadow,opacity] duration-150",
                  active === s.file ? "opacity-100 ring-2 ring-site-ink" : "opacity-70 ring-site-hairline hover:opacity-100",
                )}
              />
              <span className={cx("text-site-body", active === s.file ? "text-site-ink" : "text-site-muted")}>{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={cx(CONTAINER, SECTION)}>
        <Heading title="Every screen, built out." body={`${t.pages} pages across ${t.screens.length} areas, light and dark.`} />
        <dl className="mt-12 grid gap-x-10 gap-y-8 border-t border-site-hairline pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.screens.map((s) => (
            <div key={s.area} className="flex flex-col gap-2">
              <dt className="text-site-body-medium text-site-ink">{s.area}</dt>
              <dd className="text-site-body text-pretty text-site-muted">{s.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-16 grid gap-3 sm:grid-cols-2">
          {t.highlights.map((h) => (
            <li key={h} className="flex items-start gap-3 text-site-body text-site-ink">
              <RiCheckLine className="mt-0.5 size-4 shrink-0 text-site-muted" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
      </section>

      <section className={cx(CONTAINER, "pb-20 sm:pb-28")}>
        <Heading title="From download to yours." body={t.tier === "pro" ? "Your key, one command, your app." : "No account, no key: one command."} />
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3 rounded-2xl bg-site-surface p-6 ring-1 ring-site-hairline">
              <span className="font-mono text-body-2-regular text-site-faint">0{i + 1}</span>
              <span className="text-site-body-medium text-site-ink">{step.title}</span>
              <p className="text-site-body text-pretty text-site-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <ArrowLink href={t.tier === "pro" ? "/#pricing" : "/components"} className="mt-10">
          {t.tier === "pro" ? "Propflow comes with every Pro plan" : "Pair it with Panelo's components"}
        </ArrowLink>
      </section>
    </Page>
  );
}
