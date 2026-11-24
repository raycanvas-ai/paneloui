import type { Metadata } from "next";

import { ALL_ENTRIES, COMPONENT_SECTIONS, type Entry } from "@/components/application/docs/components-index";
import { FAQ } from "@/components/application/site/faq";
import { PLANS } from "@/components/application/site/pricing";
import { SITE } from "@/components/application/site/templates";

// Search and sharing metadata in one place. Titles lead with what people search for ("React dashboard
// components", "shadcn/ui"), the brand last; every number comes from the catalogue or the plans.

export const BRAND = "Panelo UI";
// Who makes Panelo, stated the same way on the page, in structured data and in /llms.txt.
export const MAKER = { name: "Raycanvas", url: "https://raycanvas.ai" };
export const PARTNER = { name: "Shadcn Labs", url: "https://x.com/shadcnlabs" };
export const SIBLINGS = [
  { name: "Ruixen UI", url: "https://ruixen.com" },
  { name: "snapcn", url: "https://snapcn.dev" },
];
export const REPO_URL = "https://github.com/raycanvas-ai/paneloui";
export const UI_SDK_URL = "https://ui-sdk.dev";
export const shippedEntries = ALL_ENTRIES.filter((e) => e.status === "shipped");

// The site-wide share card (app/opengraph-image.png). Named here because a page that sets its own
// openGraph replaces the inherited one, image included; a route's own opengraph-image file still wins.
const SHARE_IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630, alt: "Panelo UI: React dashboard components AI agents can operate" };

/** A page's canonical URL and matching Open Graph fields, so shares and search agree on the address. */
export function pageMeta(path: string, title: string, description: string, extra: Metadata = {}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: BRAND, type: "website", locale: "en_US", images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE] },
    ...extra,
  };
}

// What each catalogue section is, in the words people search with.
const KIND: Record<string, string> = {
  "dashboard-pages": "React Dashboard Page",
  "profile-pages": "React Profile Page",
  "login-pages": "React Login Page",
  sidebars: "React Sidebar",
  elements: "React Component",
  charts: "React Chart",
  calendars: "React Calendar",
};

export const sectionIdOf = (entry: Entry) => COMPONENT_SECTIONS.find((s) => s.entries.includes(entry))?.id ?? "elements";
export const kindOf = (entry: Entry) => KIND[sectionIdOf(entry)] ?? "React Component";

export function entryMeta(entry: Entry): Metadata {
  // "<Name>: React Dashboard Page", or "<Name> for React" when the name already says what it is
  // ("Revenue Chart"), so no title repeats itself. Under 60 characters with the brand; shadcn/ui is in the description.
  const nouns = kindOf(entry).split(" ").slice(1);
  const title = nouns.some((n) => entry.name.includes(n)) ? `${entry.name} for React` : `${entry.name}: ${kindOf(entry)}`;
  const terms = entry.tier === "free" ? "Free and MIT-licensed" : "Panelo Pro";
  const description = `${entry.description} ${terms}; installs with the shadcn CLI.`;
  // Its own card (app/components/[slug]/opengraph-image.tsx), named explicitly so the site-wide one doesn't win.
  const image = `${entry.href}/opengraph-image`;
  const meta = pageMeta(entry.href, title, description);
  return { ...meta, openGraph: { ...meta.openGraph, images: [image] }, twitter: { ...meta.twitter, images: [image] } };
}

/** JSON-LD as a script tag. `<` is escaped so data can never close the tag early. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const ORG = {
  "@type": "Organization",
  "@id": `${SITE}/#org`,
  name: MAKER.name,
  url: MAKER.url,
  email: "support@paneloui.com",
  brand: { "@type": "Brand", name: BRAND, logo: `${SITE}/icon.png` },
  sameAs: ["https://github.com/raycanvas-ai"],
};

/** The home page's graph: who makes Panelo, the site, the product with its real plans and prices, and the FAQ. */
export const homeGraph = {
  "@context": "https://schema.org",
  "@graph": [
    ORG,
    { "@type": "WebSite", "@id": `${SITE}/#site`, url: SITE, name: BRAND, publisher: { "@id": `${SITE}/#org` } },
    {
      "@type": "SoftwareApplication",
      name: BRAND,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: SITE,
      image: `${SITE}${SHARE_IMAGE.url}`,
      description: `${shippedEntries.length} React and Tailwind dashboard components, pages and charts for shadcn/ui, built on Vercel's UI SDK so AI agents can operate them. Free components are MIT-licensed.`,
      softwareRequirements: "React 19, Tailwind CSS v4, shadcn/ui, Vercel UI SDK",
      sameAs: [REPO_URL],
      creator: { "@id": `${SITE}/#org` },
      publisher: { "@id": `${SITE}/#org` },
      funder: { "@type": "Organization", name: PARTNER.name, url: PARTNER.url },
      offers: PLANS.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: plan.price ?? 0,
        priceCurrency: "USD",
        url: `${SITE}/#pricing`,
        availability: "https://schema.org/InStock",
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
      mainEntity: FAQ.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
  ],
};

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: `${SITE}${item.path}` })),
  };
}
