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
