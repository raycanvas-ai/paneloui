import Link from "next/link";

import { ChevronRight, CornerDownLeft, SearchX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Kbd } from "@/components/ui/kbd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RESULT_KINDS, type ResultKind, type SearchResult, searchWorkspace } from "./search-data";

const SUGGESTIONS = ["atlas", "orion", "runbook", "maya"];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, query }: { text: string; query: string }) {
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  let offset = 0;
  return parts.map((part) => {
    const key = offset;
    offset += part.length;
    if (part.toLowerCase() !== query.toLowerCase()) return part;
    return (
      <mark key={key} className="rounded-sm bg-primary/15 px-0.5 text-foreground">
        {part}
      </mark>
    );
  });
}

export function SearchResults({ query }: { query: string }) {
  const results = searchWorkspace(query);

  if (results.length === 0) return <NoResults query={query} />;

  const kinds = Object.keys(RESULT_KINDS) as ResultKind[];
  const byKind = (kind: ResultKind) => results.filter((r) => r.kind === kind);

  return (
    <Tabs defaultValue="all" className="flex flex-col gap-4">
      <div className="scrollbar-none -mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <TabsList variant="line">
          <TabsTrigger value="all">
            All <Count value={results.length} />
          </TabsTrigger>
          {kinds.map((kind) => (
            <TabsTrigger key={kind} value={kind} disabled={byKind(kind).length === 0}>
              {RESULT_KINDS[kind].label} <Count value={byKind(kind).length} />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="all" className="flex flex-col gap-5">
        {kinds.map((kind) => {
          const group = byKind(kind);
          if (group.length === 0) return null;
          return (
            <section key={kind} aria-labelledby={`group-${kind}`} className="flex flex-col gap-2">
              <h2 id={`group-${kind}`} className="font-medium text-muted-foreground text-xs">
                {RESULT_KINDS[kind].label}
              </h2>
              <ResultList results={group} query={query} />
            </section>
          );
        })}
      </TabsContent>

      {kinds.map((kind) => (
        <TabsContent key={kind} value={kind}>
          <ResultList results={byKind(kind)} query={query} />
        </TabsContent>
      ))}

      <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-xs">
        <span className="inline-flex items-center gap-1.5">
          <Kbd>Tab</Kbd> Move between results
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>
            <CornerDownLeft />
          </Kbd>
          Open result
        </span>
      </p>
    </Tabs>
  );
}

function Count({ value }: { value: number }) {
  return (
    <Badge variant="secondary" className="h-4.5 min-w-4.5 px-1 tabular-nums">
      {value}
    </Badge>
  );
}

function ResultList({ results, query }: { results: SearchResult[]; query: string }) {
  return (
    <Card className="gap-0 divide-y divide-border py-0">
      {results.map((result) => {
        const Icon = RESULT_KINDS[result.kind].icon;
        return (
          <Link
            key={result.id}
            prefetch={false}
            href={result.href}
            className="group/result flex items-start gap-3 px-4 py-3 outline-none transition-[background-color] duration-150 ease-out hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">
                <Highlight text={result.title} query={query} />
              </p>
              <p className="mt-0.5 line-clamp-2 text-muted-foreground text-sm">
                <Highlight text={result.description} query={query} />
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                {result.path} · {result.meta}
              </p>
            </div>
            <ChevronRight
              aria-hidden="true"
              className="mt-2 size-4 shrink-0 text-muted-foreground opacity-0 transition-[opacity] duration-150 ease-out group-hover/result:opacity-100 group-focus-visible/result:opacity-100"
            />
          </Link>
        );
      })}
    </Card>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <Card className="py-0">
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="animate-stage stage-0">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle className="animate-stage stage-1">
            {query ? <>No results for &ldquo;{query}&rdquo;</> : "Search your workspace"}
          </EmptyTitle>
          <EmptyDescription className="animate-stage stage-2">
            {query
              ? "Check the spelling or try a broader term. Search covers projects, tasks, docs and people."
              : "Find projects, tasks, docs and people across Panelo."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="animate-stage stage-3">
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((term) => (
              <Badge key={term} variant="outline" asChild>
                <Link prefetch={false} href={`/dashboard/search?q=${term}`}>
                  {term}
                </Link>
              </Badge>
            ))}
          </div>
        </EmptyContent>
      </Empty>
    </Card>
  );
}
