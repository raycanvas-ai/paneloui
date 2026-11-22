"use client";

import { type ReactNode, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Clock, CornerDownLeft, Search } from "lucide-react";

import { RESULT_KINDS, searchWorkspace } from "@/app/(main)/dashboard/search/_components/search-data";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { type SidebarLink, sidebarItems } from "@/navigation/sidebar/sidebar-items";

const RECENT_KEY = "panelo:recent-pages";
const RECENT_LIMIT = 4;

/** Every sidebar link, tagged with its section, so the palette mirrors the navigation exactly. */
const pages = sidebarItems.flatMap((section) => section.items.map((link) => ({ ...link, section: section.label })));

/** Placeholder routes add noise when browsing; they still show up once you type. */
const browsable = pages.filter((page) => !page.url.endsWith("/coming-soon"));

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

interface SearchDialogProps {
  /** Custom opener; receives the function that opens the palette. Defaults to a small "Search ⌘K" button. */
  readonly trigger?: (open: () => void) => ReactNode;
}

export function SearchDialog({ trigger }: SearchDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // localStorage is read on open, never during render, so server and client markup match.
  const toggle = (next: boolean) => {
    if (next) setRecent(readRecent());
    else setQuery("");
    setOpen(next);
  };

  const go = (url: string) => {
    const next = [url, ...readRecent().filter((item) => item !== url)].slice(0, RECENT_LIMIT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    toggle(false);
    router.push(url);
  };

  const term = query.trim();
  const recentPages = recent.flatMap((url) => pages.filter((page) => page.url === url));
  const sections = [...new Set((term ? pages : browsable).map((page) => page.section))];
  const workspace = term ? searchWorkspace(term).slice(0, 6) : [];

  const pageItem = (page: SidebarLink & { section: string }, prefix: string) => (
    <CommandItem
      key={`${prefix}-${page.id}`}
      value={`${prefix} ${page.section} ${page.title}`}
      onSelect={() => go(page.url)}
    >
      <page.icon />
      <span className="truncate">{page.title}</span>
      <span className="ml-auto text-muted-foreground text-xs">{page.section}</span>
    </CommandItem>
  );

  return (
    <>
      {trigger ? (
        trigger(() => toggle(true))
      ) : (
        <button
          type="button"
          onClick={() => toggle(true)}
          className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
        >
          <Search className="size-4" />
          Search
          <kbd className="rounded border bg-muted px-1.5 font-medium text-[10px]">⌘K</kbd>
        </button>
      )}

      <CommandDialog open={open} onOpenChange={toggle} title="Search" description="Jump to a page or find work">
        <Command>
          <CommandInput placeholder="Search pages, projects, people…" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>Nothing matches “{term}”.</CommandEmpty>

            {!term && recentPages.length > 0 ? (
              <>
                <CommandGroup heading="Recent">
                  {recentPages.map((page) => (
                    <CommandItem key={`recent-${page.id}`} value={`recent ${page.title}`} onSelect={() => go(page.url)}>
                      <Clock />
                      <span className="truncate">{page.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            ) : null}

            {sections.map((section) => (
              <CommandGroup key={section} heading={section}>
                {(term ? pages : browsable)
                  .filter((page) => page.section === section)
                  .map((page) => pageItem(page, "page"))}
              </CommandGroup>
            ))}

            {workspace.length > 0 ? (
              <CommandGroup heading="Workspace">
                {workspace.map((result) => {
                  const Icon = RESULT_KINDS[result.kind].icon;
                  return (
                    <CommandItem
                      key={result.id}
                      value={`workspace ${result.title} ${result.description} ${result.path}`}
                      onSelect={() => go(result.href)}
                    >
                      <Icon />
                      <span className="truncate">{result.title}</span>
                      <span className="ml-auto shrink-0 text-muted-foreground text-xs">{result.path}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : null}

            {term ? (
              <CommandGroup heading="Everything">
                <CommandItem
                  forceMount
                  value={`everything ${term}`}
                  onSelect={() => go(`/dashboard/search?q=${encodeURIComponent(term)}`)}
                >
                  <CornerDownLeft />
                  <span className="truncate">See all results for “{term}”</span>
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
