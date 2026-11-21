"use client";

import type { ReactElement } from "react";

import { ALL_ENTRIES, COMPONENT_SECTIONS, type SectionKind } from "@/components/application/docs/components-index";
import { BASE_DEMOS, MORE_DEMOS } from "@/components/application/docs/panelo-base-demos";
import { Scaled, TEMPLATE_CARD, TemplateFrame } from "@/components/application/docs/preview-frames";
import { BalanceChart } from "@/components/panelo/blocks/charts/balance-chart";
import { BudgetCard } from "@/components/panelo/blocks/charts/budget-card";
import { RevenueChart } from "@/components/panelo/blocks/charts/revenue-chart";
import { SalesTrendPanel } from "@/components/panelo/blocks/charts/sales-chart";
import { TrendsChart } from "@/components/panelo/blocks/charts/trends-chart";
import { HAS_PRO } from "@pro";

export const slugOf = (href: string) => href.replace("/components/", "");

/** A full Panelo screen from /preview/[slug], framed like the catalogue's screen cards. */
export function PaneloScreen({ slug, title }: { slug: string; title: string }) {
  // A clone without components/panelo/pro has no route for pro screens; say so instead of framing a 404.
  if (!HAS_PRO && ALL_ENTRIES.some((e) => e.tier === "pro" && slugOf(e.href) === slug)) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-sm text-text-tertiary">
        Included with Panelo Pro
      </div>
    );
  }
  return (
    <TemplateFrame>
      <iframe src={`/preview/${slug}`} title={`${title} preview`} loading="lazy" tabIndex={-1} aria-hidden className="pointer-events-none size-full border-0" />
    </TemplateFrame>
  );
}

const CHARTS: Record<string, () => ReactElement> = {
  "sales-trend": () => <SalesTrendPanel />,
  "revenue-chart": () => <RevenueChart />,
  "trends-chart": () => <TrendsChart />,
  "balance-chart": () => <BalanceChart />,
  "budget-card": () => <BudgetCard />,
};

/** The live demo of a Panelo component, themed through the token bridge. */
export function PaneloDemo({ slug }: { slug: string }) {
  const Demo = BASE_DEMOS[slug] ?? MORE_DEMOS[slug];
  return (
    <div data-panelo className="flex size-full items-center justify-center p-6 text-foreground">
      {Demo ? <Demo /> : null}
    </div>
  );
}

export function PaneloChart({ slug }: { slug: string }) {
  const Chart = CHARTS[slug];
  return Chart ? (
    <div data-panelo className="text-foreground">
      <Chart />
    </div>
  ) : null;
}

const PREVIEW: Record<SectionKind, (slug: string, name: string) => ReactElement> = {
  component: (slug) => <PaneloDemo slug={slug.replace(/^ui-/, "")} />,
  chart: (slug) => (
    <Scaled width={720}>
      <PaneloChart slug={slug} />
    </Scaled>
  ),
  screen: (slug, name) => <PaneloScreen slug={slug} title={name} />,
};

const OPTIONS: Record<SectionKind, { fade?: boolean; className?: string; previewClassName?: string }> = {
  component: {},
  chart: { fade: true },
  screen: TEMPLATE_CARD,
};

/** Card preview and card options for every catalogue entry, keyed by href. */
export const PANELO_PREVIEWS: Record<string, { Preview: () => ReactElement; options: (typeof OPTIONS)[SectionKind] }> = Object.fromEntries(
  COMPONENT_SECTIONS.flatMap((section) =>
    section.entries.map((entry) => [entry.href, { Preview: () => PREVIEW[section.kind](slugOf(entry.href), entry.name), options: OPTIONS[section.kind] }]),
  ),
);
