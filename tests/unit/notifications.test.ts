import { describe, it, expect, beforeEach } from "vitest";
import { useDemoStore } from "@/lib/demo-store";

beforeEach(() => {
  window.localStorage.clear();
  useDemoStore.getState().reset();
});

describe("notification state", () => {
  it("seeds demonstration notifications", () => {
    const { notifications } = useDemoStore.getState();
    expect(notifications.length).toBeGreaterThan(0);
  });

  it("seeds a mix of read and unread notifications", () => {
    const { notifications } = useDemoStore.getState();
    const read = notifications.filter((n) => n.read);
    const unread = notifications.filter((n) => !n.read);
    expect(read.length).toBeGreaterThan(0);
    expect(unread.length).toBeGreaterThan(0);
  });

  it("every notification has required fields", () => {
    const { notifications } = useDemoStore.getState();
    for (const n of notifications) {
      expect(n.id).toBeTruthy();
      expect(n.type).toBeTruthy();
      expect(n.title).toBeTruthy();
      expect(n.createdAt).toBeTruthy();
      expect(typeof n.read).toBe("boolean");
    }
  });

  it("markNotificationRead sets a single notification to read", () => {
    const unread = useDemoStore.getState().notifications.find((n) => !n.read);
    expect(unread).toBeDefined();
    if (!unread) return;

    useDemoStore.getState().markNotificationRead(unread.id);
    const updated = useDemoStore.getState().notifications.find((n) => n.id === unread.id);
    expect(updated?.read).toBe(true);
  });

  it("markNotificationRead does not affect other notifications", () => {
    const state = useDemoStore.getState();
    const unread = state.notifications.find((n) => !n.read);
    const otherUnread = state.notifications.find((n) => !n.read && n.id !== unread?.id);
    if (!unread || !otherUnread) return;

    useDemoStore.getState().markNotificationRead(unread.id);
    const other = useDemoStore.getState().notifications.find((n) => n.id === otherUnread.id);
    expect(other?.read).toBe(false);
  });

  it("markAllNotificationsRead sets every notification to read", () => {
    useDemoStore.getState().markAllNotificationsRead();
    const { notifications } = useDemoStore.getState();
    for (const n of notifications) {
      expect(n.read).toBe(true);
    }
  });

  it("markAllNotificationsRead is idempotent", () => {
    useDemoStore.getState().markAllNotificationsRead();
    const count1 = useDemoStore.getState().notifications.filter((n) => n.read).length;
    useDemoStore.getState().markAllNotificationsRead();
    const count2 = useDemoStore.getState().notifications.filter((n) => n.read).length;
    expect(count2).toBe(count1);
  });

  it("markNotificationRead on an already-read notification is a no-op", () => {
    const read = useDemoStore.getState().notifications.find((n) => n.read);
    if (!read) return;
    useDemoStore.getState().markNotificationRead(read.id);
    const stillRead = useDemoStore.getState().notifications.find((n) => n.id === read.id);
    expect(stillRead?.read).toBe(true);
  });

  it("notifications are preserved across reset", () => {
    const before = useDemoStore.getState().notifications.length;
    useDemoStore.getState().markAllNotificationsRead();
    useDemoStore.getState().reset();
    const after = useDemoStore.getState().notifications.length;
    expect(after).toBe(before);
    // After reset, unread notifications should be restored from seed.
    const hasUnread = useDemoStore.getState().notifications.some((n) => !n.read);
    expect(hasUnread).toBe(true);
  });

  it("notificationsOpen UI state defaults to false", () => {
    expect(useDemoStore.getState().notificationsOpen).toBe(false);
  });

  it("setNotificationsOpen toggles the notification panel state", () => {
    useDemoStore.getState().setNotificationsOpen(true);
    expect(useDemoStore.getState().notificationsOpen).toBe(true);
    useDemoStore.getState().setNotificationsOpen(false);
    expect(useDemoStore.getState().notificationsOpen).toBe(false);
  });
});
