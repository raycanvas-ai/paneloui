import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { COMPONENT_SECTIONS } from "@/components/application/docs/components-index";
import { ComponentDetailPage } from "@/components/application/docs/component-detail-page";

const entries = COMPONENT_SECTIONS.flatMap((section) => section.entries).filter((entry) => entry.status === "shipped");
const find = (slug: string) => entries.find((entry) => entry.href === `/components/${slug}`);

export function generateStaticParams() {
  return entries.map((entry) => ({ slug: entry.href.replace("/components/", "") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = find((await params).slug);
  return entry ? { title: entry.name, description: entry.description } : {};
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = find((await params).slug);
  if (!entry) notFound();
  return <ComponentDetailPage href={entry.href} />;
}
