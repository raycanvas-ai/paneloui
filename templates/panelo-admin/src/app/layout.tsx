import type { ReactNode } from "react";

import { cn } from "cn";
import type { Metadata } from "next";

import { AgentBridge } from "@/components/agent-bridge";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_CONFIG } from "@/config/app-config";
import { FONT_VARIABLES } from "@/lib/fonts/registry";
import { PreferenceBootScript } from "@/lib/preferences/boot-script";
import { DEFAULT_SETTINGS, SETTING_NAMES, SETTINGS } from "@/lib/preferences/settings";

import "./globals.css";

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

/** The server always renders the defaults; the boot script swaps in saved values before paint. */
const settingAttributes = Object.fromEntries(
  SETTING_NAMES.map((name) => [SETTINGS[name].attribute, DEFAULT_SETTINGS[name]]),
);

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // The boot script rewrites <html> attributes before hydration, hence the warning opt-out.
    <html lang="en" {...settingAttributes} suppressHydrationWarning>
      <head>
        <PreferenceBootScript />
      </head>
      <body className={cn(FONT_VARIABLES, "min-h-screen antialiased")}>
        <TooltipProvider>
          {children}
          <Toaster />
          <AgentBridge />
        </TooltipProvider>
      </body>
    </html>
  );
}
