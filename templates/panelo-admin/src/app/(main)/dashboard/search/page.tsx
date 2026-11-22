import { Search } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

import { searchWorkspace } from "./_components/search-data";
import { SearchResults } from "./_components/search-results";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const query = ((Array.isArray(q) ? q[0] : q) ?? "atlas").trim();
  const total = searchWorkspace(query).length;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">
          Search Results
        </h1>
        <p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
          {query ? `${total} ${total === 1 ? "result" : "results"} for "${query}"` : "Search across the workspace"}
        </p>
      </div>

      <search>
        <form action="/dashboard/search">
          <InputGroup className="h-11 rounded-xl bg-card">
            <InputGroupAddon className="pl-3">
              <Search className="size-5" />
            </InputGroupAddon>
            <InputGroupInput
              key={query}
              name="q"
              type="search"
              defaultValue={query}
              aria-label="Search projects, tasks, docs and people"
              placeholder="Search projects, tasks, docs and people..."
              className="text-base md:text-base"
            />
            <InputGroupAddon align="inline-end" className="pr-3">
              <Kbd>Enter</Kbd>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </search>

      <SearchResults query={query} />
    </div>
  );
}
