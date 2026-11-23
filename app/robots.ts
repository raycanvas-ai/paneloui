import type { MetadataRoute } from "next";

import { SITE } from "@/components/application/site/templates";

/** Crawl the pages; skip the bare previews (framed elsewhere), accounts, checkout and the API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/preview/", "/api/", "/account", "/checkout", "/r/pro/", "/t/pro/"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
