import { describe, it, expect } from "vitest";
import {
  leadStageMeta,
  priorityMeta,
  conversationStatusMeta,
  slaMeta,
  customerStatusMeta,
  callOutcomeMeta,
  followUpTypeMeta,
  followUpStatusMeta,
  channelMeta,
  industryMeta,
  formatCurrency,
  formatCurrencyFull,
  formatDuration,
  initials,
  formatRelativeTime,
  formatDateTime,
  formatDate,
} from "@/lib/display";

describe("status mapping — leadStageMeta", () => {
  it("provides a label, badge and dot for every lead stage", () => {
    const stages = [
      "new", "uncontacted", "attempted", "connected", "qualified",
      "interested", "opportunity", "customer", "at_risk", "inactive",
      "not_interested", "invalid", "do_not_contact",
    ] as const;
    for (const stage of stages) {
      const meta = leadStageMeta[stage];
      expect(meta).toBeDefined();
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.badge.length).toBeGreaterThan(0);
      expect(meta.dot.length).toBeGreaterThan(0);
    }
  });

  it("uses human-readable labels (not snake_case)", () => {
    expect(leadStageMeta.at_risk.label).toBe("At risk");
    expect(leadStageMeta.do_not_contact.label).toBe("Do not contact");
    expect(leadStageMeta.not_interested.label).toBe("Not interested");
  });
});

describe("status mapping — priorityMeta", () => {
  it("covers all four priorities", () => {
    expect(priorityMeta.low.label).toBe("Low");
    expect(priorityMeta.normal.label).toBe("Normal");
    expect(priorityMeta.high.label).toBe("High");
    expect(priorityMeta.urgent.label).toBe("Urgent");
  });
});

describe("status mapping — conversationStatusMeta", () => {
  it("covers every conversation status", () => {
    const statuses = [
      "open", "unassigned", "mine", "waiting_customer", "waiting_internal",
      "needs_approval", "snoozed", "resolved", "closed", "spam",
    ] as const;
    for (const s of statuses) {
      expect(conversationStatusMeta[s]).toBeDefined();
      expect(conversationStatusMeta[s].label.length).toBeGreaterThan(0);
    }
  });
});

describe("status mapping — slaMeta", () => {
  it("covers every SLA state with a non-colour-only label", () => {
    const states = ["safe", "approaching", "at_risk", "breached", "paused"] as const;
    for (const s of states) {
      expect(slaMeta[s]).toBeDefined();
      expect(slaMeta[s].label).toContain("SLA");
    }
  });
});

describe("status mapping — customerStatusMeta", () => {
  it("covers every customer status", () => {
    const statuses = ["prospect", "active", "renewing", "at_risk", "churned", "former"] as const;
    for (const s of statuses) {
      expect(customerStatusMeta[s]).toBeDefined();
    }
  });
});

describe("status mapping — callOutcomeMeta", () => {
  it("covers every call outcome", () => {
    const outcomes = ["completed", "voicemail", "no_answer", "busy", "failed", "scheduled"] as const;
    for (const o of outcomes) {
      expect(callOutcomeMeta[o]).toBeDefined();
    }
  });
});

describe("status mapping — followUpTypeMeta / followUpStatusMeta", () => {
  it("maps follow-up types to human labels", () => {
    expect(followUpTypeMeta.callback).toBe("Callback");
    expect(followUpTypeMeta.demo).toBe("Demo");
    expect(followUpTypeMeta.escalation).toBe("Escalation");
  });

  it("covers every follow-up status", () => {
    const statuses = ["scheduled", "completed", "overdue", "cancelled"] as const;
    for (const s of statuses) {
      expect(followUpStatusMeta[s]).toBeDefined();
    }
  });
});

describe("status mapping — channelMeta", () => {
  it("covers every channel with label and icon", () => {
    const channels = ["phone", "email", "whatsapp", "webchat", "internal", "system"] as const;
    for (const c of channels) {
      expect(channelMeta[c].label.length).toBeGreaterThan(0);
      expect(channelMeta[c].icon.length).toBeGreaterThan(0);
    }
  });
});

describe("status mapping — industryMeta", () => {
  it("maps every industry to a human-readable label", () => {
    expect(industryMeta.managed_it_services).toBe("Managed IT services");
    expect(industryMeta.cybersecurity).toBe("Cybersecurity");
    expect(industryMeta.cloud_migration).toBe("Cloud migration");
  });
});

describe("formatting helpers", () => {
  it("formatCurrency abbreviates thousands to k", () => {
    expect(formatCurrency(500)).toBe("$500");
    expect(formatCurrency(1000)).toBe("$1k");
    expect(formatCurrency(25000)).toBe("$25k");
  });

  it("formatCurrencyFull never abbreviates", () => {
    expect(formatCurrencyFull(25000)).toBe("$25,000");
  });

  it("formatDuration returns em-dash for zero", () => {
    expect(formatDuration(0)).toBe("—");
  });

  it("formatDuration formats seconds-only and minutes", () => {
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(65)).toBe("1m 05s");
    expect(formatDuration(125)).toBe("2m 05s");
  });

  it("initials extracts first letters of first two words", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("Wei-Lin Tan")).toBe("WT");
    expect(initials("singleword")).toBe("S");
    expect(initials("")).toBe("");
    expect(initials("  multiple   spaces  here")).toBe("MS");
  });

  it("formatRelativeTime returns em-dash for null", () => {
    expect(formatRelativeTime(null)).toBe("—");
  });

  it("formatRelativeTime returns just now for recent dates", () => {
    const recent = new Date(Date.now() - 30_000).toISOString();
    expect(formatRelativeTime(recent)).toBe("just now");
  });

  it("formatRelativeTime returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
  });

  it("formatRelativeTime returns hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3_600_000).toISOString();
    expect(formatRelativeTime(threeHoursAgo)).toBe("3h ago");
  });

  it("formatDateTime returns em-dash for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });

  it("formatDateTime returns a formatted string for valid dates", () => {
    const result = formatDateTime("2026-01-15T10:30:00Z");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  it("formatDate returns em-dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("formatDate returns a formatted date string", () => {
    const result = formatDate("2026-01-15T10:30:00Z");
    expect(result).toContain("2026");
    expect(result).toContain("Jan");
  });
});
