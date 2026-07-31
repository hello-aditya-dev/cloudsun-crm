"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import {
  conversationStatusMeta,
  priorityMeta,
  channelMeta,
  formatRelativeTime,
} from "@/lib/display";
import type { Conversation, ConversationStatus, Channel, Message } from "@/types/domain";
import { ContactAvatar, TeamAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { StatusBadge, SlaIndicator } from "@/components/cloudsun/shared/StatusBadge";
import { ChannelIcon } from "@/components/cloudsun/shared/ChannelIcon";
import { RelativeTime, DateTimeDisplay } from "@/components/cloudsun/shared/RelativeTime";
import { EmptyState, FilteredEmptyState, NotFoundState } from "@/components/cloudsun/shared/EmptyState";
import { SearchField, FilterBar, FilterChip, Select, ClearFiltersButton } from "@/components/cloudsun/shared/FilterBar";
import { Button } from "@/components/cloudsun/shared/Button";
import { TagList } from "@/components/cloudsun/shared/TagList";
import * as Lucide from "lucide-react";
import {
  Inbox, Search, ArrowLeft, Send, StickyNote, Clock, MoreHorizontal,
  UserPlus, Tag as TagIcon, Link2, Check, X, BellOff, Archive, RotateCcw,
  Sparkles, ChevronDown, Paperclip, AlertCircle, Ban,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type InboxView =
  | "all" | "unassigned" | "mine" | "open" | "waiting" | "needs_approval" | "snoozed" | "closed" | "spam";

const VIEW_LABELS: Record<InboxView, string> = {
  all: "All",
  unassigned: "Unassigned",
  mine: "Mine",
  open: "Open",
  waiting: "Waiting",
  needs_approval: "Needs approval",
  snoozed: "Snoozed",
  closed: "Closed",
  spam: "Spam",
};

const STATUS_FILTERS: { view: InboxView; match: (c: Conversation) => boolean }[] = [
  { view: "all", match: () => true },
  { view: "unassigned", match: (c) => c.status === "unassigned" || (!c.assigneeId && c.status === "open") },
  { view: "mine", match: (c) => c.assigneeId === "u-1" && c.status !== "closed" },
  { view: "open", match: (c) => !["closed", "resolved", "spam", "snoozed"].includes(c.status) },
  { view: "waiting", match: (c) => c.status === "waiting_customer" || c.status === "waiting_internal" },
  { view: "needs_approval", match: (c) => c.status === "needs_approval" },
  { view: "snoozed", match: (c) => c.status === "snoozed" },
  { view: "closed", match: (c) => ["closed", "resolved"].includes(c.status) },
  { view: "spam", match: (c) => c.status === "spam" },
];

const CHANNEL_FILTERS: Channel[] = ["email", "phone", "whatsapp", "webchat"];

export function InboxView({ conversationId }: { conversationId: string | undefined }) {
  const conversations = useDemoStore((s) => s.conversations);
  const contacts = useDemoStore((s) => s.contacts);
  const companies = useDemoStore((s) => s.companies);
  const teamMembers = useDemoStore((s) => s.teamMembers);
  const messages = useDemoStore((s) => s.messages);
  const currentUserId = useDemoStore((s) => s.currentUserId);
  const navigate = useDemoStore((s) => s.navigate);
  const markConversationRead = useDemoStore((s) => s.markConversationRead);
  const assignConversation = useDemoStore((s) => s.assignConversation);
  const setConversationStatus = useDemoStore((s) => s.setConversationStatus);
  const setConversationPriority = useDemoStore((s) => s.setConversationPriority);
  const snoozeConversation = useDemoStore((s) => s.snoozeConversation);
  const addMessage = useDemoStore((s) => s.addMessage);
  const markConversationUnread = useDemoStore((s) => s.markConversationUnread);

  const [activeView, setActiveView] = React.useState<InboxView>("all");
  const [search, setSearch] = React.useState("");
  const [channelFilter, setChannelFilter] = React.useState<Set<Channel>>(new Set());

  // Mobile: if a conversationId is selected, show detail only
  const isMobileDetail = conversationId && conversationId !== "new";

  const contactMap = React.useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);
  const companyMap = React.useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);
  const memberMap = React.useMemo(() => new Map(teamMembers.map((m) => [m.id, m])), [teamMembers]);

  const counts = React.useMemo(() => {
    const result: Record<string, number> = {};
    STATUS_FILTERS.forEach(({ view, match }) => {
      result[view] = conversations.filter(match).length;
    });
    result["unread"] = conversations.reduce((s, c) => s + c.unreadCount, 0);
    return result;
  }, [conversations]);

  const filtered = React.useMemo(() => {
    const viewMatch = STATUS_FILTERS.find((f) => f.view === activeView)?.match ?? (() => true);
    let list = conversations.filter(viewMatch);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const contact = contactMap.get(c.contactId);
        return (
          c.subject.toLowerCase().includes(q) ||
          c.preview.toLowerCase().includes(q) ||
          contact?.fullName.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }
    if (channelFilter.size > 0) {
      list = list.filter((c) => channelFilter.has(c.channel));
    }
    return [...list].sort(
      (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );
  }, [conversations, activeView, search, channelFilter, contactMap]);

  const selectedConversation = conversationId && conversationId !== "new"
    ? conversations.find((c) => c.id === conversationId)
    : null;

  // Mark read when selected
  React.useEffect(() => {
    if (selectedConversation && selectedConversation.unreadCount > 0) {
      markConversationRead(selectedConversation.id);
    }
  }, [selectedConversation?.id, selectedConversation?.unreadCount, markConversationRead]);

  const toggleChannel = (ch: Channel) => {
    setChannelFilter((s) => {
      const next = new Set(s);
      if (next.has(ch)) next.delete(ch); else next.add(ch);
      return next;
    });
  };

  const openConversation = (id: string) => navigate("inbox", { detailId: id });
  const closeConversation = () => navigate("inbox");

  const hasFilters = !!search || channelFilter.size > 0;
  const clearFilters = () => { setSearch(""); setChannelFilter(new Set()); };

  // Mobile detail view
  if (isMobileDetail) {
    return (
      <ConversationDetail
        conversation={selectedConversation}
        onBack={closeConversation}
        contactMap={contactMap}
        companyMap={companyMap}
        memberMap={memberMap}
        messages={messages.filter((m) => m.conversationId === conversationId)}
        currentUserId={currentUserId}
        onAssign={assignConversation}
        onStatus={setConversationStatus}
        onPriority={setConversationPriority}
        onSnooze={snoozeConversation}
        onUnread={markConversationUnread}
        onSend={addMessage}
        onOpenContact={(id) => navigate("contacts", { detailId: id })}
        onOpenCompany={(id) => navigate("companies", { detailId: id })}
        notFound={!selectedConversation}
      />
    );
  }

  return (
    <div className="flex h-full">
      {/* Left panel — views & filters (desktop) */}
      <div className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/30 lg:flex">
        <div className="border-b border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Views</p>
        </div>
        <div className="scroll-area-cs flex-1 overflow-y-auto p-2">
          <ul className="space-y-0.5">
            {STATUS_FILTERS.map((f) => {
              const isActive = activeView === f.view;
              const count = counts[f.view] ?? 0;
              return (
                <li key={f.view}>
                  <button
                    onClick={() => setActiveView(f.view)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface-hover"
                    )}
                  >
                    <span>{VIEW_LABELS[f.view]}</span>
                    {count > 0 && (
                      <span className={cn(
                        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                        isActive ? "bg-primary/15 text-primary" : "bg-surface-inset text-muted-foreground"
                      )}>{count}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="my-3 border-t border-border" />
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Channels</p>
          <ul className="space-y-0.5">
            {CHANNEL_FILTERS.map((ch) => {
              const active = channelFilter.has(ch);
              return (
                <li key={ch}>
                  <button
                    onClick={() => toggleChannel(ch)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface-hover"
                    )}
                  >
                    <ChannelIcon channel={ch} className="h-3.5 w-3.5" />
                    <span className="flex-1 text-left">{channelMeta[ch].label}</span>
                    {active && <Check className="h-3.5 w-3.5" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Centre panel — conversation list */}
      <div className={cn("flex min-w-0 flex-1 flex-col", selectedConversation ? "hidden xl:flex" : "flex")}>
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-display text-lg font-semibold text-foreground">Inbox</h1>
            <span className="text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "conversation" : "conversations"}
            </span>
          </div>
          <div className="mt-2">
            <SearchField value={search} onChange={setSearch} placeholder="Search conversations…" />
          </div>
          {/* Mobile view tabs */}
          <div className="mt-2 flex gap-1 overflow-x-auto lg:hidden">
            {STATUS_FILTERS.slice(0, 6).map((f) => (
              <button
                key={f.view}
                onClick={() => setActiveView(f.view)}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  activeView === f.view ? "bg-primary text-primary-foreground" : "bg-surface-inset text-muted-foreground"
                )}
              >
                {VIEW_LABELS[f.view]} {counts[f.view] ? `(${counts[f.view]})` : ""}
              </button>
            ))}
          </div>
          {hasFilters && (
            <div className="mt-2">
              <ClearFiltersButton onClick={clearFilters} />
            </div>
          )}
        </div>
        <div className="scroll-area-cs flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4">
              {hasFilters ? <FilteredEmptyState onClear={clearFilters} /> : (
                <EmptyState icon={Inbox} title="No conversations" description="Conversations from phone, email, WhatsApp and web chat will appear here." />
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((cv) => {
                const contact = contactMap.get(cv.contactId);
                const company = cv.companyId ? companyMap.get(cv.companyId) : null;
                const assignee = cv.assigneeId ? memberMap.get(cv.assigneeId) : null;
                const isSelected = selectedConversation?.id === cv.id;
                return (
                  <li key={cv.id}>
                    <button
                      onClick={() => openConversation(cv.id)}
                      className={cn(
                        "flex w-full flex-col gap-2 px-3 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                        isSelected ? "bg-primary/5" : "hover:bg-surface-hover",
                        cv.unreadCount > 0 && "bg-primary/[0.03]"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <ContactAvatar name={contact?.fullName ?? "?"} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn("truncate text-sm", cv.unreadCount > 0 ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                              {contact?.fullName ?? "Unknown"}
                            </p>
                            <RelativeTime iso={cv.lastActivityAt} className="shrink-0 text-[10px] text-muted-foreground" />
                          </div>
                          <p className="truncate text-xs text-muted-foreground">{company?.name ?? "No company"}</p>
                          <p className={cn("mt-1 truncate text-sm", cv.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                            {cv.subject}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{cv.preview}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <ChannelIcon channel={cv.channel} className="h-3.5 w-3.5 text-muted-foreground" />
                            <StatusBadge kind="priority" value={cv.priority} />
                            {cv.slaState !== "safe" && cv.slaState !== "paused" && (
                              <SlaIndicator state={cv.slaState} dueAt={cv.slaDueAt} />
                            )}
                            {cv.tags.slice(0, 2).map((t) => (
                              <span key={t} className="rounded border border-border bg-surface-inset px-1.5 py-0 text-[10px] font-medium text-muted-foreground">{t}</span>
                            ))}
                            {assignee && (
                              <span className="ml-auto inline-flex items-center gap-1">
                                <TeamAvatar initials={assignee.initials} color={assignee.avatarColor} size="xs" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Right panel — conversation detail (desktop inline) */}
      {selectedConversation && (
        <div className="hidden min-w-0 flex-1 border-l border-border xl:flex xl:flex-col">
          <ConversationDetail
            conversation={selectedConversation}
            onBack={closeConversation}
            contactMap={contactMap}
            companyMap={companyMap}
            memberMap={memberMap}
            messages={messages.filter((m) => m.conversationId === selectedConversation.id)}
            currentUserId={currentUserId}
            onAssign={assignConversation}
            onStatus={setConversationStatus}
            onPriority={setConversationPriority}
            onSnooze={snoozeConversation}
            onUnread={markConversationUnread}
            onSend={addMessage}
            onOpenContact={(id) => navigate("contacts", { detailId: id })}
            onOpenCompany={(id) => navigate("companies", { detailId: id })}
          />
        </div>
      )}

      {/* Empty state when no conversation selected (desktop) */}
      {!selectedConversation && (
        <div className="hidden flex-1 items-center justify-center border-l border-border p-8 xl:flex">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-inset">
              <Inbox className="h-7 w-7 text-muted-foreground" aria-hidden />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">Select a conversation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a conversation from the list to view its full history and respond. Press ⌘K to search across everything.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Conversation detail + composer                                      */
/* ------------------------------------------------------------------ */

function ConversationDetail({
  conversation,
  onBack,
  contactMap,
  companyMap,
  memberMap,
  messages,
  currentUserId,
  onAssign,
  onStatus,
  onPriority,
  onSnooze,
  onUnread,
  onSend,
  onOpenContact,
  onOpenCompany,
  notFound,
}: {
  conversation: Conversation | null | undefined;
  onBack: () => void;
  contactMap: Map<string, ReturnType<typeof Object>>;
  companyMap: Map<string, ReturnType<typeof Object>>;
  memberMap: Map<string, ReturnType<typeof Object>>;
  messages: Message[];
  currentUserId: string;
  onAssign: (id: string, a: string | null) => void;
  onStatus: (id: string, s: ConversationStatus) => void;
  onPriority: (id: string, p: Conversation["priority"]) => void;
  onSnooze: (id: string) => void;
  onUnread: (id: string) => void;
  onSend: (input: { conversationId: string; body: string; direction: "outbound" | "internal"; channel: Channel }) => void;
  onOpenContact: (id: string) => void;
  onOpenCompany: (id: string) => void;
  notFound?: boolean;
}) {
  const [composerMode, setComposerMode] = React.useState<"reply" | "note">("reply");
  const [body, setBody] = React.useState("");
  const [draftSaved, setDraftSaved] = React.useState(false);
  const [aiBusy, setAiBusy] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const composerRef = React.useRef<HTMLTextAreaElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const contact = conversation ? (contactMap as Map<string, any>).get(conversation.contactId) : null;
  const company = conversation?.companyId ? (companyMap as Map<string, any>).get(conversation.companyId) : null;
  const assignee = conversation?.assigneeId ? (memberMap as Map<string, any>).get(conversation.assigneeId) : null;

  const setConversationDraft = useDemoStore((s) => s.setConversationDraft);
  const clearConversationDraft = useDemoStore((s) => s.clearConversationDraft);
  const storedDraft = useDemoStore((s) => (conversation ? s.drafts[conversation.id] ?? "" : ""));

  // Load draft when conversation changes.
  React.useEffect(() => {
    if (!conversation) return;
    setBody(storedDraft);
    setDraftSaved(Boolean(storedDraft));
  }, [conversation?.id]);

  // Persist draft to the centralised demo store (no raw localStorage).
  React.useEffect(() => {
    if (!conversation) return;
    if (body) {
      setConversationDraft(conversation.id, body);
      setDraftSaved(true);
    } else if (storedDraft) {
      clearConversationDraft(conversation.id);
      setDraftSaved(false);
    }
  }, [body, conversation?.id]);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Keyboard shortcut: focus composer
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "r" && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        composerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (notFound || !conversation) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <NotFoundState
          title="Conversation not found"
          description="This conversation may have been removed."
          onBack={onBack}
        />
      </div>
    );
  }

  const send = () => {
    if (!body.trim()) return;
    onSend({
      conversationId: conversation.id,
      body: body.trim(),
      direction: composerMode === "note" ? "internal" : "outbound",
      channel: composerMode === "note" ? "internal" : conversation.channel,
    });
    setBody("");
    clearConversationDraft(conversation.id);
    setDraftSaved(false);
  };

  const aiAction = (action: string) => {
    setAiBusy(true);
    setTimeout(() => {
      let result = body;
      switch (action) {
        case "shorten":
          result = body.split(". ").slice(0, 2).join(". ").trim() + (body.length > 80 ? "." : "");
          break;
        case "clearer":
          result = `To clarify: ${body}`;
          break;
        case "friendlier":
          result = `Hi ${contact?.fullName?.split(" ")[0] ?? "there"}! ${body}`;
          break;
        case "formal":
          result = body.replace(/hi|hey/gi, "Hello").replace(/thanks/gi, "Thank you");
          break;
        case "summarize":
          result = `Summary: ${messages.slice(-4).map((m) => `${m.authorName}: ${m.body.slice(0, 60)}`).join(" | ")}`;
          break;
        default:
          result = body;
      }
      setBody(result);
      setAiBusy(false);
    }, 600);
  };

  const statusOptions: ConversationStatus[] = ["open", "waiting_customer", "waiting_internal", "needs_approval", "resolved", "closed", "spam"];
  const priorityOptions: Conversation["priority"][] = ["low", "normal", "high", "urgent"];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <button onClick={onBack} className="mt-0.5 rounded-lg p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground xl:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Back to list">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h2 className="truncate font-display text-base font-semibold text-foreground">{conversation.subject}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <ChannelIcon channel={conversation.channel} className="h-3.5 w-3.5 text-muted-foreground" />
                <StatusBadge kind="conversationStatus" value={conversation.status} />
                <StatusBadge kind="priority" value={conversation.priority} />
                <SlaIndicator state={conversation.slaState} dueAt={conversation.slaDueAt} />
              </div>
            </div>
          </div>
          <div className="relative flex shrink-0 items-center gap-1">
            <button onClick={() => onSnooze(conversation.id)} title="Snooze" className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Snooze">
              <Clock className="h-4 w-4" />
            </button>
            <button onClick={() => onUnread(conversation.id)} title="Mark unread" className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Mark unread">
              <BellOff className="h-4 w-4" />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} title="More" className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="More actions" aria-expanded={menuOpen}>
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-popover p-1 elevation-floating">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                  {statusOptions.map((st) => (
                    <button key={st} onClick={() => { onStatus(conversation.id, st); setMenuOpen(false); }} className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <span className="capitalize">{st.replace(/_/g, " ")}</span>
                      {conversation.status === st && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                  <div className="my-1 border-t border-border" />
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Priority</p>
                  {priorityOptions.map((p) => (
                    <button key={p} onClick={() => { onPriority(conversation.id, p); setMenuOpen(false); }} className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm capitalize hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {p}
                      {conversation.priority === p && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                  <div className="my-1 border-t border-border" />
                  <button onClick={() => { if (confirm("Copy conversation link to clipboard?")) { navigator.clipboard?.writeText(`${window.location.origin}/?conv=${conversation.id}`); } setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Link2 className="h-3.5 w-3.5" /> Copy link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Messages */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="scroll-area-cs flex-1 overflow-y-auto px-4 py-4">
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>
              ) : (
                messages.map((m) => {
                  const isInternal = m.direction === "internal";
                  const isOutbound = m.direction === "outbound";
                  return (
                    <div key={m.id} className={cn("flex gap-2.5", isOutbound && "flex-row-reverse")}>
                      {m.direction === "inbound" && <ContactAvatar name={m.authorName} size="sm" />}
                      {isOutbound && <TeamAvatar initials={(m.authorId ? (memberMap as Map<string, any>).get(m.authorId)?.initials : undefined) ?? "Y"} color={(m.authorId ? (memberMap as Map<string, any>).get(m.authorId)?.avatarColor : undefined) ?? "oklch(0.5 0.1 60)"} size="sm" />}
                      <div className={cn("max-w-[80%]", isInternal && "mx-auto max-w-full")}>
                        {isInternal ? (
                          <div className="rounded-lg border border-warning/20 bg-warning/5 px-3 py-2">
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-warning-foreground">
                              <StickyNote className="h-3 w-3" /> Internal note · {m.authorName}
                            </p>
                            <p className="mt-1 text-sm text-foreground">{m.body}</p>
                            <p className="mt-1 text-[10px] text-muted-foreground"><DateTimeDisplay iso={m.createdAt} /></p>
                          </div>
                        ) : (
                          <div className={cn("rounded-2xl px-3.5 py-2", isOutbound ? "bg-primary text-primary-foreground" : "bg-card border border-border")}>
                            <p className="mb-0.5 text-[10px] font-medium opacity-70">{m.authorName}</p>
                            <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <span className={cn("text-[10px]", isOutbound ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                <DateTimeDisplay iso={m.createdAt} />
                              </span>
                              {isOutbound && (
                                <span className={cn("inline-flex items-center gap-0.5 text-[10px]", m.status === "simulated" ? "text-primary-foreground/70" : "text-primary-foreground/70")}>
                                  {m.status === "simulated" ? "Simulated" : m.status}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-card/50 p-3">
            <div className="mx-auto max-w-2xl">
              {/* Mode toggle */}
              <div className="mb-2 flex items-center gap-1">
                <button
                  onClick={() => setComposerMode("reply")}
                  className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors", composerMode === "reply" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-hover")}
                >
                  <Send className="h-3 w-3" /> Reply
                </button>
                <button
                  onClick={() => setComposerMode("note")}
                  className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors", composerMode === "note" ? "bg-warning/10 text-warning-foreground" : "text-muted-foreground hover:bg-surface-hover")}
                >
                  <StickyNote className="h-3 w-3" /> Internal note
                </button>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {draftSaved ? "Draft saved" : ""}
                </span>
              </div>

              {/* AI assistance */}
              <div className="mb-2 flex flex-wrap items-center gap-1">
                <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-ember" /> AI assist
                </span>
                {[
                  { label: "Shorten", action: "shorten" },
                  { label: "Clearer", action: "clearer" },
                  { label: "Friendlier", action: "friendlier" },
                  { label: "Formal", action: "formal" },
                  { label: "Summarize", action: "summarize" },
                ].map((b) => (
                  <button
                    key={b.action}
                    onClick={() => aiAction(b.action)}
                    disabled={aiBusy || !body}
                    className="rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {aiBusy ? "…" : b.label}
                  </button>
                ))}
                <span className="text-[10px] text-muted-foreground">· demonstration</span>
              </div>

              <div className={cn("rounded-xl border bg-card", composerMode === "note" ? "border-warning/30" : "border-input")}>
                <textarea
                  ref={composerRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={composerMode === "note" ? "Write an internal note (visible to your team only)…" : `Reply via ${channelMeta[conversation.channel].label}…`}
                  rows={3}
                  className="w-full resize-none rounded-xl bg-transparent px-3 py-2 text-sm focus:outline-none"
                  aria-label={composerMode === "note" ? "Internal note" : "Reply"}
                />
                <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button className="rounded p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Attach file">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <span className="text-[10px] text-muted-foreground">
                      {composerMode === "note" ? "Internal only — never sent to customer" : `Simulated send · ${channelMeta[conversation.channel].label}`}
                    </span>
                  </div>
                  <Button size="sm" onClick={send} disabled={!body.trim()}>
                    {composerMode === "note" ? <><StickyNote className="h-3.5 w-3.5" /> Add note</> : <><Send className="h-3.5 w-3.5" /> Send</>}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Context panel (desktop) */}
        <div className="hidden w-72 shrink-0 border-l border-border bg-card/30 xl:block">
          <div className="scroll-area-cs h-full overflow-y-auto p-4">
            {/* Contact */}
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
              <button onClick={() => onOpenContact(contact?.id)} className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <ContactAvatar name={contact?.fullName ?? "?"} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{contact?.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{contact?.jobTitle}</p>
                </div>
              </button>
              {contact && <StatusBadge kind="leadStage" value={contact.leadStage} className="ml-2" />}
            </div>

            {/* Company */}
            {company && (
              <div className="mb-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Company</p>
                <button onClick={() => onOpenCompany(company.id)} className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-inset text-muted-foreground">
                    <Lucide.Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{company.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{company.domain}</p>
                  </div>
                </button>
              </div>
            )}

            {/* Assignee */}
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Assignee</p>
              {assignee ? (
                <div className="flex items-center gap-2.5 rounded-lg p-2">
                  <TeamAvatar initials={assignee.initials} color={assignee.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{assignee.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{assignee.email}</p>
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">Unassigned</p>
              )}
            </div>

            {/* Details */}
            <div className="mb-5 space-y-2 rounded-lg border border-border bg-card p-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><DateTimeDisplay iso={conversation.createdAt} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last activity</span><RelativeTime iso={conversation.lastActivityAt} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Unread</span><span>{conversation.unreadCount}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Channel</span><span className="capitalize">{channelMeta[conversation.channel].label}</span></div>
            </div>

            {/* Tags */}
            {conversation.tags.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tags</p>
                <TagList tags={conversation.tags} size="xs" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
