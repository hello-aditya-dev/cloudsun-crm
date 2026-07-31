# CloudSun IT-industry positioning

CloudSun is an operational customer-relationship workspace built specifically
for businesses that sell, support or implement information technology. It
brings customer, conversation and opportunity data into a single shared
workspace so sales, support and customer-success teams operate from the same
view of the truth.

## Primary positioning

> **Every customer, conversation and opportunity. One operational workspace.**

CloudSun helps IT sales, support and customer-success teams manage companies,
decision-makers, enquiries, opportunities and follow-ups from one shared
workspace.

The product is categorised as an **IT customer operations CRM**. It is not a
generic sales pipeline, not a horizontal help-desk tool, and not a
clinic-management system. It is tuned to the way IT businesses actually run:
multi-channel enquiries (phone, email, WhatsApp, web chat), technical
escalations, service renewals, implementation milestones and outcome-based
follow-ups.

## Target organisations

CloudSun is designed for IT-industry organisations with **10 to 200 staff**.
The product is shaped around the operating reality of these segments:

| Segment | What CloudSun provides |
| --- | --- |
| IT service providers | Shared inbox, contact/company records, SLA-tracked conversations, follow-up calendar |
| Managed service providers (MSPs) | Renewal tracking, account ownership, escalation routing, audit history |
| SaaS companies | Trial-to-customer pipeline, escalation paths, customer-success hand-offs |
| Cybersecurity firms | Security-assessment enquiries, escalation workflows, sensitivity-aware access |
| Cloud-service providers | Cloud-migration discussions, renewal dates, multi-contact account hierarchy |
| IT infrastructure companies | Network/infrastructure project tracking, account-level context |
| Technical-support centres | Unified inbox across channels, SLA timers, call-outcome logging |
| B2B technology sales teams | Lead-stage pipeline, opportunity tracking, estimated-value roll-ups |
| IT implementation / consulting companies | Implementation milestones, follow-up calendar, demo scheduling |

The shared thread: every one of these businesses lives or dies on the
quality of its customer conversations and the consistency of its follow-ups.
CloudSun treats those two things as first-class objects, not afterthoughts.

## Why an IT-specific CRM

A generic CRM optimises for sales rep productivity: pipeline coverage, deal
velocity, commission tracking. An IT business also needs sales, but its
support and customer-success load is at least as large as its sales load,
often larger. CloudSun makes the **conversation** the central object — not
the deal — because in an IT business the conversation is where the
relationship actually lives.

This shows up in concrete ways:

- The **inbox** is a first-class workspace, not a tab. It unifies phone,
  email, WhatsApp and web chat into one queue with SLA timers, assignment,
  internal notes and snooze.
- **Contacts and companies** carry the metadata IT teams need: preferred
  channel, time zone, marketing consent, do-not-contact flag, lead source,
  industry taxonomy (managed IT services, cybersecurity, cloud migration,
  SaaS implementation, network infrastructure, IT support, software
  development, data engineering, business automation, unified
  communications).
- **SLA** is derived from the response window and never displayed
  colour-only — every state has a human explanation ("SLA at risk. Response
  window is nearly exhausted.").
- **Follow-ups** are typed (callback, demo, meeting, check-in, proposal,
  renewal, escalation) and surfaced in the calendar, not buried in a notes
  field.

## What CloudSun is NOT

CloudSun is not a general-purpose CRM and it is explicitly not any of the
following, even though some of these have superficially similar UIs:

- **Not a dental, medical, healthcare or clinic-management system.** The
  domain types, status taxonomies and workflows are tuned to IT
  customer operations. There is no patient record, no clinical scheduling,
  no health-information privacy handling.
- **Not a horizontal help-desk or ticketing tool.** Tickets as a
  first-class object are not yet modelled (see `frontend-scope.md` for what
  is and is not built). The conversation is the central object.
- **Not a generic sales-force automation tool.** There is no commission
  engine, no forecast roll-up beyond the pipeline-by-stage view, no
  territory hierarchy.
- **Not a marketing-automation platform.** Campaigns are explicitly out of
  scope for the foundation.
- **Not a telephony carrier.** Calls are logged and demonstrated, but
  CloudSun does not place or receive real phone calls.

## Suitable organisation size

CloudSun is sized for organisations with **10 to 200 staff**. Below 10, the
operational overhead of a multi-channel CRM outweighs the benefit. Above
200, the demonstration workspace's seed data and single-tenant model stop
being representative and the production data model (see
`prisma/schema.prisma`) becomes the relevant reference.

The three plan tiers on the landing page reflect this band:

| Plan | Staff band | Positioning |
| --- | --- | --- |
| Launch | 10-25 | Single team, single channel mix |
| Growth | 26-75 | Multiple teams, mixed sales/support load |
| Scale | 76-200 | Multi-team, multi-channel, role-based access |

## How positioning shows up in the product

- The **landing page** (`src/components/cloudsun/views/LandingView.tsx`)
  opens with the operational problem (eight scattered channels: shared
  inboxes, personal Gmail, phone calls, WhatsApp, spreadsheets, ticket
  systems, sales pipelines, internal messages) and frames CloudSun as the
  one workspace that replaces them.
- The **onboarding wizard** (`OnboardingView.tsx`) asks about business
  functions and teams using an IT-industry taxonomy, not a generic
  "department" picker.
- The **demo data** (`src/data/demo.ts`) seeds 10 fictional IT companies
  spanning managed services, cybersecurity, cloud migration, SaaS
  implementation and infrastructure, with realistic IT-industry
  conversations (renewals, escalations, security assessments, migration
  discussions).
- The **role model** (`src/config/rbac.ts`) defines seven roles — owner,
  admin, operations manager, supervisor, sales employee, support employee,
  customer-success employee, analyst and read-only — matching how IT
  businesses actually divide customer-facing work.

## Reference

- `src/config/cloudsun.ts` — the `product` config object: name, category,
  tagline, supporting copy, repository identifier.
- `docs/product/frontend-scope.md` — what the foundation covers and what is
  demonstration-only or not yet built.
- `docs/product/route-map.md` — the complete route/view inventory.
