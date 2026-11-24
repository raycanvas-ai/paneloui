import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";

import { SiteFooter, SiteHeader } from "@/components/application/landing/landing-page";
import { CONTAINER, FOCUS, TEXT_LINK } from "@/components/application/site/layout-classes";
import { formatDate, getPost, POST_SLUGS } from "@/components/application/site/blog";
import { PROSE } from "@/components/application/site/prose";
import { breadcrumbs, JsonLd, MAKER, pageMeta } from "@/components/application/site/seo";
import { SITE } from "@/components/application/site/templates";
import { cx } from "@/utils/cx";

export const dynamicParams = false;

export function generateStaticParams() {
  return POST_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const meta = pageMeta(`/blog/${post.slug}`, post.title, post.description);
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: post.date, authors: [MAKER.name] } };
}

/** /blog/<slug>: one post, with the article and FAQ described for search engines and AI answers. */
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const url = `${SITE}/blog/${post.slug}`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        url,
        mainEntityOfPage: url,
        image: `${SITE}/opengraph-image.png`,
        keywords: post.primaryKeyword,
        articleSection: post.cluster,
        author: { "@type": "Organization", name: MAKER.name, url: MAKER.url },
        publisher: { "@id": `${SITE}/#org` },
      },
      ...(post.faq.length
        ? [{ "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]
        : []),
    ],
  };
  return (
    <div className="flex min-h-dvh w-full flex-col bg-site-page font-sans text-site-ink">
      <JsonLd data={graph} />
      <JsonLd data={breadcrumbs([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }])} />
      <SiteHeader />
      <main className={cx(CONTAINER, "flex-1 py-16 sm:py-24")}>
        <article className="mx-auto max-w-[720px]">
          <Link href="/blog" className={cx(TEXT_LINK, "inline-flex items-center gap-1.5 text-site-body", FOCUS)}>
            <RiArrowLeftLine className="size-4 rtl:-scale-x-100" aria-hidden />
            Blog
          </Link>
          <header className="mt-8 border-b border-site-hairline pb-10">
            <p className="text-site-body text-site-faint">{post.cluster}</p>
            <h1 className="mt-3 text-site-heading text-balance text-site-ink sm:text-site-title">{post.title}</h1>
            <p className="mt-5 text-site-lead text-pretty text-site-muted">{post.description}</p>
            <p className="mt-6 text-site-body text-site-faint">
              <time dateTime={post.date}>{formatDate(post.date)}</time> · {MAKER.name}
            </p>
          </header>
          <div className={cx(PROSE, "mt-10")} dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
