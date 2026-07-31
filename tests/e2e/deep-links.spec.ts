import { test, expect } from "./fixtures";

/**
 * E2E — Deep-link persistence.
 *
 * The CloudSun workspace uses client-side view routing (Zustand store),
 * so "deep links" are view states persisted in localStorage. These tests
 * verify that a specific view (contact detail, company detail, conversation
 * detail) survives a full page refresh.
 */

test.describe("deep links", () => {
  test("contact detail survives refresh", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });

    // Navigate to contacts and open the first contact.
    await page.locator("text=Contacts").first().click();
    await page.waitForTimeout(500);
    await page.locator("tbody tr, [class*='cursor-pointer']").first().click();
    await page.waitForTimeout(500);

    // Capture the contact name shown in the detail header.
    const detailHeading = await page.locator("h1, [class*='font-display']").first().textContent();
    expect(detailHeading).toBeTruthy();

    // Reload the page.
    await page.reload();
    await page.waitForTimeout(1000);

    // The same contact detail should be visible (view state persisted).
    if (detailHeading) {
      await expect(page.locator(`text=${detailHeading.trim()}`).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("company detail survives refresh", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });

    await page.locator("text=Companies").first().click();
    await page.waitForTimeout(500);
    // The companies view defaults to cards — each company is a button card.
    await page.locator("button[class*='rounded-xl'], button[class*='border']").first().click();
    await page.waitForTimeout(500);

    const detailHeading = await page.locator("h1, [class*='font-display']").first().textContent();
    expect(detailHeading).toBeTruthy();

    await page.reload();
    await page.waitForTimeout(1000);

    if (detailHeading) {
      await expect(page.locator(`text=${detailHeading.trim()}`).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("conversation detail survives refresh", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });

    await page.locator("text=Inbox").first().click();
    await page.waitForTimeout(500);
    await page.locator("button[class*='hover'], [class*='cursor-pointer']").first().click();
    await page.waitForTimeout(500);

    // Capture the conversation subject.
    const subject = await page.locator("h1, [class*='font-display']").first().textContent();

    await page.reload();
    await page.waitForTimeout(1000);

    // The conversation detail should still be visible.
    if (subject) {
      await expect(page.locator(`text=${subject.trim()}`).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("overview view survives refresh", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 10000 });
  });
});
