import { cn } from "cn";
import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";

import { type ChangeKind, releases } from "./changelog-data";

const KINDS: Record<ChangeKind, { label: string; className: string }> = {
  new: { label: "New", className: "bg-info/10 text-info" },
  improved: { label: "Improved", className: "bg-success/10 text-success" },
  fixed: { label: "Fixed", className: "bg-warning/10 text-warning" },
};

export function ChangelogTimeline() {
  return (
    <ol className="flex flex-col">
      {releases.map((release, index) => {
        const latest = index === 0;
        return (
          <li
            key={release.version}
            className="grid grid-cols-1 gap-2 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-8"
            aria-labelledby={`release-${release.version}`}
          >
            <div className="flex items-center gap-2 lg:sticky lg:top-0 lg:flex-col lg:items-start lg:self-start lg:py-1">
              <span className="font-medium font-mono text-sm tabular-nums">v{release.version}</span>
              <time dateTime={release.date} className="text-muted-foreground text-xs tabular-nums">
                {format(parseISO(release.date), "MMM d, yyyy")}
              </time>
              {latest && <Badge className="bg-primary/10 text-primary">Latest</Badge>}
            </div>

            <article className={cn("relative border-l pl-6", index < releases.length - 1 && "pb-10")}>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-1.5 -left-[5px] size-2.5 rounded-full ring-4 ring-background",
                  latest ? "bg-primary" : "bg-muted-foreground/40",
                )}
              />
              <h2 id={`release-${release.version}`} className="font-medium text-lg leading-snug tracking-tight">
                {release.title}
              </h2>
              <p className="mt-1 max-w-2xl text-muted-foreground text-sm">{release.summary}</p>

              <div className="mt-4 flex flex-col gap-4">
                {(Object.keys(KINDS) as ChangeKind[]).map((kind) => {
                  const items = release.changes[kind];
                  if (!items?.length) return null;
                  return (
                    <section key={kind} className="flex flex-col gap-2">
                      <Badge className={KINDS[kind].className}>{KINDS[kind].label}</Badge>
                      <ul className="flex max-w-2xl list-disc flex-col gap-1.5 pl-5 text-sm marker:text-muted-foreground">
                        {items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
