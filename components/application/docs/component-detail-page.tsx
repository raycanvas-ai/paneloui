"use client";

import { ComponentDetail } from "@/components/application/docs/component-detail";
import { ALL_ENTRIES } from "@/components/application/docs/components-index";
import { DocsShell } from "@/components/application/docs/docs-shell";

/** A catalogue item's page in the library frame, so it keeps the sidebar. */
export function ComponentDetailPage({ href }: { href: string }) {
  const entry = ALL_ENTRIES.find((e) => e.href === href)!;
  return (
    <DocsShell>
      <ComponentDetail entry={entry} />
    </DocsShell>
  );
}
