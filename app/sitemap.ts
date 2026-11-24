import type { MetadataRoute } from "next";

import { COMPONENT_SECTIONS } from "@/components/application/docs/components-index";
import { allPosts } from "@/components/application/site/blog";
import { LEGAL } from "@/components/application/site/legal";
import { SITE, TEMPLATES, TEMPLATES_LAUNCH } from "@/components/application/site/templates";

/** Every public page: the catalogue, each shipped component, templates, the demo, the blog and the legal pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const components = COMPONENT_SECTIONS.flatMap((s) => s.entries).filter((e) => e.status === "shipped");
  return [
    "/",
    "/components",
    ...components.map((e) => e.href),
    "/templates",
    ...(TEMPLATES_LAUNCH.open ? TEMPLATES.map((t) => `/templates/${t.slug}`) : []),
    "/agent-demo",
    "/blog",
    ...LEGAL.map((d) => `/legal/${d.slug}`),
  ]
    .map((path) => ({ url: `${SITE}${path}` }))
    // Posts carry their own date, so crawlers can tell new and updated guides apart.
    .concat(allPosts().map((post) => ({ url: `${SITE}/blog/${post.slug}`, lastModified: post.date })));
}
