/**
 * CloudSun — repository interfaces and demonstration implementations.
 *
 * Components and server actions consume these interfaces instead of touching
 * the Zustand store or localStorage directly. In production, swap the demo
 * implementations for Prisma-backed repositories that honour the same
 * interfaces.
 *
 * Why async even though the demo store is synchronous? Real repositories will
 * be network-bound; forcing the interface to be Promise-based now means UI
 * code is already written to await results, and the production swap is a
 * drop-in.
 */

import { useDemoStore } from "@/lib/demo-store";
import { matchesQuery, toHaystack } from "@/lib/search";
import { resolveSlaState } from "@/lib/sla";
import type {
  Company,
  Contact,
  Conversation,
  FollowUp,
  Message,
  Priority,
  SlaState,
  TeamMember,
  ConversationStatus,
  Channel,
} from "@/types/domain";

/* ------------------------------------------------------------------ */
/* Shared list types                                                   */
/* ------------------------------------------------------------------ */

export interface SortOption<TField extends string = string> {
  field: TField;
  direction: "asc" | "desc";
}

export interface ListResult<T> {
  items: T[];
  total: number;
  /** number of items after filtering but before pagination */
  filtered: number;
}

export interface PaginationInput {
  page?: number; // 1-based
  pageSize?: number;
}

/* ------------------------------------------------------------------ */
/* Contact repository                                                  */
/* ------------------------------------------------------------------ */

export interface ContactFilters {
  query?: string;
  leadStage?: Contact["leadStage"] | Contact["leadStage"][];
  companyId?: string;
  ownerId?: string | string[];
  leadSource?: string | string[];
  tag?: string | string[];
  priority?: Priority | Priority[];
  preferredChannel?: Channel | Channel[];
  marketingConsent?: boolean;
  doNotContact?: boolean;
  archived?: boolean;
}

export interface ContactListInput extends PaginationInput {
  filters?: ContactFilters;
  sort?: SortOption<keyof Contact | "companyName">;
}

export type ContactListResult = ListResult<Contact>;

export interface CreateContactInput {
  fullName: string;
  jobTitle?: string;
  companyId?: string | null;
  primaryEmail?: string;
  secondaryEmail?: string | null;
  primaryPhone?: string;
  secondaryPhone?: string | null;
  whatsappNumber?: string | null;
  location?: string;
  timeZone?: string;
  preferredLanguage?: string;
  preferredChannel?: Channel;
  leadStage?: Contact["leadStage"];
  leadSource?: string;
  ownerId?: string;
  priority?: Priority;
  estimatedValue?: number;
  tags?: string[];
  notes?: string;
  marketingConsent?: boolean;
  doNotContact?: boolean;
}

export interface UpdateContactInput {
  fullName?: string;
  jobTitle?: string;
  companyId?: string | null;
  primaryEmail?: string;
  secondaryEmail?: string | null;
  primaryPhone?: string;
  secondaryPhone?: string | null;
  whatsappNumber?: string | null;
  location?: string;
  timeZone?: string;
  preferredLanguage?: string;
  preferredChannel?: Channel;
  leadStage?: Contact["leadStage"];
  leadSource?: string;
  ownerId?: string;
  priority?: Priority;
  estimatedValue?: number;
  tags?: string[];
  notes?: string;
  marketingConsent?: boolean;
  doNotContact?: boolean;
  lastInteractionAt?: string | null;
  nextFollowUpAt?: string | null;
}

export interface MergeContactsInput {
  /** contact that will be retained and absorb the source */
  targetId: string;
  /** contact that will be archived after the merge */
  sourceId: string;
  /**
   * Per-field explicit choice: when a field is present, its value overrides
   * the target's existing value. When absent, the target's value is kept.
   * The source contact's timeline (conversations, calls, follow-ups) is always
   * re-parented to the target.
   */
  fieldChoices?: Partial<UpdateContactInput>;
}

export interface ContactRepository {
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

/* ------------------------------------------------------------------ */
/* Company repository                                                  */
/* ------------------------------------------------------------------ */

export interface CompanyFilters {
  query?: string;
  industry?: Company["industry"] | Company["industry"][];
  accountOwnerId?: string | string[];
  customerStatus?: Company["customerStatus"] | Company["customerStatus"][];
  tag?: string | string[];
}

export interface CompanyListInput extends PaginationInput {
  filters?: CompanyFilters;
  sort?: SortOption<keyof Company>;
}

export type CompanyListResult = ListResult<Company>;

export interface CreateCompanyInput {
  name: string;
  domain?: string;
  industry?: Company["industry"];
  companySize?: string;
  location?: string;
  timeZone?: string;
  accountOwnerId?: string;
  customerStatus?: Company["customerStatus"];
  estimatedValue?: number;
  servicesOfInterest?: string[];
  currentServices?: string[];
  renewalDate?: string | null;
  tags?: string[];
  notes?: string;
}

export interface UpdateCompanyInput {
  name?: string;
  domain?: string;
  industry?: Company["industry"];
  companySize?: string;
  location?: string;
  timeZone?: string;
  accountOwnerId?: string;
  customerStatus?: Company["customerStatus"];
  estimatedValue?: number;
  servicesOfInterest?: string[];
  currentServices?: string[];
  renewalDate?: string | null;
  tags?: string[];
  notes?: string;
}

export interface CompanyRepository {
  list(input: CompanyListInput): Promise<CompanyListResult>;
  getById(id: string): Promise<Company | null>;
  create(input: CreateCompanyInput): Promise<Company>;
  update(id: string, input: UpdateCompanyInput): Promise<Company>;
}

/* ------------------------------------------------------------------ */
/* Conversation repository                                             */
/* ------------------------------------------------------------------ */

export interface ConversationFilters {
  query?: string;
  status?: ConversationStatus | ConversationStatus[];
  priority?: Priority | Priority[];
  assigneeId?: string | string[] | null;
  teamId?: string | string[];
  channel?: Channel | Channel[];
  slaState?: SlaState | SlaState[];
  tag?: string | string[];
  unreadOnly?: boolean;
  contactId?: string;
  companyId?: string;
}

export interface ConversationListInput extends PaginationInput {
  filters?: ConversationFilters;
  sort?: SortOption<keyof Conversation>;
}

export type ConversationListResult = ListResult<Conversation>;

export interface UpdateConversationInput {
  status?: ConversationStatus;
  priority?: Priority;
  assigneeId?: string | null;
  teamId?: string | null;
  slaState?: SlaState;
  slaDueAt?: string | null;
  tags?: string[];
  relatedCallId?: string | null;
  relatedFollowUpId?: string | null;
  sentiment?: Conversation["sentiment"];
}

export interface AddMessageInput {
  conversationId: string;
  body: string;
  channel?: Channel;
}

export interface AddInternalNoteInput {
  conversationId: string;
  body: string;
}

export interface BulkConversationUpdateInput {
  ids: string[];
  patch: UpdateConversationInput;
}

export interface ConversationRepository {
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

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function applyPagination<T>(items: T[], input: PaginationInput): T[] {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.max(1, input.pageSize ?? (items.length || 1));
  if (!input.pageSize) return items; // no pagination requested → return all
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function compareValues(a: unknown, b: unknown, direction: "asc" | "desc"): number {
  const dir = direction === "desc" ? -1 : 1;
  if (a == null && b == null) return 0;
  if (a == null) return 1 * dir;
  if (b == null) return -1 * dir;
  if (typeof a === "number" && typeof b === "number") return (a - b) * dir;
  const sa = String(a).toLowerCase();
  const sb = String(b).toLowerCase();
  if (sa < sb) return -1 * dir;
  if (sa > sb) return 1 * dir;
  return 0;
}

function delay<T>(value: T): Promise<T> {
  // Microtask delay keeps the interface async without flakiness.
  return Promise.resolve(value);
}

/* ------------------------------------------------------------------ */
/* Demo contact repository                                             */
/* ------------------------------------------------------------------ */

class DemoContactRepository implements ContactRepository {
  async list(input: ContactListInput): Promise<ContactListResult> {
    const store = useDemoStore.getState();
    const filters = input.filters ?? {};
    const companiesById = new Map(store.companies.map((c) => [c.id, c]));

    let items = store.contacts.filter((contact) => {
      if (filters.archived !== undefined && contact.archived !== filters.archived) return false;
      if (filters.archived === undefined && contact.archived) return false; // hide archived by default
      if (filters.leadStage !== undefined && !asArray(filters.leadStage).includes(contact.leadStage)) return false;
      if (filters.companyId !== undefined && contact.companyId !== filters.companyId) return false;
      if (filters.ownerId !== undefined && !asArray(filters.ownerId).includes(contact.ownerId)) return false;
      if (filters.leadSource !== undefined && !asArray(filters.leadSource).includes(contact.leadSource)) return false;
      if (filters.priority !== undefined && !asArray(filters.priority).includes(contact.priority)) return false;
      if (filters.preferredChannel !== undefined && !asArray(filters.preferredChannel).includes(contact.preferredChannel)) return false;
      if (filters.marketingConsent !== undefined && contact.marketingConsent !== filters.marketingConsent) return false;
      if (filters.doNotContact !== undefined && contact.doNotContact !== filters.doNotContact) return false;
      if (filters.tag !== undefined) {
        const want = asArray(filters.tag);
        if (!want.some((t) => contact.tags.includes(t))) return false;
      }
      if (filters.query) {
        const company = contact.companyId ? companiesById.get(contact.companyId) : undefined;
        const haystack = toHaystack([
          contact.fullName,
          contact.jobTitle,
          contact.primaryEmail,
          contact.primaryPhone,
          contact.whatsappNumber,
          contact.location,
          contact.tags.join(" "),
          company?.name,
        ]);
        if (!matchesQuery(haystack, filters.query)) return false;
      }
      return true;
    });

    if (input.sort) {
      const { field, direction } = input.sort;
      items = [...items].sort((a, b) => {
        if (field === "companyName") {
          const an = a.companyId ? companiesById.get(a.companyId)?.name ?? "" : "";
          const bn = b.companyId ? companiesById.get(b.companyId)?.name ?? "" : "";
          return compareValues(an, bn, direction);
        }
        return compareValues(a[field as keyof Contact], b[field as keyof Contact], direction);
      });
    }

    const filtered = items.length;
    const paged = applyPagination(items, input);
    return delay({ items: paged, total: store.contacts.length, filtered });
  }

  async getById(id: string): Promise<Contact | null> {
    const contact = useDemoStore.getState().contacts.find((c) => c.id === id);
    return delay(contact ?? null);
  }

  async create(input: CreateContactInput): Promise<Contact> {
    const id = useDemoStore.getState().createContact(input);
    const created = useDemoStore.getState().contacts.find((c) => c.id === id)!;
    return delay(created);
  }

  async update(id: string, input: UpdateContactInput): Promise<Contact> {
    useDemoStore.getState().updateContact(id, input);
    const updated = useDemoStore.getState().contacts.find((c) => c.id === id)!;
    return delay(updated);
  }

  async archive(id: string): Promise<void> {
    useDemoStore.getState().archiveContact(id);
    return delay(undefined);
  }

  async restore(id: string): Promise<void> {
    useDemoStore.getState().restoreContact(id);
    return delay(undefined);
  }

  async merge(input: MergeContactsInput): Promise<Contact> {
    const retainedId = useDemoStore.getState().mergeContacts(input);
    const retained = useDemoStore.getState().contacts.find((c) => c.id === retainedId)!;
    return delay(retained);
  }

  async addTag(id: string, tag: string): Promise<void> {
    useDemoStore.getState().addContactTag(id, tag);
    return delay(undefined);
  }

  async removeTag(id: string, tag: string): Promise<void> {
    useDemoStore.getState().removeContactTag(id, tag);
    return delay(undefined);
  }
}

/* ------------------------------------------------------------------ */
/* Demo company repository                                             */
/* ------------------------------------------------------------------ */

class DemoCompanyRepository implements CompanyRepository {
  async list(input: CompanyListInput): Promise<CompanyListResult> {
    const store = useDemoStore.getState();
    const filters = input.filters ?? {};

    let items = store.companies.filter((company) => {
      if (filters.industry !== undefined && !asArray(filters.industry).includes(company.industry)) return false;
      if (filters.accountOwnerId !== undefined && !asArray(filters.accountOwnerId).includes(company.accountOwnerId)) return false;
      if (filters.customerStatus !== undefined && !asArray(filters.customerStatus).includes(company.customerStatus)) return false;
      if (filters.tag !== undefined) {
        const want = asArray(filters.tag);
        if (!want.some((t) => company.tags.includes(t))) return false;
      }
      if (filters.query) {
        const haystack = toHaystack([
          company.name,
          company.domain,
          company.industry,
          company.location,
          company.tags.join(" "),
        ]);
        if (!matchesQuery(haystack, filters.query)) return false;
      }
      return true;
    });

    if (input.sort) {
      const { field, direction } = input.sort;
      items = [...items].sort((a, b) =>
        compareValues(a[field as keyof Company], b[field as keyof Company], direction),
      );
    }

    const filtered = items.length;
    const paged = applyPagination(items, input);
    return delay({ items: paged, total: store.companies.length, filtered });
  }

  async getById(id: string): Promise<Company | null> {
    const company = useDemoStore.getState().companies.find((c) => c.id === id);
    return delay(company ?? null);
  }

  async create(input: CreateCompanyInput): Promise<Company> {
    const id = useDemoStore.getState().createCompany(input);
    const created = useDemoStore.getState().companies.find((c) => c.id === id)!;
    return delay(created);
  }

  async update(id: string, input: UpdateCompanyInput): Promise<Company> {
    useDemoStore.getState().updateCompany(id, input);
    const updated = useDemoStore.getState().companies.find((c) => c.id === id)!;
    return delay(updated);
  }
}

/* ------------------------------------------------------------------ */
/* Demo conversation repository                                        */
/* ------------------------------------------------------------------ */

class DemoConversationRepository implements ConversationRepository {
  async list(input: ConversationListInput): Promise<ConversationListResult> {
    const store = useDemoStore.getState();
    const filters = input.filters ?? {};
    const contactsById = new Map(store.contacts.map((c) => [c.id, c]));
    const companiesById = new Map(store.companies.map((c) => [c.id, c]));

    let items = store.conversations.filter((conv) => {
      if (filters.status !== undefined && !asArray(filters.status).includes(conv.status)) return false;
      if (filters.priority !== undefined && !asArray(filters.priority).includes(conv.priority)) return false;
      if (filters.channel !== undefined && !asArray(filters.channel).includes(conv.channel)) return false;
      if (filters.teamId !== undefined && !asArray(filters.teamId).includes(conv.teamId ?? "")) return false;
      if (filters.slaState !== undefined) {
        const live = resolveSlaState(conv);
        if (!asArray(filters.slaState).includes(live)) return false;
      }
      if (filters.assigneeId !== undefined) {
        const want = filters.assigneeId;
        if (want === null) {
          if (conv.assigneeId !== null) return false;
        } else if (!asArray(want as string | string[]).includes(conv.assigneeId ?? "")) {
          return false;
        }
      }
      if (filters.unreadOnly === true && conv.unreadCount <= 0) return false;
      if (filters.contactId !== undefined && conv.contactId !== filters.contactId) return false;
      if (filters.companyId !== undefined && conv.companyId !== filters.companyId) return false;
      if (filters.tag !== undefined) {
        const want = asArray(filters.tag);
        if (!want.some((t) => conv.tags.includes(t))) return false;
      }
      if (filters.query) {
        const contact = contactsById.get(conv.contactId);
        const company = conv.companyId ? companiesById.get(conv.companyId) : undefined;
        const haystack = toHaystack([
          conv.subject,
          conv.preview,
          conv.tags.join(" "),
          contact?.fullName,
          contact?.primaryEmail,
          contact?.primaryPhone,
          company?.name,
        ]);
        if (!matchesQuery(haystack, filters.query)) return false;
      }
      return true;
    });

    if (input.sort) {
      const { field, direction } = input.sort;
      items = [...items].sort((a, b) =>
        compareValues(a[field as keyof Conversation], b[field as keyof Conversation], direction),
      );
    }

    const filtered = items.length;
    const paged = applyPagination(items, input);
    return delay({ items: paged, total: store.conversations.length, filtered });
  }

  async getById(id: string): Promise<Conversation | null> {
    const conv = useDemoStore.getState().conversations.find((c) => c.id === id);
    return delay(conv ?? null);
  }

  async update(id: string, input: UpdateConversationInput): Promise<Conversation> {
    const store = useDemoStore.getState();
    if (input.status) store.setConversationStatus(id, input.status);
    if (input.priority) store.setConversationPriority(id, input.priority);
    if (input.assigneeId !== undefined) store.assignConversation(id, input.assigneeId);
    if (input.tags) store.updateConversation(id, { tags: input.tags });
    if (input.slaState !== undefined || input.slaDueAt !== undefined || input.teamId !== undefined || input.sentiment !== undefined || input.relatedCallId !== undefined || input.relatedFollowUpId !== undefined) {
      store.updateConversation(id, {
        ...(input.slaState !== undefined ? { slaState: input.slaState } : {}),
        ...(input.slaDueAt !== undefined ? { slaDueAt: input.slaDueAt } : {}),
        ...(input.teamId !== undefined ? { teamId: input.teamId } : {}),
        ...(input.sentiment !== undefined ? { sentiment: input.sentiment } : {}),
        ...(input.relatedCallId !== undefined ? { relatedCallId: input.relatedCallId } : {}),
        ...(input.relatedFollowUpId !== undefined ? { relatedFollowUpId: input.relatedFollowUpId } : {}),
      });
    }
    const updated = useDemoStore.getState().conversations.find((c) => c.id === id)!;
    return delay(updated);
  }

  async addMessage(input: AddMessageInput): Promise<Message> {
    const store = useDemoStore.getState();
    const conv = store.conversations.find((c) => c.id === input.conversationId);
    const beforeIds = new Set(store.messages.map((m) => m.id));
    store.addMessage({
      conversationId: input.conversationId,
      body: input.body,
      direction: "outbound",
      channel: input.channel ?? conv?.channel ?? "email",
    });
    const message = useDemoStore.getState().messages.find((m) => !beforeIds.has(m.id))!;
    return delay(message);
  }

  async addInternalNote(input: AddInternalNoteInput): Promise<Message> {
    const store = useDemoStore.getState();
    const beforeIds = new Set(store.messages.map((m) => m.id));
    store.addInternalNote({
      conversationId: input.conversationId,
      body: input.body,
    });
    const note = useDemoStore.getState().messages.find((m) => !beforeIds.has(m.id))!;
    return delay(note);
  }

  async bulkUpdate(input: BulkConversationUpdateInput): Promise<void> {
    useDemoStore.getState().bulkUpdateConversations(input.ids, input.patch);
    return delay(undefined);
  }

  async markRead(id: string): Promise<void> {
    useDemoStore.getState().markConversationRead(id);
    return delay(undefined);
  }

  async markUnread(id: string): Promise<void> {
    useDemoStore.getState().markConversationUnread(id);
    return delay(undefined);
  }

  async snooze(id: string): Promise<void> {
    useDemoStore.getState().snoozeConversation(id);
    return delay(undefined);
  }

  async setDraft(conversationId: string, body: string): Promise<void> {
    useDemoStore.getState().setConversationDraft(conversationId, body);
    return delay(undefined);
  }

  async getDraft(conversationId: string): Promise<string> {
    return delay(useDemoStore.getState().getConversationDraft(conversationId));
  }

  async clearDraft(conversationId: string): Promise<void> {
    useDemoStore.getState().clearConversationDraft(conversationId);
    return delay(undefined);
  }
}

/* ------------------------------------------------------------------ */
/* Read-only reference repositories (team, follow-ups)                  */
/* ------------------------------------------------------------------ */

export interface TeamRepository {
  list(): Promise<TeamMember[]>;
  getById(id: string): Promise<TeamMember | null>;
}

class DemoTeamRepository implements TeamRepository {
  async list(): Promise<TeamMember[]> {
    return delay(useDemoStore.getState().teamMembers);
  }
  async getById(id: string): Promise<TeamMember | null> {
    return delay(useDemoStore.getState().teamMembers.find((m) => m.id === id) ?? null);
  }
}

export interface FollowUpRepository {
  list(filters?: { contactId?: string; conversationId?: string; ownerId?: string }): Promise<FollowUp[]>;
}

class DemoFollowUpRepository implements FollowUpRepository {
  async list(filters?: { contactId?: string; conversationId?: string; ownerId?: string }): Promise<FollowUp[]> {
    const items = useDemoStore.getState().followUps.filter((f) => {
      if (filters?.contactId && f.contactId !== filters.contactId) return false;
      if (filters?.conversationId && f.conversationId !== filters.conversationId) return false;
      if (filters?.ownerId && f.ownerId !== filters.ownerId) return false;
      return true;
    });
    return delay(items);
  }
}

/* ------------------------------------------------------------------ */
/* Singleton exports                                                   */
/* ------------------------------------------------------------------ */

export const contactRepository: ContactRepository = new DemoContactRepository();
export const companyRepository: CompanyRepository = new DemoCompanyRepository();
export const conversationRepository: ConversationRepository = new DemoConversationRepository();
export const teamRepository: TeamRepository = new DemoTeamRepository();
export const followUpRepository: FollowUpRepository = new DemoFollowUpRepository();
