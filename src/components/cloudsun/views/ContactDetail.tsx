"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import {
  leadStageMeta,
  priorityMeta,
  channelMeta,
  industryMeta,
  teamRoleMeta,
  formatCurrency,
  formatCurrencyFull,
  formatDate,
  formatRelativeTime,
} from "@/lib/display";
import type { Contact, LeadStage, Priority, Channel } from "@/types/domain";
import { PageHeader, ContentSection } from "@/components/cloudsun/shared/PageHeader";
import { StatusBadge } from "@/components/cloudsun/shared/StatusBadge";
import { ContactAvatar, TeamAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { EmptyState, NotFoundState } from "@/components/cloudsun/shared/EmptyState";
import { Button } from "@/components/cloudsun/shared/Button";
import { TagList, Tag } from "@/components/cloudsun/shared/TagList";
import { RelativeTime, DateTimeDisplay } from "@/components/cloudsun/shared/RelativeTime";
import { ChannelIcon } from "@/components/cloudsun/shared/ChannelIcon";
import {
  ArrowLeft, Mail, Phone, MessageCircle, MapPin, Clock, Globe, Calendar,
  Plus, StickyNote, MessageSquare, Archive, MoreHorizontal, Building2,
  User, Tag as TagIcon, Shield, Bell, Pencil, Save, X, Check,
} from "lucide-react";

export function ContactDetail({ contactId }: { contactId: string | undefined }) {
  const contacts = useDemoStore((s) => s.contacts);
  const companies = useDemoStore((s) => s.companies);
  const teamMembers = useDemoStore((s) => s.teamMembers);
  const conversations = useDemoStore((s) => s.conversations);
  const calls = useDemoStore((s) => s.calls);
  const activityEvents = useDemoStore((s) => s.activityEvents);
  const navigate = useDemoStore((s) => s.navigate);
  const updateContact = useDemoStore((s) => s.updateContact);
  const archiveContact = useDemoStore((s) => s.archiveContact);
  const restoreContact = useDemoStore((s) => s.restoreContact);
  const createContact = useDemoStore((s) => s.createContact);
  const addContactTag = useDemoStore((s) => s.addContactTag);
  const addMessage = useDemoStore((s) => s.addMessage);

  const isNew = contactId === "new";
  const contact = contacts.find((c) => c.id === contactId);

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<Partial<Contact>>({});
  const [newTag, setNewTag] = React.useState("");
  const [noteText, setNoteText] = React.useState("");

  React.useEffect(() => {
    setEditing(isNew);
    setDraft(isNew ? { fullName: "", jobTitle: "", primaryEmail: "", primaryPhone: "" } : {});
    setNoteText("");
  }, [contactId, isNew]);

  if (!contact && !isNew) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <NotFoundState
          title="Contact not found"
          description="This contact may have been removed or the link is invalid."
          onBack={() => navigate("contacts")}
        />
      </div>
    );
  }

  const c: Contact = isNew
    ? (draft as Contact)
    : contact!;

  const company = c.companyId ? companies.find((co) => co.id === c.companyId) : null;
  const owner = teamMembers.find((m) => m.id === c.ownerId);
  const contactConversations = conversations.filter((cv) => cv.contactId === c.id);
  const contactCalls = calls.filter((cl) => cl.contactId === c.id);
  const contactActivity = activityEvents
    .filter((ae) => ae.contactId === c.id || ae.conversationId && contactConversations.some((cv) => cv.id === ae.conversationId))
    .slice(0, 15);

  const startSave = () => {
    if (isNew) {
      const id = createContact(draft as Contact & { fullName: string });
      navigate("contacts", { detailId: id });
    } else {
      updateContact(c.id, draft);
      setEditing(false);
      setDraft({});
    }
  };

  const cancelEdit = () => {
    if (isNew) {
      navigate("contacts");
    } else {
      setEditing(false);
      setDraft({});
    }
  };

  const addTag = () => {
    const t = newTag.trim();
    if (t) {
      if (isNew) {
        setDraft((d) => ({ ...d, tags: [...(d.tags ?? []), t] }));
      } else {
        addContactTag(c.id, t);
      }
      setNewTag("");
    }
  };

  const addNote = () => {
    if (noteText.trim()) {
      addMessage({
        conversationId: contactConversations[0]?.id ?? "",
        body: noteText,
        direction: "internal",
        channel: "internal",
      });
      setNoteText("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back */}
      <button
        onClick={() => navigate("contacts")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Contacts
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <ContactAvatar name={c.fullName || "?"} size="lg" />
          <div className="min-w-0">
            {editing ? (
              <input
                value={draft.fullName ?? c.fullName ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
                placeholder="Full name"
                className="font-display block w-full max-w-xs rounded-lg border border-input bg-card px-3 py-1.5 text-xl font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {c.fullName || "New contact"}
              </h1>
            )}
            <p className="mt-0.5 text-sm text-muted-foreground">
              {editing ? (
                <input
                  value={draft.jobTitle ?? c.jobTitle ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, jobTitle: e.target.value }))}
                  placeholder="Job title"
                  className="block w-full max-w-xs rounded-lg border border-input bg-card px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : c.jobTitle}
              {company && <span> · <button onClick={() => navigate("companies", { detailId: company.id })} className="text-primary hover:underline">{company.name}</button></span>}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {!editing && <StatusBadge kind="leadStage" value={c.leadStage ?? "new"} />}
              {!editing && <StatusBadge kind="priority" value={c.priority ?? "normal"} />}
              {c.doNotContact && <Tag tone="ember">Do not contact</Tag>}
              {c.archived && <Tag tone="neutral">Archived</Tag>}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit}><X className="h-4 w-4" /> Cancel</Button>
              <Button size="sm" onClick={startSave}><Save className="h-4 w-4" /> {isNew ? "Create" : "Save"}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit</Button>
              <Button variant="outline" size="sm"><Plus className="h-4 w-4" /> Note</Button>
              {c.archived ? (
                <Button variant="outline" size="sm" onClick={() => restoreContact(c.id)}><Check className="h-4 w-4" /> Restore</Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => { archiveContact(c.id); navigate("contacts"); }}><Archive className="h-4 w-4" /> Archive</Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact information */}
          <ContentSection title="Contact information">
            <div className="grid gap-4 rounded-xl border border-border bg-card p-4 elevation-subtle sm:grid-cols-2">
              <DetailField icon={Mail} label="Primary email" value={c.primaryEmail} editing={editing} draftKey="primaryEmail" draft={draft} setDraft={setDraft} />
              <DetailField icon={Mail} label="Secondary email" value={c.secondaryEmail} editing={editing} draftKey="secondaryEmail" draft={draft} setDraft={setDraft} />
              <DetailField icon={Phone} label="Primary phone" value={c.primaryPhone} editing={editing} draftKey="primaryPhone" draft={draft} setDraft={setDraft} />
              <DetailField icon={Phone} label="Secondary phone" value={c.secondaryPhone} editing={editing} draftKey="secondaryPhone" draft={draft} setDraft={setDraft} />
              <DetailField icon={MessageCircle} label="WhatsApp" value={c.whatsappNumber} editing={editing} draftKey="whatsappNumber" draft={draft} setDraft={setDraft} />
              <DetailField icon={MapPin} label="Location" value={c.location} editing={editing} draftKey="location" draft={draft} setDraft={setDraft} />
              <DetailField icon={Clock} label="Time zone" value={c.timeZone} editing={editing} draftKey="timeZone" draft={draft} setDraft={setDraft} />
              <DetailField icon={Globe} label="Preferred language" value={c.preferredLanguage} editing={editing} draftKey="preferredLanguage" draft={draft} setDraft={setDraft} />
            </div>
          </ContentSection>

          {/* Lead metadata */}
          <ContentSection title="Lead metadata">
            <div className="grid gap-4 rounded-xl border border-border bg-card p-4 elevation-subtle sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lead stage</p>
                {editing ? (
                  <select
                    value={draft.leadStage ?? c.leadStage ?? "new"}
                    onChange={(e) => setDraft((d) => ({ ...d, leadStage: e.target.value as LeadStage }))}
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(leadStageMeta).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                ) : <StatusBadge kind="leadStage" value={c.leadStage ?? "new"} />}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Priority</p>
                {editing ? (
                  <select
                    value={draft.priority ?? c.priority ?? "normal"}
                    onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as Priority }))}
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(priorityMeta).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                ) : <StatusBadge kind="priority" value={c.priority ?? "normal"} />}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lead source</p>
                {editing ? (
                  <input value={draft.leadSource ?? c.leadSource ?? ""} onChange={(e) => setDraft((d) => ({ ...d, leadSource: e.target.value }))} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : <p className="text-sm text-foreground">{c.leadSource || "—"}</p>}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estimated value</p>
                {editing ? (
                  <input type="number" value={draft.estimatedValue ?? c.estimatedValue ?? 0} onChange={(e) => setDraft((d) => ({ ...d, estimatedValue: Number(e.target.value) }))} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : <p className="text-sm font-medium tabular-nums text-foreground">{c.estimatedValue ? formatCurrencyFull(c.estimatedValue) : "—"}</p>}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preferred channel</p>
                {editing ? (
                  <select
                    value={draft.preferredChannel ?? c.preferredChannel ?? "email"}
                    onChange={(e) => setDraft((d) => ({ ...d, preferredChannel: e.target.value as Channel }))}
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(channelMeta).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                ) : (
                  <p className="flex items-center gap-1.5 text-sm text-foreground">
                    <ChannelIcon channel={c.preferredChannel ?? "email"} className="h-3.5 w-3.5 text-muted-foreground" />
                    {channelMeta[c.preferredChannel ?? "email"]?.label}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account owner</p>
                {owner && (
                  <div className="flex items-center gap-2">
                    <TeamAvatar initials={owner.initials} color={owner.avatarColor} size="xs" />
                    <div>
                      <p className="text-sm text-foreground">{owner.name}</p>
                      <p className="text-[10px] text-muted-foreground">{teamRoleMeta[owner.role]}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last interaction</p>
                <RelativeTime iso={c.lastInteractionAt} className="text-sm text-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next follow-up</p>
                <RelativeTime iso={c.nextFollowUpAt} className="text-sm text-foreground" />
              </div>
            </div>
          </ContentSection>

          {/* Tags */}
          <ContentSection title="Tags" actions={!editing && <AddTagInline value={newTag} onChange={setNewTag} onAdd={addTag} />}>
            <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
              {editing ? (
                <EditingTags tags={draft.tags ?? c.tags ?? []} draft={draft} setDraft={setDraft} />
              ) : c.tags?.length ? (
                <TagList tags={c.tags} />
              ) : (
                <p className="text-sm text-muted-foreground">No tags yet.</p>
              )}
            </div>
          </ContentSection>

          {/* Consent & DNC */}
          <ContentSection title="Consent">
            <div className="grid gap-4 rounded-xl border border-border bg-card p-4 elevation-subtle sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Shield className={cn("h-4 w-4", c.marketingConsent ? "text-forest" : "text-muted-foreground")} aria-hidden />
                <div>
                  <p className="text-sm font-medium text-foreground">Marketing consent</p>
                  <p className="text-xs text-muted-foreground">{c.marketingConsent ? "Granted" : "Not granted"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bell className={cn("h-4 w-4", c.doNotContact ? "text-destructive" : "text-muted-foreground")} aria-hidden />
                <div>
                  <p className="text-sm font-medium text-foreground">Do not contact</p>
                  <p className="text-xs text-muted-foreground">{c.doNotContact ? "Active — no outreach" : "Not set"}</p>
                </div>
              </div>
            </div>
          </ContentSection>

          {/* Notes */}
          <ContentSection title="Notes">
            <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
              {editing ? (
                <textarea
                  value={draft.notes ?? c.notes ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Add notes about this contact…"
                />
              ) : c.notes ? (
                <p className="text-sm text-foreground">{c.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              )}
            </div>
          </ContentSection>

          {/* Add internal note */}
          {!isNew && contactConversations.length > 0 && (
            <ContentSection title="Quick note" description="Adds an internal note to the latest conversation.">
              <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  placeholder="Write an internal note…"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="mt-2 flex justify-end">
                  <Button size="sm" onClick={addNote} disabled={!noteText.trim()}><StickyNote className="h-4 w-4" /> Add note</Button>
                </div>
              </div>
            </ContentSection>
          )}

          {/* Timeline */}
          {!isNew && (
            <ContentSection title="Activity timeline">
              <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
                {contactActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  <ol className="relative space-y-4 border-l border-border pl-4">
                    {contactActivity.map((ae) => (
                      <li key={ae.id} className="relative">
                        <span className="absolute -left-[1.4rem] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-2 ring-card" aria-hidden />
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
                )}
              </div>
            </ContentSection>
          )}
        </div>

        {/* Right: related */}
        <div className="space-y-6">
          {!isNew && company && (
            <ContentSection title="Company">
              <button
                onClick={() => navigate("companies", { detailId: company.id })}
                className="block w-full rounded-xl border border-border bg-card p-4 text-left elevation-subtle transition-shadow hover:elevation-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-inset text-muted-foreground">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{company.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{industryMeta[company.industry]}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <StatusBadge kind="customerStatus" value={company.customerStatus} />
                  <span className="text-xs text-muted-foreground">{company.companySize}</span>
                </div>
              </button>
            </ContentSection>
          )}

          {!isNew && (
            <ContentSection title="Conversations" actions={<Button variant="ghost" size="sm" onClick={() => navigate("inbox")}>View all</Button>}>
              <div className="space-y-2">
                {contactConversations.length === 0 ? (
                  <EmptyState icon={MessageSquare} title="No conversations" description="Start a conversation from the inbox." className="py-6" />
                ) : (
                  contactConversations.slice(0, 4).map((cv) => (
                    <button
                      key={cv.id}
                      onClick={() => navigate("inbox", { detailId: cv.id })}
                      className="block w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-center gap-2">
                        <ChannelIcon channel={cv.channel} className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="truncate text-sm font-medium text-foreground">{cv.subject}</p>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{cv.preview}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <StatusBadge kind="conversationStatus" value={cv.status} />
                        <RelativeTime iso={cv.lastActivityAt} className="text-[10px] text-muted-foreground" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ContentSection>
          )}

          {!isNew && contactCalls.length > 0 && (
            <ContentSection title="Recent calls">
              <div className="space-y-2">
                {contactCalls.slice(0, 4).map((cl) => (
                  <div key={cl.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium capitalize text-foreground">
                        <ChannelIcon channel="phone" className="h-3.5 w-3.5 text-muted-foreground" />
                        {cl.direction}
                      </span>
                      <StatusBadge kind="callOutcome" value={cl.outcome} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{cl.summary}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground"><DateTimeDisplay iso={cl.startedAt} /></p>
                  </div>
                ))}
              </div>
            </ContentSection>
          )}

          {!isNew && (
            <ContentSection title="Record metadata">
              <div className="space-y-2 rounded-xl border border-border bg-card p-4 elevation-subtle text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Created</span><DateTimeDisplay iso={c.createdAt} /></div>
                <div className="flex justify-between"><span>Updated</span><DateTimeDisplay iso={c.updatedAt} /></div>
                <div className="flex justify-between"><span>Contact ID</span><code className="font-mono text-[10px]">{c.id}</code></div>
              </div>
            </ContentSection>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailField({
  icon: Icon, label, value, editing, draftKey, draft, setDraft,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  editing: boolean;
  draftKey: string;
  draft: Partial<Contact>;
  setDraft: React.Dispatch<React.SetStateAction<Partial<Contact>>>;
}) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
      </p>
      {editing ? (
        <input
          value={(draft as Record<string, unknown>)[draftKey] as string ?? value ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, [draftKey]: e.target.value || null }))}
          className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <p className="text-sm text-foreground">{value || "—"}</p>
      )}
    </div>
  );
}

function AddTagInline({ value, onChange, onAdd }: { value: string; onChange: (v: string) => void; onAdd: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
        placeholder="Add tag"
        className="h-8 w-28 rounded-lg border border-input bg-card px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button size="sm" variant="ghost" onClick={onAdd}><Plus className="h-3.5 w-3.5" /></Button>
    </div>
  );
}

function EditingTags({ tags, draft, setDraft }: { tags: string[]; draft: Partial<Contact>; setDraft: React.Dispatch<React.SetStateAction<Partial<Contact>>> }) {
  const remove = (t: string) => setDraft((d) => ({ ...d, tags: (d.tags ?? tags).filter((x: string) => x !== t) }));
  return <TagList tags={tags} onRemove={remove} />;
}
