import { describe, it, expect } from "vitest";
import {
  NAV_ITEMS,
  NAV_GROUPS,
  MOBILE_NAV_IDS,
  getNavItem,
  VIEW_PERMISSIONS,
} from "@/config/navigation";
import type { NavItem } from "@/types/domain";

describe("navigation route configuration", () => {
  it("exposes exactly 14 nav items", () => {
    expect(NAV_ITEMS).toHaveLength(14);
  });

  it("every nav item has the required fields and is marked available", () => {
    for (const item of NAV_ITEMS) {
      expect(item.id).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.path).toMatch(/^\/app\//);
      expect(item.icon).toBeTruthy();
      expect(item.group).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.available).toBe(true);
      expect(Array.isArray(item.keywords)).toBe(true);
      expect(item.keywords.length).toBeGreaterThan(0);
    }
  });

  it("nav item ids are unique", () => {
    const ids = NAV_ITEMS.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("nav item paths are unique", () => {
    const paths = NAV_ITEMS.map((n) => n.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("every nav item belongs to a declared group", () => {
    const groupIds = new Set(NAV_GROUPS.map((g) => g.id));
    for (const item of NAV_ITEMS) {
      expect(groupIds.has(item.group)).toBe(true);
    }
  });

  it("declares exactly 3 nav groups", () => {
    expect(NAV_GROUPS).toHaveLength(3);
    const ids = NAV_GROUPS.map((g) => g.id);
    expect(ids).toContain("workspace");
    expect(ids).toContain("customer_operations");
    expect(ids).toContain("manage");
  });

  it("workspace group contains overview, inbox, contacts, companies", () => {
    const workspace = NAV_ITEMS.filter((n) => n.group === "workspace").map((n) => n.id);
    expect(workspace).toEqual(
      expect.arrayContaining(["overview", "inbox", "contacts", "companies"]),
    );
  });

  it("getNavItem returns the matching item", () => {
    const inbox = getNavItem("inbox");
    expect(inbox?.label).toBe("Inbox");
    expect(inbox?.path).toBe("/app/inbox");
  });

  it("getNavItem returns undefined for unknown ids", () => {
    expect(getNavItem("nonexistent")).toBeUndefined();
  });

  it("MOBILE_NAV_IDS is a subset of all nav ids and includes the four primary views", () => {
    const allIds = new Set(NAV_ITEMS.map((n) => n.id));
    for (const id of MOBILE_NAV_IDS) {
      expect(allIds.has(id)).toBe(true);
    }
    expect(MOBILE_NAV_IDS).toEqual(
      expect.arrayContaining(["overview", "inbox", "contacts", "companies"]),
    );
  });

  it("every mobile-visible item has mobileVisible true", () => {
    for (const id of MOBILE_NAV_IDS) {
      const item = getNavItem(id);
      expect(item?.mobileVisible).toBe(true);
    }
  });

  it("VIEW_PERMISSIONS covers every nav item id", () => {
    for (const item of NAV_ITEMS) {
      expect(VIEW_PERMISSIONS).toHaveProperty(item.id);
    }
  });

  it("overview and settings are visible to all roles (empty permission array)", () => {
    expect(VIEW_PERMISSIONS.overview).toEqual([]);
    expect(VIEW_PERMISSIONS.settings).toEqual([]);
  });

  it("protected views declare at least one required permission", () => {
    const protectedViews = ["inbox", "contacts", "companies", "analytics", "team", "integrations", "billing", "audit_log"];
    for (const view of protectedViews) {
      const perms = VIEW_PERMISSIONS[view];
      expect(perms.length).toBeGreaterThan(0);
    }
  });

  it("every required permission string is non-empty", () => {
    for (const [view, perms] of Object.entries(VIEW_PERMISSIONS)) {
      for (const p of perms) {
        expect(typeof p).toBe("string");
        expect(p.length).toBeGreaterThan(0);
      }
    }
  });
});
