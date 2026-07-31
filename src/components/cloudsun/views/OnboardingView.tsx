"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { onboardingSteps, ROLES, roleMeta, ROLE_LIST } from "@/config/rbac";
import { industryMeta } from "@/lib/display";
import { product } from "@/config/cloudsun";
import { Button } from "@/components/cloudsun/shared/Button";
import { ContactAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { StatusBadge } from "@/components/cloudsun/shared/StatusBadge";
import type { RoleKey, OperatingModel, OnboardingDraft } from "@/types/domain";
import {
  Sun, ArrowRight, ArrowLeft, Check, X, Building2, Users, Shield,
  Mail, Phone, Globe, Clock, Bell, Sparkles, Plus, Trash2, ChevronRight,
  LogOut, HelpCircle, CheckCircle2, AlertCircle, Layers, Briefcase,
} from "lucide-react";

const INDUSTRIES = Object.entries(industryMeta);
const OPERATING_MODELS: { value: OperatingModel; label: string }[] = [
  { value: "internal_it_team", label: "Internal IT team" },
  { value: "it_service_provider", label: "IT service provider" },
  { value: "managed_service_provider", label: "Managed service provider" },
  { value: "saas_company", label: "SaaS company" },
  { value: "technology_vendor", label: "Technology vendor" },
  { value: "bpo_for_it", label: "BPO for IT" },
  { value: "other", label: "Other" },
];
const BUSINESS_FUNCTIONS = [
  "IT sales", "Technical support", "Customer success", "Implementation",
  "Managed services", "Security operations", "Billing", "Management",
];
const TEAM_SUGGESTIONS = ["Sales", "Technical Support", "Customer Success", "Implementation", "Operations", "Management"];
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function OnboardingView() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const organisations = useAuthStore((s) => s.organisations);
  const memberships = useAuthStore((s) => s.memberships);
  const selectedOrgId = useAuthStore((s) => s.selectedOrgId);
  const onboardingDraft = useAuthStore((s) => s.onboardingDraft);
  const setOnboardingDraft = useAuthStore((s) => s.setOnboardingDraft);
  const createOrganisation = useAuthStore((s) => s.createOrganisation);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const advanceOnboardingStep = useAuthStore((s) => s.advanceOnboardingStep);
  const setOnboardingStep = useAuthStore((s) => s.setOnboardingStep);
  const signOut = useAuthStore((s) => s.signOut);
  const invitations = useAuthStore((s) => s.invitations);
  const createInvitation = useAuthStore((s) => s.createInvitation);

  const org = organisations.find((o) => o.id === selectedOrgId);
  const membership = memberships.find(
    (m) => m.userId === currentUser?.id && m.organisationId === selectedOrgId
  );
  const roleKey = membership?.roleKey ?? "owner";
  const steps = onboardingSteps[roleKey] ?? onboardingSteps.owner;
  const currentStep = membership?.onboardingStep ?? 0;
  const step = steps[currentStep] ?? steps[0];

  // If no org exists yet, show org creation first (owner journey)
  if (!org && roleKey === "owner") {
    return (
      <OrgCreateStep
        draft={onboardingDraft}
        setDraft={setOnboardingDraft}
        onCreate={(name) => {
          createOrganisation({
            name,
            website: onboardingDraft.website,
            industry: onboardingDraft.industry,
            country: onboardingDraft.country,
            timeZone: onboardingDraft.timeZone,
            defaultLanguage: onboardingDraft.language,
            operatingModel: onboardingDraft.operatingModel,
            businessFunctions: onboardingDraft.businessFunctions,
            teamSizeBand: "10-25",
          });
        }}
        currentUser={currentUser}
        onSignOut={signOut}
      />
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleContinue = () => {
    if (isLastStep) {
      completeOnboarding();
    } else {
      advanceOnboardingStep();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setOnboardingStep(currentStep - 1);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface-app">
      {/* Onboarding shell header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sun className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{product.name}</p>
              <p className="text-[10px] text-muted-foreground">{org?.name ?? "Onboarding"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Help">
              <HelpCircle className="h-4 w-4" />
            </button>
            <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-surface-inset">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {/* Step content */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step {currentStep + 1} of {steps.length} · {roleMeta[roleKey].label}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">{step.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
        </div>

        <OnboardingStepContent
          stepId={step.id}
          roleKey={roleKey}
          draft={onboardingDraft}
          setDraft={setOnboardingDraft}
          org={org}
          currentUser={currentUser}
          invitations={invitations.filter((i) => i.organisationId === selectedOrgId)}
          createInvitation={createInvitation}
        />

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:block">
              Progress is saved automatically
            </span>
            <Button onClick={handleContinue}>
              {isLastStep ? (
                roleKey === "owner" ? "Open CloudSun" : "Open my workspace"
              ) : (
                <>Continue <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Org creation (first step for owners with no org)                     */
/* ------------------------------------------------------------------ */

function OrgCreateStep({
  draft, setDraft, onCreate, currentUser, onSignOut,
}: {
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  onCreate: (name: string) => void;
  currentUser: ReturnType<typeof useAuthStore.getState>["currentUser"];
  onSignOut: () => void;
}) {
  const [name, setName] = React.useState(draft.orgName);
  const [error, setError] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your organisation name.");
      return;
    }
    setDraft({ orgName: name });
    onCreate(name);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface-app">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sun className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">{product.name}</p>
          </div>
          <button onClick={onSignOut} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 elevation-raised">
          <div className="mb-6 flex items-center gap-3">
            {currentUser && <ContactAvatar name={currentUser.displayName} color={currentUser.avatarColor} size="md" />}
            <div>
              <p className="text-sm font-medium text-foreground">Welcome, {currentUser?.givenName || currentUser?.displayName}</p>
              <p className="text-xs text-muted-foreground">Let's set up your organisation.</p>
            </div>
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Create your organisation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You'll be the organisation owner with full authority over billing, security and all teams.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="orgName" className="mb-1 block text-xs font-medium text-muted-foreground">Organisation name</label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="orgName"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  placeholder="Northbridge Systems"
                  className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
            </div>
            {error && <p className="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}
            <Button type="submit" className="w-full">
              Create organisation <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          You can configure industry, teams and integrations in the next steps.
        </p>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step content renderer                                                */
/* ------------------------------------------------------------------ */

function OnboardingStepContent({
  stepId, roleKey, draft, setDraft, org, currentUser, invitations, createInvitation,
}: {
  stepId: string;
  roleKey: RoleKey;
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  org: ReturnType<typeof useAuthStore.getState>["organisations"][0] | undefined;
  currentUser: ReturnType<typeof useAuthStore.getState>["currentUser"];
  invitations: ReturnType<typeof useAuthStore.getState>["invitations"];
  createInvitation: (input: { email: string; roleKey: RoleKey; teamId: string | null }) => void;
}) {
  switch (stepId) {
    case "welcome":
      return <WelcomeStep roleKey={roleKey} org={org} currentUser={currentUser} draft={draft} />;
    case "org-profile":
      return <OrgProfileStep draft={draft} setDraft={setDraft} />;
    case "business-functions":
      return <BusinessFunctionsStep draft={draft} setDraft={setDraft} />;
    case "teams":
      return <TeamsStep draft={draft} setDraft={setDraft} />;
    case "roles":
      return <RolesStep />;
    case "invite-managers":
      return <InviteStep draft={draft} setDraft={setDraft} invitations={invitations} createInvitation={createInvitation} roles={["administrator", "operations_manager", "supervisor"]} title="Invite managers" description="Invite administrators, operations managers and supervisors." />;
    case "invite-employees":
      return <InviteStep draft={draft} setDraft={setDraft} invitations={invitations} createInvitation={createInvitation} roles={["employee", "analyst", "read_only"]} title="Invite employees" description="Invite team members to your organisation." />;
    case "customer-data":
      return <CustomerDataStep />;
    case "integrations":
      return <IntegrationsStep />;
    case "preferences":
      return <PreferencesStep draft={draft} setDraft={setDraft} />;
    case "security":
      return <SecurityStep currentUser={currentUser} />;
    case "review":
      return <ReviewStep draft={draft} org={org} invitations={invitations} />;
    case "profile":
      return <ProfileStep currentUser={currentUser} />;
    case "mobile":
      return <MobileConfirmStep currentUser={currentUser} />;
    case "powers":
      return <PowersStep roleKey={roleKey} />;
    case "responsibilities":
      return <ResponsibilitiesStep />;
    case "departments":
    case "work-allocation":
    case "visibility":
    case "escalations":
    case "assignment":
    case "team":
    case "employees":
    case "settings":
    case "scope":
    case "reports":
      return <InfoStep stepId={stepId} roleKey={roleKey} />;
    case "communication":
    case "notifications":
      return <NotificationsStep draft={draft} setDraft={setDraft} />;
    case "availability":
      return <AvailabilityStep draft={draft} setDraft={setDraft} />;
    case "tour":
    case "ready":
    case "enter":
      return <TourStep roleKey={roleKey} />;
    default:
      return <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Step content coming soon.</div>;
  }
}

/* --- Individual steps --- */

function StepCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      {title && <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>}
      <div className="rounded-xl border border-border bg-card p-5 elevation-subtle">{children}</div>
    </div>
  );
}

function WelcomeStep({ roleKey, org, currentUser, draft }: { roleKey: RoleKey; org: any; currentUser: any; draft: OnboardingDraft }) {
  const responsibilities: Record<RoleKey, string[]> = {
    owner: ["Full authority over the organisation", "Manage billing, security and all teams", "Transfer ownership (requires re-authentication)", "Configure integrations and retention policies"],
    administrator: ["Manage memberships, teams and roles", "Configure organisation settings", "Cannot transfer ownership", "Cannot perform owner-only billing actions"],
    operations_manager: ["Manage assigned departments and teams", "Allocate work across teams", "View operational reports within scope", "Cannot manage billing or organisation-wide security"],
    supervisor: ["Manage assigned team and employees", "Assign team conversations", "Handle escalations within team scope", "Cannot manage organisation or billing"],
    employee: ["Access assigned contacts and conversations", "Add internal notes and update permitted fields", "Complete assigned follow-ups", "Cannot invite users or export data"],
    analyst: ["View authorised reports and aggregated records", "Export only if separately permitted", "Cannot modify operational records by default"],
    read_only: ["View explicitly authorised modules", "Cannot mutate data"],
  };
  return (
    <StepCard>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {currentUser && <ContactAvatar name={currentUser.displayName} color={currentUser.avatarColor} size="lg" />}
          <div>
            <p className="text-sm text-muted-foreground">Welcome to</p>
            <p className="font-display text-xl font-semibold text-foreground">{org?.name ?? "CloudSun"}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          You're joining as <span className="font-medium text-foreground">{roleMeta[roleKey].label}</span>. Here's what you'll be able to do:
        </p>
        <ul className="space-y-2">
          {responsibilities[roleKey].map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" /> {r}
            </li>
          ))}
        </ul>
      </div>
    </StepCard>
  );
}

function OrgProfileStep({ draft, setDraft }: { draft: OnboardingDraft; setDraft: (p: Partial<OnboardingDraft>) => void }) {
  return (
    <StepCard title="Organisation profile">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Organisation name"><input value={draft.orgName} onChange={(e) => setDraft({ orgName: e.target.value })} className="input-cs" /></Field>
        <Field label="Website"><input value={draft.website} onChange={(e) => setDraft({ website: e.target.value })} placeholder="company.com" className="input-cs" /></Field>
        <Field label="Industry">
          <select value={draft.industry} onChange={(e) => setDraft({ industry: e.target.value })} className="input-cs">
            {INDUSTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Country"><input value={draft.country} onChange={(e) => setDraft({ country: e.target.value })} className="input-cs" /></Field>
        <Field label="Time zone"><input value={draft.timeZone} onChange={(e) => setDraft({ timeZone: e.target.value })} className="input-cs" /></Field>
        <Field label="Default language"><input value={draft.language} onChange={(e) => setDraft({ language: e.target.value })} className="input-cs" /></Field>
        <Field label="Operating model">
          <select value={draft.operatingModel} onChange={(e) => setDraft({ operatingModel: e.target.value as OperatingModel })} className="input-cs">
            {OPERATING_MODELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>
      <style jsx>{`.input-cs{h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring}`}</style>
      <style>{`.input-cs{height:2.5rem;width:100%;border-radius:0.5rem;border:1px solid var(--input);background:var(--card);padding:0 0.75rem;font-size:0.875rem}.input-cs:focus{outline:none;box-shadow:0 0 0 2px var(--ring)}`}</style>
    </StepCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function BusinessFunctionsStep({ draft, setDraft }: { draft: OnboardingDraft; setDraft: (p: Partial<OnboardingDraft>) => void }) {
  const toggle = (fn: string) => {
    const has = draft.businessFunctions.includes(fn);
    setDraft({ businessFunctions: has ? draft.businessFunctions.filter((f) => f !== fn) : [...draft.businessFunctions, fn] });
  };
  return (
    <StepCard title="Business functions" >
      <p className="mb-3 text-sm text-muted-foreground">Select your IT operations functions. We'll recommend default teams based on your selection.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {BUSINESS_FUNCTIONS.map((fn) => (
          <button key={fn} onClick={() => toggle(fn)} className={cn("flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors", draft.businessFunctions.includes(fn) ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:bg-surface-hover")}>
            {fn}
            {draft.businessFunctions.includes(fn) && <Check className="h-4 w-4" />}
          </button>
        ))}
      </div>
    </StepCard>
  );
}

function TeamsStep({ draft, setDraft }: { draft: OnboardingDraft; setDraft: (p: Partial<OnboardingDraft>) => void }) {
  const addTeam = () => setDraft({ teams: [...draft.teams, { id: `t-${Date.now()}`, name: "New team" }] });
  const removeTeam = (id: string) => setDraft({ teams: draft.teams.filter((t) => t.id !== id) });
  const renameTeam = (id: string, name: string) => setDraft({ teams: draft.teams.map((t) => t.id === id ? { ...t, name } : t) });
  const suggestionsLeft = TEAM_SUGGESTIONS.filter((s) => !draft.teams.some((t) => t.name === s));
  return (
    <StepCard title="Teams">
      <p className="mb-3 text-sm text-muted-foreground">Create teams for your organisation. You can rename, add or remove teams later.</p>
      <div className="space-y-2">
        {draft.teams.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={t.name} onChange={(e) => renameTeam(t.id, e.target.value)} className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button onClick={() => removeTeam(t.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/5 hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Remove team"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestionsLeft.map((s) => (
          <button key={s} onClick={() => setDraft({ teams: [...draft.teams, { id: `t-${Date.now()}`, name: s }] })} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground"><Plus className="h-3 w-3" /> {s}</button>
        ))}
        <button onClick={addTeam} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15"><Plus className="h-3 w-3" /> Add team</button>
      </div>
    </StepCard>
  );
}

function RolesStep() {
  return (
    <StepCard title="Roles and control">
      <p className="mb-3 text-sm text-muted-foreground">CloudSun uses explicit permissions, not just role names. Review the default roles:</p>
      <div className="space-y-2">
        {ROLE_LIST.map((r) => (
          <div key={r.key} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{r.name}</span>
              <StatusBadge kind="custom" label={`${r.permissions.length} permissions`} meta={{ label: `${r.permissions.length} permissions`, badge: "bg-surface-inset text-muted-foreground border-border", dot: "bg-neutral-status" }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">You can create custom roles later from Team settings.</p>
    </StepCard>
  );
}

function InviteStep({
  draft, setDraft, invitations, createInvitation, roles, title, description,
}: {
  draft: OnboardingDraft; setDraft: (p: Partial<OnboardingDraft>) => void;
  invitations: ReturnType<typeof useAuthStore.getState>["invitations"];
  createInvitation: (input: { email: string; roleKey: RoleKey; teamId: string | null }) => void;
  roles: RoleKey[]; title: string; description: string;
}) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<RoleKey>(roles[0]);
  const [team, setTeam] = React.useState<string>("");
  const [error, setError] = React.useState("");

  const send = () => {
    if (!email.includes("@")) { setError("Enter a valid email."); return; }
    createInvitation({ email, roleKey: role, teamId: team || null });
    setDraft({ invites: [...draft.invites, { email, roleKey: role, teamId: team || null }] });
    setEmail(""); setError("");
  };

  const allInvites = [...draft.invites];
  return (
    <StepCard title={title}>
      <p className="mb-3 text-sm text-muted-foreground">{description}</p>
      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" className="h-9 flex-1 rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <select value={role} onChange={(e) => setRole(e.target.value as RoleKey)} className="h-9 rounded-lg border border-input bg-card px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {roles.map((r) => <option key={r} value={r}>{roleMeta[r].label}</option>)}
          </select>
          <select value={team} onChange={(e) => setTeam(e.target.value)} className="h-9 rounded-lg border border-input bg-card px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">No team</option>
            {draft.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <Button size="sm" onClick={send}><Mail className="h-3.5 w-3.5" /> Invite</Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      {allInvites.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{allInvites.length} pending invitation{allInvites.length !== 1 ? "s" : ""}</p>
          <ul className="space-y-1.5">
            {allInvites.map((inv, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border border-border bg-surface-inset px-3 py-2 text-sm">
                <span className="text-foreground">{inv.email}</span>
                <span className="text-xs text-muted-foreground">{roleMeta[inv.roleKey].label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </StepCard>
  );
}

function CustomerDataStep() {
  const [choice, setChoice] = React.useState("demo");
  return (
    <StepCard title="Customer data">
      <p className="mb-3 text-sm text-muted-foreground">How would you like to start with customer records?</p>
      <div className="space-y-2">
        {[
          { id: "demo", label: "Start with demonstration data", desc: "Pre-loaded with fictional IT companies and contacts" },
          { id: "import", label: "Import contacts later", desc: "Start clean and import from CSV or integrations" },
          { id: "create", label: "Create first company", desc: "Add your first customer manually" },
          { id: "skip", label: "Skip for now", desc: "Add data whenever you're ready" },
        ].map((o) => (
          <button key={o.id} onClick={() => setChoice(o.id)} className={cn("flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors", choice === o.id ? "border-primary/30 bg-primary/10" : "border-border bg-card hover:bg-surface-hover")}>
            <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", choice === o.id ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
              {choice === o.id && <Check className="h-3 w-3" />}
            </span>
            <div><p className="text-sm font-medium text-foreground">{o.label}</p><p className="text-xs text-muted-foreground">{o.desc}</p></div>
          </button>
        ))}
      </div>
    </StepCard>
  );
}

function IntegrationsStep() {
  const integrations = [
    { name: "Google / Gmail", status: "Not connected", note: "Separate from Google sign-in", demo: true },
    { name: "Microsoft", status: "Planned", note: "Coming soon", demo: false },
    { name: "WhatsApp", status: "Demonstration only", note: "No real messages sent", demo: true },
    { name: "Telephony", status: "Demonstration only", note: "Simulated call logging", demo: true },
    { name: "Website chat", status: "Not connected", note: "Embeddable widget", demo: false },
  ];
  return (
    <StepCard title="Communication integrations">
      <p className="mb-3 text-sm text-muted-foreground">Review your communication channels. All are optional — you can connect them later.</p>
      <div className="space-y-2">
        {integrations.map((i) => (
          <div key={i.name} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div><p className="text-sm font-medium text-foreground">{i.name}</p><p className="text-xs text-muted-foreground">{i.note}</p></div>
            <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", i.demo ? "bg-ember/10 text-ember" : "bg-muted text-muted-foreground")}>{i.status}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Gmail connection is separate from Google sign-in and requires administrator permission.</p>
    </StepCard>
  );
}

function PreferencesStep({ draft, setDraft }: { draft: OnboardingDraft; setDraft: (p: Partial<OnboardingDraft>) => void }) {
  const toggleDay = (d: string) => {
    const has = draft.workingDays.includes(d);
    setDraft({ workingDays: has ? draft.workingDays.filter((x) => x !== d) : [...draft.workingDays, d] });
  };
  return (
    <StepCard title="Work preferences">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Working days</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button key={d} onClick={() => toggleDay(d)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium uppercase transition-colors", draft.workingDays.includes(d) ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-surface-hover")}>{d}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Working hours start"><input type="time" value={draft.workingHoursStart} onChange={(e) => setDraft({ workingHoursStart: e.target.value })} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
          <Field label="Working hours end"><input type="time" value={draft.workingHoursEnd} onChange={(e) => setDraft({ workingHoursEnd: e.target.value })} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
          <Field label="Default response target">
            <select value={draft.responseTarget} onChange={(e) => setDraft({ responseTarget: e.target.value })} className="h-9 w-full rounded-lg border border-input bg-card px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="1h">1 hour</option><option value="4h">4 hours</option><option value="8h">8 hours</option><option value="24h">24 hours</option>
            </select>
          </Field>
        </div>
      </div>
    </StepCard>
  );
}

function SecurityStep({ currentUser }: { currentUser: any }) {
  return (
    <StepCard title="Security review">
      <div className="space-y-3">
        <SecurityRow icon={Check} label="Owner identity" value={currentUser?.displayName} ok />
        <SecurityRow icon={Check} label="Verified email" value={currentUser?.primaryEmail} ok />
        <SecurityRow icon={currentUser?.mobileVerifiedAt ? Check : AlertCircle} label="Verified mobile" value={currentUser?.mobileNumber ?? "Not verified"} ok={!!currentUser?.mobileVerifiedAt} />
        <SecurityRow icon={Shield} label="Active sessions" value="1 current session" ok />
        <SecurityRow icon={Building2} label="Organisation domain" value="Configured during setup" ok />
        <SecurityRow icon={Layers} label="Data access principle" value="Permission-based, role-enforced" ok />
      </div>
      <p className="mt-3 rounded-lg border border-border bg-surface-inset px-3 py-2 text-xs text-muted-foreground">
        CloudSun enforces permission checks at the data-access layer, not just in the browser. Roles define what you can do; permissions define what the system allows.
      </p>
    </StepCard>
  );
}

function SecurityRow({ icon: Icon, label, value, ok }: { icon: any; label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <Icon className={cn("h-4 w-4", ok ? "text-forest" : "text-warning")} />
      <div className="flex-1"><p className="text-sm font-medium text-foreground">{label}</p><p className="text-xs text-muted-foreground">{value}</p></div>
      {ok ? <Check className="h-4 w-4 text-forest" /> : <AlertCircle className="h-4 w-4 text-warning" />}
    </div>
  );
}

function ReviewStep({ draft, org, invitations }: { draft: OnboardingDraft; org: any; invitations: any[] }) {
  return (
    <StepCard title="Review and launch">
      <div className="space-y-3">
        <ReviewRow icon={Building2} label="Organisation" value={`${org?.name} · ${draft.industry}`} />
        <ReviewRow icon={Briefcase} label="Operating model" value={OPERATING_MODELS.find((o) => o.value === draft.operatingModel)?.label ?? draft.operatingModel} />
        <ReviewRow icon={Users} label="Teams" value={`${draft.teams.length} teams: ${draft.teams.map((t) => t.name).join(", ")}`} />
        <ReviewRow icon={Mail} label="Invitations" value={`${draft.invites.length} pending`} />
        <ReviewRow icon={Clock} label="Working hours" value={`${draft.workingHoursStart}–${draft.workingHoursEnd} · ${draft.workingDays.join(", ")}`} />
        <ReviewRow icon={Bell} label="Response target" value={draft.responseTarget} />
      </div>
      <p className="mt-3 rounded-lg border border-forest/20 bg-forest/5 px-3 py-2 text-xs text-forest">
        <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" /> Ready to launch. You can change everything later from settings.
      </p>
    </StepCard>
  );
}

function ReviewRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="text-sm text-foreground">{value}</p></div>
    </div>
  );
}

function ProfileStep({ currentUser }: { currentUser: any }) {
  return (
    <StepCard title="Confirm your profile">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Display name"><input defaultValue={currentUser?.displayName} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
        <Field label="Email"><input defaultValue={currentUser?.primaryEmail} disabled className="h-9 w-full rounded-lg border border-input bg-surface-inset px-3 text-sm text-muted-foreground" /></Field>
        <Field label="Job title"><input placeholder="e.g. IT Manager" className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
        <Field label="Time zone"><input defaultValue={currentUser?.timeZone} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
      </div>
    </StepCard>
  );
}

function MobileConfirmStep({ currentUser }: { currentUser: any }) {
  return (
    <StepCard title="Mobile verification">
      <div className="flex items-center gap-3 rounded-lg border border-forest/20 bg-forest/5 p-3">
        <Check className="h-5 w-5 text-forest" />
        <div><p className="text-sm font-medium text-foreground">{currentUser?.mobileNumber}</p><p className="text-xs text-muted-foreground">Verified {currentUser?.mobileVerifiedAt ? new Date(currentUser.mobileVerifiedAt).toLocaleDateString() : ""}</p></div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Your mobile number is used for identity verification and security notifications.</p>
    </StepCard>
  );
}

function PowersStep({ roleKey }: { roleKey: RoleKey }) {
  const role = ROLES[roleKey === "owner" ? "administrator" : roleKey];
  return (
    <StepCard title="Your authority">
      <p className="mb-3 text-sm text-muted-foreground">As {roleMeta[roleKey].label}, you have {role.permissions.length} permissions. Here's what you can and cannot do:</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium text-forest">You can</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {role.permissions.slice(0, 8).map((p) => <li key={p} className="flex items-center gap-1"><Check className="h-3 w-3 text-forest" /> {p}</li>)}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-destructive">You cannot</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-1"><X className="h-3 w-3 text-destructive" /> Transfer ownership</li>
            <li className="flex items-center gap-1"><X className="h-3 w-3 text-destructive" /> Remove the final owner</li>
            <li className="flex items-center gap-1"><X className="h-3 w-3 text-destructive" /> Access owner-only billing</li>
          </ul>
        </div>
      </div>
    </StepCard>
  );
}

function ResponsibilitiesStep() {
  return (
    <StepCard title="Your responsibilities">
      <ul className="space-y-2 text-sm text-muted-foreground">
        {["Manage assigned contacts and authorised companies", "Respond to assigned conversations", "Add internal notes visible to your team", "Update permitted CRM fields", "Complete assigned follow-ups"].map((r, i) => (
          <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-forest" /> {r}</li>
        ))}
      </ul>
      <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
        <p className="text-xs font-medium text-destructive">Restricted actions</p>
        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          <li>• Invite users or change roles</li>
          <li>• Export organisation data</li>
          <li>• Access unrestricted records</li>
        </ul>
      </div>
    </StepCard>
  );
}

function NotificationsStep({ draft, setDraft }: { draft: OnboardingDraft; setDraft: (p: Partial<OnboardingDraft>) => void }) {
  const toggle = (key: keyof OnboardingDraft["notifications"]) => setDraft({ notifications: { ...draft.notifications, [key]: !draft.notifications[key] } });
  const items: { key: keyof OnboardingDraft["notifications"]; label: string; desc: string }[] = [
    { key: "email", label: "Email notifications", desc: "Receive updates via email" },
    { key: "assignment", label: "Assignment notifications", desc: "When a conversation is assigned to you" },
    { key: "urgent", label: "Urgent escalations", desc: "High-priority and SLA-breached items" },
    { key: "followUps", label: "Follow-up reminders", desc: "Reminders for upcoming follow-ups" },
  ];
  return (
    <StepCard title="Notification preferences">
      <div className="space-y-2">
        {items.map((n) => (
          <label key={n.key} className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-3">
            <div><p className="text-sm font-medium text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
            <button onClick={() => toggle(n.key)} className={cn("relative h-5 w-9 rounded-full transition-colors", draft.notifications[n.key] ? "bg-primary" : "bg-muted")} role="switch" aria-checked={draft.notifications[n.key]}>
              <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform", draft.notifications[n.key] ? "translate-x-4" : "translate-x-0.5")} />
            </button>
          </label>
        ))}
      </div>
    </StepCard>
  );
}

function AvailabilityStep({ draft, setDraft }: { draft: OnboardingDraft; setDraft: (p: Partial<OnboardingDraft>) => void }) {
  const toggleDay = (d: string) => {
    const has = draft.workingDays.includes(d);
    setDraft({ workingDays: has ? draft.workingDays.filter((x) => x !== d) : [...draft.workingDays, d] });
  };
  return (
    <StepCard title="Availability">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Working days</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button key={d} onClick={() => toggleDay(d)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium uppercase transition-colors", draft.workingDays.includes(d) ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-surface-hover")}>{d}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Working hours start"><input type="time" value={draft.workingHoursStart} onChange={(e) => setDraft({ workingHoursStart: e.target.value })} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
          <Field label="Working hours end"><input type="time" value={draft.workingHoursEnd} onChange={(e) => setDraft({ workingHoursEnd: e.target.value })} className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></Field>
        </div>
      </div>
    </StepCard>
  );
}

function InfoStep({ stepId, roleKey }: { stepId: string; roleKey: RoleKey }) {
  const info: Record<string, { title: string; body: string }> = {
    departments: { title: "Assigned departments", body: "You'll manage the departments assigned by your organisation owner or administrator. Department scope determines which teams and records you can access." },
    "work-allocation": { title: "Work allocation", body: "As an operations manager, you can distribute work across your teams, reassign conversations and balance workload. Allocation respects team boundaries and permission scopes." },
    visibility: { title: "Contact and conversation visibility", body: "You can view all contacts and conversations within your assigned departments. Access to other departments requires explicit permission." },
    escalations: { title: "Escalation preferences", body: "Escalated conversations and SLA breaches will be routed to you based on your team scope. Configure notification urgency in the next step." },
    assignment: { title: "Conversation assignment", body: "As a supervisor, you assign conversations within your team, monitor response times and handle escalations from your team members." },
    team: { title: "Your team", body: "Your assigned team and its members are configured by your manager. You can view team activity and workload from your supervisor dashboard." },
    employees: { title: "Assigned employees", body: "You'll oversee the employees in your team, monitor their workload and help with escalations." },
    settings: { title: "Organisation settings", body: "You can manage organisation configuration within your permission scope. Owner-only settings like billing transfer are restricted." },
    scope: { title: "Access scope", body: "Your read-only access lets you view authorised modules. You cannot create, update or delete records." },
    reports: { title: "Report access", body: "You have access to operational reports and analytics within your organisation. Export requires separate permission." },
  };
  const i = info[stepId] ?? { title: stepId, body: "Information about this step." };
  return (
    <StepCard title={i.title}>
      <p className="text-sm text-muted-foreground">{i.body}</p>
    </StepCard>
  );
}

function TourStep({ roleKey }: { roleKey: RoleKey }) {
  const tour = [
    { icon: "📊", label: "Overview", desc: "Your operational snapshot" },
    { icon: "📥", label: "Inbox", desc: "Unified conversations" },
    { icon: "👥", label: "Contacts", desc: "Decision-makers and leads" },
    { icon: "🏢", label: "Companies", desc: "Customer organisations" },
    { icon: "🔍", label: "Search", desc: "Find anything with ⌘K" },
    { icon: "🔔", label: "Notifications", desc: "Stay on top of updates" },
  ];
  return (
    <StepCard title="Product tour">
      <p className="mb-3 text-sm text-muted-foreground">Here's a quick orientation to your workspace:</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {tour.map((t) => (
          <div key={t.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <span className="text-2xl">{t.icon}</span>
            <div><p className="text-sm font-medium text-foreground">{t.label}</p><p className="text-xs text-muted-foreground">{t.desc}</p></div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Press ⌘K (Ctrl+K) anywhere to search and navigate.</p>
    </StepCard>
  );
}
