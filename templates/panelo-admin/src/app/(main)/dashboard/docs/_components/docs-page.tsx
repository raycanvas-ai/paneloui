"use client";
import * as React from "react";

import { cn } from "cn";
import {
  ArrowUpDown,
  CircleUser,
  FileText,
  Grid2x2,
  LayoutGrid,
  ListFilter,
  Presentation,
  Search,
  Settings2,
  Share2,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AVATAR_TONES,
  DATE_BUCKETS,
  type DocItem,
  type DocKind,
  type DocTab,
  docTabs,
  groupByOptions,
  KIND_LABEL,
  owners,
  quickActions,
  docs as seedDocs,
  sortOptions,
} from "./docs-data";
import { quickIcons } from "./docs-icons";
import { DocPreview } from "./docs-preview";

const KIND_ICON: Record<DocKind, typeof FileText> = { doc: FileText, grid: Grid2x2, deck: Presentation };
const TAB_ICON = { "All docs": LayoutGrid, "My docs": CircleUser, Favorites: Star, Sharing: Share2, Deleted: Trash2 };

const CONTROL = "flex h-[32px] shrink-0 cursor-pointer items-center gap-[7px] rounded-[10px] px-[10px] text-[13px]";
const OUTLINE = "border border-border bg-card hover:bg-background dark:bg-card";

function Avatars({ tones }: { readonly tones: number[] }) {
  return (
    <span className="flex shrink-0 items-center">
      {tones.map((tone, index) => (
        <span
          key={`${tone}-${index}`}
          className={cn("size-[15px] rounded-full", index > 0 && "-ml-[6px]")}
          style={{ backgroundImage: AVATAR_TONES[tone] }}
        />
      ))}
    </span>
  );
}

function DocCard({ doc }: { readonly doc: DocItem }) {
  const Icon = KIND_ICON[doc.kind];
  return (
    <button
      type="button"
      className="group flex flex-col rounded-[12px] border border-border bg-card p-[10px] pb-0 text-left shadow-[0_1px_2px_rgba(16,16,20,0.04)] transition-shadow hover:shadow-[0_2px_10px_rgba(16,16,20,0.07)] dark:bg-card"
    >
      <span className="block h-[85px] w-full overflow-hidden rounded-[8px] bg-muted px-[24px] pt-[9px]">
        <span className="block overflow-hidden rounded-t-[6px] shadow-[0_1px_4px_rgba(16,16,20,0.08)]">
          <DocPreview kind={doc.preview} />
        </span>
      </span>

      <span className="flex h-[47px] items-center gap-[8px] px-[2px]">
        <Icon className="size-[18px] shrink-0 text-foreground" strokeWidth={1.7} />
        <span className="min-w-0 flex-1 truncate text-foreground text-[15px]">{doc.title}</span>
        <Avatars tones={doc.avatars} />
      </span>
    </button>
  );
}

export function DocsPage() {
  const [items, setItems] = React.useState<DocItem[]>(seedDocs);
  const [tab, setTab] = React.useState<DocTab>("All docs");
  const [groupBy, setGroupBy] = React.useState<(typeof groupByOptions)[number]>("Date");
  const [sort, setSort] = React.useState<(typeof sortOptions)[number]>("Recent");
  const [kinds, setKinds] = React.useState<DocKind[]>([]);
  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [dense, setDense] = React.useState(false);

  const visible = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const byTab = items.filter((doc) => {
      if (tab === "Deleted") return doc.deleted;
      if (doc.deleted) return false;
      if (tab === "My docs") return doc.mine;
      if (tab === "Favorites") return doc.favorite;
      if (tab === "Sharing") return doc.shared;
      return true;
    });
    const filtered = byTab.filter(
      (doc) =>
        (kinds.length === 0 || kinds.includes(doc.kind)) && (needle === "" || doc.title.toLowerCase().includes(needle)),
    );
    return [...filtered].sort((a, b) => (sort === "Name" ? a.title.localeCompare(b.title) : a.daysAgo - b.daysAgo));
  }, [items, kinds, query, sort, tab]);

  const groups = React.useMemo(() => {
    const buckets = new Map<string, DocItem[]>();
    const push = (key: string, doc: DocItem) => buckets.set(key, [...(buckets.get(key) ?? []), doc]);

    for (const doc of visible) {
      if (groupBy === "Type") push(KIND_LABEL[doc.kind], doc);
      else if (groupBy === "Owner") push(doc.owner, doc);
      else push(DATE_BUCKETS.find((bucket) => doc.daysAgo <= bucket.max)?.label ?? "Earlier", doc);
    }

    const order =
      groupBy === "Date"
        ? DATE_BUCKETS.map((bucket) => bucket.label)
        : groupBy === "Type"
          ? Object.values(KIND_LABEL)
          : owners;

    return order.filter((label) => buckets.has(label)).map((label) => ({ label, items: buckets.get(label) ?? [] }));
  }, [groupBy, visible]);

  function create(action: (typeof quickActions)[number]) {
    setItems((previous) => [
      {
        id: `new-${Date.now()}`,
        title: `Untitled ${action.title.replace("New ", "")}`,
        kind: action.kind,
        preview: action.preview,
        owner: owners[0],
        avatars: [0, 3, 5],
        daysAgo: 0,
        mine: true,
        favorite: false,
        shared: false,
        deleted: false,
      },
      ...previous,
    ]);
    setTab("All docs");
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-y-auto bg-card dark:bg-background"
      data-content-padding="false"
    >
      <div className="sticky top-0 z-10 flex h-[51px] shrink-0 items-center justify-between gap-4 border-border border-b bg-card px-[17px] dark:bg-background">
        <div className="flex min-w-0 items-center gap-[8px] overflow-x-auto">
          {docTabs.map((item) => {
            const Icon = TAB_ICON[item];
            const active = tab === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cn(
                  "flex h-[32px] shrink-0 cursor-pointer items-center gap-[7px] rounded-[10px] px-[9px] text-[15px] transition-colors",
                  active
                    ? "border border-border bg-card text-foreground shadow-[0_1px_2px_rgba(16,16,20,0.06)] dark:bg-card"
                    : "text-foreground/75 hover:bg-background",
                )}
              >
                <Icon className="size-[15px] shrink-0" strokeWidth={1.8} />
                {/* Narrow shells keep icons only, apart from the tab you are on. */}
                <span className={cn("hidden xl:inline", active && "inline")}>{item}</span>
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-[13px]">
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(CONTROL, "bg-background text-foreground")}>
              <LayoutGrid className="size-[14px]" strokeWidth={1.8} />
              <span className="text-foreground/75">
                Group by <span className="font-medium text-foreground">{groupBy}</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={groupBy} onValueChange={(value) => setGroupBy(value as typeof groupBy)}>
                {groupByOptions.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(CONTROL, OUTLINE)}>
              <ArrowUpDown className="size-[14px]" strokeWidth={1.8} />
              Sort
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={sort} onValueChange={(value) => setSort(value as typeof sort)}>
                {sortOptions.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <button type="button" onClick={() => setDense((value) => !value)} className={cn(CONTROL, OUTLINE)}>
            <Settings2 className="size-[14px]" strokeWidth={1.8} />
            View
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(CONTROL, OUTLINE)}>
              <ListFilter className="size-[14px]" strokeWidth={1.8} />
              Filter
              {kinds.length > 0 ? <span className="text-foreground/75">{kinds.length}</span> : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Type</DropdownMenuLabel>
              {(Object.keys(KIND_LABEL) as DocKind[]).map((kind) => (
                <DropdownMenuCheckboxItem
                  key={kind}
                  checked={kinds.includes(kind)}
                  onCheckedChange={(checked) =>
                    setKinds((previous) => (checked ? [...previous, kind] : previous.filter((k) => k !== kind)))
                  }
                >
                  {KIND_LABEL[kind]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {searching ? (
            <span className={cn(CONTROL, OUTLINE, "gap-[6px] pr-[6px]")}>
              {/* biome-ignore lint/a11y/noAutofocus: the field only mounts on an explicit click */}
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search docs"
                aria-label="Search docs"
                className="w-[140px] bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setQuery("");
                  setSearching(false);
                }}
                className="cursor-pointer rounded-md p-1 text-foreground/75 hover:bg-muted"
              >
                <X className="size-[14px]" />
              </button>
            </span>
          ) : (
            <button
              type="button"
              aria-label="Search docs"
              onClick={() => setSearching(true)}
              className={cn(
                "flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[10px]",
                OUTLINE,
              )}
            >
              <Search className="size-[15px]" strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      <div className="px-[17px] pt-[18px] pb-[28px]">
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Glyph = quickIcons[action.id as keyof typeof quickIcons];
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => create(action)}
                className="flex h-[62px] cursor-pointer items-center gap-[13px] rounded-[12px] border border-border bg-card px-[11px] text-left shadow-[0_1px_2px_rgba(16,16,20,0.04)] transition-shadow hover:shadow-[0_2px_10px_rgba(16,16,20,0.07)] dark:bg-card"
              >
                <span
                  className="flex size-[40px] shrink-0 items-center justify-center rounded-[11px] text-white"
                  style={{ backgroundColor: action.fill }}
                >
                  <Glyph />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-foreground text-[14px] leading-[19px]">
                    {action.title}
                  </span>
                  <span className="mt-[1px] block truncate text-foreground/75 text-[13px] leading-[16px]">
                    {action.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-[18px] h-px w-full bg-[repeating-linear-gradient(to_right,var(--border)_0_4px,transparent_4px_8px)]" />

        {groups.length === 0 ? (
          <p className="py-24 text-center text-foreground/75 text-[15px]">No documents match this view.</p>
        ) : (
          groups.map((group, index) => (
            // The first band sits under the dashed rule, which already carries space.
            <section key={group.label} className={cn(index === 0 ? "mt-[27px]" : "mt-[30px]")}>
              <h2 className="flex items-baseline gap-[10px] pl-[10px] text-foreground text-[14px] leading-none">
                {group.label}
                <span className="text-muted-foreground text-[13px] tabular-nums underline underline-offset-[3px]">
                  {String(group.items.length).padStart(2, "0")}
                </span>
              </h2>
              <div
                className={cn(
                  "mt-[18px] grid gap-[13px] sm:grid-cols-2 lg:grid-cols-3",
                  dense ? "xl:grid-cols-5" : "xl:grid-cols-4",
                )}
              >
                {group.items.map((doc) => (
                  <DocCard key={doc.id} doc={doc} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
