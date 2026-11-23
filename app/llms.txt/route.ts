import { COMPONENT_SECTIONS } from "@/components/application/docs/components-index";
import { LEGAL } from "@/components/application/site/legal";
import { LAUNCH_OFF, listPrice, PLANS } from "@/components/application/site/pricing";
import { shippedEntries } from "@/components/application/site/seo";
import { SITE, TEMPLATES_LAUNCH } from "@/components/application/site/templates";

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
    `> ${shippedEntries.length} React and Tailwind CSS dashboard components, pages and charts for shadcn/ui (${free} free, the rest in Panelo Pro), built on Vercel's UI SDK so AI agents can read the page and act through the same controls users click. Source is copied into your project with the shadcn CLI.`,
    "",
    "## Install",
    "",
    `Add \`"@panelo": "${SITE}/r/{name}.json"\` under \`registries\` in components.json, then run \`npx shadcn@latest add @panelo/<item>\`. Pro items use \`${SITE}/r/pro/{name}.json\` with a licence key header.`,
    "",
    "## Pricing",
    "",
    ...PLANS.map((p) =>
      p.price === null
        ? `- ${p.name}: free. ${p.blurb}`
        : `- ${p.name}: $${p.price} once (list $${listPrice(p)}, $${LAUNCH_OFF} launch discount applied at checkout). ${p.blurb}`,
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
    "",
    "## More",
    "",
    `- [Agent demo](${SITE}/agent-demo): a live dashboard an AI agent operates through the UI SDK.`,
    ...LEGAL.map((d) => `- [${d.title}](${SITE}/legal/${d.slug}): ${d.intro}`),
    "- Contact: support@paneloui.com",
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
