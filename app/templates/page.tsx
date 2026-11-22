import type { Metadata } from "next";

import { TemplatesIndex } from "@/components/application/landing/template-pages";

export const metadata: Metadata = { title: "Templates", description: "Whole-app Next.js templates built on Panelo: download one, run it, make it yours." };

export default function TemplatesPage() {
  return <TemplatesIndex />;
}
