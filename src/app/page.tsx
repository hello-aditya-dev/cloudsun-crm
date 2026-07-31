"use client";

import * as React from "react";
import { useDemoStore } from "@/lib/demo-store";
import { AppShell } from "@/components/cloudsun/app/AppShell";
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

export default function Home() {
  const view = useDemoStore((s) => s.view);

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
        return <TeamView />;
      case "integrations":
        return <IntegrationsView />;
      case "settings":
        return <SettingsView />;
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
