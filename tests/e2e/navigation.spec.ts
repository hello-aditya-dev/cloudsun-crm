import { test, expect } from "./fixtures";

/**
 * E2E — Navigation flows.
 *
 * Covers the required "Login demonstration → Application overview → Every
 * visible sidebar route" flow. The login demonstration itself uses the real
 * auth UI; subsequent route visits use the pre-seeded workspace fixture.
 */

test.describe("navigation", () => {
  test("login demonstration flow lands in the workspace", async ({ page }) => {
    // Start fresh — no pre-seeded auth state.
    await page.addInitScript(() => {
      localStorage.removeItem("cloudsun-auth-v1");
      localStorage.removeItem("cloudsun-demo-v2");
    });
    await page.goto("/");

    // Landing page should be visible.
    await expect(page.locator("text=CloudSun")).toBeVisible();

    // Click "Start CloudSun" (or Sign in) to enter the auth flow.
    const startBtn = page.locator("text=Start your workspace").first();
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
    } else {
      await page.locator("text=Sign in").first().click();
    }

    // Auth view: click "Continue with Google" (simulated).
    await expect(page.locator("text=Continue with Google").or(page.locator("text=Google"))).toBeVisible({ timeout: 5000 });
    await page.locator("text=Continue with Google").first().click();

    // OTP step: the demo code is displayed on screen. Read it and enter it.
    await expect(page.locator("text=/\\d{6}/").or(page.locator("[data-demo-otp]"))).toBeVisible({ timeout: 5000 });

    // Try to grab the displayed OTP code from the page text.
    const otpText = await page.locator("body").textContent();
    const otpMatch = otpText?.match(/\b(\d{6})\b/);
    if (otpMatch) {
      const code = otpMatch[1];
      // Type the code into the OTP inputs.
      const inputs = page.locator("input[maxlength='1']");
      const count = await inputs.count();
      if (count >= 6) {
        for (let i = 0; i < 6; i++) {
          await inputs.nth(i).fill(code[i]);
        }
      } else {
        // Single input fallback
        await page.locator("input").first().fill(code);
      }
    }

    // After OTP, the user lands in onboarding (org creation) or the app.
    // For the demonstration, skip onboarding by completing it quickly.
    // If the org-create form is visible, fill it and advance.
    const orgNameInput = page.locator("input[placeholder*='organisation' i], input[placeholder*='company' i], input[placeholder*='workspace' i]").first();
    if (await orgNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orgNameInput.fill("NorthPeak IT Services");
      // Click through onboarding steps — look for Continue/Next/Finish buttons.
      for (let i = 0; i < 15; i++) {
        const btn = page.locator("button:has-text('Continue'), button:has-text('Next'), button:has-text('Skip'), button:has-text('Finish'), button:has-text('Launch'), button:has-text('Complete')").first();
        if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(300);
        } else {
          break;
        }
      }
    }

    // Eventually we should reach the app workspace.
    await expect(page.locator("text=Overview").or(page.locator("text=Inbox"))).toBeVisible({ timeout: 15000 });
  });

  test("every visible sidebar route renders a valid page", async ({ page }) => {
    // The pre-seeded workspace fixture places us in the app.
    await page.goto("/");
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });

    const routes = [
      "Inbox",
      "Contacts",
      "Companies",
      "Calls",
      "Calendar",
      "Knowledge",
      "Automations",
      "Analytics",
      "Team",
      "Integrations",
      "Settings",
      "Billing",
      "Audit log",
    ];

    for (const label of routes) {
      // Click the sidebar nav item.
      const navItem = page.locator(`nav button:has-text("${label}"), nav a:has-text("${label}"), [role='navigation'] :text("${label}")`).first();
      await navItem.click();
      // Wait for the view to render — the TopBar title or PageHeader should show the label.
      await expect(page.locator(`h1, [aria-label]`).filter({ hasText: label }).first()).toBeVisible({ timeout: 10000 });
      // Verify no error boundary is shown.
      await expect(page.locator("text=Something went wrong")).not.toBeVisible();
    }
  });

  test("command palette opens with Ctrl+K and navigates", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });

    // Open the command palette.
    await page.keyboard.press("Control+k");
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Type a search query.
    await page.locator('[aria-label="Command palette search"]').fill("contacts");
    await page.locator('[role="option"]').first().click();

    // Should navigate to contacts view.
    await expect(page.locator("h1, [aria-label]").filter({ hasText: "Contacts" }).first()).toBeVisible({ timeout: 5000 });
  });

  test("theme toggle switches between light and dark", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });

    // The html element should have (or not have) the .dark class.
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    const wasDark = htmlClass.includes("dark");

    // Open the theme menu.
    await page.locator("button[aria-label='Theme']").click();
    await page.waitForTimeout(300);

    // Click "Dark" to switch to dark theme.
    await page.locator("button:has-text('Dark')").click();
    await page.waitForTimeout(500);

    // Verify the dark class was applied.
    const darkClass = await page.evaluate(() => document.documentElement.className);
    expect(darkClass).toContain("dark");

    // Switch back to light.
    await page.locator("button[aria-label='Theme']").click();
    await page.waitForTimeout(300);
    await page.locator("button:has-text('Light')").click();
    await page.waitForTimeout(500);
    const lightClass = await page.evaluate(() => document.documentElement.className);
    expect(lightClass).not.toContain("dark");
  });
});
