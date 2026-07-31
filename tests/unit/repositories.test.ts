import { describe, it, expect, beforeEach } from "vitest";
import {
  contactRepository,
  companyRepository,
  conversationRepository,
} from "@/lib/repositories";
import { useDemoStore } from "@/lib/demo-store";

/**
 * Repository tests exercise the async interfaces that components and server
 * actions will consume. Each test starts from the deterministic seed by
 * clearing localStorage (handled by tests/setup.ts) and resetting the store.
 */
beforeEach(() => {
  useDemoStore.getState().reset();
});

describe("ContactRepository", () => {
  it("lists non-archived contacts by default", async () => {
    const result = await contactRepository.list({});
    const archived = result.items.filter((c) => c.archived);
    expect(archived).toHaveLength(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.filtered).toBe(result.items.length);
  });

  it("includes archived contacts when the archived filter is true", async () => {
    const result = await contactRepository.list({
      filters: { archived: true },
    });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((c) => c.archived)).toBe(true);
  });

  it("getById returns null for an unknown id", async () => {
    const contact = await contactRepository.getById("does-not-exist");
    expect(contact).toBeNull();
  });

  it("create then getById round-trips the new contact", async () => {
    const created = await contactRepository.create({
      fullName: "Test Person",
      jobTitle: "Engineer",
      primaryEmail: "test.person@example.com",
      primaryPhone: "+1 555 9999",
    });
    expect(created.id).toBeTruthy();
    const fetched = await contactRepository.getById(created.id);
    expect(fetched?.fullName).toBe("Test Person");
    expect(fetched?.archived).toBe(false);
  });

  it("update changes the contact and bumps updatedAt", async () => {
    const before = await contactRepository.list({});
    const id = before.items[0].id;
    const originalUpdatedAt = before.items[0].updatedAt;
    await contactRepository.update(id, { jobTitle: "Updated Title" });
    const after = await contactRepository.getById(id);
    expect(after?.jobTitle).toBe("Updated Title");
    expect(after?.updatedAt).not.toBe(originalUpdatedAt);
  });

  it("archive hides the contact from the default list", async () => {
    const before = await contactRepository.list({});
    const id = before.items[0].id;
    await contactRepository.archive(id);
    const after = await contactRepository.list({});
    expect(after.items.find((c) => c.id === id)).toBeUndefined();
    const archived = await contactRepository.list({ filters: { archived: true } });
    expect(archived.items.find((c) => c.id === id)).toBeDefined();
  });

  it("restore brings the contact back into the default list", async () => {
    const before = await contactRepository.list({});
    const id = before.items[0].id;
    await contactRepository.archive(id);
    await contactRepository.restore(id);
    const after = await contactRepository.list({});
    expect(after.items.find((c) => c.id === id)).toBeDefined();
  });

  it("search finds contacts by diacritic-insensitive name match", async () => {
    const result = await contactRepository.list({
      filters: { query: "alvarez" },
    });
    expect(result.items.some((c) => c.fullName.includes("Álvarez"))).toBe(true);
  });

  it("search matches across company name", async () => {
    const result = await contactRepository.list({
      filters: { query: "northbridge" },
    });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((c) => c.fullName.length > 0)).toBe(true);
  });

  it("filters by leadStage (array form)", async () => {
    const result = await contactRepository.list({
      filters: { leadStage: ["customer", "opportunity"] },
    });
    expect(
      result.items.every((c) => c.leadStage === "customer" || c.leadStage === "opportunity"),
    ).toBe(true);
  });

  it("filters by tag", async () => {
    const result = await contactRepository.list({
      filters: { tag: "decision-maker" },
    });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((c) => c.tags.includes("decision-maker"))).toBe(true);
  });

  it("addTag and removeTag mutate the contact tag list", async () => {
    const before = await contactRepository.list({});
    const id = before.items[0].id;
    await contactRepository.addTag(id, "phase-8-test");
    let after = await contactRepository.getById(id);
    expect(after?.tags).toContain("phase-8-test");
    await contactRepository.removeTag(id, "phase-8-test");
    after = await contactRepository.getById(id);
    expect(after?.tags).not.toContain("phase-8-test");
  });

  it("merge re-parents the source's conversations, calls and follow-ups to the target", async () => {
    // Pick two contacts where the source has at least one conversation.
    const target = await contactRepository.getById("ct-1");
    const source = await contactRepository.getById("ct-6"); // has cv-2
    expect(target).toBeTruthy();
    expect(source).toBeTruthy();

    const sourceConvBefore = await conversationRepository.list({
      filters: { contactId: source!.id },
    });
    expect(sourceConvBefore.items.length).toBeGreaterThan(0);

    const merged = await contactRepository.merge({
      targetId: target!.id,
      sourceId: source!.id,
      fieldChoices: { jobTitle: "Merged Title" },
    });
    expect(merged.id).toBe(target!.id);

    // Source is now archived.
    const sourceAfter = await contactRepository.getById(source!.id);
    expect(sourceAfter?.archived).toBe(true);

    // The source's conversations now point to the target.
    const sourceConvAfter = await conversationRepository.list({
      filters: { contactId: source!.id },
    });
    expect(sourceConvAfter.items.length).toBe(0);

    const targetConvAfter = await conversationRepository.list({
      filters: { contactId: target!.id },
    });
    expect(targetConvAfter.items.length).toBeGreaterThanOrEqual(sourceConvBefore.items.length);

    // Target retains the explicit field choice.
    const targetAfter = await contactRepository.getById(target!.id);
    expect(targetAfter?.jobTitle).toBe("Merged Title");
  });

  it("pagination returns a subset", async () => {
    const page1 = await contactRepository.list({ page: 1, pageSize: 3 });
    const page2 = await contactRepository.list({ page: 2, pageSize: 3 });
    expect(page1.items).toHaveLength(3);
    expect(page2.items).toHaveLength(3);
    expect(page1.items[0].id).not.toBe(page2.items[0].id);
  });
});

describe("CompanyRepository", () => {
  it("lists all companies", async () => {
    const result = await companyRepository.list({});
    expect(result.total).toBeGreaterThanOrEqual(10);
  });

  it("getById returns null for an unknown id", async () => {
    expect(await companyRepository.getById("nope")).toBeNull();
  });

  it("create then update round-trips", async () => {
    const created = await companyRepository.create({
      name: "Test Company",
      industry: "managed_it_services",
    });
    expect(created.id).toBeTruthy();
    await companyRepository.update(created.id, { customerStatus: "active" });
    const fetched = await companyRepository.getById(created.id);
    expect(fetched?.customerStatus).toBe("active");
  });

  it("filters by industry", async () => {
    const result = await companyRepository.list({
      filters: { industry: ["cybersecurity", "cloud_migration"] },
    });
    expect(
      result.items.every(
        (c) => c.industry === "cybersecurity" || c.industry === "cloud_migration",
      ),
    ).toBe(true);
  });

  it("search matches company name with diacritics stripped", async () => {
    const result = await companyRepository.list({ filters: { query: "northbridge" } });
    expect(result.items.some((c) => c.name === "Northbridge Systems")).toBe(true);
  });
});

describe("ConversationRepository", () => {
  it("lists all conversations", async () => {
    const result = await conversationRepository.list({});
    expect(result.total).toBeGreaterThan(0);
  });

  it("getById returns null for an unknown id", async () => {
    expect(await conversationRepository.getById("nope")).toBeNull();
  });

  it("filters by status", async () => {
    const result = await conversationRepository.list({
      filters: { status: ["unassigned"] },
    });
    expect(result.items.every((c) => c.status === "unassigned")).toBe(true);
  });

  it("filters by assigneeId null (unassigned)", async () => {
    const result = await conversationRepository.list({
      filters: { assigneeId: null },
    });
    expect(result.items.every((c) => c.assigneeId === null)).toBe(true);
  });

  it("filters unreadOnly", async () => {
    const result = await conversationRepository.list({ filters: { unreadOnly: true } });
    expect(result.items.every((c) => c.unreadCount > 0)).toBe(true);
  });

  it("filters by contactId", async () => {
    const result = await conversationRepository.list({ filters: { contactId: "ct-6" } });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((c) => c.contactId === "ct-6")).toBe(true);
  });

  it("filters by companyId", async () => {
    const result = await conversationRepository.list({ filters: { companyId: "co-5" } });
    expect(result.items.every((c) => c.companyId === "co-5")).toBe(true);
  });

  it("search matches subject or contact name", async () => {
    const bySubject = await conversationRepository.list({
      filters: { query: "pricing" },
    });
    expect(bySubject.items.length).toBeGreaterThan(0);
    const byContact = await conversationRepository.list({
      filters: { query: "tobias" },
    });
    expect(byContact.items.length).toBeGreaterThan(0);
  });

  it("update changes status and priority", async () => {
    const before = await conversationRepository.list({});
    const id = before.items[0].id;
    await conversationRepository.update(id, { status: "closed", priority: "low" });
    const after = await conversationRepository.getById(id);
    expect(after?.status).toBe("closed");
    expect(after?.priority).toBe("low");
  });

  it("assignConversation sets the assignee", async () => {
    const before = await conversationRepository.list({});
    const id = before.items[0].id;
    await conversationRepository.update(id, { assigneeId: "u-2" });
    const after = await conversationRepository.getById(id);
    expect(after?.assigneeId).toBe("u-2");
  });

  it("addMessage appends an outbound message and updates preview", async () => {
    const before = await conversationRepository.list({});
    const conv = before.items[0];
    const msgCountBefore = useDemoStore.getState().messages.filter(
      (m) => m.conversationId === conv.id,
    ).length;
    const message = await conversationRepository.addMessage({
      conversationId: conv.id,
      body: "Repository-driven reply body.",
    });
    expect(message.direction).toBe("outbound");
    const msgCountAfter = useDemoStore.getState().messages.filter(
      (m) => m.conversationId === conv.id,
    ).length;
    expect(msgCountAfter).toBe(msgCountBefore + 1);
    const after = await conversationRepository.getById(conv.id);
    expect(after?.preview).toContain("Repository-driven reply body.");
  });

  it("addInternalNote appends an internal note (never outbound)", async () => {
    const before = await conversationRepository.list({});
    const conv = before.items[0];
    const note = await conversationRepository.addInternalNote({
      conversationId: conv.id,
      body: "Internal coordination note.",
    });
    expect(note.direction).toBe("internal");
    expect(note.channel).toBe("internal");
  });

  it("bulkUpdate changes status for multiple conversations", async () => {
    const before = await conversationRepository.list({});
    const ids = before.items.slice(0, 2).map((c) => c.id);
    await conversationRepository.bulkUpdate({ ids, patch: { status: "closed" } });
    const after = await conversationRepository.list({
      filters: { status: ["closed"] },
    });
    expect(ids.every((id) => after.items.some((c) => c.id === id))).toBe(true);
  });

  it("markRead zeroes unreadCount", async () => {
    const before = await conversationRepository.list({ filters: { unreadOnly: true } });
    if (before.items.length === 0) return;
    const id = before.items[0].id;
    await conversationRepository.markRead(id);
    const after = await conversationRepository.getById(id);
    expect(after?.unreadCount).toBe(0);
  });

  it("markUnread sets unreadCount to at least 1", async () => {
    const before = await conversationRepository.list({});
    const id = before.items[0].id;
    await conversationRepository.markUnread(id);
    const after = await conversationRepository.getById(id);
    expect(after?.unreadCount).toBeGreaterThanOrEqual(1);
  });

  it("snooze sets status to snoozed", async () => {
    const before = await conversationRepository.list({});
    const id = before.items[0].id;
    await conversationRepository.snooze(id);
    const after = await conversationRepository.getById(id);
    expect(after?.status).toBe("snoozed");
  });

  it("drafts persist through the repository", async () => {
    const before = await conversationRepository.list({});
    const id = before.items[0].id;
    expect(await conversationRepository.getDraft(id)).toBe("");
    await conversationRepository.setDraft(id, "draft body");
    expect(await conversationRepository.getDraft(id)).toBe("draft body");
    await conversationRepository.clearDraft(id);
    expect(await conversationRepository.getDraft(id)).toBe("");
  });
});
