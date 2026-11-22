import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TemplateDetail } from "@/components/application/landing/template-pages";
import { templateBySlug, TEMPLATES } from "@/components/application/site/templates";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = templateBySlug((await params).slug);
  return t ? { title: `${t.name} template`, description: t.tagline } : {};
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const t = templateBySlug((await params).slug);
  if (!t) notFound();
  return <TemplateDetail slug={t.slug} />;
}
