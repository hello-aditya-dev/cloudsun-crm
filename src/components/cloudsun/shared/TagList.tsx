"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function TagList({
  tags,
  className,
  onRemove,
  size = "sm",
}: {
  tags: string[];
  className?: string;
  onRemove?: (tag: string) => void;
  size?: "xs" | "sm";
}) {
  if (!tags.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border border-border bg-surface-inset font-medium text-muted-foreground",
            size === "xs" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs"
          )}
        >
          {tag}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="rounded p-0.5 hover:bg-black/10 hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ember" | "forest";
  className?: string;
}) {
  const tones = {
    neutral: "border-border bg-surface-inset text-muted-foreground",
    ember: "border-ember/20 bg-ember/10 text-ember",
    forest: "border-forest/20 bg-forest/10 text-forest",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
