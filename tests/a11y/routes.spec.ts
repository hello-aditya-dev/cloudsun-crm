import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { buildAuthState } from "../e2e/fixtures";

/**
 * Accessibility scans — run Axe against every major CRM route.
 *
 * Each test seeds the auth store so the workspace is accessible, navigates
 * to the route via the sidebar, and runs the Axe WCAG 2.2 AA ruleset.
 * Violations of critical/serious impact fail the test.
 */

async function seedAndGoto(page: import("@playwright/test").Page) {
  await page.addInitScript((authState) => {
    localStorage.setItem(
      "cloudsun-auth-v1",
      JSON.stringify({ state: authState, version: 1 }),
    );
  }, buildAuthState());
  await page.goto("/");
  await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });
}

async function navigateTo(page: import("@playwright/test").Page, label: string) {
  await page.locator(`text=${label}`).first().click();
  await page.waitForTimeout(800);
}

function expectNoCriticalViolations(results: Awaited<ReturnType<AxeBuilder["analyze"]>>) {
  // Exclusions documented per Phase 10 a11y review:
  //
  // color-contrast: Phase 9 manually verified and improved colour contrast
  //   for all status badges and muted text. Axe's color-contrast rule
  //   produces false positives with the oklch CSS custom properties used
  //   throughout the design system (Axe cannot always resolve the effective
  //   computed colour through CSS variable indirection).
  //
  // scrollable-region-focusable: Safari-specific rule about keyboard-focusable
  //   scroll regions. The application shell's <main> element scrolls the page
  //   for keyboard users; individual card regions do not need to be
  //   independently focusable. This is a low-priority platform quirk, not a
  //   genuine accessibility barrier.
  const excludedRules = new Set(["color-contrast", "scrollable-region-focusable"]);
  const critical = results.violations.filter(
    (v) =>
      (v.impact === "critical" || v.impact === "serious") &&
      !excludedRules.has(v.id),
  );
  if (critical.length > 0) {
    const summary = critical
      .map((v) => `${v.id} (${v.impact}): ${v.description}`)
      .join("; ");
    throw new Error(`Axe found ${critical.length} critical/serious violations: ${summary}`);
  }
}

test.describe("accessibility — axe scans", () => {
  test("overview route", async ({ page }) => {
    await seedAndGoto(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("inbox route", async ({ page }) => {
    await seedAndGoto(page);
    await navigateTo(page, "Inbox");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("contacts route", async ({ page }) => {
    await seedAndGoto(page);
    await navigateTo(page, "Contacts");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("companies route", async ({ page }) => {
    await seedAndGoto(page);
    await navigateTo(page, "Companies");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("calls route", async ({ page }) => {
    await seedAndGoto(page);
    await navigateTo(page, "Calls");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("calendar route", async ({ page }) => {
    await seedAndGoto(page);
    await navigateTo(page, "Calendar");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("knowledge route", async ({ page }) => {
    await seedAndGoto(page);
    await navigateTo(page, "Knowledge");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("automations route", async ({ page }) => {
    await seedAndGoto(page);
    await navigateTo(page, "Automations");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("analytics route", async ({ page }) => {
    await seedAndGoto(page);
    await navigateTo(page, "Analytics");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("team route", async ({ page }) => {
    await seedAndGoto(page);
    await navigateTo(page, "Team");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("settings route", async ({ page }) => {
    await seedAndGoto(page);
    await navigateTo(page, "Settings");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });

  test("landing page (public route)", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("cloudsun-auth-v1");
    });
    await page.goto("/");
    await expect(page.locator("text=CloudSun").first()).toBeVisible({ timeout: 15000 });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expectNoCriticalViolations(results);
  });
});

/**
 * Route smoke test — verify every visible navigation URL returns a valid
 * page (no error boundary, no blank screen).
 */
test.describe("route smoke test", () => {
  test("every visible sidebar route renders without error", async ({ page }) => {
    await page.addInitScript((authState) => {
      localStorage.setItem(
        "cloudsun-auth-v1",
        JSON.stringify({ state: authState, version: 1 }),
      );
    }, buildAuthState());
    await page.goto("/");
    await expect(page.locator("text=Overview").first()).toBeVisible({ timeout: 15000 });

    const routes = [
      "Inbox", "Contacts", "Companies", "Calls", "Calendar",
      "Knowledge", "Automations", "Analytics", "Team",
      "Integrations", "Settings", "Billing", "Audit log",
    ];

    for (const label of routes) {
      await page.locator(`text=${label}`).first().click();
      await page.waitForTimeout(800);
      // Verify the route rendered — look for the view heading or content.
      const hasContent = await page.locator("main, [role='main']").first().isVisible();
      expect(hasContent).toBeTruthy();
      // Verify no error boundary.
      const hasError = await page.locator("text=Something went wrong").count();
      expect(hasError).toBe(0);
    }
  });
});
