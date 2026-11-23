import type { Metadata } from "next";

import { TemplatesIndex } from "@/components/application/landing/template-pages";
import { pageMeta } from "@/components/application/site/seo";
import { TEMPLATES_LAUNCH } from "@/components/application/site/templates";

export const metadata: Metadata = TEMPLATES_LAUNCH.open
  ? pageMeta("/templates", "Next.js Dashboard Templates", "Whole-app Next.js and shadcn/ui dashboard templates: download one, run it, make it yours. One free, the rest in Panelo Pro.")
  : pageMeta(
      "/templates",
      `Next.js Dashboard Templates, Out ${TEMPLATES_LAUNCH.date}`,
      `${TEMPLATES_LAUNCH.count} whole-app Next.js and shadcn/ui dashboard templates arrive ${TEMPLATES_LAUNCH.date}: one free, the rest included in every Panelo Pro plan.`,
    );

export default function TemplatesPage() {
  return <TemplatesIndex />;
}
