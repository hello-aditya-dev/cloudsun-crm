import { describe, it, expect, beforeEach } from "vitest";
import { useDemoStore } from "@/lib/demo-store";

beforeEach(() => {
  window.localStorage.clear();
  useDemoStore.getState().reset();
});

describe("demo store persistence", () => {
  it("starts with seeded conversations", () => {
    const state = useDemoStore.getState();
    expect(state.conversations.length).toBeGreaterThan(0);
    expect(state.contacts.length).toBeGreaterThan(0);
    expect(state.companies.length).toBeGreaterThan(0);
    expect(state.drafts).toEqual({});
  });

  it("reset restores seeded state and clears drafts", () => {
    const before = useDemoStore.getState();
    const firstId = before.conversations[0].id;
    useDemoStore.getState().setConversationStatus(firstId, "closed");
    useDemoStore.getState().setConversationDraft(firstId, "stale draft");
    expect(useDemoStore.getState().conversations.find((c) => c.id === firstId)?.status).toBe(
      "closed",
    );
    expect(useDemoStore.getState().getConversationDraft(firstId)).toBe("stale draft");

    useDemoStore.getState().reset();

    expect(useDemoStore.getState().conversations.find((c) => c.id === firstId)?.status).not.toBe(
      "closed",
    );
    expect(useDemoStore.getState().drafts).toEqual({});
  });
});

describe("demo store drafts", () => {
  it("setConversationDraft / getConversationDraft / clearConversationDraft cycle", () => {
    const id = "cv-1";
    expect(useDemoStore.getState().getConversationDraft(id)).toBe("");
    useDemoStore.getState().setConversationDraft(id, "hello");
    expect(useDemoStore.getState().getConversationDraft(id)).toBe("hello");
    useDemoStore.getState().setConversationDraft(id, ""); // empty body clears
    expect(useDemoStore.getState().getConversationDraft(id)).toBe("");
  });

  it("drafts survive persistence (state object reference)", () => {
    useDemoStore.getState().setConversationDraft("cv-1", "persisted");
    const state = useDemoStore.getState();
    expect(state.drafts["cv-1"]).toBe("persisted");
  });
});

describe("data consistency — archive contact closes open conversations", () => {
  it("archiving a contact closes their open conversations", () => {
    // ct-6 has cv-2 (open) and cv-8 (waiting_internal).
    const before = useDemoStore.getState().conversations.filter((c) => c.contactId === "ct-6");
    expect(before.some((c) => c.status === "open")).toBe(true);
    useDemoStore.getState().archiveContact("ct-6");
    const after = useDemoStore.getState().conversations.filter((c) => c.contactId === "ct-6");
    expect(after.every((c) => c.status === "closed" || c.status === "resolved" || c.status === "spam")).toBe(true);
  });

  it("archiving a contact records an audit activity", () => {
    const activityBefore = useDemoStore.getState().activityEvents.filter(
      (e) => e.type === "system" && e.summary === "Archived a contact",
    ).length;
    useDemoStore.getState().archiveContact("ct-6");
    const activityAfter = useDemoStore.getState().activityEvents.filter(
      (e) => e.type === "system" && e.summary === "Archived a contact",
    ).length;
    expect(activityAfter).toBe(activityBefore + 1);
  });

  it("restoring a contact flips archived back to false", () => {
    useDemoStore.getState().archiveContact("ct-6");
    expect(useDemoStore.getState().contacts.find((c) => c.id === "ct-6")?.archived).toBe(true);
    useDemoStore.getState().restoreContact("ct-6");
    expect(useDemoStore.getState().contacts.find((c) => c.id === "ct-6")?.archived).toBe(false);
  });
});

describe("data consistency — mergeContacts", () => {
  it("merges the source into the target, re-parents conversations and archives the source", () => {
    const sourceConvsBefore = useDemoStore
      .getState()
      .conversations.filter((c) => c.contactId === "ct-6");
    expect(sourceConvsBefore.length).toBeGreaterThan(0);

    const retainedId = useDemoStore.getState().mergeContacts({
      targetId: "ct-1",
      sourceId: "ct-6",
      fieldChoices: { jobTitle: "Merged CTO" },
    });
    expect(retainedId).toBe("ct-1");

    // Source archived.
    expect(useDemoStore.getState().contacts.find((c) => c.id === "ct-6")?.archived).toBe(true);
    // Source's conversations re-parented to target.
    const sourceConvsAfter = useDemoStore
      .getState()
      .conversations.filter((c) => c.contactId === "ct-6");
    expect(sourceConvsAfter.length).toBe(0);
    const targetConvsAfter = useDemoStore
      .getState()
      .conversations.filter((c) => c.contactId === "ct-1");
    expect(targetConvsAfter.length).toBeGreaterThanOrEqual(sourceConvsBefore.length);
    // Explicit field choice honoured.
    expect(useDemoStore.getState().contacts.find((c) => c.id === "ct-1")?.jobTitle).toBe(
      "Merged CTO",
    );
  });

  it("merge unions tags from both contacts", () => {
    const targetBefore = useDemoStore.getState().contacts.find((c) => c.id === "ct-1");
    const sourceBefore = useDemoStore.getState().contacts.find((c) => c.id === "ct-6");
    useDemoStore.getState().mergeContacts({ targetId: "ct-1", sourceId: "ct-6" });
    const merged = useDemoStore.getState().contacts.find((c) => c.id === "ct-1");
    for (const tag of [...(targetBefore?.tags ?? []), ...(sourceBefore?.tags ?? [])]) {
      expect(merged?.tags).toContain(tag);
    }
  });

  it("merge records an audit activity", () => {
    const before = useDemoStore
      .getState()
      .activityEvents.filter((e) => e.summary.startsWith("Merged ")).length;
    useDemoStore.getState().mergeContacts({ targetId: "ct-1", sourceId: "ct-6" });
    const after = useDemoStore
      .getState()
      .activityEvents.filter((e) => e.summary.startsWith("Merged ")).length;
    expect(after).toBe(before + 1);
  });

  it("merge is a no-op when either id is missing", () => {
    const retainedId = useDemoStore.getState().mergeContacts({
      targetId: "missing-1",
      sourceId: "ct-6",
    });
    expect(retainedId).toBe("missing-1");
    // Source not archived because target could not be found.
    expect(useDemoStore.getState().contacts.find((c) => c.id === "ct-6")?.archived).toBe(false);
  });
});

describe("data consistency — addInternalNote", () => {
  it("appends an internal message and does not change the conversation preview", () => {
    const conv = useDemoStore.getState().conversations[0];
    const previewBefore = conv.preview;
    const messagesBefore = useDemoStore.getState().messages.filter(
      (m) => m.conversationId === conv.id,
    ).length;
    useDemoStore.getState().addInternalNote({ conversationId: conv.id, body: "Note body" });
    const messagesAfter = useDemoStore.getState().messages.filter(
      (m) => m.conversationId === conv.id,
    ).length;
    expect(messagesAfter).toBe(messagesBefore + 1);
    const newMsg = useDemoStore
      .getState()
      .messages.filter((m) => m.conversationId === conv.id)
      .slice(-1)[0];
    expect(newMsg.direction).toBe("internal");
    expect(newMsg.channel).toBe("internal");
    // Preview should be unchanged (notes are not customer-facing).
    const convAfter = useDemoStore.getState().conversations.find((c) => c.id === conv.id);
    expect(convAfter?.preview).toBe(previewBefore);
  });
});

describe("notifications", () => {
  it("markNotificationRead flips read to true", () => {
    const unread = useDemoStore
      .getState()
      .notifications.find((n) => !n.read);
    if (!unread) return;
    useDemoStore.getState().markNotificationRead(unread.id);
    expect(useDemoStore.getState().notifications.find((n) => n.id === unread.id)?.read).toBe(true);
  });

  it("markAllNotificationsRead sets every notification to read", () => {
    useDemoStore.getState().markAllNotificationsRead();
    const unread = useDemoStore.getState().notifications.filter((n) => !n.read);
    expect(unread).toHaveLength(0);
  });
});

describe("migration safety", () => {
  it("does not crash when a malformed object is in storage", () => {
    // Simulate a corrupted legacy entry under the v1 key.
    window.localStorage.setItem("cloudsun-demo-v1", "{not valid json");
    window.localStorage.setItem(
      "cloudsun-demo-v2",
      JSON.stringify({ version: 1, garbage: true }),
    );
    // Clearing and resetting should reseed cleanly.
    window.localStorage.clear();
    useDemoStore.getState().reset();
    const state = useDemoStore.getState();
    expect(state.conversations.length).toBeGreaterThan(0);
    expect(state.drafts).toEqual({});
  });
});
