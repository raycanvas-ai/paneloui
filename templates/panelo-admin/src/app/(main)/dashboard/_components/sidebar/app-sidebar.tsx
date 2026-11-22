"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "cn";
import { Command, PanelLeftClose, Search } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { rootUser } from "@/data/users";
import type { SidebarLink, SidebarSection } from "@/navigation/sidebar/sidebar-items";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

import { SearchDialog } from "../header/search-dialog";
import { ThemeSwitcher } from "../header/theme-switcher";

function NavItem({ item, active }: { readonly item: SidebarLink; readonly active: boolean }) {
  const Icon = item.icon;

  return (
    <li className="flex w-full flex-col">
      <Link
        prefetch={false}
        href={item.url}
        className={cn(
          "flex h-8 w-full items-center gap-1.5 rounded-lg px-2 text-left transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        )}
      >
        <Icon className="size-[18px] shrink-0" />
        <span className="line-clamp-1 flex-1 font-medium text-[15px] tracking-[-0.28px]">{item.title}</span>
      </Link>
    </li>
  );
}

function NavSection({
  group,
  isActive,
}: {
  readonly group: SidebarSection;
  readonly isActive: (i: SidebarLink) => boolean;
}) {
  const [open, setOpen] = React.useState(group.defaultOpen ?? true);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-px">
      <CollapsibleTrigger className="flex h-8 w-full items-center gap-1.5 overflow-clip rounded-lg px-2 outline-none hover:bg-sidebar-accent">
        <svg
          role="presentation"
          viewBox="0 0 14 14"
          fill="none"
          className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", !open && "-rotate-90")}
        >
          <path
            d="m4 5.5 3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="flex-1 text-left font-medium text-[13px] text-muted-foreground tracking-[-0.12px]">
          {group.label}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-px">
          {group.items.map((item) => (
            <NavItem key={item.id} item={item} active={isActive(item)} />
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const isActive = React.useCallback((item: SidebarLink) => pathname === item.url, [pathname]);

  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="md:p-2">
      <SidebarHeader className="h-12 justify-center gap-0 px-2 py-0">
        <div className="flex items-center gap-2">
          <Link
            prefetch={false}
            href="/dashboard/default"
            className="flex size-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background"
          >
            <Command className="size-4" />
          </Link>
          <span className="flex-1 truncate font-semibold text-base tracking-[-0.3px]">{APP_CONFIG.name}</span>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-3 px-2 pb-4">
        <SearchDialog
          trigger={(open) => (
            <button
              type="button"
              onClick={open}
              className="flex h-8 w-full shrink-0 items-center gap-1.5 rounded-lg border border-border/50 bg-background px-2 text-[13px] text-muted-foreground shadow-sm transition-colors hover:bg-sidebar-accent"
            >
              <Search className="size-4 shrink-0" />
              <span className="flex-1 text-left">Search</span>
              <kbd className="font-medium text-[11px] tracking-wide">⌘K</kbd>
            </button>
          )}
        />
        {sidebarItems.map((group) => (
          <NavSection key={group.id} group={group} isActive={isActive} />
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-0 border-sidebar-border border-t px-2 py-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent font-medium text-[11px]">
            {rootUser.name.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-medium text-[13px]">{rootUser.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{rootUser.email}</p>
          </div>
          <ThemeSwitcher />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
