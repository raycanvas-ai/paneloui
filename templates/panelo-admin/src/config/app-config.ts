import { version } from "../../package.json";

/** Product identity, read by metadata, the sidebar header, auth screens and the maintenance page. */
export const APP_CONFIG = {
  name: "Panelo",
  version,
  copyright: `© ${new Date().getFullYear()} Panelo`,
  meta: {
    title: "Panelo · Admin dashboard template for Next.js",
    description:
      "Dashboards, apps, commerce, account and auth screens for SaaS products and internal tools, built on Next.js, Tailwind CSS and shadcn/ui.",
  },
} as const;
