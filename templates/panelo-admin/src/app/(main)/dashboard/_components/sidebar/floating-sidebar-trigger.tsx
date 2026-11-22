"use client";

import { PanelLeftOpen } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";

/**
 * The only way back once the sidebar is collapsed — its own toggle lives inside
 * the sidebar, so it goes with it. Mobile tracks `openMobile`; `open` stays true
 * there and would hide this permanently.
 */
export function FloatingSidebarTrigger() {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();

  if (isMobile ? openMobile : open) return null;

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Open sidebar"
      className="fixed top-4 left-4 z-50 inline-flex size-8 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-sidebar-accent hover:text-foreground"
    >
      <PanelLeftOpen className="size-[18px]" />
    </button>
  );
}
