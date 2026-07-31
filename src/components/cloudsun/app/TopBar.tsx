"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import { getNavItem, NAV_ITEMS } from "@/config/navigation";
import { product } from "@/config/cloudsun";
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Check,
  CircleDot,
} from "lucide-react";
import { TeamAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { useAuthStore } from "@/lib/auth-store";
import { roleMeta } from "@/config/rbac";

export function TopBar() {
  const view = useDemoStore((s) => s.view);
  const setMobileNavOpen = useDemoStore((s) => s.setMobileNavOpen);
  const setCommandOpen = useDemoStore((s) => s.setCommandOpen);
  const setNotificationsOpen = useDemoStore((s) => s.setNotificationsOpen);
  const setProfileOpen = useDemoStore((s) => s.setProfileOpen);
  const notificationsOpen = useDemoStore((s) => s.notificationsOpen);
  const profileOpen = useDemoStore((s) => s.profileOpen);
  const notifications = useDemoStore((s) => s.notifications);
  const theme = useDemoStore((s) => s.theme);
  const setTheme = useDemoStore((s) => s.setTheme);
  const authUser = useAuthStore((s) => s.currentUser);
  const getCurrentRole = useAuthStore((s) => s.getCurrentRole);
  const role = getCurrentRole();

  const navItem = getNavItem(view.view);
  const title = navItem?.label ?? "CloudSun";

  const unreadCount = notifications.filter((n) => !n.read).length;

  const [themeMenuOpen, setThemeMenuOpen] = React.useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = React.useState(false);

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      let isDark = false;
      if (theme === "dark") isDark = true;
      else if (theme === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      root.classList.toggle("dark", isDark);
    };
    apply();
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface-app/80 px-3 backdrop-blur-md sm:px-4">
      {/* Mobile menu */}
      <button
        onClick={() => setMobileNavOpen(true)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Title + breadcrumb. Rendered as a div (not a heading) so each view's
          PageHeader owns the single h1 for the page, keeping heading hierarchy
          correct for assistive technology. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-display text-base font-semibold text-foreground sm:text-lg" aria-label={title}>
            {title}
          </div>
          <span className="hidden items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <CircleDot className="h-2.5 w-2.5 text-warning" aria-hidden />
            {product.demoModeLabel}
          </span>
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          {navItem?.description}
        </p>
      </div>

      {/* Search trigger */}
      <button
        onClick={() => setCommandOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex lg:w-64"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden rounded border border-border bg-surface-inset px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground xl:inline">
          ⌘K
        </kbd>
      </button>
      <button
        onClick={() => setCommandOpen(true)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Help */}
      <div className="relative hidden sm:block">
        <button
          onClick={() => setHelpMenuOpen(!helpMenuOpen)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Help"
          aria-expanded={helpMenuOpen}
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        {helpMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setHelpMenuOpen(false)} aria-hidden />
            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-popover p-1 elevation-floating">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Help
              </p>
              {[
                { label: "Getting started", hint: "Onboarding guide" },
                { label: "Keyboard shortcuts", hint: "⌘K to search" },
                { label: "What's new", hint: "Recent updates" },
                { label: "Contact support", hint: "Demonstration only" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setHelpMenuOpen(false)}
                  className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.hint}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Theme */}
      <div className="relative">
        <button
          onClick={() => setThemeMenuOpen(!themeMenuOpen)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Theme"
          aria-expanded={themeMenuOpen}
        >
          {theme === "light" ? <Sun className="h-5 w-5" /> : theme === "dark" ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </button>
        {themeMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)} aria-hidden />
            <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-border bg-popover p-1 elevation-floating">
              {([
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Monitor },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    setThemeMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <opt.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                    {opt.label}
                  </span>
                  {theme === opt.value && <Check className="h-4 w-4 text-primary" aria-hidden />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Profile menu"
          aria-expanded={profileOpen}
        >
          <TeamAvatar
            initials={authUser ? (authUser.givenName?.[0] ?? "") + (authUser.familyName?.[0] ?? "") : "U"}
            color={authUser?.avatarColor ?? "oklch(0.5 0.1 60)"}
            size="sm"
          />
          <div className="hidden text-left lg:block">
            <p className="text-xs font-semibold leading-tight text-foreground">
              {authUser?.displayName ?? "User"}
            </p>
            <p className="text-[10px] leading-tight text-muted-foreground">
              {role ? roleMeta[role].label : authUser?.primaryEmail}
            </p>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground lg:block" aria-hidden />
        </button>
      </div>
    </header>
  );
}
