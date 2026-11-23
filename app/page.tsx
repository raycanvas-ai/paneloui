import type { Metadata } from "next";

import { LandingPage } from "@/components/application/landing/landing-page";
import { homeGraph, JsonLd, pageMeta, shippedEntries } from "@/components/application/site/seo";

export const metadata: Metadata = pageMeta(
  "/",
  "React Dashboard Components for shadcn/ui",
  `${shippedEntries.length} React and Tailwind dashboard components, pages and charts for shadcn/ui, built on Vercel's UI SDK so AI agents can operate them. Free components and Pro from $129 once.`,
  { title: { absolute: "React Dashboard Components for shadcn/ui | Panelo UI" } },
);

export default function Home() {
  return (
    <>
      <JsonLd data={homeGraph} />
      <LandingPage />
    </>
  );
}
