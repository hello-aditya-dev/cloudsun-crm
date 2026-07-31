"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import { NAV_ITEMS } from "@/config/navigation";
import * as Lucide from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Search, ArrowRight, Users, Building2, Inbox, LayoutDashboard } from "lucide-react";

function getIcon(name: string): LucideIcon {
  return (Lucide as unknown as Record<string, LucideIcon>)[name] ?? Lucide.Circle;
}

interface CommandResult {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: LucideIcon;
  action: () => void;
}

export function CommandPalette() {
  const open = useDemoStore((s) => s.commandOpen);
  const setOpen = useDemoStore((s) => s.setCommandOpen);
  const navigate = useDemoStore((s) => s.navigate);
  const contacts = useDemoStore((s) => s.contacts);
  const companies = useDemoStore((s) => s.companies);
  const conversations = useDemoStore((s) => s.conversations);
  const setTheme = useDemoStore((s) => s.setTheme);

  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Keyboard shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  // Focus trap
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  const allResults: CommandResult[] = React.useMemo(() => {
    const results: CommandResult[] = [];

    // Navigation
    NAV_ITEMS.filter((n) => n.available).forEach((item) => {
      results.push({
        id: `nav-${item.id}`,
        label: item.label,
        hint: item.description,
        group: "Navigate",
        icon: getIcon(item.icon),
        action: () => {
          navigate(item.id);
          close();
        },
      });
    });

    // Contacts
    contacts
      .filter((c) => !c.archived)
      .forEach((c) => {
        results.push({
          id: `contact-${c.id}`,
          label: c.fullName,
          hint: c.jobTitle,
          group: "Contacts",
          icon: Users,
          action: () => {
            navigate("contacts", { detailId: c.id });
            close();
          },
        });
      });

    // Companies
    companies.forEach((co) => {
      results.push({
        id: `company-${co.id}`,
        label: co.name,
        hint: co.domain,
        group: "Companies",
        icon: Building2,
        action: () => {
          navigate("companies", { detailId: co.id });
          close();
        },
      });
    });

    // Conversations
    conversations.forEach((cv) => {
      const contact = contacts.find((c) => c.id === cv.contactId);
      results.push({
        id: `conv-${cv.id}`,
        label: cv.subject,
        hint: contact?.fullName,
        group: "Conversations",
        icon: Inbox,
        action: () => {
          navigate("inbox", { detailId: cv.id });
          close();
        },
      });
    });

    // Actions
    results.push(
      {
        id: "action-create-contact",
        label: "Create contact",
        hint: "Add a new contact",
        group: "Actions",
        icon: Users,
        action: () => {
          navigate("contacts");
          close();
        },
      },
      {
        id: "action-overview",
        label: "Go to overview",
        group: "Actions",
        icon: LayoutDashboard,
        action: () => {
          navigate("overview");
          close();
        },
      },
      {
        id: "action-theme-dark",
        label: "Switch to dark theme",
        group: "Actions",
        icon: Lucide.Moon,
        action: () => {
          setTheme("dark");
          close();
        },
      },
      {
        id: "action-theme-light",
        label: "Switch to light theme",
        group: "Actions",
        icon: Lucide.Sun,
        action: () => {
          setTheme("light");
          close();
        },
      }
    );

    return results;
  }, [contacts, companies, conversations, navigate, setTheme]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return allResults.slice(0, 20);
    const q = query.toLowerCase();
    return allResults
      .filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          r.hint?.toLowerCase().includes(q) ||
          r.group.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [query, allResults]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, CommandResult[]>();
    filtered.forEach((r) => {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Reset active index when query changes
  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[activeIndex]?.action();
    }
  };

  // Scroll active item into view
  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover elevation-floating">
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search contacts, companies, conversations or navigate…"
            className="h-12 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Command palette search"
          />
          <kbd className="rounded border border-border bg-surface-inset px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>
        <div
          ref={listRef}
          className="scroll-area-cs max-h-[50vh] overflow-y-auto p-1"
          role="listbox"
        >
          {grouped.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm font-medium text-foreground">No results</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                {items.map((item) => {
                  runningIndex++;
                  const idx = runningIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      onClick={item.action}
                      onMouseEnter={() => setActiveIndex(idx)}
                      role="option"
                      aria-selected={isActive}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                        isActive ? "bg-primary/10" : "hover:bg-surface-hover"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                          isActive ? "bg-primary/15 text-primary" : "bg-surface-inset text-muted-foreground"
                        )}
                      >
                        <item.icon className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                        {item.hint && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.hint}
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-border bg-surface-inset px-1 py-0.5 font-mono">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-border bg-surface-inset px-1 py-0.5 font-mono">↵</kbd>
            select
          </span>
        </div>
      </div>
    </div>
  );
}
