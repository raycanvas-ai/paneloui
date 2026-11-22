import { cn } from "cn";
import { FileText } from "lucide-react";

import { PANEL, PanelHead } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";

import { getPages, type RangeKey } from "./analytics-data";

export function PagesPanel({ range }: { readonly range: RangeKey }) {
  const { pageviews, rows } = getPages(range);

  return (
    <div className={cn(PANEL, "flex min-w-0 flex-col gap-3 p-4 sm:p-5")}>
      <PanelHead icon={<FileText className="size-4 text-muted-foreground" strokeWidth={1.8} />} title="Top pages">
        <span className="mr-1.5 text-muted-foreground text-xs tabular-nums">
          {pageviews.toLocaleString("en-US")} pageviews
        </span>
      </PanelHead>

      <ol className="flex flex-col gap-3">
        {rows.map((page) => (
          <li key={page.path}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate">{page.title}</p>
                <p className="truncate font-mono text-muted-foreground text-xs">{page.path}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-medium tabular-nums">{page.views.toLocaleString("en-US")}</p>
                <p className="text-muted-foreground text-xs tabular-nums">{Math.round(page.share * 100)}%</p>
              </div>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-muted">
              <div
                className="h-1 rounded-full bg-[var(--tone-secondary)]"
                style={{ width: `${(page.share / rows[0].share) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
