import type { ReactNode } from "react";

import { cookies } from "next/headers";

import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { FloatingSidebarTrigger } from "@/app/(main)/dashboard/_components/sidebar/floating-sidebar-trigger";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/** The inset card floats inside the sidebar colour on desktop and fills the screen on mobile. */
const INSET_CARD =
  "min-w-0 overflow-hidden peer-data-[variant=inset]:border md:peer-data-[variant=inset]:rounded-2xl md:peer-data-[variant=inset]:my-3 md:peer-data-[variant=inset]:mr-3 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-3";

/**
 * Scroll area for every dashboard page. Pages that are full-bleed apps (chat, mail, boards)
 * mark themselves data-content-padding="false" to drop the padding and own their scrolling.
 * The "centered" width setting caps the content at 2xl on very wide screens.
 */
const PAGE_AREA =
  "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 has-data-[content-padding=false]:overflow-hidden has-data-[content-padding=false]:p-0 in-data-[content-layout=centered]:mx-auto in-data-[content-layout=centered]:w-full in-data-[content-layout=centered]:max-w-screen-2xl";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  // shadcn's SidebarProvider remembers open/closed in this cookie.
  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen} className="h-svh overflow-hidden bg-sidebar [--sidebar-width:16rem]">
      <AppSidebar />
      <FloatingSidebarTrigger />
      <SidebarInset className={INSET_CARD}>
        <div className={PAGE_AREA}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
