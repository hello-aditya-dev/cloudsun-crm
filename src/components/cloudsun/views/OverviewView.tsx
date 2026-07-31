"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import {
  formatCurrency,
  formatRelativeTime,
  industryMeta,
  leadStageMeta,
  conversationStatusMeta,
} from "@/lib/display";
import { PageHeader, ContentSection } from "@/components/cloudsun/shared/PageHeader";
import { MetricCard } from "@/components/cloudsun/shared/MetricCard";
import { StatusBadge, SlaIndicator } from "@/components/cloudsun/shared/StatusBadge";
import { ContactAvatar, TeamAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { Button } from "@/components/cloudsun/shared/Button";
import { RelativeTime, DateTimeDisplay } from "@/components/cloudsun/shared/RelativeTime";
import { ChannelIcon } from "@/components/cloudsun/shared/ChannelIcon";
import {
  Users, Building2, Inbox, TrendingUp, Clock, AlertTriangle,
  Calendar, Phone, ArrowRight, Activity, Sparkles,
} from "lucide-react";

export function OverviewView() {
  const contacts = useDemoStore((s) => s.contacts);
  const companies = useDemoStore((s) => s.companies);
  const conversations = useDemoStore((s) => s.conversations);
  const calls = useDemoStore((s) => s.calls);
  const followUps = useDemoStore((s) => s.followUps);
  const activityEvents = useDemoStore((s) => s.activityEvents);
  const teamMembers = useDemoStore((s) => s.teamMembers);
  const navigate = useDemoStore((s) => s.navigate);

  const activeContacts = contacts.filter((c) => !c.archived);
  const openConversations = conversations.filter(
    (c) => !["closed", "resolved", "spam"].includes(c.status)
  );
  const unassigned = conversations.filter((c) => !c.assigneeId && c.status !== "closed");
  const slaAtRisk = conversations.filter(
    (c) => ["at_risk", "breached", "approaching"].includes(c.slaState)
  );
  const overdueFollowUps = followUps.filter((f) => f.status === "overdue");
  const upcomingFollowUps = followUps
    .filter((f) => f.status === "scheduled")
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 5);
  const totalPipeline = activeContacts.reduce((s, c) => s + c.estimatedValue, 0);
  const totalAccountValue = companies.reduce((s, c) => s + c.estimatedValue, 0);

  // Pipeline by stage
  const pipelineStages = ["qualified", "interested", "opportunity", "customer"] as const;
  const pipelineCounts = pipelineStages.map((stage) => ({
    stage,
    count: activeContacts.filter((c) => c.leadStage === stage).length,
    value: activeContacts.filter((c) => c.leadStage === stage).reduce((s, c) => s + c.estimatedValue, 0),
  }));
  const maxPipelineCount = Math.max(...pipelineCounts.map((p) => p.count), 1);

  // Conversations by channel
  const channelCounts = (["email", "phone", "whatsapp", "webchat"] as const).map((ch) => ({
    channel: ch,
    count: conversations.filter((c) => c.channel === ch).length,
  }));

  const recentActivity = activityEvents.slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Workspace"
        title="Overview"
        description="Operational snapshot of your IT customer operations workspace."
      />

      {/* Metrics */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Open conversations"
          value={openConversations.length}
          delta={`${unassigned.length} unassigned`}
          icon={Inbox}
          hint="across all channels"
        />
        <MetricCard
          label="Active contacts"
          value={activeContacts.length}
          delta={`${contacts.filter((c) => c.leadStage === "new").length} new`}
          deltaDirection="up"
          icon={Users}
        />
        <MetricCard
          label="Pipeline value"
          value={formatCurrency(totalPipeline)}
          delta={`${companies.filter((c) => c.customerStatus === "prospect").length} prospects`}
          icon={TrendingUp}
        />
        <MetricCard
          label="Account value"
          value={formatCurrency(totalAccountValue)}
          delta={`${companies.length} companies`}
          icon={Building2}
        />
      </div>

      {/* Alerts */}
      {(slaAtRisk.length > 0 || overdueFollowUps.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {slaAtRisk.length > 0 && (
            <button
              onClick={() => navigate("inbox")}
              className="flex h-full items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 text-left transition-colors hover:bg-warning/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{slaAtRisk.length} SLA at risk</p>
                <p className="truncate text-xs text-muted-foreground">
                  {slaAtRisk.map((c) => c.subject).slice(0, 2).join(", ")}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {overdueFollowUps.length > 0 && (
            <button
              onClick={() => navigate("calendar")}
              className="flex h-full items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left transition-colors hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                <Clock className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{overdueFollowUps.length} follow-up overdue</p>
                <p className="truncate text-xs text-muted-foreground">{overdueFollowUps.map((f) => f.notes).filter(Boolean).slice(0, 2).join(", ") || "Review and reschedule"}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: pipeline + channels */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pipeline */}
          <ContentSection title="Pipeline by stage" description="Active leads and opportunities">
            <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
              <div className="space-y-3">
                {pipelineCounts.map((p) => (
                  <div key={p.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{leadStageMeta[p.stage].label}</span>
                      <span className="text-muted-foreground">
                        {p.count} {p.count === 1 ? "contact" : "contacts"} · {formatCurrency(p.value)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-inset">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(p.count / maxPipelineCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ContentSection>

          {/* Recent activity */}
          <ContentSection
            title="Recent activity"
            actions={<Button variant="ghost" size="sm" onClick={() => navigate("audit_log")}>View all</Button>}
          >
            <div className="rounded-xl border border-border bg-card elevation-subtle">
              <ol className="divide-y divide-border">
                {recentActivity.map((ae) => (
                  <li key={ae.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-inset text-muted-foreground">
                      <ActivityIcon type={ae.type} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{ae.actorName}</span> {ae.summary.toLowerCase()}
                      </p>
                      {ae.detail && <p className="truncate text-xs text-muted-foreground">{ae.detail}</p>}
                    </div>
                    <RelativeTime iso={ae.createdAt} className="shrink-0 text-[10px] text-muted-foreground" />
                  </li>
                ))}
              </ol>
            </div>
          </ContentSection>

          {/* Conversations by channel */}
          <ContentSection title="Conversations by channel">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {channelCounts.map(({ channel, count }) => (
                <button
                  key={channel}
                  onClick={() => navigate("inbox")}
                  className="rounded-xl border border-border bg-card p-4 text-left elevation-subtle transition-shadow hover:elevation-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChannelIcon channel={channel} className="h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 font-display text-2xl font-semibold text-foreground">{count}</p>
                  <p className="text-xs capitalize text-muted-foreground">{channelMetaLabel(channel)}</p>
                </button>
              ))}
            </div>
          </ContentSection>
        </div>

        {/* Right: follow-ups + team */}
        <div className="space-y-6">
          {/* Upcoming follow-ups */}
          <ContentSection
            title="Upcoming follow-ups"
            actions={<Button variant="ghost" size="sm" onClick={() => navigate("calendar")}><Calendar className="h-3.5 w-3.5" /> Calendar</Button>}
          >
            <div className="space-y-2">
              {upcomingFollowUps.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">No upcoming follow-ups.</p>
              ) : (
                upcomingFollowUps.map((f) => {
                  const contact = contacts.find((c) => c.id === f.contactId);
                  const owner = teamMembers.find((m) => m.id === f.ownerId);
                  return (
                    <button
                      key={f.id}
                      onClick={() => contact && navigate("contacts", { detailId: contact.id })}
                      className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {contact && <ContactAvatar name={contact.fullName} size="sm" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{contact?.fullName}</p>
                        <p className="truncate text-xs capitalize text-muted-foreground">{f.type.replace(/_/g, " ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground"><RelativeTime iso={f.dueAt} /></p>
                        {owner && <p className="text-[10px] text-muted-foreground">{owner.name.split(" ")[0]}</p>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ContentSection>

          {/* Team online */}
          <ContentSection title="Team" actions={<Button variant="ghost" size="sm" onClick={() => navigate("team")}>View</Button>}>
            <div className="rounded-xl border border-border bg-card p-3 elevation-subtle">
              <ul className="space-y-1">
                {teamMembers.slice(0, 5).map((m) => (
                  <li key={m.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
                    <TeamAvatar initials={m.initials} color={m.avatarColor} size="sm" status={m.status} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                      <p className="truncate text-[10px] capitalize text-muted-foreground">{m.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </ContentSection>

          {/* Demo info */}
          <div className="rounded-xl border border-ember/20 bg-ember/5 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-ember" aria-hidden />
              <p className="text-sm font-semibold text-foreground">Demonstration workspace</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              All data is fictional and stored locally in your browser. Changes persist until you reset the demo from your profile menu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    message: Inbox,
    call: Phone,
    internal_note: Inbox,
    stage_change: TrendingUp,
    owner_change: Users,
    follow_up: Calendar,
    status_change: Activity,
    priority_change: AlertTriangle,
    assignment_change: Users,
    snooze: Clock,
    automation: Sparkles,
    system: Activity,
  };
  const Icon = icons[type] ?? Activity;
  return <Icon className="h-3.5 w-3.5" />;
}

function channelMetaLabel(ch: string): string {
  const map: Record<string, string> = {
    email: "Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    webchat: "Web chat",
  };
  return map[ch] ?? ch;
}
