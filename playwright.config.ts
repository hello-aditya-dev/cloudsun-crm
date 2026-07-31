import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for CloudSun CRM.
 *
 * The dev server is expected to already be running on port 3000
 * (started via `bun run dev`). We do NOT auto-start a second server
 * because the sandbox has limited memory and two Next.js dev compilers
 * would OOM. CI should run `bun run dev` in the background first.
 *
 * Tests are split into two projects:
 *   - e2e  — end-to-end user flows (tests/e2e/*.spec.ts)
 *   - a11y — axe accessibility scans against every major route (tests/a11y/*.spec.ts)
 */
export default defineConfig({
  testDir: "./tests",
  outputDir: "./tests/results",
  fullyParallel: false, // memory-safe: run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // single worker to keep memory low
  reporter: [["list"], ["html", { outputFolder: "tests/report" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "e2e",
      testMatch: /e2e\/(?!mobile\.spec\.ts).*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "a11y",
      testMatch: "a11y/**/*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      testMatch: "e2e/mobile.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
