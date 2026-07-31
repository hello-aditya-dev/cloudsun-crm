# CloudSun — IT CRM Frontend Foundation

CloudSun is a unified customer, lead and conversation workspace for IT sales,
customer success and technical-support teams. Every customer, conversation and
opportunity lives in one operational workspace.

This repository contains the complete frontend foundation for CloudSun — a
production-quality React/Next.js application with a documented design system,
application shell, routed structure, reusable component library, and fully
functional contacts, companies and unified-inbox experiences backed by a
persistent demonstration repository.

## Quick start

```bash
bun install
bun run dev          # start the dev server on port 3000
bun run lint         # ESLint
bun run typecheck    # TypeScript
bun run test         # Vitest unit + component suite
bun run test:e2e     # Playwright end-to-end flows
bun run test:a11y    # Axe accessibility scans
bun run build        # production build
```

The dev server must be running (`bun run dev`) before `test:e2e` or
`test:a11y` — Playwright connects to `http://localhost:3000`.

## What is complete

The following areas are fully built and verified:

- **IT-industry positioning** — CloudSun is positioned for IT service
  providers, MSPs, SaaS companies, cybersecurity firms and B2B technology
  sales teams. No dental or healthcare terminology remains. Demonstration
  data represents real IT businesses and professionals.
- **Design system** — A complete, documented token system built on CSS
  custom properties: warm ivory surfaces, terracotta ember primary, forest-
  green support, editorial Fraunces serif headings. Semantic tokens for
  surfaces, text, statuses and CRM semantics. Dark mode. Elevation system.
  Reduced-motion support. Custom scrollbars.
- **Application shell** — Responsive desktop, tablet and mobile shell with a
  collapsible sidebar (state persists), command palette (Ctrl+K),
  notification center, profile menu, and a mobile bottom navigation bar with
  safe-area insets.
- **Routed structure** — Client-side view routing with 14 navigable views.
  Deep links survive refresh. Loading states, error boundaries and not-found
  states exist. Browser back/forward works within the workspace.
- **Reusable components** — A consistent component library: StatusBadge,
  SlaIndicator, ContactAvatar, TeamAvatar, AvatarStack, ChannelIcon,
  EmptyState/FilteredEmptyState/ErrorState/NotFoundState/PermissionState/
  OfflineState/LoadingState/PageSkeleton, MetricCard, PageHeader,
  SearchField, FilterBar, FilterChip, Select, ViewToggle, ClearFiltersButton,
  TagList, RelativeTime, DateTimeDisplay, Button.
- **Contacts** — Full list with search, stage/priority/owner/company filters,
  sort, table/cards view toggle, pagination, bulk select and bulk actions.
  Create, edit, archive, restore. Contact detail with info, lead metadata,
  tags, consent/DNC, notes, activity timeline, related conversations/calls.
- **Companies** — List with cards/table views, search and filters. Company
  detail with contacts, conversations, timeline and stats.
- **Unified inbox** — 3-panel workspace: left views (All/Unassigned/Mine/
  Open/Waiting/Needs approval/Snoozed/Closed/Spam) + channel filters; centre
  conversation list with search and SLA indicators; right conversation detail
  with message thread, reply/internal-note composer, AI assist actions,
  context panel. Drafts persist. Mobile: list → full-screen detail.
- **Conversations** — Status changes, priority changes, assignments, snooze,
  internal notes, simulated replies. All mutations log audit activities.
- **Persistent demonstration state** — Zustand + localStorage with versioned
  migration safety. Changes persist across refresh. A reset control restores
  the deterministic seed.

## What is demonstration only

These features exist in the UI but are simulated — they do not connect to
external services:

- **Authentication** — Google sign-in and email/password are simulated.
  OTP codes are generated and displayed in the UI. No real OAuth or
  identity provider is connected.
- **External messages** — Replies and internal notes are marked "Simulated"
  and stored locally. No email, WhatsApp or web-chat messages are sent or
  received.
- **Telephony** — The Calls view shows demonstration call history. No real
  telephony, SIP or Exotel integration.
- **AI actions** — The composer's AI assist buttons (Shorten, Clearer,
  Friendlier, Formal, Summarize) are demonstration placeholders.
- **Integrations** — The Integrations view shows demonstration provider
  states. No live API connections.
- **Billing** — The Billing view shows demonstration plans. No payment
  processing occurs on this site.

## What is not yet built

These capabilities require future implementation phases:

- Production database repositories (Prisma-backed, replacing the demo store)
- Production authentication (real OAuth, session management, MFA)
- Campaign engine
- Queue engine
- Live agent presence
- Telephony provider integration
- Full ticketing engine
- Full quality assurance engine
- Production analytics
- 200-agent capacity validation

## Architecture

- **Framework**: Next.js 16 with App Router, TypeScript 5
- **Styling**: Tailwind CSS 4 with a custom CloudSun design token system
- **State**: Zustand with localStorage persistence (demo store + auth store)
- **Repository layer**: Async repository interfaces wrapping the demo store,
  ready for a production Prisma swap
- **Testing**: Vitest (unit + component), Playwright (E2E), Axe (a11y)

See [docs/architecture/demo-repository-layer.md](docs/architecture/demo-repository-layer.md)
for the repository abstraction, and
[docs/design/design-system.md](docs/design/design-system.md) for the design
system.

## Demonstration behaviour

All changes (contacts created, conversations replied to, status changes,
notes, drafts) persist in `localStorage` under the `cloudsun-demo-v2` key.
The store is versioned — if the schema changes, stale data is transparently
reseeded from the deterministic seed.

To reset the demonstration data to its initial state, open the profile menu
(top-right) and choose "Reset demo data".

## Repository

- **Repository**: `hello-aditya-dev/cloudsun-crm`
- **Branch**: `main`
- **Original source**: `hello-aditya-dev/cloudsun` (do not modify)
