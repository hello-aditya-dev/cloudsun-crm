"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/display";

export function RelativeTime({
  iso,
  className,
  fallback = "—",
}: {
  iso: string | null | undefined;
  className?: string;
  fallback?: string;
}) {
  if (!iso) return <span className={cn("text-muted-foreground", className)}>{fallback}</span>;
  return (
    <time
      dateTime={iso}
      title={new Date(iso).toLocaleString()}
      className={cn("tabular-nums", className)}
    >
      {formatRelativeTime(iso)}
    </time>
  );
}

export function DateTimeDisplay({
  iso,
  className,
  fallback = "—",
}: {
  iso: string | null | undefined;
  className?: string;
  fallback?: string;
}) {
  if (!iso) return <span className={cn("text-muted-foreground", className)}>{fallback}</span>;
  return (
    <time
      dateTime={iso}
      className={cn("tabular-nums", className)}
    >
      {new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}
    </time>
  );
}
