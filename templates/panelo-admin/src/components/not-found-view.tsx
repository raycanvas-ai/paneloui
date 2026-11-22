import Link from "next/link";

import { cn } from "cn";
import { ArrowUpRight, House, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const destinations = [
  { label: "Overview", href: "/dashboard/default" },
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Chat", href: "/dashboard/chat" },
  { label: "Settings", href: "/dashboard/settings" },
];

/** Shared by the app-level and dashboard 404s; `fullScreen` fills the viewport outside the shell. */
export function NotFoundView({ fullScreen = false }: { readonly fullScreen?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-12 text-center",
        fullScreen ? "min-h-dvh bg-background" : "h-full min-h-[32rem]",
      )}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="animate-stage stage-0 flex flex-col items-center gap-3">
          <Badge variant="secondary">Error 404</Badge>
          <p
            aria-hidden="true"
            className="font-medium text-7xl text-muted-foreground/30 leading-none tracking-tighter tabular-nums sm:text-8xl"
          >
            404
          </p>
        </div>

        <div className="animate-stage stage-1 flex flex-col gap-2">
          <h1 className="text-balance font-medium text-2xl leading-tight tracking-tight sm:text-3xl">
            We can&apos;t find that page
          </h1>
          <p className="text-muted-foreground text-sm">
            The link may be broken, or the page may have moved. Search the workspace or jump to one of the places below.
          </p>
        </div>

        {/* A plain GET form, so search works before any JavaScript loads. */}
        <search className="animate-stage stage-2 w-full">
          <form action="/dashboard/search">
            <label htmlFor="not-found-search" className="sr-only">
              Search the workspace
            </label>
            <InputGroup className="h-10 rounded-full bg-card">
              <InputGroupAddon className="pl-3">
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="not-found-search"
                name="q"
                type="search"
                placeholder="Search pages, people, orders…"
              />
            </InputGroup>
          </form>
        </search>

        <nav aria-label="Popular pages" className="animate-stage stage-3 flex flex-wrap justify-center gap-2">
          {destinations.map((item) => (
            <Link
              key={item.href}
              prefetch={false}
              href={item.href}
              className="rounded-full bg-muted px-3 py-1 text-sm transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="animate-stage stage-4 flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" asChild>
            <Link prefetch={false} href="/dashboard/default">
              <House data-icon="inline-start" />
              Go to dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link prefetch={false} href="/dashboard/help">
              Help center
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
