import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { COMPONENT_SECTIONS } from "@/components/application/docs/components-index";
import { ComponentDetailPage } from "@/components/application/docs/component-detail-page";
import { breadcrumbs, entryMeta, JsonLd } from "@/components/application/site/seo";

const entries = COMPONENT_SECTIONS.flatMap((section) => section.entries).filter((entry) => entry.status === "shipped");
const find = (slug: string) => entries.find((entry) => entry.href === `/components/${slug}`);

export function generateStaticParams() {
  return entries.map((entry) => ({ slug: entry.href.replace("/components/", "") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = find((await params).slug);
  return entry ? entryMeta(entry) : {};
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = find((await params).slug);
  if (!entry) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Components", path: "/components" },
          { name: entry.name, path: entry.href },
        ])}
      />
      <ComponentDetailPage href={entry.href} />
    </>
  );
}
