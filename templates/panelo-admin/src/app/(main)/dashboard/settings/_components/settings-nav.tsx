"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "cn";
import { Bell, CreditCard, KeyRound, ShieldCheck, UserCog } from "lucide-react";

const links = [
  { title: "General", href: "/dashboard/settings", icon: UserCog },
  { title: "Security", href: "/dashboard/settings/security", icon: ShieldCheck },
  { title: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { title: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
  { title: "API Keys", href: "/dashboard/settings/api-keys", icon: KeyRound },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="scrollbar-none touch-pan-x overflow-x-auto overscroll-x-contain border-b"
    >
      <ul className="flex w-max min-w-full gap-5">
        {links.map(({ title, href, icon: Icon }) => {
          // General is the index route, so it must match exactly or it would stay lit on every sub-page.
          const active = href === "/dashboard/settings" ? pathname === href : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-10 items-center gap-1.5 whitespace-nowrap rounded-sm font-medium text-foreground/60 text-sm outline-none transition-[color] duration-150 ease-out hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-muted-foreground dark:hover:text-foreground",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground after:opacity-0",
                  active && "text-foreground after:opacity-100 dark:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className={cn("size-4", active ? "text-primary" : "text-current")} />
                {title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
