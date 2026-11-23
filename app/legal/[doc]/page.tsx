import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/components/application/landing/landing-page";
import { LEGAL, LEGAL_UPDATED, legalDoc } from "@/components/application/site/legal";
import { cx } from "@/utils/cx";

export function generateStaticParams() {
  return LEGAL.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const doc = legalDoc((await params).doc);
  return doc ? { title: doc.title, description: doc.intro } : {};
}

/** /legal/<doc>: licence, terms, privacy and refunds, with the other three a click away. */
export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const doc = legalDoc((await params).doc);
  if (!doc) notFound();
  return (
    <div className="flex min-h-dvh w-full flex-col bg-site-page font-sans text-site-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1152px] flex-1 px-6 py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[200px_1fr]">
          <nav aria-label="Legal" className="flex gap-1 lg:flex-col">
            {LEGAL.map((d) => (
              <Link
                key={d.slug}
                href={`/legal/${d.slug}`}
                aria-current={d.slug === doc.slug ? "page" : undefined}
                className={cx(
                  "rounded-lg px-3 py-1.5 text-site-body outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-border-focus-ring",
                  d.slug === doc.slug ? "bg-site-pill text-site-ink" : "text-site-muted hover:text-site-ink",
                )}
              >
                {d.title}
              </Link>
            ))}
          </nav>
          <article className="max-w-[680px]">
            <h1 className="text-site-display-sm text-site-ink">{doc.title}</h1>
            <p className="mt-3 text-site-body text-site-faint">Updated {LEGAL_UPDATED}</p>
            <p className="mt-6 text-site-lead text-pretty text-site-muted">{doc.intro}</p>
            {doc.sections.map((section) => (
              <section key={section.heading} className="mt-10 border-t border-site-hairline pt-8">
                <h2 className="text-site-section text-site-ink">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-site-text text-pretty text-site-muted">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
