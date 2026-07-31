# Frontend foundation scope

This document defines what the CloudSun frontend foundation covers, what is
demonstration-only, and what is explicitly not yet built. It is the source
of truth for anyone assessing the foundation for production readiness.

## What the foundation covers

The foundation is a complete, navigable, responsive CRM workspace built with
Next.js 16, TypeScript, Tailwind CSS 4 and Zustand. The following are
fully implemented and tested:

### Design system

- Warm-ivory / terracotta-ember / forest-green identity in
  `src/app/globals.css`.
- Semantic CSS custom properties for surfaces, text, borders, statuses and
  CRM-specific semantics (ember/forest/info-strong).
- Light and dark mode (`.dark` class on `<html>`, all tokens have dark
  variants).
- Editorial serif headings (`.font-display`, Fraunces) over system sans
  body.
- Elevation utilities (`elevation-subtle`, `elevation-raised`,
  `elevation-floating`), custom scrollbars (`.scroll-area-cs`), reduced
  motion, safe-area helpers.
- See `docs/design/design-system.md`.

### Application shell

- `AppShell` (sidebar + topbar + main + command palette + notifications +
  profile + mobile nav).
- Collapsible `Sidebar` with organisation switcher, three nav groups,
  permission-based filtering and unread/contact badges.
- `TopBar` with title, command-palette trigger, notifications bell, help
  menu, theme toggle and profile menu.
- `CommandPalette` (Ctrl/Cmd+K) with grouped navigation, contact, company
  and conversation search, theme actions, focus trap and keyboard nav.
- `NotificationCenter` with read/unread, mark-all-read and record
  navigation.
- `ProfileMenu` with identity, security link, sign out and reset-demo.
- `MobileNav` bottom navigation with safe-area padding, showing the four
  workspace items plus a "More" button that opens the slide-over
  `MobileSidebar`.
- See `docs/design/component-inventory.md`.

### Routed structure

- 14 routes in three groups (workspace, customer operations, manage).
- Client-side view state via Zustand (`view: { view, params }`), persisted
  to localStorage so deep links survive refresh.
- See `docs/product/route-map.md`.

### Reusable component library

- Shared: `Button`, `StatusBadge` + `SlaIndicator`, `EmptyState` family
  (`FilteredEmptyState`, `ErrorState`, `NotFoundState`, `PermissionState`,
  `OfflineState`, `LoadingState`, `PageSkeleton`), `FilterBar` family
  (`SearchField`, `FilterChip`, `ClearFiltersButton`, `Select`,
  `ViewToggle`), `ContactAvatar` family (`TeamAvatar`, `AvatarStack`),
  `ChannelIcon` + `ChannelBadge`, `MetricCard`, `PageHeader` family
  (`ContentSection`, `SectionHeader`), `RelativeTime` +
  `DateTimeDisplay`, `TagList` + `Tag`.
- App shell: see above.

### Workspace views (fully interactive)

- **Overview** — metrics, SLA alerts, pipeline by stage, recent activity,
  conversations by channel, upcoming follow-ups, team.
- **Inbox** — 3-panel workspace (views, conversation list, detail) with
  message thread, reply / internal-note composer, AI-assist action
  buttons (demonstration), context panel, draft persistence, keyboard
  shortcuts. Mobile: list to full-screen detail.
- **Contacts** — list with search, stage/priority/owner/company filters,
  sort, table/cards view toggle, pagination, bulk select + bulk stage and
  archive, create. Detail with edit, archive, lead metadata, tags,
  consent / DNC, notes, activity timeline, related conversations, calls
  and company.
- **Companies** — list with filters and detail with contacts,
  conversations, timeline and account stats.

### Secondary views (demonstration screens)

- Calls, Calendar, Knowledge, Automations, Analytics, Team, Integrations,
  Settings, Billing, Audit log. Each renders a meaningful screen using
  demo data; none are "coming soon" stubs.

### Auth, onboarding and RBAC

- Landing website (`LandingView`).
- Authentication flow (`AuthView`): Google sign-in (simulated, identity
  scopes only), email/password fallback, 6-digit OTP with auto-advance,
  paste, resend countdown, expiry and attempt limits.
- Onboarding wizard (`OnboardingView`): role-specific step counts (owner
  12, admin 10, ops manager 10, supervisor 9, employee 7, analyst 5,
  read-only 4), org creation, business functions, teams, role review,
  invitations, customer data, integrations, preferences, security review,
  launch summary.
- Team admin (`TeamAdminView`): member list with role changes,
  suspend/reactivate, last-owner protection, invitation creation.
- Security settings (`SecuritySettingsView`): identity verification,
  active sessions with revoke, sign-out-everywhere.
- 7 roles, 35 permissions, permission-based navigation filtering.

### State, repositories, tests

- `src/lib/demo-store.ts` — Zustand persistent store, versioned migration
  (`DEMO_VERSION = 2`), full CRUD, drafts, audit activity log.
- `src/lib/repositories.ts` — async `ContactRepository`,
  `CompanyRepository`, `ConversationRepository`, `TeamRepository`,
  `FollowUpRepository` interfaces with demo implementations.
- `src/lib/sla.ts` — SLA state derivation with paused overrides.
- `src/lib/search.ts` — diacritic- and case-insensitive search.
- 293 unit + component tests, Playwright E2E + a11y + mobile suites. See
  `docs/testing/frontend-testing.md`.

## What is demonstration-only

These features render and behave in a self-contained way but are not
backed by a real provider. They are clearly labelled in the UI with the
"Demonstration workspace" badge in the top bar.

| Feature | Demonstration behaviour |
| --- | --- |
| Authentication (Google sign-in, OTP) | Identity-only; no real OAuth tokens, no real email delivery. OTP accepts the seeded code. |
| External messages (inbound) | All inbound messages are pre-seeded in `demo.ts`. New messages created by the user are tagged `"simulated"`. |
| Telephony / calls | Calls are logged with outcome and duration, but no real call is placed or received. |
| AI assist actions in the composer | Buttons are present and labelled (summarise, suggest reply, translate, etc.) but do not call an LLM. |
| Integrations view | Status cards show connected/disconnected state, but no provider APIs are called. |
| Billing view | Plan cards and "contact for pricing" copy are shown; no payment is processed. |
| Notifications | Pre-seeded; new notifications are not generated by external triggers. |
| Audit log | Activity events generated by local mutations; no server-side audit. |

The "Demonstration workspace" badge in the `TopBar` and the explicit
disclaimers on the landing page (`No payment processed on this site`,
`No unverified certifications`) make the demo status unambiguous.

## What is not yet built

These are out of scope for the foundation and would be required for a
production launch.

| Capability | Notes |
| --- | --- |
| Production database | A Prisma schema exists (`prisma/schema.prisma`) but no production repositories or migrations are wired in. The repository interfaces are async and ready for a Prisma swap (see `docs/architecture/demo-repository-layer.md`). |
| Production authentication | No real OAuth client, no session server, no JWT issuance. |
| Campaign engine | Marketing campaigns are not modelled. |
| Queue engine / routing rules | The inbox has views and manual assignment but no auto-routing rules engine. |
| Live presence | Team-member status is static in the seed. |
| Telephony provider integration | No SIP/WebRTC client, no provider SDK. |
| Ticketing | Tickets are not a first-class object. Conversations fill this role in the foundation. |
| Quality assurance (QA) module | No call review, scoring or coaching workflows. |
| Production analytics | The analytics view renders demonstration metrics only. No event pipeline, no warehouse. |
| 200-agent validation | Performance is validated at single-user scale. No load testing. |

## Out-of-scope technologies

To keep the foundation coherent and auditable, the following technologies
are intentionally **not** introduced:

- **Redis** — no in-memory cache, no pub/sub, no queue backend.
- **WebSocket backend** — the inbox is refresh-and-persist, not real-time
  push. (An `examples/websocket/` snippet exists for reference only; it is
  not wired into the app.)
- **Production database repositories** — the demo repositories wrap the
  Zustand store. Production repositories (Prisma-backed) are a future
  swap, not a current dependency.
- **Production authentication** — no NextAuth credentials provider, no
  OAuth client, no session server. The `auth-store` is a persisted
  Zustand store, not a real session.
- **Payment processing** — no Stripe, no Paddle, no checkout. Plan cards
  say "Contact for pricing" and the landing page explicitly disclaims
  payment.

## Reading order

1. `docs/product/it-crm-positioning.md` — who CloudSun is for.
2. `docs/product/route-map.md` — what screens exist.
3. `docs/design/design-system.md` — the visual language.
4. `docs/design/component-inventory.md` — the building blocks.
5. `docs/architecture/demo-repository-layer.md` — how state is held and
   how it would be swapped for production.
6. `docs/testing/frontend-testing.md` — how the foundation is verified.
