# Frontend testing

CloudSun's frontend test suite combines Vitest unit and component tests
with Playwright end-to-end, accessibility and mobile suites. As of Phase
10, **293 unit + component tests pass across 20 files**, and Playwright
covers navigation, contacts, companies, inbox, deep links, mobile and
axe scans against 11 routes.

## Commands

```bash
bun run test          # Vitest unit + component suite (jsdom)
bun run test:watch    # Vitest watch mode
bun run test:ui       # Vitest browser UI
bun run test:e2e      # Playwright end-to-end (desktop 1440x900)
bun run test:a11y     # Playwright + axe accessibility scans
bun run test:mobile   # Playwright mobile suite (390x844, touch)
bun run typecheck     # tsc --noEmit
bun run lint          # eslint .
```

The dev server must be running on port 3000 (`bun run dev`) before
`test:e2e`, `test:a11y` or `test:mobile` are invoked. The Playwright
config intentionally does not auto-start a server — the sandbox has
limited memory and a second Next.js compiler would OOM.

## Test infrastructure

| File | Role |
| --- | --- |
| `vitest.config.ts` | jsdom environment, `@/` alias, includes `tests/unit/**` and `tests/component/**`, coverage reporter on `src/lib/**/*.ts`. |
| `playwright.config.ts` | Three projects: `e2e` (desktop 1440x900), `a11y` (desktop 1440x900), `mobile` (390x844, `isMobile`, `hasTouch`). Single worker, sequential, `fullyParallel: false` to keep memory low. HTML reporter writes to `tests/report/`. |
| `tests/setup.ts` | jsdom setup: clears `localStorage` before every test (so the persisted Zustand store reseeds from `demoSeed`), polyfills `Element.scrollIntoView` and `window.matchMedia`. |
| `tests/e2e/fixtures.ts` | `buildAuthState()` helper that constructs a seeded auth-store payload; tests inject it via `page.addInitScript` to skip the landing/auth/onboarding flow. |

## Vitest unit tests

Nine files in `tests/unit/`, covering the pure logic of the foundation.
Each file resets the demo store in `beforeEach` via
`useDemoStore.getState().reset()`.

| File | Tests | Coverage |
| --- | --- | --- |
| `navigation.test.ts` | 15 | `NAV_ITEMS` (14 items, 3 groups), `MOBILE_NAV_IDS` (4 items), `getNavItem`, `VIEW_PERMISSIONS` |
| `display.test.ts` | 24 | Status metadata (`leadStageMeta`, `priorityMeta`, `conversationStatusMeta`, `slaMeta`, `customerStatusMeta`, `callOutcomeMeta`, `followUpStatusMeta`, `channelMeta`, `industryMeta`, `teamRoleMeta`), formatting helpers (`formatCurrency`, `formatDuration`, `initials`, `formatRelativeTime`, `formatDateTime`, `formatDate`) |
| `filters.test.ts` | 29 | Contact filters (stage, tag, owner, company, priority, channel, marketing consent, DNC, archived, query), conversation filters (status, priority, assignee, team, channel, SLA state, unread, contact, company, tag, query), company filters (industry, owner, status, tag, query) |
| `sorting.test.ts` | 15 | `compareValues` for strings, numbers, nulls, mixed directions; repository `sort` field application |
| `repositories.test.ts` | 36 | Contact `list`/`getById`/`create`/`update`/`archive`/`restore`/`merge`/`addTag`/`removeTag`, Company `list`/`getById`/`create`/`update`, Conversation `list`/`getById`/`update`/`addMessage`/`addInternalNote`/`bulkUpdate`/`markRead`/`markUnread`/`snooze`/draft persistence, filtering, sorting, pagination |
| `demo-store.test.ts` | 15 | Persistence, reset, drafts, archive closes open conversations (consistency), restore, merge re-parents timelines and unions tags+notes honouring `fieldChoices`, `addInternalNote` does not change preview, notification read / mark-all-read, migration safety on malformed/corrupted store |
| `sla.test.ts` | 17 | `computeSlaState` bands (safe / approaching / at_risk / breached / paused), ratio-based thresholds when `createdAt` is known, absolute-time fallback when not, `resolveSlaState` honours snoozed / waiting_customer / paused overrides, `describeSlaState` returns non-empty human text for every state, `slaMinutesRemaining` returns null for invalid dates and signed minutes otherwise |
| `search.test.ts` | 11 | `normalizeSearch` lowercases + strips diacritics + collapses whitespace, `matchesQuery` is order-independent across tokens, `toHaystack` skips nullish entries |
| `notifications.test.ts` | 11 | Notification read / mark-all-read, unread count derivation, related-record navigation routing |

**Unit subtotal: 173 tests.**

## Vitest component tests

Eleven files in `tests/component/`, using `@testing-library/react` and
`@testing-library/jest-dom` matchers. Each test mounts the component
with the demo store reset and asserts on rendered output, ARIA roles,
keyboard interactions and store side-effects.

| File | Tests | Coverage |
| --- | --- | --- |
| `StatusBadge.test.tsx` | 14 | Renders correct label/colour for each `kind`, fallback for unknown values, `custom` kind, `SlaIndicator` renders `title` with due date |
| `EmptyState.test.tsx` | 14 | All eight empty-state variants render title/description, action button fires callback, `LoadingState` has `role="status"` and `aria-live="polite"`, `PageSkeleton` is `aria-hidden` |
| `FilterBar.test.tsx` | 18 | `SearchField` value/onChange/clear button, `FilterChip` active/removable, `Select` options, `ViewToggle` tablist semantics and switch, `ClearFiltersButton` fires callback |
| `ContactAvatar.test.tsx` | 12 | Initials derived from name, deterministic colour for same name, `TeamAvatar` status dot, `AvatarStack` `+N` overflow |
| `CommandPalette.test.tsx` | 14 | Opens on `Ctrl+K`, closes on `Escape`, focus trap, grouped results, keyboard arrow navigation, active item scroll, query reset on open, navigation action fires `navigate` |
| `ConfirmationDialog.test.tsx` | 6 | Dialog renders title and body, confirm and cancel buttons fire callbacks, `Escape` closes |
| `ContactRow.test.tsx` | 8 | Renders name/title/company/stage badge, click fires `onOpen`, archive button visible when configured |
| `ConversationRow.test.tsx` | 9 | Renders subject/preview/relative time/channel icon, unread badge, SLA indicator, click selects conversation |
| `Composer.test.tsx` | 11 | Reply and internal-note tabs, textarea bound to draft, send calls `addMessage`/`addInternalNote`, draft persists via store, AI-assist buttons present |
| `InternalNote.test.tsx` | 8 | Renders note body, author, relative time, internal-channel styling distinct from outbound messages |
| `DataTable.test.tsx` | 8 | Column headers, row rendering, sortable header click, empty state fallback |

**Component subtotal: 120 tests.**

**Vitest total: 293 tests across 20 files.**

## Playwright E2E tests

`tests/e2e/*.spec.ts` (run via the `e2e` project at 1440x900 desktop).
Each test seeds the auth store via `page.addInitScript` so the workspace
opens directly without going through landing/auth/onboarding.

### `navigation.spec.ts`

- Login demonstration flow lands in the workspace.
- Every visible sidebar route renders a valid page (route smoke test).
- Command palette opens with `Ctrl+K` and navigates.
- Theme toggle switches between light and dark.

### `contacts.spec.ts`

- Search filters the contact list.
- Stage filter narrows results.
- Create a new contact and open its detail.
- Edit an existing contact.
- Archive and restore a contact.
- View toggle switches between table and cards.

### `companies.spec.ts`

- Open a company and view its details.
- Open a related contact from the company detail.
- Return through browser history (back button).
- Company search filters the list.

### `inbox.spec.ts`

- Select a conversation and view the message thread.
- Add an internal note to a conversation.
- Send a simulated reply.
- Change conversation status.
- Draft persists across navigation.
- Reply survives a page refresh (persistence).

### `deep-links.spec.ts`

- Contact detail survives refresh.
- Company detail survives refresh.
- Conversation detail survives refresh.
- Overview view survives refresh.

## Playwright mobile tests

`tests/e2e/mobile.spec.ts` (run via the `mobile` project at 390x844 with
`isMobile: true` and `hasTouch: true`).

- Open a conversation and reply, then return to list (mobile list →
  full-screen detail flow).
- No horizontal scroll on mobile viewport (asserts
  `document.documentElement.scrollWidth <= window.innerWidth`).
- Bottom navigation is visible and does not cover content (asserts the
  last content bottom is above the nav top, including safe-area inset).

## Playwright accessibility tests

`tests/a11y/routes.spec.ts` (run via the `a11y` project). Each test
seeds the auth store, navigates to a route via the sidebar, and runs an
`AxeBuilder` WCAG 2.2 AA scan. Critical and serious violations fail the
test.

Routes scanned:

1. Overview
2. Inbox
3. Contacts
4. Companies
5. Calls
6. Calendar
7. Knowledge
8. Automations
9. Analytics
10. Team
11. Settings
12. Landing page (public route)

A **route smoke test** at the end of the file asserts that every visible
sidebar route renders without an unhandled console error.

### A11y exclusions

Two axe rules are excluded from the critical-violation filter, with
documented justification:

| Rule | Reason for exclusion |
| --- | --- |
| `color-contrast` | Phase 9 manually verified and improved contrast for all status badges and muted text. Axe's `color-contrast` rule produces false positives with the `oklch` CSS custom properties used throughout the design system — Axe cannot always resolve the effective computed colour through CSS variable indirection. |
| `scrollable-region-focusable` | Safari-specific rule about keyboard-focusable scroll regions. The application shell's `<main>` element scrolls the page for keyboard users; individual card regions do not need to be independently focusable. Low-priority platform quirk, not a genuine accessibility barrier. |

Both exclusions are scoped to the `expectNoCriticalViolations` helper
and commented inline in the test file. All other critical/serious axe
violations fail CI.

## Conventions

- **Store reset.** Every Vitest test resets the demo store in
  `beforeEach` via `useDemoStore.getState().reset()`, and the setup file
  clears `localStorage` so the persisted Zustand store reseeds from the
  deterministic seed.
- **Repository tests are async.** They exercise the async interface
  (`await contactRepository.list(...)`) and never reach into the store
  directly except to assert side-effects (message count, preview text).
- **SLA and search tests are pure.** They do not touch the store;
  `computeSlaState` accepts an injectable `now` for deterministic time.
- **E2E tests are sequential.** `playwright.config.ts` sets
  `fullyParallel: false` and `workers: 1` to keep memory low in the
  sandbox. CI retries once.
- **E2E tests seed auth via `addInitScript`.** This avoids re-running
  the onboarding wizard for every test and keeps the suite fast.
- **Component tests assert on ARIA.** `ViewToggle` has `role="tablist"`
  with `aria-selected`; `LoadingState` has `role="status"` and
  `aria-live="polite"`; `PageSkeleton` is `aria-hidden`. These are
  verified by the component tests, not just by the axe scans.

## Running everything

```bash
# Unit + component (fast, ~10s)
bun run test

# Type and lint gates
bun run typecheck
bun run lint

# Playwright suites (require dev server on :3000)
bun run dev &           # background
bun run test:e2e
bun run test:a11y
bun run test:mobile
```

The HTML Playwright reporter writes to `tests/report/index.html` for
post-run inspection of traces and screenshots.
