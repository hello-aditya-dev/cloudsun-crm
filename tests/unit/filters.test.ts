import { describe, it, expect, beforeEach } from "vitest";
import { contactRepository, companyRepository, conversationRepository } from "@/lib/repositories";
import { useDemoStore } from "@/lib/demo-store";

beforeEach(() => {
  window.localStorage.clear();
  useDemoStore.getState().reset();
});

describe("contact filters", () => {
  it("hides archived contacts by default", async () => {
    const all = await contactRepository.list({});
    const archivedCount = all.items.filter((c) => c.archived).length;
    expect(archivedCount).toBe(0);
  });

  it("returns archived contacts when archived:true filter is set", async () => {
    const result = await contactRepository.list({ filters: { archived: true } });
    expect(result.items.every((c) => c.archived)).toBe(true);
    expect(result.filtered).toBeGreaterThan(0);
  });

  it("filters by single leadStage", async () => {
    const result = await contactRepository.list({ filters: { leadStage: "customer" } });
    expect(result.items.every((c) => c.leadStage === "customer")).toBe(true);
  });

  it("filters by multiple leadStages (array)", async () => {
    const result = await contactRepository.list({
      filters: { leadStage: ["new", "qualified"] },
    });
    expect(result.items.every((c) => c.leadStage === "new" || c.leadStage === "qualified")).toBe(true);
  });

  it("filters by companyId", async () => {
    const all = await contactRepository.list({});
    const sample = all.items[0];
    const result = await contactRepository.list({ filters: { companyId: sample.companyId } });
    expect(result.items.every((c) => c.companyId === sample.companyId)).toBe(true);
  });

  it("filters by ownerId", async () => {
    const all = await contactRepository.list({});
    const ownerId = all.items[0].ownerId;
    const result = await contactRepository.list({ filters: { ownerId } });
    expect(result.items.every((c) => c.ownerId === ownerId)).toBe(true);
  });

  it("filters by priority", async () => {
    const result = await contactRepository.list({ filters: { priority: "high" } });
    expect(result.items.every((c) => c.priority === "high")).toBe(true);
  });

  it("filters by tag", async () => {
    const all = await contactRepository.list({});
    const contactWithTag = all.items.find((c) => c.tags.length > 0);
    if (!contactWithTag) return; // skip if no tagged contacts
    const tag = contactWithTag.tags[0];
    const result = await contactRepository.list({ filters: { tag } });
    expect(result.items.every((c) => c.tags.includes(tag))).toBe(true);
  });

  it("filters by marketingConsent", async () => {
    const result = await contactRepository.list({ filters: { marketingConsent: false } });
    expect(result.items.every((c) => c.marketingConsent === false)).toBe(true);
  });

  it("filters by doNotContact", async () => {
    const result = await contactRepository.list({ filters: { doNotContact: true } });
    expect(result.items.every((c) => c.doNotContact === true)).toBe(true);
  });

  it("search is diacritic-insensitive", async () => {
    const result = await contactRepository.list({ filters: { query: "ostergren" } });
    expect(result.items.length).toBeGreaterThan(0);
    const hasDiacritic = result.items.some((c) =>
      c.fullName.toLowerCase().includes("ö") || c.fullName.toLowerCase().includes("ostergren"),
    );
    expect(hasDiacritic).toBe(true);
  });

  it("search matches across contact name and company name", async () => {
    const all = await contactRepository.list({});
    const sample = all.items[0];
    const result = await contactRepository.list({ filters: { query: sample.fullName.split(" ")[0] } });
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("combined filters narrow results", async () => {
    const result = await contactRepository.list({
      filters: { leadStage: "customer", priority: "normal" },
    });
    expect(result.items.every((c) => c.leadStage === "customer" && c.priority === "normal")).toBe(true);
  });
});

describe("company filters", () => {
  it("filters by industry", async () => {
    const result = await companyRepository.list({ filters: { industry: "cybersecurity" } });
    expect(result.items.every((c) => c.industry === "cybersecurity")).toBe(true);
  });

  it("filters by customerStatus", async () => {
    const result = await companyRepository.list({ filters: { customerStatus: "active" } });
    expect(result.items.every((c) => c.customerStatus === "active")).toBe(true);
  });

  it("filters by accountOwnerId", async () => {
    const all = await companyRepository.list({});
    const ownerId = all.items[0].accountOwnerId;
    const result = await companyRepository.list({ filters: { accountOwnerId: ownerId } });
    expect(result.items.every((c) => c.accountOwnerId === ownerId)).toBe(true);
  });

  it("searches by company name", async () => {
    const all = await companyRepository.list({});
    const sample = all.items[0];
    const result = await companyRepository.list({ filters: { query: sample.name.split(" ")[0] } });
    expect(result.items.length).toBeGreaterThan(0);
  });
});

describe("conversation filters", () => {
  it("filters by status", async () => {
    const result = await conversationRepository.list({ filters: { status: "open" } });
    expect(result.items.every((c) => c.status === "open")).toBe(true);
  });

  it("filters by multiple statuses (array)", async () => {
    const result = await conversationRepository.list({
      filters: { status: ["open", "resolved"] },
    });
    expect(result.items.every((c) => c.status === "open" || c.status === "resolved")).toBe(true);
  });

  it("filters by priority", async () => {
    const result = await conversationRepository.list({ filters: { priority: "urgent" } });
    expect(result.items.every((c) => c.priority === "urgent")).toBe(true);
  });

  it("filters by channel", async () => {
    const result = await conversationRepository.list({ filters: { channel: "email" } });
    expect(result.items.every((c) => c.channel === "email")).toBe(true);
  });

  it("filters unassigned conversations (assigneeId null)", async () => {
    const result = await conversationRepository.list({ filters: { assigneeId: null } });
    expect(result.items.every((c) => c.assigneeId === null)).toBe(true);
  });

  it("filters by assigneeId", async () => {
    const all = await conversationRepository.list({});
    const assigned = all.items.find((c) => c.assigneeId !== null);
    if (!assigned || !assigned.assigneeId) return;
    const result = await conversationRepository.list({ filters: { assigneeId: assigned.assigneeId } });
    expect(result.items.every((c) => c.assigneeId === assigned.assigneeId)).toBe(true);
  });

  it("filters unreadOnly", async () => {
    const result = await conversationRepository.list({ filters: { unreadOnly: true } });
    expect(result.items.every((c) => c.unreadCount > 0)).toBe(true);
  });

  it("filters by contactId", async () => {
    const all = await conversationRepository.list({});
    const contactId = all.items[0].contactId;
    const result = await conversationRepository.list({ filters: { contactId } });
    expect(result.items.every((c) => c.contactId === contactId)).toBe(true);
  });

  it("filters by companyId", async () => {
    const all = await conversationRepository.list({});
    const withCompany = all.items.find((c) => c.companyId);
    if (!withCompany || !withCompany.companyId) return;
    const result = await conversationRepository.list({ filters: { companyId: withCompany.companyId } });
    expect(result.items.every((c) => c.companyId === withCompany.companyId)).toBe(true);
  });

  it("filters by tag", async () => {
    const all = await conversationRepository.list({});
    const withTag = all.items.find((c) => c.tags.length > 0);
    if (!withTag) return;
    const tag = withTag.tags[0];
    const result = await conversationRepository.list({ filters: { tag } });
    expect(result.items.every((c) => c.tags.includes(tag))).toBe(true);
  });

  it("searches by subject and contact name", async () => {
    const all = await conversationRepository.list({});
    const sample = all.items[0];
    const token = sample.subject.split(" ")[0];
    const result = await conversationRepository.list({ filters: { query: token } });
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("resolves live SLA state for filtering", async () => {
    const result = await conversationRepository.list({ filters: { slaState: "paused" } });
    expect(result.items.length).toBeGreaterThan(0);
  });
});
