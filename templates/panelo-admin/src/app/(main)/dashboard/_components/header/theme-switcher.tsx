"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSetting } from "@/lib/preferences/store";

const NEXT_MODE = { light: "dark", dark: "system", system: "light" } as const;
const MODE_LABEL = { light: "Light", dark: "Dark", system: "System" } as const;

export function ThemeSwitcher() {
  const [mode, setMode] = useSetting("mode");
  const next = NEXT_MODE[mode];

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground"
      onClick={() => setMode(next)}
      aria-label={`Theme: ${MODE_LABEL[mode]}. Switch to ${MODE_LABEL[next]}`}
    >
      {/* Icons key off the <html> attribute, so the right one shows before hydration. */}
      <Sun className="in-data-[theme-mode=light]:block hidden" />
      <Moon className="in-data-[theme-mode=dark]:block hidden" />
      <Monitor className="in-data-[theme-mode=system]:block hidden" />
    </Button>
  );
}
