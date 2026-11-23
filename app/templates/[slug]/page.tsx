import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TemplateDetail } from "@/components/application/landing/template-pages";
import { pageMeta } from "@/components/application/site/seo";
import { templateBySlug, TEMPLATES, TEMPLATES_LAUNCH } from "@/components/application/site/templates";

// Nothing about a template is public before launch day, its page included.
const find = (slug: string) => (TEMPLATES_LAUNCH.open ? templateBySlug(slug) : undefined);

export function generateStaticParams() {
  return TEMPLATES_LAUNCH.open ? TEMPLATES.map((t) => ({ slug: t.slug })) : [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = find((await params).slug);
  return t ? pageMeta(`/templates/${t.slug}`, `${t.name}: Next.js Dashboard Template`, `${t.tagline} ${t.pages} pages, light and dark, on Next.js 16 and shadcn/ui.`) : {};
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const t = find((await params).slug);
  if (!t) notFound();
  return <TemplateDetail slug={t.slug} />;
}
