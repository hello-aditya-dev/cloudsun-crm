"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/lib/auth-store";
import { useDemoStore } from "@/lib/demo-store";
import { AppShell } from "@/components/cloudsun/app/AppShell";
import { LandingView } from "@/components/cloudsun/views/LandingView";

// Code-split every non-landing view so the initial bundle stays small and the
// dev compiler never has to build every view at once. Each view becomes its own
// chunk that is loaded on demand when the user navigates to it.

const AuthView = dynamic(
  () => import("@/components/cloudsun/views/AuthView").then((m) => ({ default: m.AuthView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const OnboardingView = dynamic(
  () => import("@/components/cloudsun/views/OnboardingView").then((m) => ({ default: m.OnboardingView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const OverviewView = dynamic(
  () => import("@/components/cloudsun/views/OverviewView").then((m) => ({ default: m.OverviewView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const InboxView = dynamic(
  () => import("@/components/cloudsun/views/InboxView").then((m) => ({ default: m.InboxView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const ContactsView = dynamic(
  () => import("@/components/cloudsun/views/ContactsView").then((m) => ({ default: m.ContactsView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const ContactDetail = dynamic(
  () => import("@/components/cloudsun/views/ContactDetail").then((m) => ({ default: m.ContactDetail })),
  { loading: () => <ViewLoading />, ssr: false },
);
const CompaniesView = dynamic(
  () => import("@/components/cloudsun/views/CompaniesView").then((m) => ({ default: m.CompaniesView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const CompanyDetail = dynamic(
  () => import("@/components/cloudsun/views/CompanyDetail").then((m) => ({ default: m.CompanyDetail })),
  { loading: () => <ViewLoading />, ssr: false },
);
const TeamAdminView = dynamic(
  () => import("@/components/cloudsun/views/TeamAdminView").then((m) => ({ default: m.TeamAdminView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const SecuritySettingsView = dynamic(
  () => import("@/components/cloudsun/views/SecuritySettingsView").then((m) => ({
    default: m.SecuritySettingsView,
  })),
  { loading: () => <ViewLoading />, ssr: false },
);
const PermissionDeniedView = dynamic(
  () => import("@/components/cloudsun/views/PermissionDeniedView").then((m) => ({
    default: m.PermissionDeniedView,
  })),
  { loading: () => <ViewLoading />, ssr: false },
);
const CallsView = dynamic(
  () => import("@/components/cloudsun/views/SecondaryViews").then((m) => ({ default: m.CallsView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const CalendarView = dynamic(
  () => import("@/components/cloudsun/views/SecondaryViews").then((m) => ({ default: m.CalendarView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const KnowledgeView = dynamic(
  () => import("@/components/cloudsun/views/SecondaryViews").then((m) => ({ default: m.KnowledgeView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const AutomationsView = dynamic(
  () => import("@/components/cloudsun/views/SecondaryViews").then((m) => ({ default: m.AutomationsView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const AnalyticsView = dynamic(
  () => import("@/components/cloudsun/views/SecondaryViews").then((m) => ({ default: m.AnalyticsView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const TeamView = dynamic(
  () => import("@/components/cloudsun/views/SecondaryViews").then((m) => ({ default: m.TeamView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const IntegrationsView = dynamic(
  () => import("@/components/cloudsun/views/SecondaryViews").then((m) => ({
    default: m.IntegrationsView,
  })),
  { loading: () => <ViewLoading />, ssr: false },
);
const SettingsView = dynamic(
  () => import("@/components/cloudsun/views/SecondaryViews").then((m) => ({ default: m.SettingsView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const BillingView = dynamic(
  () => import("@/components/cloudsun/views/SecondaryViews").then((m) => ({ default: m.BillingView })),
  { loading: () => <ViewLoading />, ssr: false },
);
const AuditLogView = dynamic(
  () => import("@/components/cloudsun/views/SecondaryViews").then((m) => ({ default: m.AuditLogView })),
  { loading: () => <ViewLoading />, ssr: false },
);

function ViewLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading view"
      className="flex min-h-[60vh] w-full items-center justify-center p-8"
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span
          className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}

export default function Home() {
  const authPhase = useAuthStore((s) => s.authPhase);
  const canAccessView = useAuthStore((s) => s.canAccessView);
  const view = useDemoStore((s) => s.view);

  // Phase 1: Public landing website
  if (authPhase === "public") {
    return (
      <LandingView
        onGetStarted={() => useAuthStore.getState().startSignup()}
        onSignIn={() => useAuthStore.getState().startLogin()}
      />
    );
  }

  // Phase 2: Authentication (login / signup / OTP)
  if (authPhase === "auth") {
    return <AuthView />;
  }

  // Phase 3: Role-specific onboarding
  if (authPhase === "onboarding") {
    return <OnboardingView />;
  }

  // Phase 4: Authorised workspace (app shell)
  // Check view access permissions
  if (!canAccessView(view.view)) {
    return (
      <AppShell>
        <PermissionDeniedView viewId={view.view} />
      </AppShell>
    );
  }

  const renderView = () => {
    switch (view.view) {
      case "overview":
        return <OverviewView />;
      case "inbox":
        return <InboxView conversationId={view.params.detailId} />;
      case "contacts":
        return view.params.detailId ? (
          <ContactDetail contactId={view.params.detailId} />
        ) : (
          <ContactsView />
        );
      case "companies":
        return view.params.detailId ? (
          <CompanyDetail companyId={view.params.detailId} />
        ) : (
          <CompaniesView />
        );
      case "calls":
        return <CallsView />;
      case "calendar":
        return <CalendarView />;
      case "knowledge":
        return <KnowledgeView />;
      case "automations":
        return <AutomationsView />;
      case "analytics":
        return <AnalyticsView />;
      case "team":
        return <TeamAdminView />;
      case "integrations":
        return <IntegrationsView />;
      case "settings":
        return view.params.detailId === "security" ? <SecuritySettingsView /> : <SettingsView />;
      case "billing":
        return <BillingView />;
      case "audit_log":
        return <AuditLogView />;
      default:
        return <OverviewView />;
    }
  };

  return <AppShell>{renderView()}</AppShell>;
}
