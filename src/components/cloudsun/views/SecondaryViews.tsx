"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import {
  callOutcomeMeta,
  followUpTypeMeta,
  followUpStatusMeta,
  industryMeta,
  customerStatusMeta,
  teamRoleMeta,
  leadStageMeta,
  formatDuration,
  formatCurrency,
} from "@/lib/display";
import { PageHeader, ContentSection } from "@/components/cloudsun/shared/PageHeader";
import { MetricCard } from "@/components/cloudsun/shared/MetricCard";
import { StatusBadge } from "@/components/cloudsun/shared/StatusBadge";
import { ContactAvatar, TeamAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { ChannelIcon } from "@/components/cloudsun/shared/ChannelIcon";
import { EmptyState } from "@/components/cloudsun/shared/EmptyState";
import { Button } from "@/components/cloudsun/shared/Button";
import { SearchField, FilterBar, Select } from "@/components/cloudsun/shared/FilterBar";
import { RelativeTime, DateTimeDisplay } from "@/components/cloudsun/shared/RelativeTime";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Play, Calendar as CalendarIcon,
  Clock, BookOpen, Workflow, BarChart3, Users, Plug, Settings as SettingsIcon,
  CreditCard, ScrollText, CheckCircle2, AlertCircle, Plus, Download, RefreshCw,
  Shield, Bell, Palette, Database, Zap,
} from "lucide-react";

/* ================================================================== */
/* Calls                                                               */
/* ================================================================== */

export function CallsView() {
  const calls = useDemoStore((s) => s.calls);
  const contacts = useDemoStore((s) => s.contacts);
  const companies = useDemoStore((s) => s.companies);
  const teamMembers = useDemoStore((s) => s.teamMembers);
  const navigate = useDemoStore((s) => s.navigate);

  const [search, setSearch] = React.useState("");
  const [outcome, setOutcome] = React.useState("");

  const contactMap = React.useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);

  const filtered = React.useMemo(() => {
    let list = calls;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const contact = contactMap.get(c.contactId);
        return c.summary.toLowerCase().includes(q) || c.phoneNumber.includes(q) || contact?.fullName.toLowerCase().includes(q);
      });
    }
    if (outcome) list = list.filter((c) => c.outcome === outcome);
    return [...list].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [calls, search, outcome, contactMap]);

  const totalDuration = calls.reduce((s, c) => s + c.durationSeconds, 0);
  const completed = calls.filter((c) => c.outcome === "completed").length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Customer operations"
        title="Calls"
        description="Demonstration call log and telephony history. No real calls are placed."
        actions={<Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total calls" value={calls.length} icon={Phone} />
        <MetricCard label="Completed" value={completed} icon={CheckCircle2} hint={`${Math.round((completed / Math.max(calls.length, 1)) * 100)}% rate`} />
        <MetricCard label="Talk time" value={formatDuration(totalDuration)} icon={Clock} />
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchField value={search} onChange={setSearch} placeholder="Search by contact, number or summary…" className="flex-1" />
        <Select value={outcome} onChange={setOutcome} ariaLabel="Outcome" options={[{ value: "", label: "All outcomes" }, ...Object.entries(callOutcomeMeta).map(([v, m]) => ({ value: v, label: m.label }))]} />
      </div>
      <div className="mt-4 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState icon={Phone} title="No calls found" description="Try adjusting your filters." />
        ) : filtered.map((cl) => {
          const contact = contactMap.get(cl.contactId);
          const company = cl.companyId ? companies.find((c) => c.id === cl.companyId) : null;
          const agent = cl.agentId ? teamMembers.find((m) => m.id === cl.agentId) : null;
          const DirIcon = cl.direction === "inbound" ? PhoneIncoming : cl.direction === "outbound" ? PhoneOutgoing : PhoneMissed;
          return (
            <div key={cl.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 elevation-subtle sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", cl.direction === "missed" ? "bg-destructive/10 text-destructive" : "bg-surface-inset text-muted-foreground")}>
                  <DirIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <button onClick={() => contact && navigate("contacts", { detailId: contact.id })} className="truncate text-sm font-medium text-foreground hover:underline">
                    {contact?.fullName ?? "Unknown"}
                  </button>
                  <p className="truncate text-xs text-muted-foreground">{company?.name ?? "No company"}</p>
                  <p className="truncate text-xs text-muted-foreground">{cl.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-muted-foreground">{cl.summary}</p>
                  <p className="text-[10px] text-muted-foreground"><DateTimeDisplay iso={cl.startedAt} /> · {formatDuration(cl.durationSeconds)}</p>
                </div>
                <StatusBadge kind="callOutcome" value={cl.outcome} />
                {cl.recordingAvailable && (
                  <button className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Play recording">
                    <Play className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Calendar / Follow-ups                                              */
/* ================================================================== */

export function CalendarView() {
  const followUps = useDemoStore((s) => s.followUps);
  const contacts = useDemoStore((s) => s.contacts);
  const teamMembers = useDemoStore((s) => s.teamMembers);
  const navigate = useDemoStore((s) => s.navigate);

  const contactMap = React.useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);

  const sorted = React.useMemo(
    () => [...followUps].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
    [followUps]
  );
  const overdue = sorted.filter((f) => f.status === "overdue");
  const scheduled = sorted.filter((f) => f.status === "scheduled");
  const completed = sorted.filter((f) => f.status === "completed");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Customer operations"
        title="Calendar"
        description="Follow-ups, demos and scheduled callbacks."
        actions={<Button size="sm"><Plus className="h-4 w-4" /> Schedule</Button>}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Scheduled" value={scheduled.length} icon={CalendarIcon} />
        <MetricCard label="Overdue" value={overdue.length} icon={AlertCircle} />
        <MetricCard label="Completed" value={completed.length} icon={CheckCircle2} />
      </div>
      <div className="mt-6 space-y-6">
        {overdue.length > 0 && (
          <ContentSection title="Overdue">
            <FollowUpList items={overdue} contactMap={contactMap} teamMembers={teamMembers} navigate={navigate} />
          </ContentSection>
        )}
        <ContentSection title="Upcoming">
          <FollowUpList items={scheduled} contactMap={contactMap} teamMembers={teamMembers} navigate={navigate} />
        </ContentSection>
      </div>
    </div>
  );
}

function FollowUpList({ items, contactMap, teamMembers, navigate }: {
  items: ReturnType<typeof useDemoStore.getState>["followUps"];
  contactMap: Map<string, any>;
  teamMembers: ReturnType<typeof useDemoStore.getState>["teamMembers"];
  navigate: (v: any, p?: any) => void;
}) {
  if (items.length === 0) return <EmptyState icon={CalendarIcon} title="Nothing scheduled" description="No follow-ups in this list." />;
  return (
    <div className="space-y-2">
      {items.map((f) => {
        const contact = contactMap.get(f.contactId);
        const owner = teamMembers.find((m) => m.id === f.ownerId);
        return (
          <button key={f.id} onClick={() => contact && navigate("contacts", { detailId: contact.id })} className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {contact && <ContactAvatar name={contact.fullName} size="sm" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{contact?.fullName ?? "Unknown"}</p>
              <p className="truncate text-xs text-muted-foreground">{f.notes}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="rounded-md border border-border bg-surface-inset px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">{followUpTypeMeta[f.type]}</span>
              <StatusBadge kind="followUpStatus" value={f.status} />
              <RelativeTime iso={f.dueAt} className="text-[10px] text-muted-foreground" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/* Knowledge base                                                     */
/* ================================================================== */

const KB_ARTICLES = [
  { id: "kb-1", title: "Onboarding a new managed-services account", category: "Onboarding", excerpt: "Standard steps to provision monitoring, patch management and helpdesk for a new MSP customer.", updated: "2026-01-12" },
  { id: "kb-2", title: "Handling a security-assessment enquiry", category: "Sales", excerpt: "Qualification questions and SOC2 narrative to share with prospects evaluating our security practice.", updated: "2026-01-10" },
  { id: "kb-3", title: "Cloud migration renewal playbook", category: "Customer success", excerpt: "How to structure renewal conversations mid-migration, including milestone reviews and pricing.", updated: "2026-01-08" },
  { id: "kb-4", title: "Triage an SLA-breached conversation", category: "Support", excerpt: "Escalation path, internal-note conventions and resolution templates for at-risk SLAs.", updated: "2026-01-14" },
  { id: "kb-5", title: "Canned responses for pricing enquiries", category: "Templates", excerpt: "Approved reply templates for SaaS onboarding, helpdesk and network-infrastructure pricing questions.", updated: "2026-01-11" },
  { id: "kb-6", title: "DNC and consent handling", category: "Compliance", excerpt: "How to respect do-not-contact requests and manage marketing consent across channels.", updated: "2026-01-05" },
];

export function KnowledgeView() {
  const [search, setSearch] = React.useState("");
  const filtered = KB_ARTICLES.filter(
    (a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Customer operations" title="Knowledge" description="Playbooks, articles and response templates for your team." actions={<Button size="sm"><Plus className="h-4 w-4" /> New article</Button>} />
      <div className="mt-5">
        <SearchField value={search} onChange={setSearch} placeholder="Search articles…" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {filtered.map((a) => (
          <button key={a.id} className="rounded-xl border border-border bg-card p-4 text-left elevation-subtle transition-shadow hover:elevation-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md bg-ember/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ember">{a.category}</span>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-2 font-display text-base font-semibold text-foreground">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{a.excerpt}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">Updated {a.updated}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Automations                                                         */
/* ================================================================== */

const AUTOMATIONS = [
  { id: "au-1", name: "Assign pricing enquiries to sales", trigger: "New email with subject containing 'pricing'", action: "Assign to Sales team", enabled: true, runs: 14 },
  { id: "au-2", name: "Escalate urgent WhatsApp messages", trigger: "WhatsApp inbound marked urgent", action: "Set priority urgent + notify on-call", enabled: true, runs: 3 },
  { id: "au-3", name: "SLA breach warning", trigger: "SLA state becomes breached", action: "Add internal note + ping assignee", enabled: true, runs: 2 },
  { id: "au-4", name: "Renewal reminder", trigger: "30 days before renewal date", action: "Create follow-up for account owner", enabled: true, runs: 8 },
  { id: "au-5", name: "Auto-close resolved after 7 days", trigger: "Conversation resolved for 7 days", action: "Close conversation", enabled: false, runs: 0 },
];

export function AutomationsView() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Customer operations" title="Automations" description="Demonstration rules and triggers. No external actions are executed." actions={<Button size="sm"><Plus className="h-4 w-4" /> New rule</Button>} />
      <div className="mt-5 space-y-3">
        {AUTOMATIONS.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4 elevation-subtle">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-muted-foreground" />
                  <h3 className="truncate font-medium text-foreground">{a.name}</h3>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-muted-foreground"><span className="font-medium text-foreground">When:</span> {a.trigger}</p>
                  <p className="text-muted-foreground"><span className="font-medium text-foreground">Then:</span> {a.action}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold", a.enabled ? "bg-forest/10 text-forest" : "bg-muted text-muted-foreground")}>
                  {a.enabled ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {a.enabled ? "Active" : "Disabled"}
                </span>
                <span className="text-[10px] text-muted-foreground">{a.runs} runs</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Analytics                                                          */
/* ================================================================== */

export function AnalyticsView() {
  const conversations = useDemoStore((s) => s.conversations);
  const contacts = useDemoStore((s) => s.contacts);
  const companies = useDemoStore((s) => s.companies);
  const calls = useDemoStore((s) => s.calls);

  const byStatus = Object.entries(
    conversations.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const byIndustry = Object.entries(
    companies.reduce<Record<string, number>>((acc, c) => {
      acc[c.industry] = (acc[c.industry] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const maxIndustry = Math.max(...byIndustry.map(([, n]) => n), 1);

  const byStage = Object.entries(leadStageMeta).map(([stage]) => ({
    stage,
    count: contacts.filter((c) => c.leadStage === stage).length,
  })).filter((s) => s.count > 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Customer operations" title="Analytics" description="Operational metrics and pipeline analytics for your workspace." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Conversations" value={conversations.length} icon={BarChart3} />
        <MetricCard label="Contacts" value={contacts.length} icon={Users} />
        <MetricCard label="Companies" value={companies.length} icon={Plug} />
        <MetricCard label="Calls logged" value={calls.length} icon={Phone} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ContentSection title="Conversations by status">
          <div className="space-y-2 rounded-xl border border-border bg-card p-4 elevation-subtle">
            {byStatus.map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <StatusBadge kind="conversationStatus" value={status as any} />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-inset">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(count / conversations.length) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </ContentSection>
        <ContentSection title="Companies by industry">
          <div className="space-y-2 rounded-xl border border-border bg-card p-4 elevation-subtle">
            {byIndustry.map(([industry, count]) => (
              <div key={industry} className="flex items-center gap-2">
                <span className="w-40 truncate text-xs text-muted-foreground">{industryMeta[industry as keyof typeof industryMeta]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-inset">
                  <div className="h-full rounded-full bg-forest" style={{ width: `${(count / maxIndustry) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </ContentSection>
        <ContentSection title="Contacts by lead stage">
          <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
            <div className="flex flex-wrap gap-2">
              {byStage.map((s) => (
                <div key={s.stage} className="flex items-center gap-2 rounded-lg border border-border bg-surface-inset px-3 py-1.5">
                  <StatusBadge kind="leadStage" value={s.stage as any} />
                  <span className="text-sm font-semibold tabular-nums text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ContentSection>
        <ContentSection title="Customer status distribution">
          <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
            <div className="space-y-2">
              {Object.entries(customerStatusMeta).map(([status, meta]) => {
                const count = companies.filter((c) => c.customerStatus === status).length;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <StatusBadge kind="customerStatus" value={status as any} />
                    <span className="text-sm font-semibold tabular-nums text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </ContentSection>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Team                                                                */
/* ================================================================== */

export function TeamView() {
  const teamMembers = useDemoStore((s) => s.teamMembers);
  const teams = useDemoStore((s) => s.teams);
  const conversations = useDemoStore((s) => s.conversations);
  const contacts = useDemoStore((s) => s.contacts);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Manage" title="Team" description="Team members, roles and current workload." actions={<Button size="sm"><Plus className="h-4 w-4" /> Invite</Button>} />
      <div className="mt-6 space-y-6">
        {teams.map((team) => {
          const members = teamMembers.filter((m) => m.teamId === team.id);
          return (
            <ContentSection key={team.id} title={team.name} description={team.description}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((m) => {
                  const assignedConvos = conversations.filter((c) => c.assigneeId === m.id && !["closed", "resolved"].includes(c.status)).length;
                  const ownedContacts = contacts.filter((c) => c.ownerId === m.id && !c.archived).length;
                  return (
                    <div key={m.id} className="rounded-xl border border-border bg-card p-4 elevation-subtle">
                      <div className="flex items-center gap-3">
                        <TeamAvatar initials={m.initials} color={m.avatarColor} size="md" status={m.status} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{m.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{teamRoleMeta[m.role]}</p>
                        </div>
                      </div>
                      <p className="mt-2 truncate text-xs text-muted-foreground">{m.email}</p>
                      <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs">
                        <span className="text-muted-foreground"><span className="font-semibold text-foreground">{assignedConvos}</span> open</span>
                        <span className="text-muted-foreground"><span className="font-semibold text-foreground">{ownedContacts}</span> contacts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ContentSection>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Integrations                                                       */
/* ================================================================== */

const INTEGRATIONS = [
  { id: "int-1", name: "Email (SMTP)", category: "Messaging", connected: true, demonstration: true, description: "Demonstration email channel. No real messages are sent." },
  { id: "int-2", name: "WhatsApp Business", category: "Messaging", connected: false, demonstration: true, description: "WhatsApp demonstration provider. Reconnect required." },
  { id: "int-3", name: "Web chat widget", category: "Messaging", connected: true, demonstration: false, description: "Embedded website chat for inbound enquiries." },
  { id: "int-4", name: "Telephony (demonstration)", category: "Voice", connected: true, demonstration: true, description: "Simulated telephony for call logging. No real calls placed." },
  { id: "int-5", name: "Calendar sync", category: "Productivity", connected: false, demonstration: false, description: "Two-way calendar sync for follow-ups and demos." },
  { id: "int-6", name: "Identity provider (SSO)", category: "Security", connected: false, demonstration: false, description: "SAML/OIDC single sign-on for your organisation." },
];

export function IntegrationsView() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Manage" title="Integrations" description="Connected providers and integration status. Demonstration providers are clearly labelled." />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((i) => (
          <div key={i.id} className="rounded-xl border border-border bg-card p-4 elevation-subtle">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-inset text-muted-foreground"><Plug className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{i.name}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{i.category}</p>
                </div>
              </div>
              <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold", i.connected ? "bg-forest/10 text-forest" : "bg-muted text-muted-foreground")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", i.connected ? "bg-forest" : "bg-muted-foreground")} />
                {i.connected ? "Connected" : "Not connected"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{i.description}</p>
            {i.demonstration && <p className="mt-1 text-[10px] font-medium text-ember">Demonstration only</p>}
            <div className="mt-3">
              <Button variant={i.connected ? "outline" : "primary"} size="sm">
                {i.connected ? "Configure" : "Connect"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Settings                                                            */
/* ================================================================== */

export function SettingsView() {
  const theme = useDemoStore((s) => s.theme);
  const setTheme = useDemoStore((s) => s.setTheme);
  const reset = useDemoStore((s) => s.reset);
  const navigate = useDemoStore((s) => s.navigate);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Manage" title="Settings" description="Workspace preferences. Most production settings are demonstration-only." />
      <div className="mt-6 space-y-6">
        <ContentSection title="Appearance">
          <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Theme</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["light", "dark", "system"] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)} className={cn("rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors", theme === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-surface-hover")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </ContentSection>
        <ContentSection title="Notifications">
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 elevation-subtle">
            {[
              { label: "New pricing enquiry", icon: Bell, on: true },
              { label: "Urgent support escalation", icon: AlertCircle, on: true },
              { label: "SLA at risk", icon: Clock, on: true },
              { label: "Renewal reminders", icon: CalendarIcon, on: true },
              { label: "Mentions", icon: Users, on: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-foreground"><n.icon className="h-4 w-4 text-muted-foreground" /> {n.label}</span>
                <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold", n.on ? "bg-forest/10 text-forest" : "bg-muted text-muted-foreground")}>
                  {n.on ? "On" : "Off"}
                </span>
              </div>
            ))}
          </div>
        </ContentSection>
        <ContentSection title="Security">
          <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Authentication</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Demonstration-only authentication. Production SSO is not configured in this phase.</p>
          </div>
        </ContentSection>
        <ContentSection title="Data">
          <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Demonstration data</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">All workspace data is stored locally in your browser and persists until reset.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => { if (confirm("Reset all demonstration data?")) { reset(); navigate("overview"); } }}>
              <RefreshCw className="h-4 w-4" /> Reset demonstration workspace
            </Button>
          </div>
        </ContentSection>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Billing                                                             */
/* ================================================================== */

export function BillingView() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Manage" title="Billing" description="Plan and demonstration billing. No real payments are processed." />
      <div className="mt-6 space-y-6">
        <div className="rounded-xl border border-ember/20 bg-ember/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ember">Current plan</p>
              <p className="font-display text-2xl font-semibold text-foreground">Operations — Demonstration</p>
              <p className="mt-1 text-sm text-muted-foreground">All features available in demonstration mode. No payment required.</p>
            </div>
            <Zap className="h-8 w-8 text-ember" />
          </div>
        </div>
        <ContentSection title="Usage this cycle">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Conversations", used: 16, limit: "Unlimited" },
              { label: "Contacts", used: 22, limit: "Unlimited" },
              { label: "Team members", used: 8, limit: 25 },
              { label: "Storage", used: "0.4 MB", limit: "Local only" },
            ].map((u) => (
              <div key={u.label} className="rounded-xl border border-border bg-card p-4 elevation-subtle">
                <p className="text-xs text-muted-foreground">{u.label}</p>
                <p className="mt-1 font-display text-xl font-semibold text-foreground">{u.used}</p>
                <p className="text-xs text-muted-foreground">of {u.limit}</p>
              </div>
            ))}
          </div>
        </ContentSection>
        <ContentSection title="Invoices">
          <div className="rounded-xl border border-border bg-card elevation-subtle">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-surface-inset text-left text-xs text-muted-foreground"><th className="px-4 py-2 font-medium">Invoice</th><th className="px-4 py-2 font-medium">Date</th><th className="px-4 py-2 font-medium">Amount</th><th className="px-4 py-2 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-border">
                {[{ id: "INV-2026-01", date: "Jan 1, 2026", amount: "$0.00", status: "Demonstration" }].map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 font-medium text-foreground">{inv.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                    <td className="px-4 py-3 tabular-nums">{inv.amount}</td>
                    <td className="px-4 py-3"><span className="rounded-md bg-ember/10 px-2 py-0.5 text-[10px] font-semibold text-ember">{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentSection>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Audit log                                                          */
/* ================================================================== */

export function AuditLogView() {
  const activityEvents = useDemoStore((s) => s.activityEvents);
  const [search, setSearch] = React.useState("");
  const filtered = activityEvents.filter(
    (ae) => !search || ae.summary.toLowerCase().includes(search.toLowerCase()) || ae.actorName.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Manage" title="Audit log" description="Chronological history of workspace events." actions={<Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>} />
      <div className="mt-5">
        <SearchField value={search} onChange={setSearch} placeholder="Search events…" />
      </div>
      <div className="mt-4 rounded-xl border border-border bg-card elevation-subtle">
        <ol className="divide-y divide-border">
          {filtered.map((ae) => (
            <li key={ae.id} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-inset text-muted-foreground">
                <ScrollText className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground"><span className="font-medium">{ae.actorName}</span> — {ae.summary}</p>
                {ae.detail && <p className="text-xs text-muted-foreground">{ae.detail}</p>}
              </div>
              <DateTimeDisplay iso={ae.createdAt} className="shrink-0 text-[10px] text-muted-foreground" />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
