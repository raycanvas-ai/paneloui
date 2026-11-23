import { ogImage, OG_SIZE } from "@/components/application/site/og";
import { shippedEntries } from "@/components/application/site/seo";

export const alt = "Panelo UI: React dashboard components AI agents can operate";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "React · Tailwind CSS · shadcn/ui · Vercel UI SDK",
    title: "Dashboard components AI agents can operate.",
    detail: `${shippedEntries.length} components, pages and charts · Pro from $129 once`,
  });
}
