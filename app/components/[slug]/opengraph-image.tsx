import { ogImage, OG_SIZE } from "@/components/application/site/og";
import { kindOf, shippedEntries } from "@/components/application/site/seo";

export const alt = "A Panelo UI component";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return shippedEntries.map((e) => ({ slug: e.href.replace("/components/", "") }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = shippedEntries.find((e) => e.href === `/components/${slug}`);
  return ogImage({
    eyebrow: entry ? `${kindOf(entry)} · ${entry.tier === "free" ? "Free, MIT" : "Panelo Pro"}` : "Panelo UI",
    title: entry?.name ?? "Panelo UI",
    detail: "Installs with the shadcn CLI",
  });
}
