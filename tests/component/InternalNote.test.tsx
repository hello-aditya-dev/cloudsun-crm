import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useDemoStore } from "@/lib/demo-store";

beforeEach(() => {
  window.localStorage.clear();
  useDemoStore.getState().reset();
});

/**
 * Minimal internal-note composer that mirrors the InboxView internal note
 * composer. It uses addInternalNote (distinct from addMessage) so the note
 * is recorded on the internal channel and does not change the conversation
 * preview.
 */
function InternalNoteComposer({ conversationId }: { conversationId: string }) {
  const [body, setBody] = React.useState("");
  const addInternalNote = useDemoStore((s) => s.addInternalNote);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        addInternalNote({ conversationId, body });
        setBody("");
      }}
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add an internal note…"
        aria-label="Internal note composer"
      />
      <button type="submit" disabled={!body.trim()}>
        Add note
      </button>
    </form>
  );
}

import * as React from "react";

describe("InternalNoteComposer", () => {
  it("renders an empty textarea by default", () => {
    render(<InternalNoteComposer conversationId="cv-1" />);
    expect(screen.getByLabelText("Internal note composer")).toHaveValue("");
  });

  it("disables the submit button when the note is empty", () => {
    render(<InternalNoteComposer conversationId="cv-1" />);
    expect(screen.getByText("Add note")).toBeDisabled();
  });

  it("adds an internal note when submitted", () => {
    const conv = useDemoStore.getState().conversations[0];
    const beforeCount = useDemoStore.getState().messages.filter(
      (m) => m.conversationId === conv.id,
    ).length;
    render(<InternalNoteComposer conversationId={conv.id} />);
    fireEvent.change(screen.getByLabelText("Internal note composer"), {
      target: { value: "Follow up with the automation team" },
    });
    fireEvent.click(screen.getByText("Add note"));
    const afterCount = useDemoStore.getState().messages.filter(
      (m) => m.conversationId === conv.id,
    ).length;
    expect(afterCount).toBe(beforeCount + 1);
  });

  it("creates the note on the internal channel with direction internal", () => {
    const conv = useDemoStore.getState().conversations[0];
    render(<InternalNoteComposer conversationId={conv.id} />);
    fireEvent.change(screen.getByLabelText("Internal note composer"), {
      target: { value: "Internal context note" },
    });
    fireEvent.click(screen.getByText("Add note"));
    const note = useDemoStore
      .getState()
      .messages.filter((m) => m.conversationId === conv.id)
      .slice(-1)[0];
    expect(note.channel).toBe("internal");
    expect(note.direction).toBe("internal");
    expect(note.body).toBe("Internal context note");
  });

  it("clears the textarea after submitting", () => {
    const conv = useDemoStore.getState().conversations[0];
    render(<InternalNoteComposer conversationId={conv.id} />);
    fireEvent.change(screen.getByLabelText("Internal note composer"), {
      target: { value: "A note" },
    });
    fireEvent.click(screen.getByText("Add note"));
    expect(screen.getByLabelText("Internal note composer")).toHaveValue("");
  });

  it("does not change the conversation preview (unlike an outbound reply)", () => {
    const conv = useDemoStore.getState().conversations[0];
    const previewBefore = conv.preview;
    render(<InternalNoteComposer conversationId={conv.id} />);
    fireEvent.change(screen.getByLabelText("Internal note composer"), {
      target: { value: "This should not become the preview" },
    });
    fireEvent.click(screen.getByText("Add note"));
    const updated = useDemoStore.getState().conversations.find((c) => c.id === conv.id);
    expect(updated?.preview).toBe(previewBefore);
  });

  it("logs an internal_note activity event", () => {
    const conv = useDemoStore.getState().conversations[0];
    const activitiesBefore = useDemoStore.getState().activityEvents.filter(
      (a) => a.conversationId === conv.id && a.type === "internal_note",
    ).length;
    render(<InternalNoteComposer conversationId={conv.id} />);
    fireEvent.change(screen.getByLabelText("Internal note composer"), {
      target: { value: "Note for activity log" },
    });
    fireEvent.click(screen.getByText("Add note"));
    const activitiesAfter = useDemoStore.getState().activityEvents.filter(
      (a) => a.conversationId === conv.id && a.type === "internal_note",
    ).length;
    expect(activitiesAfter).toBe(activitiesBefore + 1);
  });

  it("does not submit an empty note", () => {
    const addInternalNoteSpy = vi.spyOn(useDemoStore.getState(), "addInternalNote");
    render(<InternalNoteComposer conversationId="cv-1" />);
    const form = screen.getByLabelText("Internal note composer").closest("form")!;
    fireEvent.submit(form);
    expect(addInternalNoteSpy).not.toHaveBeenCalled();
    addInternalNoteSpy.mockRestore();
  });
});
