"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import { NAV_ITEMS } from "@/config/navigation";
import * as Lucide from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

function getIcon(name: string): LucideIcon {
  return (Lucide as unknown as Record<string, LucideIcon>)[name] ?? Lucide.Circle;
}

export function MobileNav() {
  const view = useDemoStore((s) => s.view);
  const navigate = useDemoStore((s) => s.navigate);
  const setMobileNavOpen = useDemoStore((s) => s.setMobileNavOpen);
  const conversations = useDemoStore((s) => s.conversations);
  const inboxUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const items = NAV_ITEMS.filter((n) => n.mobileVisible);
  // Add "More" item
  const navItems = [...items, {
    id: "more" as const,
    label: "More",
    icon: "more-horizontal",
  }];

  return (
    <nav
      className="pb-safe fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t border-border bg-surface-app/95 backdrop-blur-md md:hidden"
      aria-label="Bottom navigation"
    >
      {navItems.map((item) => {
        const Icon = item.id === "more" ? MoreHorizontal : getIcon(item.icon);
        const isActive = view.view === item.id;
        const badge = item.id === "inbox" ? inboxUnread : 0;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === "more") {
                setMobileNavOpen(true);
              } else {
                navigate(item.id);
              }
            }}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="relative">
              <Icon className="h-5 w-5" aria-hidden />
              {badge > 0 && (
                <span className="absolute -right-2 -top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-[8px] font-bold text-destructive-foreground">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </span>
            <span>{item.label}</span>
            {isActive && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
            )}
          </button>
        );
      })}
    </nav>
  );
}
