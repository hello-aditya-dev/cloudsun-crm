# Route map

This is the complete inventory of CloudSun CRM's routed views. The
configuration is the single source of truth at `src/config/navigation.ts`;
this document is a human-readable mirror.

## Routing model

CloudSun runs as a **single visible URL** (`/`). All navigation is
client-side: a `view: { view: ViewId, params: ViewParams }` slice on the
Zustand store drives which view component `src/app/page.tsx` renders.
There is no Next.js App Router segment per view.

Why this model:

- The sandbox the foundation was built in exposes only one route. URL-based
  routing would still be single-route on the wire.
- It keeps the auth/onboarding/app phasing in one place — `page.tsx`
  decides between `LandingView`, `AuthView`, `OnboardingView` and
  `AppShell` based on `authPhase`.

Deep links survive refresh because the entire `view` object is part of the
persisted Zustand store (`cloudsun-demo-v2`). Opening a contact detail,
refreshing, and landing back on the same contact is supported and tested
(`tests/e2e/deep-links.spec.ts`).

## Nav groups

| Group id | Label | Items |
| --- | --- | --- |
| `workspace` | Workspace | overview, inbox, contacts, companies |
| `customer_operations` | Customer operations | calls, calendar, knowledge, automations, analytics |
| `manage` | Manage | team, integrations, settings, billing, audit_log |

## Permission model

`VIEW_PERMISSIONS` in `src/config/navigation.ts` maps each view id to the
permissions a role must hold (any-of) to see the nav item. An empty array
means the view is visible to every authenticated member.

```ts
export const VIEW_PERMISSIONS: Record<string, string[]> = {
  overview: [],
  inbox: ["conversations.view_all", "conversations.view_team", "conversations.view_assigned"],
  contacts: ["contacts.view_all", "contacts.view_team", "contacts.view_assigned"],
  companies: ["companies.view_all", "companies.view_team"],
  calls: [],
  calendar: [],
  knowledge: [],
  automations: [],
  analytics: ["reports.view"],
  team: ["members.view"],
  integrations: ["integrations.view"],
  settings: [],
  billing: ["billing.view", "billing.manage"],
  audit_log: ["audit.view"],
};
```

`Sidebar`, `MobileSidebar` and `MobileNav` all use `hasAnyPermission` from
`src/config/rbac.ts` to filter items by the current role.

## Complete route inventory

### Workspace group

| Id | Label | Path (logical) | Icon | Description | Mobile visible | Required permissions |
| --- | --- | --- | --- | --- | --- | --- |
| `overview` | Overview | `/app/overview` | `layout-dashboard` | Operational snapshot of your workspace | yes | (none) |
| `inbox` | Inbox | `/app/inbox` | `inbox` | Unified conversations across phone, email, WhatsApp and web chat | yes | `conversations.view_all` / `view_team` / `view_assigned` |
| `contacts` | Contacts | `/app/contacts` | `users` | Decision-makers, leads and customer contacts | yes | `contacts.view_all` / `view_team` / `view_assigned` |
| `companies` | Companies | `/app/companies` | `building-2` | Customer and prospect organisations | yes | `companies.view_all` / `view_team` |

### Customer operations group

| Id | Label | Path (logical) | Icon | Description | Mobile visible | Required permissions |
| --- | --- | --- | --- | --- | --- | --- |
| `calls` | Calls | `/app/calls` | `phone` | Call log and demonstration telephony history | no | (none) |
| `calendar` | Calendar | `/app/calendar` | `calendar` | Follow-ups, demos and scheduled callbacks | no | (none) |
| `knowledge` | Knowledge | `/app/knowledge` | `book-open` | Knowledge base and response playbooks | no | (none) |
| `automations` | Automations | `/app/automations` | `workflow` | Demonstration automation rules and triggers | no | (none) |
| `analytics` | Analytics | `/app/analytics` | `bar-chart-3` | Operational metrics and pipeline analytics | no | `reports.view` |

### Manage group

| Id | Label | Path (logical) | Icon | Description | Mobile visible | Required permissions |
| --- | --- | --- | --- | --- | --- | --- |
| `team` | Team | `/app/team` | `user-cog` | Team members and roles | no | `members.view` |
| `integrations` | Integrations | `/app/integrations` | `plug` | Connected providers and integration status | no | `integrations.view` |
| `settings` | Settings | `/app/settings` | `settings` | Workspace preferences | no | (none) |
| `billing` | Billing | `/app/billing` | `credit-card` | Plan and demonstration billing | no | `billing.view` / `billing.manage` |
| `audit_log` | Audit log | `/app/audit-log` | `scroll-text` | Audit event history | no | `audit.view` |

Total: **14 routes** across **3 groups**.

> Note: paths are logical identifiers only — the URL never changes. They
> exist on the nav item for documentation, command-palette search and a
> future URL-routing migration.

## Detail routes

Several views render a detail screen when `view.params.detailId` is set.
These are not separate routes — they are the same view id with params —
but they are deep-linkable.

| View | Param | Effect |
| --- | --- | --- |
| `contacts` | `detailId` | Opens `ContactDetail` for the given contact id |
| `companies` | `detailId` | Opens `CompanyDetail` for the given company id |
| `inbox` | `detailId` | Selects the given conversation in the inbox |
| `settings` | `detailId` | Opens a specific settings tab (e.g. `security`) |

The back button, "Open related contact/company" cross-links and
notification deep-links all use this param mechanism. Refreshing a detail
view preserves the param because it lives in the persisted store.

## Mobile navigation

`MobileNav` (bottom bar, mobile only) shows the four workspace items plus
a **More** button:

```
[ Overview ] [ Inbox ] [ Contacts ] [ Companies ] [ More ]
```

Each item is permission-filtered the same way as the sidebar. Tapping
**More** opens the full `MobileSidebar` slide-over, which lists every
permission-visible nav item grouped identically to the desktop sidebar.

`MOBILE_NAV_IDS` in `navigation.ts` is the derived list of ids that
appear on the bottom bar (`NAV_ITEMS.filter((n) => n.mobileVisible)`).

## Command palette

The command palette (`Ctrl/Cmd+K`) searches across:

- Navigation (all 14 items, plus keywords like "dashboard", "messages",
  "people", "accounts" etc.)
- Contacts (by name, email, phone, company)
- Companies (by name, domain, industry)
- Conversations (by subject, preview, contact name)
- Theme actions (light / dark / system)

Selecting any result calls `navigate(view, params)`, the same path as the
sidebar. See `docs/design/component-inventory.md` for the full
`CommandPalette` API.

## Adding a new route

1. Append a `NavItem` to `NAV_ITEMS` in `src/config/navigation.ts` with
   `id`, `label`, `path`, `icon` (a `lucide-react` icon name), `group`,
   `mobileVisible`, `keywords`, `description`, `available: true`.
2. Add the `id` to `VIEW_PERMISSIONS` if it should be gated.
3. Add the view component to `src/app/page.tsx`'s lazy-loaded map and to
   the route smoke test in `tests/a11y/routes.spec.ts` if it should be a
   visible sidebar item.
4. If the view needs a detail screen, document the `params.detailId`
   contract here.

No change is needed to `Sidebar`, `MobileSidebar`, `MobileNav` or
`CommandPalette` — they all read from `NAV_ITEMS` and
`VIEW_PERMISSIONS` directly.
