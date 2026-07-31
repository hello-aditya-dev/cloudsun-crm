"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/cloudsun/shared/Button";
import { product } from "@/config/cloudsun";
import {
  Sun,
  Menu,
  X,
  ArrowRight,
  Shield,
  CheckCircle2,
  Building2,
  Inbox,
  Phone,
  Mail,
  MessageCircle,
  FileSpreadsheet,
  Ticket,
  GitBranch,
  MessagesSquare,
  UserPlus,
  BellRing,
  BarChart3,
  Target,
  History,
  Eye,
  BookOpen,
  Zap,
  Crown,
  Briefcase,
  ClipboardCheck,
  Headset,
  HeartHandshake,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Settings,
  Cloud,
  Sparkles,
  KeyRound,
  ScrollText,
  LogOut,
  FileLock,
  Plug,
  Rocket,
  TrendingUp,
  Layers,
} from "lucide-react";

interface LandingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingView({ onGetStarted, onSignIn }: LandingViewProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const onNavigate = React.useCallback((section: string) => {
    setMobileMenuOpen(false);
    if (typeof document === "undefined") return;
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const navLinks: { label: string; section: string }[] = [
    { label: "Product", section: "product" },
    { label: "Solutions", section: "solutions" },
    { label: "Pricing", section: "pricing" },
    { label: "Security", section: "security" },
    { label: "Integrations", section: "integrations" },
  ];

  const channels = [
    { icon: Inbox, label: "Shared inboxes" },
    { icon: Mail, label: "Personal Gmail" },
    { icon: Phone, label: "Phone calls" },
    { icon: MessageCircle, label: "WhatsApp" },
    { icon: FileSpreadsheet, label: "Spreadsheets" },
    { icon: Ticket, label: "Ticket systems" },
    { icon: GitBranch, label: "Sales pipelines" },
    { icon: MessagesSquare, label: "Internal messages" },
  ];

  const workflow = [
    {
      icon: Inbox,
      title: "Capture",
      desc: "Pull every enquiry, call, message and form submission into one inbox.",
    },
    {
      icon: UserPlus,
      title: "Assign",
      desc: "Route each conversation to the right owner based on rules and capacity.",
    },
    {
      icon: CheckCircle2,
      title: "Resolve",
      desc: "Reply, log notes, attach context and confirm the customer is unblocked.",
    },
    {
      icon: BellRing,
      title: "Follow up",
      desc: "Schedule the next step so nothing slips between teams or channels.",
    },
    {
      icon: BarChart3,
      title: "Measure",
      desc: "Track response times, pipeline movement and team load in one view.",
    },
  ];

  const capabilities = [
    {
      icon: Building2,
      title: "Companies and contacts",
      desc: "One record per account and decision-maker, shared across teams.",
    },
    {
      icon: MessagesSquare,
      title: "Unified conversations",
      desc: "Email, phone, WhatsApp and webchat in a single thread per customer.",
    },
    {
      icon: UserCheck,
      title: "Ownership and assignment",
      desc: "Clear owners for every record, with reassignment and watchers.",
    },
    {
      icon: Target,
      title: "Lead tracking",
      desc: "Pipeline stages, value estimates and qualification fields per contact.",
    },
    {
      icon: History,
      title: "Customer history",
      desc: "Every interaction, note and decision visible in one timeline.",
    },
    {
      icon: BellRing,
      title: "Follow-ups",
      desc: "Scheduled reminders linked to contacts and conversations, never lost.",
    },
    {
      icon: Eye,
      title: "Team visibility",
      desc: "See who is working on what, with workload and status at a glance.",
    },
    {
      icon: BookOpen,
      title: "Knowledge",
      desc: "Capture articles and answers so the team replies consistently and faster.",
    },
    {
      icon: Zap,
      title: "Automations",
      desc: "Rules that route, tag, escalate and remind without manual overhead.",
    },
    {
      icon: BarChart3,
      title: "Reporting foundation",
      desc: "Operational metrics on activity, SLA and pipeline, exportable.",
    },
  ];

  const roles = [
    {
      icon: Crown,
      title: "Organisation owner",
      desc: "See the whole customer operation in one place, with the controls to govern it.",
    },
    {
      icon: Briefcase,
      title: "Operations manager",
      desc: "Balance workload, monitor SLAs and keep every team aligned to one source of truth.",
    },
    {
      icon: ClipboardCheck,
      title: "Supervisor",
      desc: "Watch live queues, coach replies and step in before a conversation slips.",
    },
    {
      icon: TrendingUp,
      title: "Sales employee",
      desc: "Track leads, opportunities and follow-ups without leaving the customer context.",
    },
    {
      icon: Headset,
      title: "Support employee",
      desc: "Resolve tickets with full history and a clear path to escalation.",
    },
    {
      icon: HeartHandshake,
      title: "Customer-success employee",
      desc: "Stay ahead of renewals, health signals and proactive outreach.",
    },
  ];

  const useCases = [
    { icon: Sparkles, title: "New sales enquiry" },
    { icon: AlertTriangle, title: "Support escalation" },
    { icon: RefreshCw, title: "Service renewal" },
    { icon: Settings, title: "Implementation update" },
    { icon: Shield, title: "Security assessment" },
    { icon: Cloud, title: "Cloud-migration discussion" },
    { icon: UserPlus, title: "Customer onboarding" },
    { icon: Mail, title: "Account follow-up" },
  ];

  const securityFeatures = [
    {
      icon: UserCheck,
      title: "Verified identities",
      desc: "Every team member signs in with a verified account; no anonymous access.",
    },
    {
      icon: KeyRound,
      title: "Role-based access",
      desc: "Permissions are scoped to roles, so people only see what they need to.",
    },
    {
      icon: Layers,
      title: "Organisation isolation",
      desc: "Each workspace is isolated; data does not bleed between customers.",
    },
    {
      icon: ScrollText,
      title: "Audit history",
      desc: "Key actions — views, edits, assignments — are recorded and reviewable.",
    },
    {
      icon: LogOut,
      title: "Revocable sessions",
      desc: "Sessions can be revoked at any time, from any device, by an admin.",
    },
    {
      icon: FileLock,
      title: "Permission-based records",
      desc: "Sensitive records can be restricted to specific people or roles.",
    },
    {
      icon: Plug,
      title: "Honest integration states",
      desc: "Integration status is shown as it is, with clear disconnect and error states.",
    },
  ];

  const plans = [
    {
      icon: Rocket,
      name: "Launch",
      teamSize: "10–25 team members",
      desc: "For early IT teams establishing their customer operations from a shared workspace.",
      priceLabel: "Contact for pricing",
      cta: "Request pilot",
      featured: false,
    },
    {
      icon: TrendingUp,
      name: "Growth",
      teamSize: "26–75 team members",
      desc: "For growing IT teams managing multiple segments, queues and customer-success motions.",
      priceLabel: "Demonstration access available",
      cta: "Start demonstration",
      featured: true,
    },
    {
      icon: Building2,
      name: "Scale",
      teamSize: "76–200 team members",
      desc: "For larger organisations running structured, multi-team operations and SLAs.",
      priceLabel: "Contact for pricing",
      cta: "Contact sales",
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-surface-app text-foreground">
      {/* =========================================================
          1. Public header
         ========================================================= */}
      <header className="border-b border-border bg-surface-app">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => onNavigate("product")}
              className="flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${product.name} home`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ember text-ember-foreground">
                <Sun className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                {product.name}
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.section}
                  onClick={() => onNavigate(link.section)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onSignIn}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Sign in
              </button>
              <Button onClick={() => onNavigate("pricing")}>Start CloudSun</Button>
            </div>

            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface-app">
            <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.section}
                  onClick={() => onNavigate(link.section)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-2 border-t border-border pt-3 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignIn();
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Sign in
                </button>
                <Button
                  className="w-full"
                  onClick={() => onNavigate("pricing")}
                >
                  Start CloudSun
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* =========================================================
            2. Hero
           ========================================================= */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage:
                "radial-gradient(60% 50% at 50% 0%, oklch(0.58 0.135 38 / 0.10), transparent 70%)",
            }}
          />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground elevation-subtle">
                  <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                  {product.eyebrow}
                </span>
                <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
                  Every customer, conversation and opportunity.{" "}
                  <span className="text-ember">One operational workspace.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
                  CloudSun helps IT sales, support and customer-success teams
                  manage companies, decision-makers, enquiries, opportunities
                  and follow-ups without losing context between channels.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                  <Button size="lg" onClick={onGetStarted}>
                    Start your workspace
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => onNavigate("product")}
                  >
                    Explore the product
                  </Button>
                </div>
                <button
                  onClick={onSignIn}
                  className="mt-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:underline"
                >
                  Already use CloudSun?{" "}
                  <span className="ml-1 text-ember underline-offset-4 hover:underline">
                    Sign in
                  </span>
                </button>
              </div>

              <div className="relative">
                <ProductPreview />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. Operational problem
           ========================================================= */}
        <section id="integrations" className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-ember">
                The operational problem
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                IT teams lose customer context across too many channels
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                A single customer might ping you on WhatsApp, reply to a sales
                email, open a support ticket, and follow up by phone — across
                days and teams. When each channel lives in its own tool, the
                story breaks apart and follow-ups slip.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {channels.map((c) => (
                <div
                  key={c.label}
                  className="group rounded-xl border border-border bg-card p-4 elevation-subtle transition-shadow hover:elevation-raised"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-inset text-forest">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            4. Product workflow
           ========================================================= */}
        <section id="product" className="border-t border-border bg-surface-inset/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-ember">
                The product
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Five steps from enquiry to measured outcome
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                CloudSun turns scattered customer activity into a single,
                traceable flow — captured, owned, resolved, followed up, and
                measured.
              </p>
            </div>

            <div className="mt-12 flex flex-col gap-3 md:flex-row md:items-stretch">
              {workflow.map((step, i) => (
                <React.Fragment key={step.title}>
                  <div className="flex-1 min-w-0 rounded-xl border border-border bg-card p-5 elevation-subtle transition-shadow hover:elevation-raised">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ember/10 text-ember">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-lg font-semibold">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  {i < workflow.length - 1 && (
                    <div
                      className="flex items-center justify-center text-muted-foreground shrink-0"
                      aria-hidden
                    >
                      <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            5. Core capabilities
           ========================================================= */}
        <section id="solutions" className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-ember">
                Core capabilities
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Everything IT customer operations runs on
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                Ten connected capabilities that replace the patchwork of
                inboxes, sheets and tickets — without forcing your team to
                learn a new way of working.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((cap) => (
                <div
                  key={cap.title}
                  className="group rounded-xl border border-border bg-card p-6 elevation-subtle transition-shadow hover:elevation-raised"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ember/10 text-ember">
                    <cap.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">
                    {cap.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            6. Role-specific value
           ========================================================= */}
        <section className="border-t border-border bg-surface-inset/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-ember">
                For every role
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Built for every role in your IT operations
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                Sales, support and customer-success see the same customer from
                their own angle — without losing the shared record underneath.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <div
                  key={role.title}
                  className="rounded-xl border border-border bg-card p-6 elevation-subtle transition-shadow hover:elevation-raised"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest/10 text-forest">
                      <role.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">
                      {role.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {role.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            7. IT-industry use cases
           ========================================================= */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-ember">
                Built for the IT industry
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Use cases IT teams run on CloudSun
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                From a fresh enquiry to a renewal conversation, CloudSun keeps
                the context, owner and next step together — for the situations
                IT teams actually face.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {useCases.map((uc) => (
                <div
                  key={uc.title}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 elevation-subtle transition-shadow hover:elevation-raised"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ember/10 text-ember">
                    <uc.icon className="h-4 w-4" />
                  </div>
                  <span className="pt-1 text-sm font-medium leading-snug">
                    {uc.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            8. Security and control
           ========================================================= */}
        <section id="security" className="border-t border-border bg-surface-inset/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ember">
                  Security and control
                </span>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                  Honest controls for a workspace you can trust
                </h2>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  CloudSun is built with the controls IT teams expect —
                  verified identities, scoped permissions, isolated workspaces
                  and audit history. We show integration and security states as
                  they are, not as we would like them to be.
                </p>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  We do not claim certifications we have not obtained. As
                  CloudSun matures, this section will be updated to reflect
                  verified controls and independent assessments.
                </p>
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-card p-4 elevation-subtle">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Security posture is described honestly here. Anything
                    verified externally will be referenced by name and date.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {securityFeatures.map((feat) => (
                  <div
                    key={feat.title}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 elevation-subtle transition-shadow hover:elevation-raised"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest">
                      <feat.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{feat.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            9. Plans
           ========================================================= */}
        <section id="pricing" className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-ember">
                Plans
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Plans that scale with your team
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                CloudSun is currently in active demonstration. We work with IT
                teams directly to set up a workspace sized for your operation —
                no payment is processed through this site.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative rounded-2xl border bg-card p-6 transition-shadow hover:elevation-floating",
                    plan.featured
                      ? "border-ember/50 elevation-floating ring-1 ring-ember/20"
                      : "border-border elevation-subtle"
                  )}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-ember px-3 py-1 text-xs font-semibold text-ember-foreground">
                      <Sparkles className="h-3 w-3" />
                      Most teams start here
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        plan.featured
                          ? "bg-ember/10 text-ember"
                          : "bg-surface-inset text-forest"
                      )}
                    >
                      <plan.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {plan.teamSize}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {plan.desc}
                  </p>
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="font-display text-lg font-semibold text-foreground">
                      {plan.priceLabel}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No payment processed on this site
                    </p>
                  </div>
                  <Button
                    className="mt-6 w-full"
                    variant={plan.featured ? "primary" : "outline"}
                    onClick={onGetStarted}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            10. Final CTA
           ========================================================= */}
        <section className="border-t border-border bg-surface-inset/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 lg:p-16 text-center elevation-raised">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-ember text-ember-foreground">
                <Sun className="h-6 w-6" />
              </div>
              <h2 className="mt-6 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                Create your CloudSun workspace
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                Start with a demonstration workspace and bring your team in.
                Every customer, conversation and opportunity in one place.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" onClick={onGetStarted}>
                  Start your workspace
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  onClick={onSignIn}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
                >
                  Sign in to an existing workspace
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          11. Public footer
         ========================================================= */}
      <footer className="border-t border-border bg-surface-app">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ember text-ember-foreground">
                  <Sun className="h-5 w-5" />
                </div>
                <span className="font-display text-xl font-semibold tracking-tight">
                  {product.name}
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
                {product.tagline}
              </p>
            </div>

            <FooterColumn
              title="Product"
              links={[
                { label: "Workflow", section: "product" },
                { label: "Capabilities", section: "solutions" },
                { label: "Pricing", section: "pricing" },
                { label: "Security", section: "security" },
              ]}
              onNavigate={onNavigate}
            />
            <FooterColumn
              title="Solutions"
              links={[
                { label: "For sales teams", section: "solutions" },
                { label: "For support teams", section: "solutions" },
                { label: "For customer success", section: "solutions" },
                { label: "Use cases", section: "integrations" },
              ]}
              onNavigate={onNavigate}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: "About", section: "product" },
                { label: "Workflow", section: "product" },
                { label: "Security", section: "security" },
                { label: "Plans", section: "pricing" },
              ]}
              onNavigate={onNavigate}
            />
            <FooterColumn
              title="Legal"
              links={[
                { label: "Privacy", section: "security" },
                { label: "Terms", section: "security" },
                { label: "Data handling", section: "security" },
                { label: "Audit policy", section: "security" },
              ]}
              onNavigate={onNavigate}
            />
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {product.currentYear} {product.name}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              {product.demoModeLabel}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------
   Footer column
------------------------------------------------------------------ */
function FooterColumn({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: { label: string; section: string }[];
  onNavigate: (section: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <button
              onClick={() => onNavigate(link.section)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:underline"
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------
   Stylized product preview — mock CRM interface (no real data)
------------------------------------------------------------------ */
function ProductPreview() {
  const sidebarItems = [
    { active: false, w: "w-12" },
    { active: true, w: "w-14" },
    { active: false, w: "w-10" },
    { active: false, w: "w-12" },
    { active: false, w: "w-10" },
  ];

  const conversationRows = [
    { color: "bg-ember/60", w1: "w-24", w2: "w-32", tag: true },
    { color: "bg-forest/60", w1: "w-20", w2: "w-36", tag: false },
    { color: "bg-ember/40", w1: "w-28", w2: "w-24", tag: true },
    { color: "bg-forest/40", w1: "w-16", w2: "w-32", tag: false },
  ];

  const chartBars = [40, 65, 50, 80, 60, 95, 70];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 70% 30%, oklch(0.58 0.135 38 / 0.10), transparent 70%)",
        }}
      />
      <div className="rounded-2xl border border-border bg-card elevation-floating overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border bg-surface-inset/60 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-ember/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-ember/30" />
            <div className="h-2.5 w-2.5 rounded-full bg-forest/40" />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block h-5 w-32 lg:w-44 rounded-md bg-card border border-border" />
            <div className="h-5 w-12 rounded-md bg-ember/10 border border-ember/20" />
          </div>
        </div>

        <div className="grid grid-cols-12">
          {/* Mini sidebar */}
          <div className="col-span-3 border-r border-border bg-surface-inset/40 p-3 hidden sm:block">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-md bg-ember text-ember-foreground flex items-center justify-center">
                <Sun className="h-3.5 w-3.5" />
              </div>
              <div className="h-2 w-12 rounded-full bg-foreground/15" />
            </div>
            <div className="space-y-1">
              {sidebarItems.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5",
                    item.active ? "bg-ember/10" : ""
                  )}
                >
                  <div
                    className={cn(
                      "h-3.5 w-3.5 rounded",
                      item.active ? "bg-ember/60" : "bg-foreground/15"
                    )}
                  />
                  <div
                    className={cn(
                      "h-2 rounded-full",
                      item.w,
                      item.active ? "bg-foreground/30" : "bg-foreground/10"
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div className="col-span-12 sm:col-span-6 p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="h-2.5 w-20 rounded-full bg-foreground/20" />
              <div className="flex items-center gap-1">
                <div className="h-4 w-10 rounded-md bg-surface-inset border border-border" />
                <div className="h-4 w-10 rounded-md bg-surface-inset border border-border" />
              </div>
            </div>
            {conversationRows.map((row, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-border bg-surface-inset/30 px-2.5 py-2"
              >
                <div className={cn("mt-0.5 h-6 w-6 rounded-full", row.color)} />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className={cn("h-2 rounded-full bg-foreground/25", row.w1)} />
                    {row.tag && (
                      <div className="h-3 w-8 rounded bg-ember/20" />
                    )}
                  </div>
                  <div className={cn("h-2 rounded-full bg-foreground/10", row.w2)} />
                </div>
              </div>
            ))}
          </div>

          {/* Detail / metric panel */}
          <div className="col-span-12 sm:col-span-3 border-t sm:border-t-0 sm:border-l border-border bg-surface-inset/40 p-3 space-y-3">
            <div className="space-y-1.5">
              <div className="h-2 w-16 rounded-full bg-foreground/20" />
              <div className="h-5 w-20 rounded-full bg-ember/70" />
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-2 w-12 rounded-full bg-foreground/15" />
              <div className="flex items-end gap-1.5 h-14 pt-1">
                {chartBars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background:
                        i === 5 ? "var(--ember)" : "oklch(0.58 0.135 38 / 0.22)",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-2 w-2 rounded-full bg-forest" />
              <div className="h-2 w-20 rounded-full bg-foreground/15" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-ember" />
              <div className="h-2 w-16 rounded-full bg-foreground/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
