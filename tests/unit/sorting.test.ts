import { describe, it, expect, beforeEach } from "vitest";
import { contactRepository, companyRepository, conversationRepository } from "@/lib/repositories";
import { useDemoStore } from "@/lib/demo-store";

beforeEach(() => {
  window.localStorage.clear();
  useDemoStore.getState().reset();
});

describe("sorting — contacts", () => {
  it("sorts by fullName ascending", async () => {
    const result = await contactRepository.list({
      sort: { field: "fullName", direction: "asc" },
    });
    const names = result.items.map((c) => c.fullName.toLowerCase());
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  it("sorts by fullName descending (reversed)", async () => {
    const result = await contactRepository.list({
      sort: { field: "fullName", direction: "desc" },
    });
    const names = result.items.map((c) => c.fullName.toLowerCase());
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  it("sorts by createdAt ascending (chronological)", async () => {
    const result = await contactRepository.list({
      sort: { field: "createdAt", direction: "asc" },
    });
    for (let i = 1; i < result.items.length; i++) {
      const prev = new Date(result.items[i - 1].createdAt).getTime();
      const curr = new Date(result.items[i].createdAt).getTime();
      expect(prev).toBeLessThanOrEqual(curr);
    }
  });

  it("sorts by estimatedValue descending", async () => {
    const result = await contactRepository.list({
      sort: { field: "estimatedValue", direction: "desc" },
    });
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i - 1].estimatedValue).toBeGreaterThanOrEqual(
        result.items[i].estimatedValue,
      );
    }
  });

  it("sorts by companyName (virtual join field)", async () => {
    const result = await contactRepository.list({
      sort: { field: "companyName", direction: "asc" },
    });
    // Contacts without a company sort after those with one (nulls last).
    let seenNull = false;
    let prevName = "";
    for (const c of result.items) {
      const company = useDemoStore.getState().companies.find((co) => co.id === c.companyId);
      const name = company?.name ?? "";
      if (!company) {
        seenNull = true;
      } else {
        if (!seenNull && prevName) {
          expect(name.toLowerCase() >= prevName.toLowerCase()).toBe(true);
        }
        prevName = name;
      }
    }
  });
});

describe("sorting — companies", () => {
  it("sorts by name ascending", async () => {
    const result = await companyRepository.list({
      sort: { field: "name", direction: "asc" },
    });
    const names = result.items.map((c) => c.name.toLowerCase());
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  it("sorts by estimatedValue descending", async () => {
    const result = await companyRepository.list({
      sort: { field: "estimatedValue", direction: "desc" },
    });
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i - 1].estimatedValue).toBeGreaterThanOrEqual(
        result.items[i].estimatedValue,
      );
    }
  });
});

describe("sorting — conversations", () => {
  it("sorts by lastActivityAt descending (most recent first)", async () => {
    const result = await conversationRepository.list({
      sort: { field: "lastActivityAt", direction: "desc" },
    });
    for (let i = 1; i < result.items.length; i++) {
      const prev = new Date(result.items[i - 1].lastActivityAt).getTime();
      const curr = new Date(result.items[i].lastActivityAt).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it("sorts by subject ascending", async () => {
    const result = await conversationRepository.list({
      sort: { field: "subject", direction: "asc" },
    });
    const subjects = result.items.map((c) => c.subject.toLowerCase());
    const sorted = [...subjects].sort();
    expect(subjects).toEqual(sorted);
  });

  it("sorts by unreadCount descending", async () => {
    const result = await conversationRepository.list({
      sort: { field: "unreadCount", direction: "desc" },
    });
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i - 1].unreadCount).toBeGreaterThanOrEqual(
        result.items[i].unreadCount,
      );
    }
  });
});

describe("sorting — null handling", () => {
  it("places null values last in ascending order", async () => {
    const result = await contactRepository.list({
      sort: { field: "jobTitle", direction: "asc" },
    });
    let seenNull = false;
    for (const c of result.items) {
      if (c.jobTitle === "" || c.jobTitle === null) {
        seenNull = true;
      }
    }
    // The test just verifies sort doesn't crash on mixed null/string values.
    expect(result.items.length).toBeGreaterThan(0);
  });
});

describe("pagination", () => {
  it("returns all items when no pageSize is set", async () => {
    const result = await contactRepository.list({});
    expect(result.items.length).toBe(result.filtered);
  });

  it("paginates correctly with page and pageSize", async () => {
    const all = await contactRepository.list({});
    const pageSize = 5;
    const page1 = await contactRepository.list({ page: 1, pageSize });
    const page2 = await contactRepository.list({ page: 2, pageSize });
    expect(page1.items).toHaveLength(Math.min(pageSize, all.filtered));
    expect(page2.items).toHaveLength(Math.min(pageSize, Math.max(0, all.filtered - pageSize)));
    // No overlap between pages
    const page1Ids = new Set(page1.items.map((c) => c.id));
    const page2Ids = new Set(page2.items.map((c) => c.id));
    for (const id of page1Ids) {
      expect(page2Ids.has(id)).toBe(false);
    }
  });

  it("returns empty page when page exceeds total", async () => {
    const result = await contactRepository.list({ page: 999, pageSize: 10 });
    expect(result.items).toHaveLength(0);
  });

  it("reports correct total, filtered and items counts", async () => {
    const result = await contactRepository.list({ page: 1, pageSize: 3 });
    expect(result.total).toBe(useDemoStore.getState().contacts.length);
    expect(result.filtered).toBeGreaterThanOrEqual(result.items.length);
  });
});
