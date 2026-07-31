# Frontend testing

CloudSun's frontend test suite uses [Vitest](https://vitest.dev/) with a
jsdom environment.

## Commands

```bash
bun run test          # run the unit suite once
bun run test:watch    # watch mode
bun run test:ui       # browser UI
bun run typecheck     # tsc --noEmit
bun run lint          # eslint .
```

## Layout

```
tests/
  setup.ts                    # jsdom + localStorage reset before each test
  unit/
    repositories.test.ts      # async Contact/Company/Conversation repos
    demo-store.test.ts        # persistence, migration, data consistency, merge
    sla.test.ts               # SLA state derivation + descriptions
    search.test.ts            # diacritic-insensitive search normalization
```

## What is covered

### Repository operations (`repositories.test.ts`)

- Contact `list` / `getById` / `create` / `update` / `archive` / `restore`
  / `merge` / `addTag` / `removeTag`
- Company `list` / `getById` / `create` / `update`
- Conversation `list` / `getById` / `update` / `addMessage` /
  `addInternalNote` / `bulkUpdate` / `markRead` / `markUnread` / `snooze`
  / draft persistence
- Filtering by stage, tag, status, priority, assignee, channel, contact,
  company, unread, and diacritic-insensitive free-text search
- Pagination

### Demo-state migrations and consistency (`demo-store.test.ts`)

- Reset restores seeded state and clears drafts
- Archive closes a contact's open conversations (no broken links)
- Restore flips `archived` back to false
- Merge re-parents conversations to the target, archives the source,
  unions tags, honours explicit field choices, records an audit activity
- `addInternalNote` appends an internal message without changing the
  customer-facing preview
- Notification read / mark-all-read
- Migration safety: a corrupted localStorage entry does not crash the store

### SLA display logic (`sla.test.ts`)

- `computeSlaState` derives `safe` / `approaching` / `at_risk` /
  `breached` / `paused` from `slaDueAt` and the SLA window
- `resolveSlaState` honours snoozed / waiting_customer / paused overrides
- `describeSlaState` returns a non-empty human explanation for every state
- `slaMinutesRemaining` returns null for missing/invalid dates and signed
  minutes otherwise

### Search normalization (`search.test.ts`)

- `normalizeSearch` lowercases, strips diacritics, collapses whitespace
- `matchesQuery` is order-independent across tokens
- `toHaystack` joins parts while skipping nullish entries

## Conventions

- Each test file resets the demo store in `beforeEach` via
  `useDemoStore.getState().reset()` and the setup file clears
  `localStorage` so the persisted Zustand store reseeds from the
  deterministic seed.
- Repository tests exercise the async interface — they never reach into
  the store directly except to assert side-effects (message count, preview
  text).
- SLA and search tests are pure and do not touch the store.
