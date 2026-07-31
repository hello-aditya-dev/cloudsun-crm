"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import { teamRoleMeta } from "@/lib/display";
import { TeamAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import {
  User,
  Settings,
  Palette,
  LogOut,
  ChevronRight,
  CircleDot,
} from "lucide-react";
import { product } from "@/config/cloudsun";

export function ProfileMenu() {
  const open = useDemoStore((s) => s.profileOpen);
  const setOpen = useDemoStore((s) => s.setProfileOpen);
  const navigate = useDemoStore((s) => s.navigate);
  const teamMembers = useDemoStore((s) => s.teamMembers);
  const currentUserId = useDemoStore((s) => s.currentUserId);
  const reset = useDemoStore((s) => s.reset);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  if (!open) return null;

  const currentUser = teamMembers.find((m) => m.id === currentUserId);

  const items = [
    { label: "Profile", icon: User, hint: "Demonstration only", onClick: () => { setOpen(false); } },
    { label: "Preferences", icon: Settings, hint: "Workspace settings", onClick: () => { navigate("settings"); setOpen(false); } },
    { label: "Appearance", icon: Palette, hint: "Theme & density", onClick: () => { navigate("settings"); setOpen(false); } },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
      <div
        className="fixed right-2 top-14 z-50 w-72 rounded-xl border border-border bg-popover p-1 elevation-floating sm:right-4"
        role="dialog"
        aria-label="Profile menu"
      >
        {/* Identity */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-3">
          <TeamAvatar
            initials={currentUser?.initials ?? "U"}
            color={currentUser?.avatarColor ?? "oklch(0.5 0.1 60)"}
            status={currentUser?.status}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {currentUser?.name ?? "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentUser?.email}
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {currentUser ? teamRoleMeta[currentUser.role] : "Member"}
            </p>
          </div>
        </div>

        {/* Organisation */}
        <div className="mx-1 mb-1 rounded-lg border border-border bg-surface-inset px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Organisation</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-warning">
              <CircleDot className="h-2.5 w-2.5" aria-hidden />
              {product.demoModeLabel}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-foreground">CloudSun IT</p>
        </div>

        {/* Menu items */}
        <div className="space-y-0.5">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">{item.label}</span>
                <span className="block text-xs text-muted-foreground">{item.hint}</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            </button>
          ))}
        </div>

        {/* Reset demo */}
        <div className="my-1 border-t border-border" />
        <button
          onClick={() => {
            if (confirm("Reset the demonstration workspace? All local changes will be lost and seeded data restored.")) {
              reset();
              navigate("overview");
              setOpen(false);
            }
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-destructive hover:bg-destructive/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="flex-1">
            <span className="block text-sm font-medium">Reset demo</span>
            <span className="block text-xs text-destructive/70">Restore seeded data</span>
          </span>
        </button>
      </div>
    </>
  );
}
