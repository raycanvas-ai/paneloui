import type { MetadataRoute } from "next";

import { COMPONENT_SECTIONS } from "@/components/application/docs/components-index";
import { LEGAL } from "@/components/application/site/legal";
import { SITE, TEMPLATES } from "@/components/application/site/templates";

/** Every public page: the catalogue, each shipped component, templates, the demo and the legal pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const components = COMPONENT_SECTIONS.flatMap((s) => s.entries).filter((e) => e.status === "shipped");
  return [
    "/",
    "/components",
    ...components.map((e) => e.href),
    "/templates",
    ...TEMPLATES.map((t) => `/templates/${t.slug}`),
    "/agent-demo",
    ...LEGAL.map((d) => `/legal/${d.slug}`),
  ].map((path) => ({ url: `${SITE}${path}` }));
}
