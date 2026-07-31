"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import { formatRelativeTime } from "@/lib/display";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/cloudsun/shared/EmptyState";

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pricing_enquiry: Bell,
  support_escalation: Bell,
  renewal_reminder: Bell,
  assigned_conversation: Bell,
  sla_risk: Bell,
  follow_up_due: Bell,
  integration_disconnected: Bell,
  mention: Bell,
};

export function NotificationCenter() {
  const open = useDemoStore((s) => s.notificationsOpen);
  const setOpen = useDemoStore((s) => s.setNotificationsOpen);
  const notifications = useDemoStore((s) => s.notifications);
  const markRead = useDemoStore((s) => s.markNotificationRead);
  const markAllRead = useDemoStore((s) => s.markAllNotificationsRead);
  const navigate = useDemoStore((s) => s.navigate);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  if (!open) return null;

  const unread = notifications.filter((n) => !n.read);

  const handleClick = (n: (typeof notifications)[number]) => {
    markRead(n.id);
    if (n.relatedType === "conversation") {
      navigate("inbox", { detailId: n.relatedId ?? undefined });
    } else if (n.relatedType === "contact") {
      navigate("contacts", { detailId: n.relatedId ?? undefined });
    } else if (n.relatedType === "company") {
      navigate("companies", { detailId: n.relatedId ?? undefined });
    } else if (n.relatedType === "follow_up") {
      navigate("calendar");
    }
    setOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
      <div
        className="fixed right-0 top-14 z-40 w-full max-w-sm border-b border-l border-border bg-popover elevation-floating sm:w-96"
        role="dialog"
        aria-label="Notifications"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Notifications</h2>
            <p className="text-xs text-muted-foreground">
              {unread.length} unread of {notifications.length}
            </p>
          </div>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden />
              Mark all read
            </button>
          )}
        </div>
        <div className="scroll-area-cs max-h-[70vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You're all caught up."
              className="m-4 border-0 bg-transparent"
            />
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = notificationIcons[n.type] ?? Bell;
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClick(n)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                        !n.read && "bg-primary/[0.04]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          n.read ? "bg-surface-inset text-muted-foreground" : "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          {!n.read && (
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                      {n.relatedType && (
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
