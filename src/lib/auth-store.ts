"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AuthPhase,
  AuthUser,
  Organisation,
  Membership,
  Invitation,
  Session,
  RoleKey,
  OnboardingDraft,
  OperatingModel,
  ViewId,
} from "@/types/domain";
import { hasPermission, hasAnyPermission, defaultViewForRole } from "@/config/rbac";
import { VIEW_PERMISSIONS } from "@/config/navigation";

const AUTH_VERSION = 1;

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

const AVATAR_COLORS = [
  "oklch(0.58 0.135 38)",
  "oklch(0.55 0.1 155)",
  "oklch(0.6 0.09 230)",
  "oklch(0.65 0.15 15)",
  "oklch(0.7 0.1 75)",
  "oklch(0.6 0.11 280)",
];

function colorForEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "org";
}

const DEFAULT_DRAFT: OnboardingDraft = {
  orgName: "",
  website: "",
  industry: "managed_it_services",
  country: "United States",
  timeZone: "America/Chicago",
  language: "en",
  operatingModel: "it_service_provider",
  businessFunctions: [],
  teams: [
    { id: "t-sales", name: "Sales" },
    { id: "t-support", name: "Technical Support" },
  ],
  invites: [],
  workingDays: ["mon", "tue", "wed", "thu", "fri"],
  workingHoursStart: "09:00",
  workingHoursEnd: "17:00",
  responseTarget: "4h",
  notifications: { email: true, assignment: true, urgent: true, followUps: true },
};

interface AuthState {
  version: number;
  authPhase: AuthPhase;

  /* identity */
  currentUser: AuthUser | null;

  /* organisations & membership */
  organisations: Organisation[];
  memberships: Membership[];
  invitations: Invitation[];
  sessions: Session[];
  selectedOrgId: string | null;

  /* auth flow state */
  authStep: "login" | "signup" | "otp" | "org-create" | "invitation";
  pendingEmail: string | null;
  pendingProvider: "google" | "password" | null;
  otpCode: string | null; // demo only — the generated code
  otpAttempts: number;
  otpResendCount: number;
  otpExpiresAt: string | null;
  activeInvitationToken: string | null;

  /* onboarding */
  onboardingDraft: OnboardingDraft;
  onboardingRole: RoleKey | null;

  /* actions — auth flow */
  setAuthPhase: (phase: AuthPhase) => void;
  startSignup: () => void;
  startLogin: () => void;
  signInWithGoogle: (email: string, name: string) => void;
  signInWithPassword: (email: string, password: string) => void;
  sendOtp: (mobile: string) => void;
  verifyOtp: (code: string) => boolean;
  resendOtp: () => void;
  changeMobile: () => void;
  signOut: () => void;
  signOutEverywhere: () => void;
  revokeSession: (id: string) => void;

  /* actions — org & onboarding */
  setOnboardingDraft: (patch: Partial<OnboardingDraft>) => void;
  createOrganisation: (input: Partial<Organisation> & { name: string }) => string;
  completeOnboarding: () => void;
  advanceOnboardingStep: () => void;
  setOnboardingStep: (step: number) => void;

  /* actions — invitations */
  createInvitation: (input: { email: string; roleKey: RoleKey; teamId: string | null }) => void;
  acceptInvitation: (token: string) => boolean;
  revokeInvitation: (id: string) => void;
  setActiveInvitation: (token: string | null) => void;

  /* actions — membership */
  updateMembership: (id: string, patch: Partial<Membership>) => void;
  suspendMember: (id: string) => void;
  reactivateMember: (id: string) => void;
  changeMemberRole: (id: string, roleKey: RoleKey) => void;

  /* actions — org selection */
  selectOrganisation: (orgId: string) => void;

  /* helpers */
  getCurrentMembership: () => Membership | null;
  getCurrentRole: () => RoleKey | undefined;
  canAccessView: (view: ViewId) => boolean;
  defaultView: () => ViewId;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      version: AUTH_VERSION,
      authPhase: "public",
      currentUser: null,
      organisations: [],
      memberships: [],
      invitations: [],
      sessions: [],
      selectedOrgId: null,
      authStep: "login",
      pendingEmail: null,
      pendingProvider: null,
      otpCode: null,
      otpAttempts: 0,
      otpResendCount: 0,
      otpExpiresAt: null,
      activeInvitationToken: null,
      onboardingDraft: { ...DEFAULT_DRAFT },
      onboardingRole: null,

      setAuthPhase: (phase) => set({ authPhase: phase }),

      startSignup: () => set({ authPhase: "auth", authStep: "signup", pendingEmail: null, pendingProvider: null }),
      startLogin: () => set({ authPhase: "auth", authStep: "login", pendingEmail: null, pendingProvider: null }),

      signInWithGoogle: (email, name) => {
        const existing = get().currentUser;
        const ts = nowISO();
        const parts = name.split(" ");
        const user: AuthUser = existing && existing.primaryEmail === email
          ? { ...existing, lastLoginAt: ts, authProvider: "google" }
          : {
              id: existing?.id ?? uid("u"),
              primaryEmail: email,
              emailVerifiedAt: ts,
              displayName: name,
              givenName: parts[0] ?? "",
              familyName: parts.slice(1).join(" ") ?? "",
              avatarUrl: null,
              avatarColor: colorForEmail(email),
              mobileNumber: existing?.mobileNumber ?? null,
              mobileCountryCode: existing?.mobileCountryCode ?? null,
              mobileVerifiedAt: existing?.mobileVerifiedAt ?? null,
              locale: "en",
              timeZone: "America/Chicago",
              status: "active",
              lastLoginAt: ts,
              createdAt: existing?.createdAt ?? ts,
              updatedAt: ts,
              authProvider: "google",
            };
        // create session
        const session: Session = {
          id: uid("sess"),
          userId: user.id,
          deviceSummary: navigator.userAgent.includes("Mobile") ? "Mobile browser" : "Desktop browser",
          ipHint: "203.0.113.x",
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          lastActiveAt: ts,
          createdAt: ts,
          revokedAt: null,
          revocationReason: null,
          isCurrent: true,
        };
        set((s) => ({
          currentUser: user,
          pendingEmail: email,
          pendingProvider: "google",
          sessions: [...s.sessions.map((x) => ({ ...x, isCurrent: false })), session],
          authStep: user.mobileVerifiedAt ? "org-create" : "otp",
        }));
        // decide next phase
        const memberships = get().memberships;
        const activeMembership = memberships.find(
          (m) => m.userId === user.id && m.status === "active"
        );
        if (activeMembership) {
          set({ authPhase: "app", selectedOrgId: activeMembership.organisationId });
        } else if (user.mobileVerifiedAt) {
          set({ authPhase: "onboarding", authStep: "org-create" });
        } else {
          set({ authPhase: "auth", authStep: "otp" });
        }
      },

      signInWithPassword: (email, _password) => {
        // Demonstration: any email/password creates an account
        get().signInWithGoogle(email, email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      },

      sendOtp: (mobile) => {
        // Demo: generate a 6-digit code, display it in the UI (clearly labelled demonstration)
        const code = String(Math.floor(100000 + Math.random() * 900000));
        set({
          otpCode: code,
          otpAttempts: 0,
          otpExpiresAt: new Date(Date.now() + 5 * 60000).toISOString(),
          pendingEmail: get().pendingEmail,
        });
        // Store the pending mobile on the user once verified
        if (get().currentUser) {
          set((s) => ({
            currentUser: s.currentUser ? {
              ...s.currentUser,
              mobileNumber: mobile,
              mobileCountryCode: mobile.startsWith("+91") ? "+91" : mobile.startsWith("+1") ? "+1" : null,
            } : s.currentUser,
          }));
        }
      },

      verifyOtp: (code) => {
        const state = get();
        if (!state.otpCode || !state.otpExpiresAt) return false;
        if (Date.now() > new Date(state.otpExpiresAt).getTime()) return false;
        if (state.otpAttempts >= 5) return false;
        if (code !== state.otpCode) {
          set((s) => ({ otpAttempts: s.otpAttempts + 1 }));
          return false;
        }
        // Success — mark mobile verified
        const ts = nowISO();
        set((s) => ({
          currentUser: s.currentUser ? { ...s.currentUser, mobileVerifiedAt: ts, updatedAt: ts } : s.currentUser,
          otpCode: null,
          otpExpiresAt: null,
          otpAttempts: 0,
        }));
        // Decide next phase
        const memberships = get().memberships;
        const activeMembership = memberships.find(
          (m) => m.userId === get().currentUser?.id && m.status === "active"
        );
        if (activeMembership) {
          set({ authPhase: "app", selectedOrgId: activeMembership.organisationId });
        } else {
          set({ authPhase: "onboarding", authStep: "org-create" });
        }
        return true;
      },

      resendOtp: () => {
        const state = get();
        if (state.otpResendCount >= 3) return;
        if (state.currentUser?.mobileNumber) {
          get().sendOtp(state.currentUser.mobileNumber);
          set((s) => ({ otpResendCount: s.otpResendCount + 1 }));
        }
      },

      changeMobile: () => set({ authStep: "otp", otpCode: null, otpExpiresAt: null, otpAttempts: 0 }),

      signOut: () => {
        const ts = nowISO();
        set((s) => ({
          sessions: s.sessions.map((x) => x.isCurrent ? { ...x, revokedAt: ts, revocationReason: "Signed out" } : x),
          currentUser: null,
          authPhase: "public",
          authStep: "login",
          selectedOrgId: null,
          pendingEmail: null,
          pendingProvider: null,
          otpCode: null,
          activeInvitationToken: null,
        }));
      },

      signOutEverywhere: () => {
        const ts = nowISO();
        set((s) => ({
          sessions: s.sessions.map((x) => ({ ...x, revokedAt: ts, revocationReason: "Signed out everywhere", isCurrent: false })),
          currentUser: null,
          authPhase: "public",
          authStep: "login",
          selectedOrgId: null,
        }));
      },

      revokeSession: (id) => {
        const ts = nowISO();
        set((s) => ({
          sessions: s.sessions.map((x) => x.id === id ? { ...x, revokedAt: ts, revocationReason: "Revoked" } : x),
        }));
      },

      setOnboardingDraft: (patch) => set((s) => ({ onboardingDraft: { ...s.onboardingDraft, ...patch } })),

      createOrganisation: (input) => {
        const user = get().currentUser;
        if (!user) return "";
        const id = uid("org");
        const ts = nowISO();
        const org: Organisation = {
          id,
          name: input.name,
          slug: slugify(input.name),
          legalName: input.legalName ?? null,
          industry: input.industry ?? "managed_it_services",
          website: input.website ?? "",
          country: input.country ?? "United States",
          timeZone: input.timeZone ?? "America/Chicago",
          defaultLanguage: input.defaultLanguage ?? "en",
          teamSizeBand: input.teamSizeBand ?? "10-25",
          operatingModel: input.operatingModel ?? "it_service_provider",
          status: "onboarding",
          createdById: user.id,
          createdAt: ts,
          updatedAt: ts,
          businessFunctions: input.businessFunctions ?? [],
        };
        // Create owner membership
        const membership: Membership = {
          id: uid("mem"),
          organisationId: id,
          userId: user.id,
          roleKey: "owner",
          status: "onboarding",
          jobTitle: "Owner",
          employeeId: null,
          teamId: null,
          managerMembershipId: null,
          joinedAt: ts,
          lastAccessAt: null,
          onboardingCompletedAt: null,
          onboardingStep: 0,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({
          organisations: [...s.organisations, org],
          memberships: [...s.memberships, membership],
          selectedOrgId: id,
          onboardingRole: "owner",
          authPhase: "onboarding",
        }));
        return id;
      },

      completeOnboarding: () => {
        const user = get().currentUser;
        const orgId = get().selectedOrgId;
        if (!user || !orgId) return;
        const ts = nowISO();
        set((s) => ({
          memberships: s.memberships.map((m) =>
            m.userId === user.id && m.organisationId === orgId
              ? { ...m, status: "active", onboardingCompletedAt: ts, updatedAt: ts }
              : m
          ),
          organisations: s.organisations.map((o) =>
            o.id === orgId ? { ...o, status: "active", updatedAt: ts } : o
          ),
          authPhase: "app",
        }));
      },

      advanceOnboardingStep: () => {
        const user = get().currentUser;
        const orgId = get().selectedOrgId;
        if (!user || !orgId) return;
        set((s) => ({
          memberships: s.memberships.map((m) =>
            m.userId === user.id && m.organisationId === orgId
              ? { ...m, onboardingStep: m.onboardingStep + 1, updatedAt: nowISO() }
              : m
          ),
        }));
      },

      setOnboardingStep: (step) => {
        const user = get().currentUser;
        const orgId = get().selectedOrgId;
        if (!user || !orgId) return;
        set((s) => ({
          memberships: s.memberships.map((m) =>
            m.userId === user.id && m.organisationId === orgId
              ? { ...m, onboardingStep: step, updatedAt: nowISO() }
              : m
          ),
        }));
      },

      createInvitation: (input) => {
        const user = get().currentUser;
        const orgId = get().selectedOrgId;
        if (!user || !orgId) return;
        const inviterMembership = get().memberships.find(
          (m) => m.userId === user.id && m.organisationId === orgId
        );
        if (!inviterMembership) return;
        const inv: Invitation = {
          id: uid("inv"),
          organisationId: orgId,
          email: input.email,
          roleKey: input.roleKey,
          teamId: input.teamId,
          inviterMembershipId: inviterMembership.id,
          status: "pending",
          token: uid("tok"),
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          acceptedAt: null,
          createdAt: nowISO(),
        };
        set((s) => ({ invitations: [...s.invitations, inv] }));
      },

      acceptInvitation: (token) => {
        const user = get().currentUser;
        if (!user) return false;
        const inv = get().invitations.find((i) => i.token === token);
        if (!inv || inv.status !== "pending") return false;
        if (Date.now() > new Date(inv.expiresAt).getTime()) {
          set((s) => ({ invitations: s.invitations.map((i) => i.id === inv.id ? { ...i, status: "expired" } : i) }));
          return false;
        }
        // Check email match (Journey I — wrong Google account)
        if (inv.email !== user.primaryEmail) {
          return false; // caller should show "wrong account" error
        }
        const ts = nowISO();
        const membership: Membership = {
          id: uid("mem"),
          organisationId: inv.organisationId,
          userId: user.id,
          roleKey: inv.roleKey,
          status: "onboarding",
          jobTitle: "",
          employeeId: null,
          teamId: inv.teamId,
          managerMembershipId: null,
          joinedAt: ts,
          lastAccessAt: null,
          onboardingCompletedAt: null,
          onboardingStep: 0,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({
          memberships: [...s.memberships, membership],
          invitations: s.invitations.map((i) => i.id === inv.id ? { ...i, status: "accepted", acceptedAt: ts } : i),
          selectedOrgId: inv.organisationId,
          onboardingRole: inv.roleKey,
          authPhase: "onboarding",
          activeInvitationToken: null,
        }));
        return true;
      },

      revokeInvitation: (id) => {
        const ts = nowISO();
        set((s) => ({
          invitations: s.invitations.map((i) => i.id === id ? { ...i, status: "revoked" } : i),
        }));
      },

      setActiveInvitation: (token) => set({ activeInvitationToken: token }),

      updateMembership: (id, patch) =>
        set((s) => ({ memberships: s.memberships.map((m) => m.id === id ? { ...m, ...patch, updatedAt: nowISO() } : m) })),

      suspendMember: (id) =>
        set((s) => ({ memberships: s.memberships.map((m) => m.id === id ? { ...m, status: "suspended", updatedAt: nowISO() } : m) })),

      reactivateMember: (id) =>
        set((s) => ({ memberships: s.memberships.map((m) => m.id === id ? { ...m, status: "active", updatedAt: nowISO() } : m) })),

      changeMemberRole: (id, roleKey) =>
        set((s) => ({ memberships: s.memberships.map((m) => m.id === id ? { ...m, roleKey, updatedAt: nowISO() } : m) })),

      selectOrganisation: (orgId) => {
        const user = get().currentUser;
        if (!user) return;
        set((s) => ({
          selectedOrgId: orgId,
          memberships: s.memberships.map((m) =>
            m.userId === user.id && m.organisationId === orgId
              ? { ...m, lastAccessAt: nowISO() }
              : m
          ),
        }));
      },

      getCurrentMembership: () => {
        const user = get().currentUser;
        const orgId = get().selectedOrgId;
        if (!user || !orgId) return null;
        return get().memberships.find(
          (m) => m.userId === user.id && m.organisationId === orgId && m.status !== "revoked" && m.status !== "left"
        ) ?? null;
      },

      getCurrentRole: () => get().getCurrentMembership()?.roleKey,

      canAccessView: (view) => {
        const role = get().getCurrentRole();
        if (!role) return false;
        // Overview, settings always accessible
        if (view === "overview" || view === "settings") return true;
        // Check permission requirements from the view-permissions map
        const required = VIEW_PERMISSIONS[view] ?? [];
        if (required.length === 0) return true;
        return hasAnyPermission(role, required);
      },

      defaultView: () => {
        const role = get().getCurrentRole();
        return role ? defaultViewForRole(role) : "overview";
      },

      resetAuth: () =>
        set({
          version: AUTH_VERSION,
          authPhase: "public",
          currentUser: null,
          organisations: [],
          memberships: [],
          invitations: [],
          sessions: [],
          selectedOrgId: null,
          authStep: "login",
          pendingEmail: null,
          pendingProvider: null,
          otpCode: null,
          otpAttempts: 0,
          otpResendCount: 0,
          otpExpiresAt: null,
          activeInvitationToken: null,
          onboardingDraft: { ...DEFAULT_DRAFT },
          onboardingRole: null,
        }),
    }),
    {
      name: "cloudsun-auth-v1",
      storage: createJSONStorage(() => localStorage),
      version: AUTH_VERSION,
      migrate: (persisted: unknown) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        const p = persisted as Partial<AuthState>;
        if (p.version !== AUTH_VERSION) {
          return {
            version: AUTH_VERSION,
            authPhase: "public" as AuthPhase,
            currentUser: null,
            organisations: [],
            memberships: [],
            invitations: [],
            sessions: [],
            selectedOrgId: null,
            authStep: "login" as const,
            pendingEmail: null,
            pendingProvider: null,
            otpCode: null,
            otpAttempts: 0,
            otpResendCount: 0,
            otpExpiresAt: null,
            activeInvitationToken: null,
            onboardingDraft: { ...DEFAULT_DRAFT },
            onboardingRole: null,
          } as AuthState;
        }
        return persisted as AuthState;
      },
    }
  )
);
