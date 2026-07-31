import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { StatusBadge, SlaIndicator } from "@/components/cloudsun/shared/StatusBadge";
import { useDemoStore } from "@/lib/demo-store";
import { resolveSlaState } from "@/lib/sla";
import type { Conversation, Contact } from "@/types/domain";

beforeEach(() => {
  window.localStorage.clear();
  useDemoStore.getState().reset();
});

/**
 * Minimal conversation row that mirrors the markup pattern used by InboxView's
 * conversation list. Tests the row composition (avatar + subject + preview +
 * SLA indicator + status badge) in isolation.
 */
function ConversationRow({
  conversation,
  contactName,
  onClick,
}: {
  conversation: Conversation;
  contactName?: string;
  onClick?: (id: string) => void;
}) {
  const slaState = resolveSlaState(conversation);
  return (
    <button
      type="button"
      onClick={() => onClick?.(conversation.id)}
      className="flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3 text-left hover:bg-surface-hover"
      aria-label={`Open conversation ${conversation.subject}`}
    >
      {contactName && <ContactAvatar name={contactName} size="sm" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {conversation.subject}
          </span>
          {conversation.unreadCount > 0 && (
            <span
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground"
              aria-label={`${conversation.unreadCount} unread`}
            >
              {conversation.unreadCount}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {conversation.preview || "No messages yet"}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusBadge kind="conversationStatus" value={conversation.status} />
        <SlaIndicator state={slaState} dueAt={conversation.slaDueAt} />
      </div>
    </button>
  );
}

describe("ConversationRow", () => {
  function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
    const seed = useDemoStore.getState().conversations[0];
    return { ...seed, id: "cv-test", subject: "Demo conversation", ...overrides };
  }

  it("renders the conversation subject and preview", () => {
    const conv = makeConversation({
      subject: "Cloud migration enquiry",
      preview: "Hi, I'd like to discuss…",
    });
    render(<ConversationRow conversation={conv} contactName="Ada Lovelace" />);
    expect(screen.getByText("Cloud migration enquiry")).toBeInTheDocument();
    expect(screen.getByText("Hi, I'd like to discuss…")).toBeInTheDocument();
  });

  it("shows 'No messages yet' when preview is empty", () => {
    const conv = makeConversation({ preview: "" });
    render(<ConversationRow conversation={conv} />);
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });

  it("renders a conversation status badge", () => {
    const conv = makeConversation({ status: "open" });
    render(<ConversationRow conversation={conv} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("renders an SLA indicator", () => {
    const conv = makeConversation({ slaState: "safe", slaDueAt: null });
    render(<ConversationRow conversation={conv} />);
    expect(screen.getByText("SLA safe")).toBeInTheDocument();
  });

  it("renders an unread count badge when unreadCount > 0", () => {
    const conv = makeConversation({ unreadCount: 3 });
    render(<ConversationRow conversation={conv} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByLabelText("3 unread")).toBeInTheDocument();
  });

  it("does not render an unread badge when unreadCount is 0", () => {
    const conv = makeConversation({ unreadCount: 0 });
    render(<ConversationRow conversation={conv} />);
    expect(screen.queryByLabelText(/unread/)).not.toBeInTheDocument();
  });

  it("fires onClick with the conversation id when clicked", () => {
    const onClick = vi.fn();
    const conv = makeConversation({ id: "cv-456" });
    render(<ConversationRow conversation={conv} onClick={onClick} />);
    fireEvent.click(screen.getByLabelText("Open conversation Demo conversation"));
    expect(onClick).toHaveBeenCalledWith("cv-456");
  });

  it("renders an accessible label that includes the subject", () => {
    const conv = makeConversation({ subject: "Security assessment" });
    render(<ConversationRow conversation={conv} />);
    expect(screen.getByLabelText("Open conversation Security assessment")).toBeInTheDocument();
  });

  it("shows paused SLA for snoozed conversations", () => {
    const conv = makeConversation({ status: "snoozed", slaState: "paused", slaDueAt: null });
    render(<ConversationRow conversation={conv} />);
    expect(screen.getByText("SLA paused")).toBeInTheDocument();
  });
});
