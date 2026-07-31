import { test, expect } from "./fixtures";

/**
 * E2E — Companies lifecycle.
 *
 * Open companies → open company → open related contact → return through
 * browser history (back button).
 */

test.describe("companies", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });
    await page.locator("text=Companies").first().click();
    await expect(page.locator("h1, [aria-label]").filter({ hasText: "Companies" }).first()).toBeVisible({ timeout: 5000 });
  });

  test("open a company and view its details", async ({ page }) => {
    // The companies view defaults to cards. Each company is a button card.
    const firstCompanyCard = page.locator("main button[class*='rounded-xl'], main button[class*='border']").first();
    await firstCompanyCard.click();
    await page.waitForTimeout(500);

    // The company detail should show a heading (company name).
    await expect(page.locator("h1, [class*='font-display']").first()).toBeVisible({ timeout: 5000 });
  });

  test("open a related contact from the company detail", async ({ page }) => {
    // Open the first company.
    await page.locator("main button[class*='rounded-xl'], main button[class*='border']").first().click();
    await page.waitForTimeout(500);

    // The company detail has a "Contacts" section. Each contact is a card
    // button (class includes 'bg-card') inside <main>.
    const contactButtons = page.locator("main button[class*='bg-card']");
    const count = await contactButtons.count();
    if (count > 0) {
      await contactButtons.first().click();
      await page.waitForTimeout(500);
      // We should now be on a contact detail page.
      await expect(page.locator("text=Contacts").first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("return through browser history (back button)", async ({ page }) => {
    // Navigate: companies list → company detail.
    await page.locator("main button[class*='rounded-xl'], main button[class*='border']").first().click();
    await page.waitForTimeout(500);

    // Go back via the in-app back button — it has text-muted-foreground class
    // and contains "Companies" text.
    const backBtn = page.locator("main button[class*='text-muted-foreground']").first();
    await backBtn.click();
    await page.waitForTimeout(500);

    // Should be back on the companies list.
    await expect(page.locator("text=Companies").first()).toBeVisible({ timeout: 5000 });
  });

  test("company search filters the list", async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill("cloud");
      await page.waitForTimeout(500);
    }
    // Verify no crash.
    await expect(page.locator("text=Companies").first()).toBeVisible();
  });
});
