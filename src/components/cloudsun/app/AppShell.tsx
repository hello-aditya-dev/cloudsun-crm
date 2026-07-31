"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { NotificationCenter } from "./NotificationCenter";
import { ProfileMenu } from "./ProfileMenu";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-surface-app">
      <Sidebar />
      <MobileSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="scroll-area-cs flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
      </div>
      <CommandPalette />
      <NotificationCenter />
      <ProfileMenu />
      <MobileNav />
    </div>
  );
}

/** Standard responsive page container used by every view. */
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
