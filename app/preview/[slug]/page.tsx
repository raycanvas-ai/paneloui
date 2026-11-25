import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgentProbe } from "@/components/panelo/agent-probe";
import { EmbeddedFrame } from "@/components/application/docs/embedded-frame";
import { LookReceiver } from "@/components/application/docs/look-receiver";
import { PANELO_LOADERS } from "@/components/application/docs/panelo-previews";

export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  return Object.keys(PANELO_LOADERS).map((slug) => ({ slug }));
}

const CHARTS = new Set(["sales-trend", "revenue-chart", "trends-chart", "balance-chart", "activity-heatmap", "pie-chart", "contribution-chart", "link-graph"]);

/** A Panelo block, template or chart on its own: framed by the catalog cards and used by the agent tests. */
export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const load = PANELO_LOADERS[slug];
  if (!load) notFound();
  const Component = await load();

  return (
    <div data-panelo className="bg-background text-foreground">
      {CHARTS.has(slug) ? (
        <div className="flex min-h-svh justify-center p-6 sm:p-10 sm:pt-[12vh]">
          <div className="w-full max-w-4xl">
            <Component />
          </div>
        </div>
      ) : (
        <Component />
      )}
      <AgentProbe />
      <LookReceiver />
      <EmbeddedFrame />
    </div>
  );
}
