import { ComponentsCatalog } from "@/components/application/app-shell/components-catalog";
import { DocsShell } from "@/components/application/docs/docs-shell";

/** The component library: every category of the catalogue in the library frame. */
export default function ComponentsPage() {
  return (
    <DocsShell>
      <ComponentsCatalog />
    </DocsShell>
  );
}
