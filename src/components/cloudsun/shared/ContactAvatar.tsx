"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { initials as toInitials } from "@/lib/display";

const AVATAR_COLORS = [
  "oklch(0.58 0.135 38)",
  "oklch(0.55 0.1 155)",
  "oklch(0.6 0.09 230)",
  "oklch(0.65 0.15 15)",
  "oklch(0.7 0.1 75)",
  "oklch(0.6 0.11 280)",
  "oklch(0.58 0.13 330)",
  "oklch(0.5 0.12 200)",
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ContactAvatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const bg = color ?? colorForName(name);
  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-1 ring-inset ring-black/5",
        sizes[size],
        className
      )}
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      {toInitials(name) || "?"}
    </span>
  );
}

export function TeamAvatar({
  initials,
  color,
  size = "sm",
  status,
  className,
}: {
  initials: string;
  color: string;
  size?: "xs" | "sm" | "md";
  status?: "online" | "busy" | "away" | "offline";
  className?: string;
}) {
  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
  };
  const statusColor = {
    online: "bg-forest",
    busy: "bg-destructive",
    away: "bg-warning",
    offline: "bg-neutral-status",
  };
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold text-white ring-1 ring-inset ring-black/5",
          sizes[size]
        )}
        style={{ backgroundColor: color }}
        aria-hidden
      >
        {initials}
      </span>
      {status && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card",
            statusColor[status]
          )}
          aria-hidden
        />
      )}
    </span>
  );
}

export function AvatarStack({
  items,
  max = 4,
  size = "sm",
}: {
  items: { id: string; name: string; color?: string }[];
  max?: number;
  size?: "xs" | "sm" | "md";
}) {
  const shown = items.slice(0, max);
  const remaining = items.length - shown.length;
  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
  };
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((it) => (
        <ContactAvatar
          key={it.id}
          name={it.name}
          color={it.color}
          size={size}
          className="ring-2 ring-card"
        />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-card",
            sizes[size]
          )}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
