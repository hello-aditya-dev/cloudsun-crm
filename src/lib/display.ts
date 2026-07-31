import type {
  Channel,
  ConversationStatus,
  LeadStage,
  Priority,
  SlaState,
  CustomerStatus,
  CallOutcome,
  FollowUpType,
  FollowUpStatus,
  Industry,
} from "@/types/domain";

/* ------------------------------------------------------------------ */
/* Status metadata — single source of truth for status colours/labels */
/* ------------------------------------------------------------------ */

export type StatusMeta = {
  label: string;
  /** tailwind utility classes for a soft badge */
  badge: string;
  /** dot colour */
  dot: string;
};

export const leadStageMeta: Record<LeadStage, StatusMeta> = {
  new: { label: "New", badge: "bg-info/10 text-info-strong border-info/20", dot: "bg-info" },
  uncontacted: { label: "Uncontacted", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
  attempted: { label: "Attempted", badge: "bg-warning/10 text-warning-foreground border-warning/20", dot: "bg-warning" },
  connected: { label: "Connected", badge: "bg-info/10 text-info-strong border-info/20", dot: "bg-info" },
  qualified: { label: "Qualified", badge: "bg-forest/10 text-forest-strong border-forest/20", dot: "bg-forest" },
  interested: { label: "Interested", badge: "bg-forest/10 text-forest-strong border-forest/20", dot: "bg-forest" },
  opportunity: { label: "Opportunity", badge: "bg-ember/10 text-ember-strong border-ember/20", dot: "bg-ember" },
  customer: { label: "Customer", badge: "bg-forest/15 text-forest-strong border-forest/25", dot: "bg-forest" },
  at_risk: { label: "At risk", badge: "bg-destructive/10 text-destructive-strong border-destructive/20", dot: "bg-destructive" },
  inactive: { label: "Inactive", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
  not_interested: { label: "Not interested", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
  invalid: { label: "Invalid", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
  do_not_contact: { label: "Do not contact", badge: "bg-destructive/10 text-destructive-strong border-destructive/20", dot: "bg-destructive" },
};

export const priorityMeta: Record<Priority, StatusMeta> = {
  low: { label: "Low", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
  normal: { label: "Normal", badge: "bg-info/10 text-info-strong border-info/20", dot: "bg-info" },
  high: { label: "High", badge: "bg-warning/10 text-warning-foreground border-warning/20", dot: "bg-warning" },
  urgent: { label: "Urgent", badge: "bg-destructive/10 text-destructive-strong border-destructive/20", dot: "bg-destructive" },
};

export const conversationStatusMeta: Record<ConversationStatus, StatusMeta> = {
  open: { label: "Open", badge: "bg-info/10 text-info-strong border-info/20", dot: "bg-info" },
  unassigned: { label: "Unassigned", badge: "bg-warning/10 text-warning-foreground border-warning/20", dot: "bg-warning" },
  mine: { label: "Mine", badge: "bg-ember/10 text-ember-strong border-ember/20", dot: "bg-ember" },
  waiting_customer: { label: "Waiting for customer", badge: "bg-warning/10 text-warning-foreground border-warning/20", dot: "bg-warning" },
  waiting_internal: { label: "Waiting internally", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
  needs_approval: { label: "Needs approval", badge: "bg-warning/10 text-warning-foreground border-warning/20", dot: "bg-warning" },
  snoozed: { label: "Snoozed", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
  resolved: { label: "Resolved", badge: "bg-forest/10 text-forest-strong border-forest/20", dot: "bg-forest" },
  closed: { label: "Closed", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
  spam: { label: "Spam", badge: "bg-destructive/10 text-destructive-strong border-destructive/20", dot: "bg-destructive" },
};

export const slaMeta: Record<SlaState, StatusMeta> = {
  safe: { label: "SLA safe", badge: "bg-forest/10 text-forest-strong border-forest/20", dot: "bg-forest" },
  approaching: { label: "SLA approaching", badge: "bg-warning/10 text-warning-foreground border-warning/20", dot: "bg-warning" },
  at_risk: { label: "SLA at risk", badge: "bg-warning/15 text-warning-foreground border-warning/25", dot: "bg-warning" },
  breached: { label: "SLA breached", badge: "bg-destructive/10 text-destructive-strong border-destructive/20", dot: "bg-destructive" },
  paused: { label: "SLA paused", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
};

export const customerStatusMeta: Record<CustomerStatus, StatusMeta> = {
  prospect: { label: "Prospect", badge: "bg-info/10 text-info-strong border-info/20", dot: "bg-info" },
  active: { label: "Active", badge: "bg-forest/10 text-forest-strong border-forest/20", dot: "bg-forest" },
  renewing: { label: "Renewing", badge: "bg-ember/10 text-ember-strong border-ember/20", dot: "bg-ember" },
  at_risk: { label: "At risk", badge: "bg-warning/10 text-warning-foreground border-warning/20", dot: "bg-warning" },
  churned: { label: "Churned", badge: "bg-destructive/10 text-destructive-strong border-destructive/20", dot: "bg-destructive" },
  former: { label: "Former", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
};

export const callOutcomeMeta: Record<CallOutcome, StatusMeta> = {
  completed: { label: "Completed", badge: "bg-forest/10 text-forest-strong border-forest/20", dot: "bg-forest" },
  voicemail: { label: "Voicemail", badge: "bg-info/10 text-info-strong border-info/20", dot: "bg-info" },
  no_answer: { label: "No answer", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
  busy: { label: "Busy", badge: "bg-warning/10 text-warning-foreground border-warning/20", dot: "bg-warning" },
  failed: { label: "Failed", badge: "bg-destructive/10 text-destructive-strong border-destructive/20", dot: "bg-destructive" },
  scheduled: { label: "Scheduled", badge: "bg-info/10 text-info-strong border-info/20", dot: "bg-info" },
};

export const followUpTypeMeta: Record<FollowUpType, string> = {
  callback: "Callback",
  demo: "Demo",
  meeting: "Meeting",
  check_in: "Check-in",
  proposal: "Proposal",
  renewal: "Renewal",
  escalation: "Escalation",
};

export const followUpStatusMeta: Record<FollowUpStatus, StatusMeta> = {
  scheduled: { label: "Scheduled", badge: "bg-info/10 text-info-strong border-info/20", dot: "bg-info" },
  completed: { label: "Completed", badge: "bg-forest/10 text-forest-strong border-forest/20", dot: "bg-forest" },
  overdue: { label: "Overdue", badge: "bg-destructive/10 text-destructive-strong border-destructive/20", dot: "bg-destructive" },
  cancelled: { label: "Cancelled", badge: "bg-muted text-muted-foreground border-border", dot: "bg-neutral-status" },
};

export const channelMeta: Record<Channel, { label: string; icon: string }> = {
  phone: { label: "Phone", icon: "phone" },
  email: { label: "Email", icon: "mail" },
  whatsapp: { label: "WhatsApp", icon: "message-circle" },
  webchat: { label: "Web chat", icon: "globe" },
  internal: { label: "Internal note", icon: "sticky-note" },
  system: { label: "System", icon: "cpu" },
};

export const industryMeta: Record<Industry, string> = {
  managed_it_services: "Managed IT services",
  cybersecurity: "Cybersecurity",
  cloud_migration: "Cloud migration",
  saas_implementation: "SaaS implementation",
  network_infrastructure: "Network infrastructure",
  it_support: "IT support",
  software_development: "Software development",
  data_engineering: "Data engineering",
  business_automation: "Business automation",
  unified_communications: "Unified communications",
};

export const teamRoleMeta: Record<string, string> = {
  account_owner: "Account owner",
  operations_manager: "Operations manager",
  customer_success_manager: "Customer success manager",
  technical_lead: "Technical lead",
  support_specialist: "Support specialist",
  sales_developer: "Sales developer",
};

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toLocaleString()}`;
}

export function formatCurrencyFull(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function formatDuration(seconds: number): string {
  if (seconds === 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
