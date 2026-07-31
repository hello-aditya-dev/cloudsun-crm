"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { NAV_ITEMS, NAV_GROUPS, getNavItem } from "@/config/navigation";
import { product } from "@/config/cloudsun";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function getIcon(name: string): LucideIcon {
  return (Lucide as unknown as Record<string, LucideIcon>)[name] ?? Lucide.Circle;
}

export function Sidebar() {
  const collapsed = useDemoStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useDemoStore((s) => s.toggleSidebar);
  const view = useDemoStore((s) => s.view);
  const navigate = useDemoStore((s) => s.navigate);
  const conversations = useDemoStore((s) => s.conversations);
  const contacts = useDemoStore((s) => s.contacts);

  const inboxUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const activeContacts = contacts.filter((c) => !c.archived).length;

  const badges: Record<string, number> = {
    inbox: inboxUnread,
    contacts: activeContacts,
  };

  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label="Primary navigation"
    >
      {/* Organisation card */}
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-3 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Lucide.Sun className="h-5 w-5" aria-hidden />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              CloudSun IT
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {product.demoModeLabel}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="scroll-area-cs flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => {
          const items = NAV_ITEMS.filter(
            (n) => n.group === group.id && n.available
          );
          if (!items.length) return null;
          return (
            <div key={group.id} className="mb-4">
              {!collapsed && (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = getIcon(item.icon);
                  const isActive = view.view === item.id;
                  const badge = badges[item.id];
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => navigate(item.id)}
                        title={collapsed ? item.label : undefined}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={item.label}
                        className={cn(
                          "group relative flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          collapsed && "justify-center px-0",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                        )}
                      >
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-primary"
                            aria-hidden
                          />
                        )}
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                          aria-hidden
                        />
                        {!collapsed && (
                          <span className="flex-1 truncate text-left">{item.label}</span>
                        )}
                        {!collapsed && badge ? (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                            {badge > 99 ? "99+" : badge}
                          </span>
                        ) : null}
                        {collapsed && badge ? (
                          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Collapse control */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/** Mobile slide-over navigation. */
export function MobileSidebar() {
  const open = useDemoStore((s) => s.mobileNavOpen);
  const setOpen = useDemoStore((s) => s.setMobileNavOpen);
  const view = useDemoStore((s) => s.view);
  const navigate = useDemoStore((s) => s.navigate);
  const conversations = useDemoStore((s) => s.conversations);
  const inboxUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const badges: Record<string, number> = { inbox: inboxUnread };

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-sidebar elevation-floating">
        <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Lucide.Sun className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">CloudSun IT</p>
              <p className="text-xs text-muted-foreground">{product.demoModeLabel}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close navigation"
          >
            <Lucide.X className="h-5 w-5" />
          </button>
        </div>
        <nav className="scroll-area-cs flex-1 overflow-y-auto px-2 py-3">
          {NAV_GROUPS.map((group) => {
            const items = NAV_ITEMS.filter(
              (n) => n.group === group.id && n.available
            );
            if (!items.length) return null;
            return (
              <div key={group.id} className="mb-4">
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = getIcon(item.icon);
                    const isActive = view.view === item.id;
                    const badge = badges[item.id];
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => navigate(item.id)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="flex-1 text-left">{item.label}</span>
                          {badge ? (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                              {badge}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
