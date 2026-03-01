"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  Building2,
  MoreHorizontal,
} from "lucide-react";

const mobileNavItems = [
  { key: "dashboard", href: "/", icon: LayoutDashboard },
  { key: "crypto", href: "/crypto", icon: Wallet },
  { key: "banks", href: "/banks", icon: Landmark },
  { key: "realEstate", href: "/real-estate", icon: Building2 },
  { key: "settings", href: "/settings", icon: MoreHorizontal, labelKey: "more" },
];

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{t(item.labelKey || item.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
