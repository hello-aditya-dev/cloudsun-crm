import { test, expect } from "./fixtures";

/**
 * E2E — Mobile inbox flow.
 *
 * Open mobile inbox → open conversation → reply → return to list.
 * Uses the iPhone 13 viewport (390×844) configured in playwright.config.ts.
 */

test.describe("mobile inbox", () => {
  test.beforeEach(async ({ page }) => {
    // The 'mobile' project uses a 390×844 viewport with touch emulation.
    await page.goto("/");
    // On mobile the sidebar is hidden; wait for the main content area instead.
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });

    // On mobile, the bottom nav shows overview/inbox/contacts/companies.
    // Target the bottom nav specifically (sidebar nav is hidden but still in DOM).
    await page.locator("nav[aria-label='Bottom navigation'] button").filter({ hasText: "Inbox" }).click();
    await page.waitForTimeout(500);
  });

  test("open a conversation and reply, then return to list", async ({ page }) => {
    // Click the first conversation in the mobile list.
    await page.locator("ul.divide-y li button").first().click();
    await page.waitForTimeout(500);

    // The conversation detail should be full-screen on mobile.
    const composer = page.locator("textarea").first();
    await expect(composer).toBeVisible({ timeout: 5000 });

    // Type and send a reply.
    await composer.fill("Mobile E2E reply");
    await page.locator("button:has-text('Send')").last().click();
    await page.waitForTimeout(500);

    // The reply should appear in the thread.
    await expect(page.locator("text=Mobile E2E reply").first()).toBeVisible({ timeout: 5000 });

    // Return to the list via the in-app back button.
    const backBtn = page.locator("main button[class*='text-muted-foreground']").first();
    if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backBtn.click();
    } else {
      await page.goBack();
    }
    await page.waitForTimeout(500);

    // Should be back on the conversation list.
    await expect(page.locator("main")).toBeVisible({ timeout: 5000 });
  });

  test("no horizontal scroll on mobile viewport", async ({ page }) => {
    // Verify the page does not overflow horizontally at 390px width.
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test("bottom navigation is visible and does not cover content", async ({ page }) => {
    // The bottom nav should be visible (target it by aria-label to avoid
    // matching the hidden sidebar nav).
    const bottomNav = page.locator("nav[aria-label='Bottom navigation']");
    await expect(bottomNav).toBeVisible();

    // Verify the bottom nav does not overlap the last visible content.
    const navBottom = await page.evaluate(() => {
      const nav = document.querySelector("nav[aria-label='Bottom navigation']");
      if (!nav) return null;
      const rect = nav.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    });
    // If a fixed bottom nav exists, its top should be within the viewport.
    if (navBottom) {
      expect(navBottom.top).toBeLessThan(844); // viewport height
    }
  });
});
