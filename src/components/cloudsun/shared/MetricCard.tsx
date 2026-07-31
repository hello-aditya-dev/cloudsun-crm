"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function MetricCard({
  label,
  value,
  delta,
  deltaDirection,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaDirection?: "up" | "down";
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 elevation-subtle transition-shadow hover:elevation-raised",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-inset text-muted-foreground">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {(delta || hint) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                deltaDirection === "up"
                  ? "text-forest"
                  : deltaDirection === "down"
                    ? "text-destructive"
                    : "text-muted-foreground"
              )}
            >
              {deltaDirection === "up" ? (
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              ) : deltaDirection === "down" ? (
                <ArrowDownRight className="h-3 w-3" aria-hidden />
              ) : null}
              {delta}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}
