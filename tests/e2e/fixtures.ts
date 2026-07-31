import { test as base, expect, type Page } from "@playwright/test";

/**
 * Playwright fixture that bootstraps the CloudSun CRM demonstration
 * workspace so E2E tests can skip the full landing → auth → onboarding
 * flow. The auth store (cloudsun-auth-v1) and demo store (cloudsun-demo-v2)
 * are pre-seeded in localStorage before the page loads.
 *
 * One test (navigation.spec.ts) exercises the real login demonstration
 * flow and does NOT use this fixture.
 */

const TEST_USER = {
  id: "u-e2e",
  primaryEmail: "owner@cloudsun-demo.example",
  emailVerifiedAt: "2026-01-01T00:00:00.000Z",
  displayName: "Eleanor Owner",
  givenName: "Eleanor",
  familyName: "Owner",
  avatarUrl: null,
  avatarColor: "oklch(0.58 0.135 38)",
  mobileNumber: "+15555550100",
  mobileCountryCode: "+1",
  mobileVerifiedAt: "2026-01-01T00:00:00.000Z",
  locale: "en",
  timeZone: "America/Chicago",
  status: "active",
  lastLoginAt: "2026-01-15T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-15T00:00:00.000Z",
  authProvider: "google",
};

const TEST_ORG = {
  id: "org-e2e",
  name: "NorthPeak IT Services",
  slug: "northpeak-it-services",
  legalName: null,
  industry: "managed_it_services",
  website: "https://example.com",
  country: "United States",
  timeZone: "America/Chicago",
  defaultLanguage: "en",
  teamSizeBand: "10-25",
  operatingModel: "it_service_provider",
  status: "active",
  createdById: "u-e2e",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-15T00:00:00.000Z",
  businessFunctions: [],
};

const TEST_MEMBERSHIP = {
  id: "mem-e2e",
  organisationId: "org-e2e",
  userId: "u-e2e",
  roleKey: "owner",
  status: "active",
  jobTitle: "Owner",
  employeeId: null,
  teamId: null,
  managerMembershipId: null,
  joinedAt: "2026-01-01T00:00:00.000Z",
  lastAccessAt: "2026-01-15T00:00:00.000Z",
  onboardingCompletedAt: "2026-01-01T00:00:00.000Z",
  onboardingStep: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-15T00:00:00.000Z",
};

const TEST_SESSION = {
  id: "sess-e2e",
  userId: "u-e2e",
  deviceSummary: "Desktop browser",
  ipHint: "203.0.113.x",
  expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  lastActiveAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  revokedAt: null,
  revocationReason: null,
  isCurrent: true,
};

/**
 * Auth store state that places the user directly in the authorised
 * workspace (authPhase: "app") with an active owner membership.
 */
export function buildAuthState() {
  return {
    version: 1,
    authPhase: "app",
    currentUser: TEST_USER,
    organisations: [TEST_ORG],
    memberships: [TEST_MEMBERSHIP],
    invitations: [],
    sessions: [TEST_SESSION],
    selectedOrgId: "org-e2e",
    authStep: "login",
    pendingEmail: null,
    pendingProvider: null,
    otpCode: null,
    otpAttempts: 0,
    otpResendCount: 0,
    otpExpiresAt: null,
    activeInvitationToken: null,
    onboardingDraft: {
      orgName: "",
      website: "",
      industry: "managed_it_services",
      country: "United States",
      timeZone: "America/Chicago",
      language: "en",
      operatingModel: "it_service_provider",
      businessFunctions: [],
      teams: [],
      invites: [],
      workingDays: ["mon", "tue", "wed", "thu", "fri"],
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      responseTarget: "4h",
      notifications: { email: true, assignment: true, urgent: true, followUps: true },
    },
    onboardingRole: "owner",
  };
}

/**
 * Navigate to a specific CRM view by injecting the view state into the
 * demo store before the page loads. Used for deep-link tests.
 */
export async function navigateToView(
  page: Page,
  view: string,
  params: Record<string, string> = {},
) {
  const demoState = { view: { view, params } };
  await page.addInitScript((state) => {
    const raw = localStorage.getItem("cloudsun-demo-v2");
    let parsed = {};
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      parsed = {};
    }
    const merged = { ...parsed, ...state };
    localStorage.setItem("cloudsun-demo-v2", JSON.stringify(merged));
  }, demoState);
}

/** Seed both auth and demo stores before first navigation. */
export async function seedWorkspace(page: Page) {
  // Set the auth store on every page load (including reloads) so the user
  // stays logged in. Do NOT clear the demo store — it must persist across
  // reloads so persistence tests (drafts, replies) work correctly. Each
  // Playwright test gets a fresh browser context, so the demo store starts
  // empty and reseeds from the deterministic seed on first load.
  await page.addInitScript((authState) => {
    localStorage.setItem("cloudsun-auth-v1", JSON.stringify({ state: authState, version: 1 }));
  }, buildAuthState());
}

/** Extended test fixture that auto-seeds the workspace. */
export const test = base.extend({
  // Playwright fixture pattern — not a React component, so the
  // react-hooks/rules-of-hooks rule does not apply here.
  /* eslint-disable react-hooks/rules-of-hooks */
  page: async ({ page }, use) => {
    await seedWorkspace(page);
    await use(page);
  },
  /* eslint-enable react-hooks/rules-of-hooks */
});

export { expect };
