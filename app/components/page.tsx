import type { Metadata } from "next";

import { ComponentsCatalog } from "@/components/application/app-shell/components-catalog";
import { DocsShell } from "@/components/application/docs/docs-shell";
import { breadcrumbs, JsonLd, pageMeta, shippedEntries } from "@/components/application/site/seo";

export const metadata: Metadata = pageMeta(
  "/components",
  `${shippedEntries.length} React Dashboard Components and Pages`,
  `Every Panelo component in one place: dashboard pages, charts, calendars, sidebars, login and profile pages for React, Tailwind CSS and shadcn/ui. ${shippedEntries.filter((e) => e.tier === "free").length} are free.`,
);

/** The component library: every category of the catalogue in the library frame. */
export default function ComponentsPage() {
  return (
    <DocsShell>
      <JsonLd data={breadcrumbs([{ name: "Home", path: "/" }, { name: "Components", path: "/components" }])} />
      <ComponentsCatalog />
    </DocsShell>
  );
}
