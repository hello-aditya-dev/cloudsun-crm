import { describe, it, expect } from "vitest";
import {
  computeSlaState,
  resolveSlaState,
  describeSlaState,
  slaMinutesRemaining,
} from "@/lib/sla";
import type { Conversation } from "@/types/domain";

const NOW = new Date("2026-01-15T12:00:00.000Z");
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe("computeSlaState", () => {
  it("returns 'paused' when paused is true regardless of dueAt", () => {
    const past = new Date(NOW.getTime() - HOUR).toISOString();
    expect(computeSlaState(past, NOW, true)).toBe("paused");
  });

  it("returns 'safe' when dueAt is null (no SLA)", () => {
    expect(computeSlaState(null, NOW)).toBe("safe");
  });

  it("returns 'safe' for an invalid dueAt", () => {
    expect(computeSlaState("not-a-date", NOW)).toBe("safe");
  });

  it("returns 'breached' when the deadline has passed", () => {
    const past = new Date(NOW.getTime() - HOUR).toISOString();
    expect(computeSlaState(past, NOW, false, new Date(NOW.getTime() - DAY).toISOString())).toBe(
      "breached",
    );
  });

  it("returns 'at_risk' when less than 25% of the window remains", () => {
    // Window 100 hours, 20 hours remaining (20%).
    const createdAt = new Date(NOW.getTime() - 80 * HOUR).toISOString();
    const dueAt = new Date(NOW.getTime() + 20 * HOUR).toISOString();
    expect(computeSlaState(dueAt, NOW, false, createdAt)).toBe("at_risk");
  });

  it("returns 'approaching' when 25–50% of the window remains", () => {
    // Window 100 hours, 40 hours remaining (40%).
    const createdAt = new Date(NOW.getTime() - 60 * HOUR).toISOString();
    const dueAt = new Date(NOW.getTime() + 40 * HOUR).toISOString();
    expect(computeSlaState(dueAt, NOW, false, createdAt)).toBe("approaching");
  });

  it("returns 'safe' when more than 50% of the window remains", () => {
    const createdAt = new Date(NOW.getTime() - 10 * HOUR).toISOString();
    const dueAt = new Date(NOW.getTime() + 90 * HOUR).toISOString();
    expect(computeSlaState(dueAt, NOW, false, createdAt)).toBe("safe");
  });

  it("falls back to absolute bands when no createdAt is supplied", () => {
    const oneHourLeft = new Date(NOW.getTime() + HOUR).toISOString();
    expect(computeSlaState(oneHourLeft, NOW)).toBe("at_risk");
    const fourHoursLeft = new Date(NOW.getTime() + 4 * HOUR).toISOString();
    expect(computeSlaState(fourHoursLeft, NOW)).toBe("approaching");
    const twoDaysLeft = new Date(NOW.getTime() + 2 * DAY).toISOString();
    expect(computeSlaState(twoDaysLeft, NOW)).toBe("safe");
  });
});

describe("resolveSlaState", () => {
  const baseConversation: Conversation = {
    id: "cv-x",
    contactId: "ct-1",
    companyId: "co-1",
    channel: "email",
    subject: "Test",
    preview: "",
    status: "open",
    priority: "normal",
    assigneeId: null,
    teamId: null,
    slaState: "safe",
    slaDueAt: null,
    unreadCount: 0,
    sentiment: null,
    tags: [],
    relatedCallId: null,
    relatedFollowUpId: null,
    lastActivityAt: "2026-01-10T00:00:00.000Z",
    createdAt: "2026-01-10T00:00:00.000Z",
  };

  it("respects the stored 'paused' slaState even with a past dueAt", () => {
    const conv: Conversation = {
      ...baseConversation,
      slaState: "paused",
      slaDueAt: new Date(NOW.getTime() - HOUR).toISOString(),
    };
    expect(resolveSlaState(conv, NOW)).toBe("paused");
  });

  it("treats snoozed conversations as paused", () => {
    const conv: Conversation = {
      ...baseConversation,
      status: "snoozed",
      slaState: "safe",
      slaDueAt: new Date(NOW.getTime() - HOUR).toISOString(),
    };
    expect(resolveSlaState(conv, NOW)).toBe("paused");
  });

  it("treats waiting_customer conversations as paused", () => {
    const conv: Conversation = {
      ...baseConversation,
      status: "waiting_customer",
      slaState: "safe",
      slaDueAt: new Date(NOW.getTime() - HOUR).toISOString(),
    };
    expect(resolveSlaState(conv, NOW)).toBe("paused");
  });

  it("reports breached when dueAt has passed and the conversation is active", () => {
    const conv: Conversation = {
      ...baseConversation,
      slaState: "safe",
      slaDueAt: new Date(NOW.getTime() - HOUR).toISOString(),
      createdAt: new Date(NOW.getTime() - DAY).toISOString(),
    };
    expect(resolveSlaState(conv, NOW)).toBe("breached");
  });
});

describe("describeSlaState", () => {
  it("returns a non-empty, human-readable explanation for every state", () => {
    const states = ["safe", "approaching", "at_risk", "breached", "paused"] as const;
    for (const s of states) {
      const desc = describeSlaState(s);
      expect(desc).toBeTruthy();
      expect(desc.length).toBeGreaterThan(10);
    }
  });
});

describe("slaMinutesRemaining", () => {
  it("returns null when dueAt is null", () => {
    expect(slaMinutesRemaining(null, NOW)).toBeNull();
  });

  it("returns null for an invalid date", () => {
    expect(slaMinutesRemaining("not-a-date", NOW)).toBeNull();
  });

  it("returns positive minutes before the deadline", () => {
    const inOneHour = new Date(NOW.getTime() + HOUR).toISOString();
    expect(slaMinutesRemaining(inOneHour, NOW)).toBe(60);
  });

  it("returns negative minutes after the deadline (breached)", () => {
    const oneHourAgo = new Date(NOW.getTime() - HOUR).toISOString();
    expect(slaMinutesRemaining(oneHourAgo, NOW)).toBe(-60);
  });
});
