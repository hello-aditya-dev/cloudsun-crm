"use client";

import * as React from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useDemoStore } from "@/lib/demo-store";
import { AppShell } from "@/components/cloudsun/app/AppShell";
import { LandingView } from "@/components/cloudsun/views/LandingView";
import { AuthView } from "@/components/cloudsun/views/AuthView";
import { OnboardingView } from "@/components/cloudsun/views/OnboardingView";
import { OverviewView } from "@/components/cloudsun/views/OverviewView";
import { InboxView } from "@/components/cloudsun/views/InboxView";
import { ContactsView } from "@/components/cloudsun/views/ContactsView";
import { ContactDetail } from "@/components/cloudsun/views/ContactDetail";
import { CompaniesView } from "@/components/cloudsun/views/CompaniesView";
import { CompanyDetail } from "@/components/cloudsun/views/CompanyDetail";
import {
  CallsView,
  CalendarView,
  KnowledgeView,
  AutomationsView,
  AnalyticsView,
  TeamView,
  IntegrationsView,
  SettingsView,
  BillingView,
  AuditLogView,
} from "@/components/cloudsun/views/SecondaryViews";
import { TeamAdminView } from "@/components/cloudsun/views/TeamAdminView";
import { SecuritySettingsView } from "@/components/cloudsun/views/SecuritySettingsView";
import { PermissionDeniedView } from "@/components/cloudsun/views/PermissionDeniedView";

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
