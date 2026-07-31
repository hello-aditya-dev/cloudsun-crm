"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";
import { useAuthStore } from "@/lib/auth-store";
import { NAV_ITEMS, NAV_GROUPS, getNavItem, VIEW_PERMISSIONS } from "@/config/navigation";
import { hasAnyPermission, roleMeta } from "@/config/rbac";
import { product } from "@/config/cloudsun";
import { ChevronLeft, ChevronRight, ChevronsUpDown, Check } from "lucide-react";
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
  const organisations = useAuthStore((s) => s.organisations);
  const selectedOrgId = useAuthStore((s) => s.selectedOrgId);
  const selectOrganisation = useAuthStore((s) => s.selectOrganisation);
  const getCurrentRole = useAuthStore((s) => s.getCurrentRole);
  const role = getCurrentRole();

  const [orgSwitcherOpen, setOrgSwitcherOpen] = React.useState(false);
  const selectedOrg = organisations.find((o) => o.id === selectedOrgId);

  const inboxUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const activeContacts = contacts.filter((c) => !c.archived).length;

  const badges: Record<string, number> = {
    inbox: inboxUnread,
    contacts: activeContacts,
  };

  // Filter nav items by permission
  const canSee = (itemId: string): boolean => {
    if (!role) return false;
    const required = VIEW_PERMISSIONS[itemId] ?? [];
    if (required.length === 0) return true;
    return hasAnyPermission(role, required as [string, ...string[]]);
  };

  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label="Primary navigation"
    >
      {/* Organisation card with switcher */}
      <div className="relative border-b border-sidebar-border px-3 py-3.5">
        <button
          onClick={() => !collapsed && setOrgSwitcherOpen(!orgSwitcherOpen)}
          className={cn("flex w-full items-center gap-2.5 rounded-lg p-1 hover:bg-sidebar-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring", collapsed && "justify-center")}
          aria-label="Switch organisation"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Lucide.Sun className="h-5 w-5" aria-hidden />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {selectedOrg?.name ?? "CloudSun"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {role ? roleMeta[role].label : product.demoModeLabel}
              </p>
            </div>
          )}
          {!collapsed && <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />}
        </button>
        {orgSwitcherOpen && !collapsed && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOrgSwitcherOpen(false)} aria-hidden />
            <div className="absolute left-2 right-2 top-full z-50 mt-1 rounded-xl border border-border bg-popover p-1 elevation-floating">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Your organisations</p>
              {organisations.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { selectOrganisation(o.id); setOrgSwitcherOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-inset text-muted-foreground"><Lucide.Building2 className="h-3.5 w-3.5" /></div>
                  <span className="flex-1 truncate text-sm text-foreground">{o.name}</span>
                  {o.id === selectedOrgId && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="scroll-area-cs flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => {
          const items = NAV_ITEMS.filter(
            (n) => n.group === group.id && n.available && canSee(n.id)
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
  const organisations = useAuthStore((s) => s.organisations);
  const selectedOrgId = useAuthStore((s) => s.selectedOrgId);
  const getCurrentRole = useAuthStore((s) => s.getCurrentRole);
  const role = getCurrentRole();
  const selectedOrg = organisations.find((o) => o.id === selectedOrgId);
  const inboxUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const badges: Record<string, number> = { inbox: inboxUnread };

  const canSee = (itemId: string): boolean => {
    if (!role) return false;
    const required = VIEW_PERMISSIONS[itemId] ?? [];
    if (required.length === 0) return true;
    return hasAnyPermission(role, required as [string, ...string[]]);
  };

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
              <p className="text-sm font-semibold text-sidebar-foreground">{selectedOrg?.name ?? "CloudSun"}</p>
              <p className="text-xs text-muted-foreground">{role ? roleMeta[role].label : product.demoModeLabel}</p>
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
              (n) => n.group === group.id && n.available && canSee(n.id)
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
