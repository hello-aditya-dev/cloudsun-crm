# Demonstration repository layer

This document describes how the CloudSun demonstration workspace persists
state, why the repository abstraction exists, and how to swap it for a
production backend without touching UI code.

## Goals

1. **One coherent product.** Actions across contacts, companies and
   conversations must update related views consistently. A contact archive
   must not leave broken conversation links; a merge must re-parent
   timelines; a status change must update inbox counts.
2. **No scattered `localStorage` access.** Components consume typed
   repository interfaces. The only code that touches `localStorage` is the
   Zustand persistence layer in `src/lib/demo-store.ts`.
3. **Migration safety.** A stale store from a previous build must never
   crash the workspace. It is transparently upgraded to the current shape.
4. **Production-swap-ready.** The repository interfaces are async
   (`Promise`-based) so a future Prisma-backed implementation is a drop-in.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  React components (InboxView, ContactsView, …)            │
│        useDemoStore() selectors + repository calls        │
└───────────────────────────┬──────────────────────────────┘
                            │
        ┌───────────────────┴────────────────────┐
        ▼                                        ▼
┌──────────────────────┐              ┌─────────────────────┐
│  src/lib/demo-store  │              │  src/lib/repositories│
│  Zustand + persist   │              │  async interfaces    │
│  (the single source  │  ◄── wraps ──│  ContactRepository   │
│   of truth)          │              │  CompanyRepository   │
│                      │              │  ConversationRepo    │
│  entities + drafts   │              │  TeamRepository      │
│  + UI state          │              │  FollowUpRepository  │
└──────────┬───────────┘              └─────────────────────┘
           │ persist()
           ▼
┌──────────────────────────────────────┐
│  window.localStorage                 │
│  key: "cloudsun-demo-v2"             │
│  versioned, migrated on load         │
└──────────────────────────────────────┘
```

## Files

| File | Responsibility |
| --- | --- |
| `src/lib/demo-store.ts` | Zustand store. Holds all entities, drafts, UI state. Persisted to a versioned localStorage key. Contains the business rules (archive closes open conversations, merge re-parents timelines, etc.). |
| `src/lib/repositories.ts` | Async repository interfaces and their demo implementations. UI code should depend on the interfaces, not the store. |
| `src/lib/sla.ts` | Pure SLA computation. Derives the live `SlaState` from `slaDueAt`, honouring paused overrides. Never colour-only — `describeSlaState` returns a human explanation. |
| `src/lib/search.ts` | `normalizeSearch`, `matchesQuery`, `toHaystack`. Diacritic- and case-insensitive. Used by every repository `list()` query. |
| `src/data/demo.ts` | Deterministic IT-industry seed data. |
| `src/hooks/use-demo-state.ts` | React hook (legacy, retained for compatibility). |

## Repository interfaces

```ts
interface ContactRepository {
  list(input: ContactListInput): Promise<ContactListResult>;
  getById(id: string): Promise<Contact | null>;
  create(input: CreateContactInput): Promise<Contact>;
  update(id: string, input: UpdateContactInput): Promise<Contact>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  merge(input: MergeContactsInput): Promise<Contact>;
  addTag(id: string, tag: string): Promise<void>;
  removeTag(id: string, tag: string): Promise<void>;
}

interface CompanyRepository {
  list(input: CompanyListInput): Promise<CompanyListResult>;
  getById(id: string): Promise<Company | null>;
  create(input: CreateCompanyInput): Promise<Company>;
  update(id: string, input: UpdateCompanyInput): Promise<Company>;
}

interface ConversationRepository {
  list(input: ConversationListInput): Promise<ConversationListResult>;
  getById(id: string): Promise<Conversation | null>;
  update(id: string, input: UpdateConversationInput): Promise<Conversation>;
  addMessage(input: AddMessageInput): Promise<Message>;
  addInternalNote(input: AddInternalNoteInput): Promise<Message>;
  bulkUpdate(input: BulkConversationUpdateInput): Promise<void>;
  markRead(id: string): Promise<void>;
  markUnread(id: string): Promise<void>;
  snooze(id: string): Promise<void>;
  setDraft(conversationId: string, body: string): Promise<void>;
  getDraft(conversationId: string): Promise<string>;
  clearDraft(conversationId: string): Promise<void>;
}
```

Singleton instances are exported as `contactRepository`,
`companyRepository`, `conversationRepository`, `teamRepository`,
`followUpRepository`.

## Data consistency rules

| Rule | Implementation |
| --- | --- |
| Updating a contact updates its conversation context | Conversations reference `contactId`, never a denormalised name. Any contact edit is immediately reflected in joined views. |
| Updating a company updates linked contact displays | Contacts reference `companyId`. Company edits propagate through the join. |
| Archiving a contact does not leave broken conversation links | `archiveContact()` closes the contact's open conversations (`open`, `unassigned`, `mine`, `waiting_customer`, `waiting_internal`, `needs_approval`) → `closed`. Resolved/closed/spam conversations keep their status. |
| Closing a conversation updates inbox counts | Inbox counts are derived from the conversations array (status + unreadCount). Closing updates both. |
| Reading a conversation updates unread counts | `markConversationRead()` sets `unreadCount = 0`. |
| Assigning a conversation updates relevant views | `assignConversation()` updates `assigneeId` and logs an `assignment_change` activity. |
| Adding a note updates the activity timeline | `addInternalNote()` appends the message and logs an `internal_note` activity. |
| Creating a contact makes it globally searchable | New contacts are prepended to `contacts[]` and immediately appear in `contactRepository.list()` and command-palette search. |
| Merging contacts re-parents timelines | `mergeContacts()` archives the source, re-points its conversations/calls/follow-ups to the target, and unions tags + notes. |
| Resetting the demo restores the complete seeded state | `reset()` re-clones `demoSeed` and clears drafts. |

## Persistence

- **Storage key:** `cloudsun-demo-v2` (versioned).
- **Version:** `DEMO_VERSION = 2`.
- **Migration:** the Zustand `migrate` callback reseeds all entity data from
  the deterministic seed when the persisted version does not match
  `DEMO_VERSION`, while preserving UI preferences (sidebar collapse, theme,
  current user). A malformed store is replaced with the seed — it never
  crashes the workspace.
- **Drafts:** composer drafts are stored in `state.drafts` (keyed by
  conversation id), not in ad-hoc localStorage keys. This means drafts
  participate in reset, migration and the same subscription model as every
  other entity.

## What persists across refresh

- Created / updated / archived / restored / merged contacts
- Created / updated companies
- Conversation assignments, statuses, priorities, snoozes
- Read / unread state
- Internal notes and simulated replies
- Composer drafts
- Tags (contact and conversation)
- Notification read state
- Sidebar collapse, theme, current user
- Activity / audit events (capped at 200)

## How to reset

`useDemoStore.getState().reset()` — or use the "Reset demo data" action in
the profile menu. Clears localStorage, reseeds from `demoSeed`, returns to
the overview view.

## Swapping for production

Replace the demo repository classes in `src/lib/repositories.ts` with
Prisma-backed implementations that honour the same interfaces. The UI does
not need to change because it depends on the interfaces, and the interfaces
are already async. The Zustand store can be removed entirely in production
(or retained as a client-side cache).

## Phase 10 additions

Phase 10 hardened the repository layer and its supporting libraries with
full test coverage and made the production-swap story explicit. The layer
is now the audited boundary between the UI and the (demonstration) data
source.

### Test coverage

The full Vitest suite (see `docs/testing/frontend-testing.md`) is **293
unit + component tests across 20 files**. The repository layer and its
dependencies are covered as follows:

| File | Tests | Coverage |
| --- | --- | --- |
| `tests/unit/repositories.test.ts` | 36 | Full CRUD across `ContactRepository`, `CompanyRepository`, `ConversationRepository`; merge; bulk update; draft persistence; filtering; sorting; pagination; diacritic-insensitive search |
| `tests/unit/demo-store.test.ts` | 15 | Persistence, reset, drafts, archive consistency (open conversations closed), restore, merge re-parenting and tag/note union honouring `fieldChoices`, `addInternalNote` preview invariant, notification state, migration safety on malformed stores |
| `tests/unit/sla.test.ts` | 17 | `computeSlaState` bands, ratio-based thresholds, absolute-time fallback, `resolveSlaState` paused overrides, `describeSlaState` non-empty human text, `slaMinutesRemaining` signed minutes and null handling |
| `tests/unit/search.test.ts` | 11 | `normalizeSearch` diacritic and case folding, `matchesQuery` order-independent token matching, `toHaystack` nullish skipping |

Component tests (`ContactRow`, `ConversationRow`, `Composer`,
`InternalNote`, `CommandPalette`, etc.) verify that the UI consumes the
repository outputs correctly.

### Async interfaces enable a future Prisma swap

Every repository method returns a `Promise`, even though the demo
implementations are synchronous (`delay()` is a microtask). This is
deliberate: real production repositories will be network-bound. Forcing
the interface to be `Promise`-based now means UI code is already written
to `await` results, and the production swap is a drop-in replacement of
the demo classes with Prisma-backed implementations. No call site changes.

```ts
// UI code (unchanged in production):
const { items, total, filtered } = await contactRepository.list({
  filters: { query, leadStage, archived: false },
  sort: { field: "fullName", direction: "asc" },
  page: 1,
  pageSize: 25,
});
```

### Contact merge semantics

`mergeContacts({ targetId, sourceId, fieldChoices })` is the canonical
merge flow. The implementation in `src/lib/demo-store.ts` guarantees:

1. **Timeline re-parenting.** The source contact's `conversations`,
   `calls` and `followUps` are re-pointed to the target id. Messages
   themselves are keyed by `conversationId` and need no edit — the
   conversation re-parenting above routes them to the target.
2. **Source archival.** The source contact is marked `archived: true`
   rather than deleted, preserving an audit trail.
3. **Tag union.** The target's tags become the set union of both
   contacts' tags, unless `fieldChoices.tags` is provided.
4. **Notes union.** The target's notes become
   `{target.notes}\n\n--- merged from {source.fullName} ---\n{source.notes}`,
   unless `fieldChoices.notes` is provided.
5. **Explicit field choices.** Any field on `fieldChoices` overrides the
   target's existing value (e.g. `primaryEmail`, `ownerId`, `leadStage`).
   Fields absent from `fieldChoices` keep the target's value.
6. **Audit activity.** A `system` activity is logged:
   `"Merged {source.fullName} into {target.fullName}"` with detail
   noting the source was archived and timelines re-parented.

`ContactRepository.merge()` is the public async surface that wraps this
store operation.

### Archive consistency

Archiving a contact is not a soft delete — it cascades to keep the
inbox coherent. `archiveContact(id)` closes the contact's open
conversations (`open`, `unassigned`, `mine`, `waiting_customer`,
`waiting_internal`, `needs_approval`) → `closed`. Resolved, closed and
spam conversations keep their status. This guarantees the inbox never
shows an open conversation whose contact has been archived.

A `system` audit activity is logged with the count of conversations
closed (e.g. `"Jane Doe — 2 open conversations closed."`).

### Centralised drafts

Composer drafts are centralised in the store, not in ad-hoc
`localStorage` keys:

```ts
setConversationDraft(conversationId, body): void
getConversationDraft(conversationId): string
clearConversationDraft(conversationId): void
```

`ConversationRepository` exposes the same three methods as async
operations. The previous direct-`localStorage` draft handling in
`InboxView` was removed in Phase 8; drafts now participate in reset,
migration and the same Zustand subscription model as every other entity.

### SLA derivation

SLA state is **derived from `slaDueAt`**, not stored as the source of
truth. `resolveSlaState(conversation)` re-derives the live state on every
read, honouring paused overrides (`snoozed`, `waiting_customer`, or an
explicit `slaState: "paused"`). This means the UI never shows a stale
"safe" badge when the deadline has actually passed.

The `SlaIndicator` component always pairs the colour with a human
explanation (`describeSlaState`) — never colour-only.

### Search normalization

`normalizeSearch` (lowercase + NFD diacritic strip + whitespace collapse)
is the single normalization used by every repository `list()` query.
"Álvarez" matches "alvarez", "de Vries" matches "de vries", and
multi-token queries are order-independent ("wei lin" matches "Wei-Lin
Tan"). `toHaystack` skips nullish parts so missing fields do not
introduce stray `"null"` tokens.

### Migration safety (reaffirmed)

`DEMO_VERSION = 2` and the storage key `cloudsun-demo-v2`. The Zustand
`migrate` callback reseeds all entity data from the deterministic seed
when the persisted version does not match, while preserving UI
preferences (sidebar collapse, theme, current user). A malformed or
corrupted store is replaced with the seed — it never crashes the
workspace. This is verified by `demo-store.test.ts`.
