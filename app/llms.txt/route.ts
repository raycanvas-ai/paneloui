import { COMPONENT_SECTIONS } from "@/components/application/docs/components-index";
import { LEGAL } from "@/components/application/site/legal";
import { LAUNCH_OFF, listPrice, PLANS } from "@/components/application/site/pricing";
import { FAQ } from "@/components/application/site/faq";
import { MAKER, PARTNER, REPO_URL, shippedEntries, SIBLINGS, UI_SDK_URL } from "@/components/application/site/seo";
import { SITE, TEMPLATES_LAUNCH, TEMPLATES_UPCOMING } from "@/components/application/site/templates";

export const dynamic = "force-static";

/**
 * /llms.txt (llmstxt.org): what Panelo is, in plain text for AI assistants that answer "which React
 * dashboard kit should I use?". Built from the same catalogue and plans as the pages, so every count and
 * price matches what's on the site.
 */
export function GET() {
  const free = shippedEntries.filter((e) => e.tier === "free").length;
  const lines = [
    "# Panelo UI",
    "",
    `> ${shippedEntries.length} React and Tailwind CSS dashboard components, pages and charts for shadcn/ui (${free} free, the rest in Panelo Pro), in a Base UI edition and a Vercel UI SDK edition that AI agents can read and operate through the same controls users click. Source is copied into your project with the shadcn CLI.`,
    "",
    "## About",
    "",
    `- Built by [${MAKER.name}](${MAKER.url}), backed by [${PARTNER.name}](${PARTNER.url}). From the creators of ${SIBLINGS.map((s) => `[${s.name}](${s.url})`).join(" and ")}.`,
    `- The UI SDK edition is built on [Vercel's UI SDK](${UI_SDK_URL}): every control exposes itself to agents, which read the page as named controls and act through the same component API a click uses.`,
    "- Two editions of every item, same source and look: Base UI (`@panelo/<item>-base`, no UI SDK in your project) and UI SDK (`@panelo/<item>`, agent-operable). The workflow canvas (dashboard-pages-10) and AI automation dashboard (dashboard-pages-11) are UI SDK only.",
    "- Works in any shadcn/ui project, Base UI or Radix: items install with the shadcn CLI into components/panelo-ui, next to components/ui.",
    "- Stack: React 19, Next.js 16, Tailwind CSS v4. Light and dark themes on every item.",
    `- Source: [GitHub](${REPO_URL}). Free components are MIT-licensed; Pro is a one-time purchase.`,
    "",
    "## Install",
    "",
    `Run \`npx shadcn@latest add @panelo/<item>\` for the UI SDK edition or \`@panelo/<item>-base\` for Base UI (or pnpm dlx, yarn, bunx --bun). \`@panelo\` is in the shadcn CLI's built-in registry index, so no components.json setup is needed; the full URL \`${SITE}/r/<item>.json\` also works. Pro items use \`${SITE}/r/pro/{name}.json\` with a licence key header.`,
    "",
    "## Pricing",
    "",
    ...PLANS.map((p) =>
      p.price === null
        ? `- ${p.name}: free. ${p.blurb}`
        : `- ${p.name}: $${p.price} once (list $${listPrice(p)}, $${LAUNCH_OFF} launch discount included). ${p.blurb}`,
    ),
    "- One-time payments in USD through Dodo Payments (merchant of record). No subscription.",
    "",
    "## Components",
    "",
    ...COMPONENT_SECTIONS.flatMap((section) => {
      const entries = section.entries.filter((e) => e.status === "shipped");
      return entries.length ? [`### ${section.title}`, "", ...entries.map((e) => `- [${e.name}](${SITE}${e.href}) (${e.tier}): ${e.description}`), ""] : [];
    }),
    "## Templates",
    "",
    TEMPLATES_LAUNCH.open
      ? `- [Templates](${SITE}/templates): whole-app Next.js dashboard templates.`
      : `- ${TEMPLATES_LAUNCH.count} whole-app Next.js dashboard templates launch ${TEMPLATES_LAUNCH.date}: one free, the rest included in every Pro plan. ${SITE}/templates`,
    `- ${TEMPLATES_UPCOMING} more templates are in the works, with no dates yet.`,
    "",
    "## FAQ",
    "",
    ...FAQ.flatMap((item) => [`### ${item.q}`, "", item.a, ""]),
    "## More",
    "",
    `- [Agent demo](${SITE}/agent-demo): a live dashboard an AI agent operates through the UI SDK.`,
    ...LEGAL.map((d) => `- [${d.title}](${SITE}/legal/${d.slug}): ${d.intro}`),
    "- Contact: support@paneloui.com",
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
