import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useDemoStore } from "@/lib/demo-store";

beforeEach(() => {
  window.localStorage.clear();
  useDemoStore.getState().reset();
});

/**
 * Minimal composer that mirrors the InboxView reply composer. It uses the
 * centralised draft store (setConversationDraft / getConversationDraft /
 * clearConversationDraft) so drafts persist across navigation, and sends
 * via addMessage.
 */
function Composer({ conversationId }: { conversationId: string }) {
  const draft = useDemoStore((s) => s.getConversationDraft(conversationId));
  const setDraft = useDemoStore((s) => s.setConversationDraft);
  const clearDraft = useDemoStore((s) => s.clearConversationDraft);
  const addMessage = useDemoStore((s) => s.addMessage);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!draft.trim()) return;
        addMessage({
          conversationId,
          body: draft,
          direction: "outbound",
          channel: "email",
        });
        clearDraft(conversationId);
      }}
    >
      <textarea
        value={draft}
        onChange={(e) => setDraft(conversationId, e.target.value)}
        placeholder="Type a reply…"
        aria-label="Reply composer"
      />
      <button type="button" onClick={() => clearDraft(conversationId)}>
        Discard draft
      </button>
      <button type="submit" disabled={!draft.trim()}>
        Send reply
      </button>
    </form>
  );
}

describe("Composer", () => {
  it("renders an empty textarea by default", () => {
    render(<Composer conversationId="cv-1" />);
    expect(screen.getByLabelText("Reply composer")).toHaveValue("");
  });

  it("persists the draft to the store as the user types", () => {
    render(<Composer conversationId="cv-1" />);
    const textarea = screen.getByLabelText("Reply composer");
    fireEvent.change(textarea, { target: { value: "Hello there" } });
    expect(useDemoStore.getState().getConversationDraft("cv-1")).toBe("Hello there");
  });

  it("restores the draft when remounted (persistence)", () => {
    useDemoStore.getState().setConversationDraft("cv-1", "Saved draft");
    render(<Composer conversationId="cv-1" />);
    expect(screen.getByLabelText("Reply composer")).toHaveValue("Saved draft");
  });

  it("keeps drafts separate per conversation", () => {
    useDemoStore.getState().setConversationDraft("cv-1", "Draft for cv-1");
    useDemoStore.getState().setConversationDraft("cv-2", "Draft for cv-2");
    const { rerender } = render(<Composer conversationId="cv-1" />);
    expect(screen.getByLabelText("Reply composer")).toHaveValue("Draft for cv-1");
    rerender(<Composer conversationId="cv-2" />);
    expect(screen.getByLabelText("Reply composer")).toHaveValue("Draft for cv-2");
  });

  it("disables the send button when the draft is empty", () => {
    render(<Composer conversationId="cv-1" />);
    expect(screen.getByText("Send reply")).toBeDisabled();
  });

  it("enables the send button when the draft has content", () => {
    render(<Composer conversationId="cv-1" />);
    fireEvent.change(screen.getByLabelText("Reply composer"), {
      target: { value: "A reply" },
    });
    expect(screen.getByText("Send reply")).not.toBeDisabled();
  });

  it("sends a reply and clears the draft on submit", () => {
    const conv = useDemoStore.getState().conversations[0];
    const beforeCount = useDemoStore.getState().messages.filter(
      (m) => m.conversationId === conv.id,
    ).length;
    render(<Composer conversationId={conv.id} />);
    fireEvent.change(screen.getByLabelText("Reply composer"), {
      target: { value: "Sending a reply now" },
    });
    fireEvent.click(screen.getByText("Send reply"));
    const afterCount = useDemoStore.getState().messages.filter(
      (m) => m.conversationId === conv.id,
    ).length;
    expect(afterCount).toBe(beforeCount + 1);
    expect(useDemoStore.getState().getConversationDraft(conv.id)).toBe("");
  });

  it("discards the draft when the discard button is clicked", () => {
    useDemoStore.getState().setConversationDraft("cv-1", "A draft to discard");
    render(<Composer conversationId="cv-1" />);
    fireEvent.click(screen.getByText("Discard draft"));
    expect(useDemoStore.getState().getConversationDraft("cv-1")).toBe("");
    expect(screen.getByLabelText("Reply composer")).toHaveValue("");
  });

  it("does not send an empty reply on submit", () => {
    const addMessageSpy = vi.spyOn(useDemoStore.getState(), "addMessage");
    render(<Composer conversationId="cv-1" />);
    // Submit with empty draft (button is disabled, but verify form guard)
    const form = screen.getByLabelText("Reply composer").closest("form")!;
    fireEvent.submit(form);
    expect(addMessageSpy).not.toHaveBeenCalled();
    addMessageSpy.mockRestore();
  });

  it("sent reply appears as an outbound message marked simulated", () => {
    const conv = useDemoStore.getState().conversations[0];
    render(<Composer conversationId={conv.id} />);
    fireEvent.change(screen.getByLabelText("Reply composer"), {
      target: { value: "Simulated reply body" },
    });
    fireEvent.click(screen.getByText("Send reply"));
    const sent = useDemoStore
      .getState()
      .messages.filter((m) => m.conversationId === conv.id)
      .slice(-1)[0];
    expect(sent.direction).toBe("outbound");
    expect(sent.body).toBe("Simulated reply body");
    expect(sent.status).toBe("simulated");
  });
});
