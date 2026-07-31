# Design system

CloudSun's design system is a warm, editorial identity built on Tailwind
CSS 4 and CSS custom properties. This document is the reference for the
tokens, typography, elevation, motion and status conventions defined in
`src/app/globals.css` and `src/lib/display.ts`.

## Identity

| Token | Role | Light value |
| --- | --- | --- |
| `--surface-app` | Page background | warm ivory `oklch(0.965 0.008 75)` |
| `--card` | Card / panel background | near-white `oklch(0.992 0.004 75)` |
| `--foreground` | Primary text | deep warm charcoal `oklch(0.28 0.012 60)` |
| `--ember` (`--primary`) | Brand accent | terracotta ember `oklch(0.58 0.135 38)` |
| `--forest` (`--success`) | Supporting accent | forest green `oklch(0.55 0.1 155)` |
| `--warning` | Approaching / at-risk | warm amber `oklch(0.74 0.14 75)` |
| `--destructive` | Error / breach / urgent | deep red `oklch(0.55 0.2 25)` |
| `--info` | Informational / "new" | slate blue `oklch(0.6 0.09 230)` |

The palette is intentionally restrained. Indigo, blue and violet are not
used anywhere in the product. The only non-warm hue is `--info` (slate
blue), and `--chart-4` (also slate blue) is reserved for chart series
that need to be distinguishable from the ember/forest/amber family.

## Token categories

All tokens are defined as CSS custom properties on `:root` and re-exposed
to Tailwind via `@theme inline` in `globals.css`. Every token has a dark
variant under `.dark`.

### Surfaces

| Token | Use |
| --- | --- |
| `--surface-app` | Page background (applied on `<body>`) |
| `--surface-elevated` | Lifted ivory (rarely used directly) |
| `--card` | Cards, popovers, inputs background |
| `--popover` | Menus, dropdowns |
| `--sidebar` | Sidebar background |
| `--surface-inset` | Inset panels, code blocks, tag chips |
| `--surface-hover` | Hover state for interactive rows |
| `--surface-selected` | Active nav item, selected row |
| `--surface-disabled` | Disabled controls |
| `--overlay` | Modal / dialog backdrop |

### Text

| Token | Use |
| --- | --- |
| `--foreground` | Primary text |
| `--text-secondary` | Secondary text |
| `--muted-foreground` | Muted labels, hints, descriptions (darkened in Phase 9 for WCAG AA on cards) |
| `--text-disabled` | Disabled text |
| `--text-inverse` | Text on dark surfaces |
| `--text-link` | Hyperlinks |

### Borders, inputs, rings

| Token | Use |
| --- | --- |
| `--border` | Default borders, dividers |
| `--input` | Form input border |
| `--ring` | Focus ring (uses `--primary` at 45% opacity) |

### Brand and destructive

| Token | Use |
| --- | --- |
| `--primary` / `--primary-foreground` | Brand button, active nav indicator |
| `--secondary` / `--secondary-foreground` | Secondary buttons |
| `--muted` / `--accent` | Neutral backgrounds |
| `--destructive` / `--destructive-foreground` | Destructive actions, breach, urgent |
| `--destructive-strong` | Dark red for badge text on light tint (WCAG AA) |

### Status colours

| Token | Use |
| --- | --- |
| `--success` / `--success-foreground` | Forest green, success states |
| `--warning` / `--warning-foreground` | Amber, approaching / at-risk |
| `--info` / `--info-foreground` | Slate blue, informational |
| `--neutral-status` / `--neutral-foreground` | Neutral grey, "inactive" / "closed" |

### CRM semantics

The system exposes the brand accents directly so CRM-specific styling can
reference them by name rather than by overloaded generic tokens:

| Token | Use |
| --- | --- |
| `--ember` / `--ember-foreground` / `--ember-strong` | Terracotta brand accent (opportunity stage, "mine" filter, primary CTAs) |
| `--forest` / `--forest-foreground` / `--forest-strong` | Forest green (qualified, customer, resolved, success) |
| `--info-strong` | Dark slate blue for badge text on light tint |

The `-strong` variants were added in Phase 9 to fix contrast on light
tinted badge backgrounds. Badges use `bg-{color}/10 text-{color}-strong
border-{color}/20` so the text always meets WCAG AA against the tint.

### Sidebar

A dedicated set of sidebar tokens (`--sidebar-foreground`,
`--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`,
`--sidebar-ring`) lets the sidebar carry its own tonality while remaining
within the warm palette.

### Charts

Five chart-series tokens (`--chart-1` through `--chart-5`) are reserved
for data visualisation. Charts 1-3 echo ember / forest / amber; chart 4
is slate blue; chart 5 is deep clay.

## Typography

```css
--font-geist-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
--font-geist-mono: "Geist Mono", ui-monospace, monospace;
--font-serif: "Fraunces", ui-serif, Georgia, serif;
```

- **Body text** uses the Geist sans family via Tailwind's `--font-sans`.
  `font-feature-settings: "cv11", "ss01"` and
  `text-rendering: optimizeLegibility` are set on `<body>`.
- **Display headings** use Fraunces, an editorial serif, applied via the
  `.font-display` utility class. `.font-display` sets `font-optical-sizing:
  auto` and a tight `letter-spacing: -0.02em`. Every view's `PageHeader`
  title and every card section heading use `.font-display`.
- **Mono** is reserved for keyboard hints (`⌘K`), tabular numerals where
  needed, and code.

## Spacing and layout

CloudSun does not redefine Tailwind's spacing scale. The conventions are:

- **Page containers** use `PageContainer` (`max-w-7xl mx-auto px-4 py-6
  sm:px-6 lg:px-8`).
- **Card padding** is `p-4` for compact cards (e.g. `MetricCard`) and
  `p-6` for content cards.
- **Gap** between items in a flex/grid is `gap-4` (default) or `gap-6`
  (generous).
- **Stack spacing** uses `space-y-4` or `space-y-6` for vertical rhythm.
- **Sidebar width** is `w-60` expanded, `w-16` collapsed.
- **Top bar height** is `h-14`.
- **Mobile bottom nav** uses `pb-safe` (`env(safe-area-inset-bottom)`)
  and the main content has `pb-[calc(5rem+env(safe-area-inset-bottom))]`
  on mobile so the bottom nav never covers content.

## Elevation

CloudSun uses a small set of box-shadow utilities rather than ad-hoc
shadows. All shadows use the warm-charcoal base colour
(`oklch(0.25 0.01 60 / ...)`) so they read as warm, not grey.

| Utility | Use |
| --- | --- |
| `elevation-flat` | No shadow |
| `elevation-subtle` | Default for cards (`MetricCard`, list rows) — `0 1px 2px 0` at 5% |
| `elevation-raised` | Hover state on subtle cards — `0 1px 3px 0` at 8% + `0 1px 2px -1px` at 6% |
| `elevation-floating` | Popovers, dropdowns, slide-overs, modals — `0 10px 24px -8px` at 16% + `0 4px 8px -4px` at 8% |

`MetricCard` illustrates the pattern: `elevation-subtle` at rest, with
`hover:elevation-raised` for affordance.

## Dark mode

Dark mode is toggled by adding the `.dark` class to `<html>`. The
`@custom-variant dark (&:is(.dark *))` declaration in `globals.css` makes
Tailwind's `dark:` variant work with this strategy. The `ThemeProvider`
wraps `next-themes`, and `TopBar` applies the class based on the
`theme` slice of the demo store (`light` / `dark` / `system`).

Dark-mode token highlights (full set in `globals.css`):

- `--surface-app: oklch(0.21 0.008 60)` (warm dark charcoal)
- `--card: oklch(0.26 0.008 60)`
- `--foreground: oklch(0.93 0.006 70)`
- `--muted-foreground: oklch(0.70 0.008 70)` (lightened for AA on dark cards)
- `--primary: oklch(0.68 0.13 40)` (lighter ember for dark)
- `--ember-strong: oklch(0.75 0.13 40)` (light ember for text on dark tint)
- `--forest-strong: oklch(0.72 0.10 155)` (light forest for text on dark tint)
- `--info-strong: oklch(0.72 0.11 230)` (light info for text on dark tint)

Borders in dark mode use translucent white (`oklch(1 0 0 / 9%)`).

## Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

All transitions honour `prefers-reduced-motion`. Animations collapse to
near-instant; smooth scroll is disabled. No motion is essential to
operating the workspace.

## Custom scrollbars

The `.scroll-area-cs` utility provides a restrained, on-brand scrollbar:

```css
.scroll-area-cs::-webkit-scrollbar { width: 8px; height: 8px; }
.scroll-area-cs::-webkit-scrollbar-track { background: transparent; }
.scroll-area-cs::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 9999px;
}
.scroll-area-cs::-webkit-scrollbar-thumb:hover {
  background: var(--muted-foreground);
}
```

Applied to the main scroll container, the sidebar nav, the mobile nav,
and any horizontally-scrollable table.

## Radius

The radius scale is built around a single `--radius: 0.75rem` and
derived variants:

| Token | Use |
| --- | --- |
| `--radius-sm` (`calc(var(--radius) - 4px)`) | Badges, chips, small inputs |
| `--radius-md` (`calc(var(--radius) - 2px)`) | Buttons, inputs |
| `--radius-lg` (`var(--radius)`) | Cards, popovers |
| `--radius-xl` (`calc(var(--radius) + 4px)`) | Large feature cards |

## Status styling (centralised in `display.ts`)

Status colours and labels are **never** inline in components. They live
in `src/lib/display.ts` as `StatusMeta` records, consumed by
`StatusBadge` and `SlaIndicator`. The single source of truth guarantees
that a given status renders identically everywhere it appears.

| Record | Keys | Used by |
| --- | --- | --- |
| `leadStageMeta` | new, uncontacted, attempted, connected, qualified, interested, opportunity, customer, at_risk, inactive, not_interested, invalid, do_not_contact | Contacts list, contact detail, pipeline view |
| `priorityMeta` | low, normal, high, urgent | Contacts, conversations |
| `conversationStatusMeta` | open, unassigned, mine, waiting_customer, waiting_internal, needs_approval, snoozed, resolved, closed, spam | Inbox list, inbox detail |
| `slaMeta` | safe, approaching, at_risk, breached, paused | `SlaIndicator`, inbox SLA column |
| `customerStatusMeta` | prospect, active, renewing, at_risk, churned, former | Companies list, company detail |
| `callOutcomeMeta` | completed, voicemail, no_answer, busy, failed, scheduled | Calls view, contact timeline |
| `followUpStatusMeta` | scheduled, completed, overdue, cancelled | Calendar, follow-up cards |
| `channelMeta` | phone, email, whatsapp, webchat, internal, system | `ChannelIcon`, `ChannelBadge`, inbox |
| `industryMeta` | managed_it_services, cybersecurity, cloud_migration, saas_implementation, network_infrastructure, it_support, software_development, data_engineering, business_automation, unified_communications | Company forms, filters |
| `followUpTypeMeta` | callback, demo, meeting, check_in, proposal, renewal, escalation | Follow-up forms |
| `teamRoleMeta` | account_owner, operations_manager, customer_success_manager, technical_lead, support_specialist, sales_developer | Team admin, profile |

Each `StatusMeta` carries `{ label, badge, dot }`:

- `label` — human-readable string.
- `badge` — Tailwind class string for the badge background, text and
  border (e.g. `"bg-ember/10 text-ember-strong border-ember/20"`).
- `dot` — Tailwind class for the leading dot (e.g. `"bg-ember"`).

The `StatusBadge` component reads these via a discriminated `kind` /
`value` pair, with a `custom` escape hatch for one-off badges.

## Formatting helpers

`display.ts` also exports the formatting helpers used throughout the UI:

| Function | Returns |
| --- | --- |
| `formatCurrency(n)` | `$5k` for >= 1000, otherwise `$1,234` |
| `formatCurrencyFull(n)` | `$1,234` always |
| `formatDuration(seconds)` | `1m 05s`, `45s`, or `—` for 0 |
| `initials(name)` | First letters of the first two words |
| `formatRelativeTime(iso)` | `just now`, `5m ago`, `3h ago`, `2d ago`, or `Jan 14` |
| `formatDateTime(iso)` | `Jan 14, 3:45 PM` |
| `formatDate(iso)` | `Jan 14, 2026` |

`RelativeTime` and `DateTimeDisplay` components wrap these with a
`<time dateTime={iso}>` element for assistive technology.

## Reference

- `src/app/globals.css` — all tokens, base layer, utilities.
- `src/lib/display.ts` — `StatusMeta` records and formatting helpers.
- `docs/design/component-inventory.md` — components that consume these
  tokens.
