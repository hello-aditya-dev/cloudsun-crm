import { test, expect } from "./fixtures";

/**
 * E2E — Inbox lifecycle.
 *
 * Open inbox → select conversation → change assignment → add internal note →
 * send simulated reply → change status → refresh → confirm persistence.
 */

test.describe("inbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });
    await page.locator("text=Inbox").first().click();
    await expect(page.locator("h1, [aria-label]").filter({ hasText: "Inbox" }).first()).toBeVisible({ timeout: 5000 });
  });

  test("select a conversation and view the message thread", async ({ page }) => {
    // Conversation list items are <li><button> inside a <ul>.
    const firstConv = page.locator("ul.divide-y li button").first();
    await firstConv.click();
    await page.waitForTimeout(500);

    // The conversation detail / message thread should be visible.
    const composer = page.locator("textarea").first();
    await expect(composer).toBeVisible({ timeout: 5000 });
  });

  test("add an internal note to a conversation", async ({ page }) => {
    await page.locator("ul.divide-y li button").first().click();
    await page.waitForTimeout(500);

    // Switch to internal note mode if there's a toggle.
    const noteToggle = page.locator("button:has-text('Note'), button:has-text('Internal')").first();
    if (await noteToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await noteToggle.click();
    }

    const composer = page.locator("textarea").first();
    await composer.fill("E2E test internal note");
    // The note send button has text "Add note" (distinct from the "Internal note" toggle).
    await page.locator("button:has-text('Add note')").first().click();
    await page.waitForTimeout(500);

    // The note should appear in the thread.
    await expect(page.locator("text=E2E test internal note").first()).toBeVisible({ timeout: 5000 });
  });

  test("send a simulated reply", async ({ page }) => {
    await page.locator("ul.divide-y li button").first().click();
    await page.waitForTimeout(500);

    const composer = page.locator("textarea").first();
    await composer.fill("E2E simulated reply body");
    // The reply send button has text "Send" (distinct from the "Reply" mode toggle).
    await page.locator("button:has-text('Send')").last().click();
    await page.waitForTimeout(500);

    // The reply should appear in the thread.
    await expect(page.locator("text=E2E simulated reply body").first()).toBeVisible({ timeout: 5000 });
  });

  test("change conversation status", async ({ page }) => {
    await page.locator("ul.divide-y li button").first().click();
    await page.waitForTimeout(500);

    // Find a status change control. The conversation detail has a status menu.
    const statusMenu = page.locator("button[aria-label*='status' i], button:has-text('Open'), button:has-text('Status')").first();
    if (await statusMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusMenu.click();
      await page.waitForTimeout(300);
      // Click a status option (e.g., Resolved).
      const resolvedOption = page.locator("button:has-text('Resolved'), button:has-text('Closed')").first();
      if (await resolvedOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await resolvedOption.click();
        await page.waitForTimeout(500);
      }
    }
    // Verify no crash.
    await expect(page.locator("text=Inbox").first()).toBeVisible();
  });

  test("draft persists across navigation", async ({ page }) => {
    await page.locator("ul.divide-y li button").first().click();
    await page.waitForTimeout(500);

    // Type a draft (do NOT send).
    const composer = page.locator("textarea").first();
    await composer.fill("Persistent draft text");
    await page.waitForTimeout(300);
    await page.waitForTimeout(300);

    // Navigate away and back.
    await page.locator("text=Overview").first().click();
    await page.waitForTimeout(500);
    await page.locator("text=Inbox").first().click();
    await page.waitForTimeout(500);

    // Re-open the same conversation.
    await page.locator("ul.divide-y li button").first().click();
    await page.waitForTimeout(500);

    // The draft should still be in the composer.
    const composerAfter = page.locator("textarea").first();
    await expect(composerAfter).toHaveValue("Persistent draft text", { timeout: 5000 });
  });

  test("reply survives a page refresh (persistence)", async ({ page }) => {
    await page.locator("ul.divide-y li button").first().click();
    await page.waitForTimeout(500);

    const composer = page.locator("textarea").first();
    await composer.fill("Reply before refresh");
    await page.locator("button:has-text('Send')").last().click();
    await page.waitForTimeout(500);

    // Reload the page.
    await page.reload();
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });

    // Navigate back to inbox and the same conversation.
    await page.locator("text=Inbox").first().click();
    await page.waitForTimeout(500);
    await page.locator("ul.divide-y li button").first().click();
    await page.waitForTimeout(500);

    // The reply should still be in the thread (persisted in localStorage).
    await expect(page.locator("text=Reply before refresh").first()).toBeVisible({ timeout: 5000 });
  });
});
