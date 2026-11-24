import type { Metadata } from "next";
import Link from "next/link";

import { Heading, SiteFooter, SiteHeader } from "@/components/application/landing/landing-page";
import { CONTAINER, FOCUS, SECTION } from "@/components/application/site/layout-classes";
import { allPosts } from "@/components/application/site/blog";
import { breadcrumbs, JsonLd, pageMeta } from "@/components/application/site/seo";
import { cx } from "@/utils/cx";

export const metadata: Metadata = pageMeta(
  "/blog",
  "Blog: shadcn/ui, UI SDK and Tailwind CSS v4 Guides",
  "Guides to shadcn/ui, Vercel's UI SDK, Tailwind CSS v4, React charts and dashboards AI agents can operate, from the team behind Panelo UI.",
);

/** /blog: every post, grouped by topic in the order the topics first appear. */
export default function BlogIndex() {
  const posts = allPosts();
  const topics = [...new Set(posts.map((p) => p.cluster))].map((cluster) => ({ cluster, posts: posts.filter((p) => p.cluster === cluster) }));
  return (
    <div className="flex min-h-dvh w-full flex-col bg-site-page font-sans text-site-ink">
      <JsonLd data={breadcrumbs([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
      <SiteHeader />
      <main className={cx(CONTAINER, SECTION, "flex-1")}>
        <Heading as="h1" title="Blog." body="shadcn/ui, Vercel's UI SDK, Tailwind CSS v4, and dashboards AI agents can operate." />
        <div className="mt-16 flex flex-col gap-16">
          {topics.map((topic) => (
            <section key={topic.cluster} aria-labelledby={`topic-${topic.cluster.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-12">
              <h2 id={`topic-${topic.cluster.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="text-site-body-medium text-site-ink lg:sticky lg:top-28 lg:self-start">
                {topic.cluster}
              </h2>
              <ul className="border-t border-site-hairline">
                {topic.posts.map((post) => (
                  <li key={post.slug} className="border-b border-site-hairline">
                    <Link href={`/blog/${post.slug}`} className={cx("group flex flex-col gap-1.5 rounded-md py-5", FOCUS)}>
                      <span className="text-site-question text-site-ink transition-colors group-hover:text-site-muted">{post.title}</span>
                      <span className="max-w-[640px] text-site-body text-pretty text-site-muted">{post.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
