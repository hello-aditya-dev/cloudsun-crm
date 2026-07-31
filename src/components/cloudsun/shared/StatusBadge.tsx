"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { StatusMeta } from "@/lib/display";
import {
  leadStageMeta,
  priorityMeta,
  conversationStatusMeta,
  slaMeta,
  customerStatusMeta,
  callOutcomeMeta,
  followUpStatusMeta,
} from "@/lib/display";

type BadgeKind =
  | { kind: "leadStage"; value: keyof typeof leadStageMeta }
  | { kind: "priority"; value: keyof typeof priorityMeta }
  | { kind: "conversationStatus"; value: keyof typeof conversationStatusMeta }
  | { kind: "sla"; value: keyof typeof slaMeta }
  | { kind: "customerStatus"; value: keyof typeof customerStatusMeta }
  | { kind: "callOutcome"; value: keyof typeof callOutcomeMeta }
  | { kind: "followUpStatus"; value: keyof typeof followUpStatusMeta }
  | { kind: "custom"; label: string; meta: StatusMeta };

const metaFor: Record<
  BadgeKind["kind"],
  Record<string, StatusMeta>
> = {
  leadStage: leadStageMeta,
  priority: priorityMeta,
  conversationStatus: conversationStatusMeta,
  sla: slaMeta,
  customerStatus: customerStatusMeta,
  callOutcome: callOutcomeMeta,
  followUpStatus: followUpStatusMeta,
  custom: {},
};

export function StatusBadge(props: BadgeKind & { className?: string }) {
  let meta: StatusMeta;
  if (props.kind === "custom") {
    meta = props.meta;
  } else {
    meta = metaFor[props.kind][props.value] ?? {
      label: String(props.value),
      badge: "bg-muted text-muted-foreground border-border",
      dot: "bg-neutral-status",
    };
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        meta.badge,
        props.className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}

/** Standalone SLA indicator with explanatory tooltip-friendly label. */
export function SlaIndicator({
  state,
  dueAt,
  className,
}: {
  state: keyof typeof slaMeta;
  dueAt?: string | null;
  className?: string;
}) {
  const meta = slaMeta[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        meta.badge,
        className
      )}
      title={dueAt ? `Due ${new Date(dueAt).toLocaleString()}` : meta.label}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}
