# Component inventory

This is the inventory of CloudSun's reusable components. There are two
collections: **shared** primitives in `src/components/cloudsun/shared/`
and the **app shell** in `src/components/cloudsun/app/`. View components
(`src/components/cloudsun/views/`) are documented per-view in the route
map and are not repeated here.

All shared and shell components are `"use client"` and rely on the design
tokens documented in `docs/design/design-system.md`.

---

## Shared components

### `Button`

**File:** `src/components/cloudsun/shared/Button.tsx`

Polymorphic button with five variants and four sizes. Uses semantic
tokens (`bg-primary`, `bg-secondary`, `bg-destructive`, etc.) so dark
mode is automatic.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "ghost" \| "destructive" \| "outline"` | `"primary"` | |
| `size` | `"sm" \| "md" \| "lg" \| "icon"` | `"md"` | `icon` is a 36x36 square |
| `className` | `string` | | Merged via `cn()` |
| `...props` | `React.ButtonHTMLAttributes<HTMLButtonElement>` | | Focus ring, disabled states built in |

### `StatusBadge` and `SlaIndicator`

**File:** `src/components/cloudsun/shared/StatusBadge.tsx`

`StatusBadge` renders a status pill using the centralised metadata in
`src/lib/display.ts`. It is discriminated by `kind` and looks up the
correct `StatusMeta` record.

| Prop | Type | Notes |
| --- | --- | --- |
| `kind` | `"leadStage" \| "priority" \| "conversationStatus" \| "sla" \| "customerStatus" \| "callOutcome" \| "followUpStatus" \| "custom"` | |
| `value` | `keyof typeof <kind>Meta` | Required for non-custom kinds |
| `label`, `meta` | `string`, `StatusMeta` | Required for `kind: "custom"` |
| `className` | `string` | |

Renders a leading dot, the label, and applies the badge background /
border / text classes from `StatusMeta`. Falls back to a neutral muted
badge for unknown values.

`SlaIndicator` is a standalone SLA pill with a `title` tooltip showing
the due date. Used in the inbox list and detail header.

| Prop | Type | Notes |
| --- | --- | --- |
| `state` | `keyof typeof slaMeta` | safe / approaching / at_risk / breached / paused |
| `dueAt` | `string \| null` | Optional; rendered in the `title` attribute |
| `className` | `string` | |

### `EmptyState` family

**File:** `src/components/cloudsun/shared/EmptyState.tsx`

Eight components for empty / error / loading states. All share the same
visual language: a centered icon in a muted circle, a `font-display`
title, an optional description, and an optional action.

| Component | Purpose | Key props |
| --- | --- | --- |
| `EmptyState` | Generic empty state | `icon`, `title`, `description`, `action` |
| `FilteredEmptyState` | Empty due to active filters; offers a "Clear filters" button | `title`, `description`, `onClear` |
| `ErrorState` | Recoverable error; red-tinted; "Try again" button | `title`, `description`, `onRetry` |
| `NotFoundState` | Record not found; offers "Go back" | `title`, `description`, `onBack` |
| `PermissionState` | User lacks permission (no action offered) | `className` |
| `OfflineState` | Network down; "changes saved locally" message | `className` |
| `LoadingState` | Spinner + label; `role="status"`, `aria-live="polite"` | `label` |
| `PageSkeleton` | Pulse-animated page placeholder; `aria-hidden` | `className` |

### `FilterBar` family

**File:** `src/components/cloudsun/shared/FilterBar.tsx`

| Component | Purpose | Key props |
| --- | --- | --- |
| `FilterBar` | Flex container that wraps filter controls | `children`, `className` |
| `SearchField` | Search input with leading icon and clear button | `value`, `onChange`, `placeholder`, `autoFocus` |
| `FilterChip` | Toggleable / removable chip | `label`, `active`, `onClick`, `onRemove` |
| `ClearFiltersButton` | Inline "Clear all" link button | `onClick` |
| `Select` | Lightweight native `<select>` styled to match the system | `value`, `onChange`, `options`, `placeholder`, `ariaLabel` |
| `ViewToggle` | Table / cards segmented control with `role="tablist"` | `view`, `onChange` |

### `ContactAvatar` family

**File:** `src/components/cloudsun/shared/ContactAvatar.tsx`

| Component | Purpose | Key props |
| --- | --- | --- |
| `ContactAvatar` | Initials avatar with deterministic colour derived from name hash | `name`, `color?`, `size` (`xs/sm/md/lg`), `className` |
| `TeamAvatar` | Team-member avatar with optional presence dot | `initials`, `color`, `size` (`xs/sm/md`), `status` (`online/busy/away/offline`) |
| `AvatarStack` | Overlapping stack of `ContactAvatar`s with a `+N` overflow | `items: { id, name, color? }[]`, `max` (default 4), `size` |

Avatar colours come from a fixed 8-colour palette of oklch values; the
same name always maps to the same colour (djb2-like hash).

### `ChannelIcon` and `ChannelBadge`

**File:** `src/components/cloudsun/shared/ChannelIcon.tsx`

Renders the lucide icon for a `Channel` value (`phone`, `email`,
`whatsapp`, `webchat`, `internal`, `system`) using the `channelMeta`
map from `display.ts`.

| Component | Purpose | Key props |
| --- | --- | --- |
| `ChannelIcon` | Bare icon (defaults to `h-4 w-4`) | `channel`, `className` |
| `ChannelBadge` | Icon + label in a bordered chip | `channel` |

### `MetricCard`

**File:** `src/components/cloudsun/shared/MetricCard.tsx`

KPI card with label, large `font-display` value, optional delta and hint.

| Prop | Type | Notes |
| --- | --- | --- |
| `label` | `string` | Uppercase, tracked |
| `value` | `React.ReactNode` | `font-display`, `tabular-nums` |
| `delta` | `string` | Optional |
| `deltaDirection` | `"up" \| "down"` | Up = forest green, down = destructive |
| `hint` | `string` | Muted, follows delta |
| `icon` | `React.ComponentType<{ className?: string }>` | Rendered in an inset square |
| `className` | `string` | |

Defaults to `elevation-subtle` at rest and `hover:elevation-raised`.

### `PageHeader` family

**File:** `src/components/cloudsun/shared/PageHeader.tsx`

| Component | Purpose | Key props |
| --- | --- | --- |
| `PageHeader` | Top-of-view header with eyebrow, `font-display` `<h1>`, description and actions | `title`, `eyebrow?`, `description?`, `actions?` |
| `ContentSection` | Section wrapper with optional header and actions | `title?`, `description?`, `actions?`, `children`, `bodyClassName?` |
| `SectionHeader` | Small uppercase section label | `title`, `description?` |

`PageHeader` is the only place a view should render an `<h1>`. The
`TopBar` title is rendered as a `<div aria-label>` precisely so that
`PageHeader`'s `<h1>` is the single page-level heading (see Phase 9
accessibility note).

### `RelativeTime` and `DateTimeDisplay`

**File:** `src/components/cloudsun/shared/RelativeTime.tsx`

Both render a `<time dateTime={iso}>` element with the ISO timestamp in
the `dateTime` attribute for assistive technology.

| Component | Renders | Fallback |
| --- | --- | --- |
| `RelativeTime` | `formatRelativeTime(iso)` — "5m ago", "2d ago", "Jan 14" | `—` |
| `DateTimeDisplay` | `toLocaleString` — "Jan 14, 3:45 PM" | `—` |

| Prop | Type |
| --- | --- |
| `iso` | `string \| null \| undefined` |
| `className` | `string` |
| `fallback` | `string` (default `"—"`) |

### `TagList` and `Tag`

**File:** `src/components/cloudsun/shared/TagList.tsx`

| Component | Purpose | Key props |
| --- | --- | --- |
| `TagList` | Wrap a list of tags; optional per-tag remove button | `tags`, `onRemove?`, `size` (`xs/sm`) |
| `Tag` | Standalone tag with a tone | `children`, `tone` (`neutral/ember/forest`) |

---

## App shell components

### `AppShell` and `PageContainer`

**File:** `src/components/cloudsun/app/AppShell.tsx`

`AppShell` is the top-level layout. It composes `Sidebar`,
`MobileSidebar`, `TopBar`, the scrollable `<main>`, and the four
overlay components (`CommandPalette`, `NotificationCenter`, `ProfileMenu`,
`MobileNav`). The main element has
`pb-[calc(5rem+env(safe-area-inset-bottom))]` on mobile so the bottom
nav never covers content.

`PageContainer` is the standard responsive page wrapper every view uses:

```tsx
<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
  {children}
</div>
```

### `Sidebar` and `MobileSidebar`

**File:** `src/components/cloudsun/app/Sidebar.tsx`

| Component | Purpose |
| --- | --- |
| `Sidebar` | Desktop (md+) sidebar. Collapsible between `w-60` and `w-16`. Renders the organisation card with switcher, three nav groups (filtered by `VIEW_PERMISSIONS`), inbox/contacts badges, and a collapse toggle. |
| `MobileSidebar` | Full-height slide-over (`w-72 max-w-[85vw]`) for mobile. Body-scroll-locks while open. Same nav content as `Sidebar`. |

Both consume `useDemoStore` for view/collapse state and `useAuthStore`
for the organisation list and current role. The `canSee(itemId)` helper
filters items via `hasAnyPermission`.

### `TopBar`

**File:** `src/components/cloudsun/app/TopBar.tsx`

Sticky top bar (`h-14`) with:

- Mobile menu button (opens `MobileSidebar`).
- View title rendered as `<div aria-label>` (not a heading — `PageHeader`
  owns the page `<h1>`).
- Demonstration workspace badge.
- View description (subtitle).
- Command palette trigger (with `⌘K` hint on large screens).
- Notifications bell with unread count badge.
- Help dropdown (hidden on mobile).
- Theme menu (light / dark / system).
- Profile menu trigger showing `TeamAvatar` + name + role label.

The theme effect applies the `.dark` class to `document.documentElement`
and listens to `prefers-color-scheme` changes when in `system` mode.

### `CommandPalette`

**File:** `src/components/cloudsun/app/CommandPalette.tsx`

Global search and navigation dialog. Opens with `Ctrl/Cmd+K`, closes with
`Escape`. Features:

- Focus trap (`document.body.style.overflow = "hidden"` while open,
  input auto-focus on open).
- Grouped results: Navigate (all 14 nav items), Contacts, Companies,
  Conversations, Theme actions.
- Keyboard navigation: `ArrowUp` / `ArrowDown` to move active index,
  `Enter` to execute, `Escape` to close.
- Active item is scrolled into view inside `listRef`.
- Search query resets on open.

Selecting a result calls `navigate(view, params)` and closes the palette.

### `NotificationCenter`

**File:** `src/components/cloudsun/app/NotificationCenter.tsx`

Right-side popover listing notifications. Features:

- Unread count grouping at the top.
- Per-notification icon, title, body, relative time, "Mark as read".
- "Mark all as read" action.
- Clicking a notification marks it read and navigates to the related
  record (conversation → inbox with `detailId`, contact → contacts
  detail, company → companies detail, follow-up → calendar).
- `Escape` closes the panel.

### `ProfileMenu`

**File:** `src/components/cloudsun/app/ProfileMenu.tsx`

Profile dropdown showing the current user identity and role. Items:

- Profile / Preferences / Security / Appearance (navigate to settings).
- Reset demo data (calls `useDemoStore.getState().reset()`).
- Sign out (calls `useAuthStore.getState().signOut()`).

`Escape` closes the menu.

### `MobileNav`

**File:** `src/components/cloudsun/app/MobileNav.tsx`

Bottom navigation bar (mobile only). Renders the four `mobileVisible`
workspace items (`overview`, `inbox`, `contacts`, `companies`) plus a
**More** button that opens `MobileSidebar`. Uses `pb-safe` for
safe-area inset. Each item shows its icon, label, and an unread badge
for the inbox.

### `ThemeProvider`

**File:** `src/components/cloudsun/app/ThemeProvider.tsx`

Thin wrapper around `next-themes`'s `ThemeProvider`. Mounted once in
`src/app/layout.tsx`.

---

## Conventions

- Every shared component accepts an optional `className` prop merged via
  the `cn()` helper (`src/lib/utils.ts`, `clsx` + `tailwind-merge`).
- No shared component imports the Zustand store. App-shell components do,
  but they are the boundary between state and presentation.
- No shared component hardcodes a status colour. All status colours come
  from `src/lib/display.ts` via `StatusBadge`.
- Icon buttons always have an `aria-label`. Icon-only decorative
  elements are marked `aria-hidden`.
- Focus-visible rings use `focus-visible:ring-2 focus-visible:ring-ring`
  consistently across interactive elements.
