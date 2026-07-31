"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import { industryMeta, customerStatusMeta, formatCurrencyFull, formatDate, formatRelativeTime } from "@/lib/display";
import type { Company, Industry, CustomerStatus } from "@/types/domain";
import { PageHeader, ContentSection } from "@/components/cloudsun/shared/PageHeader";
import { StatusBadge } from "@/components/cloudsun/shared/StatusBadge";
import { ContactAvatar, TeamAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { NotFoundState } from "@/components/cloudsun/shared/EmptyState";
import { Button } from "@/components/cloudsun/shared/Button";
import { TagList, Tag } from "@/components/cloudsun/shared/TagList";
import { RelativeTime, DateTimeDisplay } from "@/components/cloudsun/shared/RelativeTime";
import { ChannelIcon } from "@/components/cloudsun/shared/ChannelIcon";
import { leadStageMeta, teamRoleMeta } from "@/lib/display";
import {
  ArrowLeft, Building2, Globe, MapPin, Clock, Users, MessageSquare,
  Phone, Calendar, Save, X, Pencil, Plus, ExternalLink,
} from "lucide-react";

export function CompanyDetail({ companyId }: { companyId: string | undefined }) {
  const companies = useDemoStore((s) => s.companies);
  const contacts = useDemoStore((s) => s.contacts);
  const conversations = useDemoStore((s) => s.conversations);
  const calls = useDemoStore((s) => s.calls);
  const teamMembers = useDemoStore((s) => s.teamMembers);
  const activityEvents = useDemoStore((s) => s.activityEvents);
  const navigate = useDemoStore((s) => s.navigate);
  const updateCompany = useDemoStore((s) => s.updateCompany);
  const createCompany = useDemoStore((s) => s.createCompany);

  const isNew = companyId === "new";
  const company = companies.find((c) => c.id === companyId);

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<Partial<Company>>({});

  React.useEffect(() => {
    setEditing(isNew);
    setDraft(isNew ? { name: "", domain: "", industry: "managed_it_services", customerStatus: "prospect" } : {});
  }, [companyId, isNew]);

  if (!company && !isNew) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <NotFoundState title="Company not found" description="This company may have been removed." onBack={() => navigate("companies")} />
      </div>
    );
  }

  const co: Company = isNew ? (draft as Company) : company!;
  const owner = teamMembers.find((m) => m.id === co.accountOwnerId);
  const coContacts = contacts.filter((c) => c.companyId === co.id && !c.archived);
  const coConversations = conversations.filter((cv) => cv.companyId === co.id);
  const coCalls = calls.filter((cl) => cl.companyId === co.id);
  const coActivity = activityEvents
    .filter((ae) => coConversations.some((cv) => cv.id === ae.conversationId))
    .slice(0, 12);

  const save = () => {
    if (isNew) {
      const id = createCompany(draft as Company & { name: string });
      navigate("companies", { detailId: id });
    } else {
      updateCompany(co.id, draft);
      setEditing(false);
      setDraft({});
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <button onClick={() => navigate("companies")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Companies
      </button>

      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-7 w-7" aria-hidden />
          </span>
          <div className="min-w-0">
            {editing ? (
              <input value={draft.name ?? co.name ?? ""} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Company name" className="font-display block w-full max-w-xs rounded-lg border border-input bg-card px-3 py-1.5 text-xl font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            ) : (
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{co.name || "New company"}</h1>
            )}
            <p className="mt-0.5 text-sm text-muted-foreground">
              {editing ? (
                <input value={draft.domain ?? co.domain ?? ""} onChange={(e) => setDraft((d) => ({ ...d, domain: e.target.value }))} placeholder="domain.example" className="rounded border border-input bg-card px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              ) : co.domain}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {!editing && <StatusBadge kind="customerStatus" value={co.customerStatus ?? "prospect"} />}
              {!editing && co.estimatedValue > 0 && <Tag tone="forest">{formatCurrencyFull(co.estimatedValue)}</Tag>}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => isNew ? navigate("companies") : (setEditing(false), setDraft({}))}><X className="h-4 w-4" /> Cancel</Button>
              <Button size="sm" onClick={save}><Save className="h-4 w-4" /> {isNew ? "Create" : "Save"}</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit</Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Company information */}
          <ContentSection title="Company information">
            <div className="grid gap-4 rounded-xl border border-border bg-card p-4 elevation-subtle sm:grid-cols-2">
              <Field icon={Globe} label="Domain" value={co.domain} editing={editing} draftKey="domain" draft={draft} setDraft={setDraft} />
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Industry</p>
                {editing ? (
                  <select value={draft.industry ?? co.industry ?? "managed_it_services"} onChange={(e) => setDraft((d) => ({ ...d, industry: e.target.value as Industry }))} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {Object.entries(industryMeta).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ) : <p className="text-sm text-foreground">{industryMeta[co.industry]}</p>}
              </div>
              <Field icon={Users} label="Company size" value={co.companySize} editing={editing} draftKey="companySize" draft={draft} setDraft={setDraft} />
              <Field icon={MapPin} label="Location" value={co.location} editing={editing} draftKey="location" draft={draft} setDraft={setDraft} />
              <Field icon={Clock} label="Time zone" value={co.timeZone} editing={editing} draftKey="timeZone" draft={draft} setDraft={setDraft} />
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer status</p>
                {editing ? (
                  <select value={draft.customerStatus ?? co.customerStatus ?? "prospect"} onChange={(e) => setDraft((d) => ({ ...d, customerStatus: e.target.value as CustomerStatus }))} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {Object.entries(customerStatusMeta).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                ) : <StatusBadge kind="customerStatus" value={co.customerStatus} />}
              </div>
              <Field icon={Calendar} label="Renewal date" value={co.renewalDate ? formatDate(co.renewalDate) : "—"} editing={false} draftKey="renewalDate" draft={draft} setDraft={setDraft} />
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estimated value</p>
                {editing ? (
                  <input type="number" value={draft.estimatedValue ?? co.estimatedValue ?? 0} onChange={(e) => setDraft((d) => ({ ...d, estimatedValue: Number(e.target.value) }))} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : <p className="text-sm font-medium tabular-nums text-foreground">{co.estimatedValue ? formatCurrencyFull(co.estimatedValue) : "—"}</p>}
              </div>
            </div>
          </ContentSection>

          {/* Services */}
          <ContentSection title="Services">
            <div className="grid gap-4 rounded-xl border border-border bg-card p-4 elevation-subtle sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current services</p>
                {co.currentServices?.length ? <TagList tags={co.currentServices} /> : <p className="text-sm text-muted-foreground">None</p>}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Services of interest</p>
                {co.servicesOfInterest?.length ? <TagList tags={co.servicesOfInterest} /> : <p className="text-sm text-muted-foreground">None</p>}
              </div>
            </div>
          </ContentSection>

          {/* Notes */}
          <ContentSection title="Notes">
            <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
              {editing ? (
                <textarea value={draft.notes ?? co.notes ?? ""} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} rows={3} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Add notes…" />
              ) : co.notes ? <p className="text-sm text-foreground">{co.notes}</p> : <p className="text-sm text-muted-foreground">No notes yet.</p>}
            </div>
          </ContentSection>

          {/* Contacts at this company */}
          {!isNew && (
            <ContentSection title={`Contacts (${coContacts.length})`} actions={<Button variant="ghost" size="sm" onClick={() => navigate("contacts", { detailId: "new" })}><Plus className="h-3.5 w-3.5" /> Add</Button>}>
              <div className="space-y-2">
                {coContacts.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">No contacts at this company yet.</p>
                ) : coContacts.map((c) => (
                  <button key={c.id} onClick={() => navigate("contacts", { detailId: c.id })} className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <ContactAvatar name={c.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{c.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.jobTitle}</p>
                    </div>
                    <StatusBadge kind="leadStage" value={c.leadStage} />
                    <RelativeTime iso={c.lastInteractionAt} className="hidden text-[10px] text-muted-foreground sm:block" />
                  </button>
                ))}
              </div>
            </ContentSection>
          )}

          {/* Open conversations */}
          {!isNew && coConversations.length > 0 && (
            <ContentSection title={`Conversations (${coConversations.length})`}>
              <div className="space-y-2">
                {coConversations.slice(0, 6).map((cv) => {
                  const contact = contacts.find((c) => c.id === cv.contactId);
                  return (
                    <button key={cv.id} onClick={() => navigate("inbox", { detailId: cv.id })} className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <ChannelIcon channel={cv.channel} className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{cv.subject}</p>
                        <p className="truncate text-xs text-muted-foreground">{contact?.fullName}</p>
                      </div>
                      <StatusBadge kind="conversationStatus" value={cv.status} />
                    </button>
                  );
                })}
              </div>
            </ContentSection>
          )}

          {/* Activity timeline */}
          {!isNew && coActivity.length > 0 && (
            <ContentSection title="Activity timeline">
              <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
                <ol className="relative space-y-3 border-l border-border pl-4">
                  {coActivity.map((ae) => (
                    <li key={ae.id} className="relative">
                      <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" aria-hidden />
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{ae.summary}</p>
                          {ae.detail && <p className="text-xs text-muted-foreground">{ae.detail}</p>}
                          <p className="mt-0.5 text-[10px] text-muted-foreground">by {ae.actorName}</p>
                        </div>
                        <DateTimeDisplay iso={ae.createdAt} className="text-[10px] text-muted-foreground" />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </ContentSection>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {!isNew && owner && (
            <ContentSection title="Account owner">
              <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
                <div className="flex items-center gap-2.5">
                  <TeamAvatar initials={owner.initials} color={owner.avatarColor} size="md" status={owner.status} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{owner.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{teamRoleMeta[owner.role]}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{owner.email}</p>
                  </div>
                </div>
              </div>
            </ContentSection>
          )}

          {!isNew && co.renewalDate && (
            <ContentSection title="Renewal">
              <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-medium text-foreground">{formatDate(co.renewalDate)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  <RelativeTime iso={co.renewalDate} /> ·{" "}
                  {new Date(co.renewalDate) > new Date() ? "upcoming" : "overdue"}
                </p>
              </div>
            </ContentSection>
          )}

          {!isNew && co.tags.length > 0 && (
            <ContentSection title="Tags">
              <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
                <TagList tags={co.tags} />
              </div>
            </ContentSection>
          )}

          {!isNew && (
            <ContentSection title="Quick stats">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-3 elevation-subtle">
                  <p className="text-xs text-muted-foreground">Contacts</p>
                  <p className="mt-1 font-display text-xl font-semibold text-foreground">{coContacts.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 elevation-subtle">
                  <p className="text-xs text-muted-foreground">Open convos</p>
                  <p className="mt-1 font-display text-xl font-semibold text-foreground">
                    {coConversations.filter((cv) => !["closed", "resolved", "spam"].includes(cv.status)).length}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 elevation-subtle">
                  <p className="text-xs text-muted-foreground">Calls</p>
                  <p className="mt-1 font-display text-xl font-semibold text-foreground">{coCalls.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 elevation-subtle">
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="mt-1 font-display text-xl font-semibold text-foreground">{formatCurrencyFull(co.estimatedValue)}</p>
                </div>
              </div>
            </ContentSection>
          )}

          {!isNew && (
            <ContentSection title="Record metadata">
              <div className="space-y-2 rounded-xl border border-border bg-card p-4 elevation-subtle text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Created</span><DateTimeDisplay iso={co.createdAt} /></div>
                <div className="flex justify-between"><span>Updated</span><DateTimeDisplay iso={co.updatedAt} /></div>
                <div className="flex justify-between"><span>Company ID</span><code className="font-mono text-[10px]">{co.id}</code></div>
              </div>
            </ContentSection>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, editing, draftKey, draft, setDraft }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  editing: boolean;
  draftKey: string;
  draft: Partial<Company>;
  setDraft: React.Dispatch<React.SetStateAction<Partial<Company>>>;
}) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
      </p>
      {editing ? (
        <input value={(draft as Record<string, unknown>)[draftKey] as string ?? value ?? ""} onChange={(e) => setDraft((d) => ({ ...d, [draftKey]: e.target.value || null }))} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      ) : <p className="text-sm text-foreground">{value || "—"}</p>}
    </div>
  );
}
