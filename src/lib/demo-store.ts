"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { demoSeed } from "@/data/demo";
import type {
  ActivityEvent,
  Company,
  Contact,
  Conversation,
  FollowUp,
  Message,
  Notification,
  TeamMember,
  ViewId,
  ViewState,
  ViewParams,
} from "@/types/domain";

const DEMO_VERSION = 1;

interface DemoState {
  /* versioning for migration safety */
  version: number;

  /* entities */
  teams: typeof demoSeed.teams;
  teamMembers: TeamMember[];
  companies: Company[];
  contacts: Contact[];
  conversations: Conversation[];
  messages: Message[];
  calls: typeof demoSeed.calls;
  followUps: FollowUp[];
  notifications: Notification[];
  activityEvents: ActivityEvent[];

  /* ui state */
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  theme: "light" | "dark" | "system";
  commandOpen: boolean;
  notificationsOpen: boolean;
  profileOpen: boolean;
  currentUserId: string;
  view: ViewState;

  /* derived helpers */
  reset: () => void;
  navigate: (view: ViewId, params?: ViewParams) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setMobileNavOpen: (v: boolean) => void;
  setCommandOpen: (v: boolean) => void;
  setNotificationsOpen: (v: boolean) => void;
  setProfileOpen: (v: boolean) => void;
  setTheme: (t: "light" | "dark" | "system") => void;

  /* contact operations */
  createContact: (input: Partial<Contact> & { fullName: string }) => string;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  archiveContact: (id: string) => void;
  restoreContact: (id: string) => void;
  bulkUpdateContacts: (ids: string[], patch: Partial<Contact>) => void;
  addContactTag: (id: string, tag: string) => void;
  removeContactTag: (id: string, tag: string) => void;

  /* company operations */
  createCompany: (input: Partial<Company> & { name: string }) => string;
  updateCompany: (id: string, patch: Partial<Company>) => void;

  /* conversation operations */
  updateConversation: (id: string, patch: Partial<Conversation>) => void;
  assignConversation: (id: string, assigneeId: string | null) => void;
  setConversationStatus: (id: string, status: Conversation["status"]) => void;
  setConversationPriority: (id: string, priority: Conversation["priority"]) => void;
  markConversationRead: (id: string) => void;
  markConversationUnread: (id: string) => void;
  snoozeConversation: (id: string) => void;
  addConversationTag: (id: string, tag: string) => void;
  bulkUpdateConversations: (ids: string[], patch: Partial<Conversation>) => void;
  addMessage: (input: {
    conversationId: string;
    body: string;
    direction: "outbound" | "internal";
    channel: Message["channel"];
  }) => void;

  /* notifications */
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  /* audit */
  logActivity: (event: Omit<ActivityEvent, "id" | "createdAt">) => void;
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      version: DEMO_VERSION,
      ...structuredClone(demoSeed),
      sidebarCollapsed: false,
      mobileNavOpen: false,
      theme: "light",
      commandOpen: false,
      notificationsOpen: false,
      profileOpen: false,
      currentUserId: "u-1",
      view: { view: "overview", params: {} },

      reset: () =>
        set({
          version: DEMO_VERSION,
          ...structuredClone(demoSeed),
          view: { view: "overview", params: {} },
          sidebarCollapsed: false,
          mobileNavOpen: false,
          commandOpen: false,
          notificationsOpen: false,
          profileOpen: false,
        }),

      navigate: (view, params = {}) =>
        set({ view: { view, params }, mobileNavOpen: false }),

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
      setCommandOpen: (v) => set({ commandOpen: v }),
      setNotificationsOpen: (v) => set({ notificationsOpen: v }),
      setProfileOpen: (v) => set({ profileOpen: v }),
      setTheme: (t) => set({ theme: t }),

      createContact: (input) => {
        const id = uid("ct");
        const ts = nowISO();
        const contact: Contact = {
          id,
          fullName: input.fullName,
          jobTitle: input.jobTitle ?? "",
          companyId: input.companyId ?? null,
          primaryEmail: input.primaryEmail ?? "",
          secondaryEmail: input.secondaryEmail ?? null,
          primaryPhone: input.primaryPhone ?? "",
          secondaryPhone: input.secondaryPhone ?? null,
          whatsappNumber: input.whatsappNumber ?? null,
          location: input.location ?? "",
          timeZone: input.timeZone ?? "UTC",
          preferredLanguage: input.preferredLanguage ?? "en",
          preferredChannel: input.preferredChannel ?? "email",
          leadStage: input.leadStage ?? "new",
          leadSource: input.leadSource ?? "Manual",
          ownerId: input.ownerId ?? get().currentUserId,
          priority: input.priority ?? "normal",
          estimatedValue: input.estimatedValue ?? 0,
          tags: input.tags ?? [],
          notes: input.notes ?? "",
          marketingConsent: input.marketingConsent ?? true,
          doNotContact: input.doNotContact ?? false,
          archived: false,
          lastInteractionAt: null,
          nextFollowUpAt: null,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ contacts: [contact, ...s.contacts] }));
        get().logActivity({
          type: "system",
          contactId: id,
          conversationId: null,
          actorId: get().currentUserId,
          actorName: get().teamMembers.find((m) => m.id === get().currentUserId)?.name ?? "User",
          summary: "Created a contact",
          detail: contact.fullName,
        });
        return id;
      },

      updateContact: (id, patch) =>
        set((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c
          ),
        })),

      archiveContact: (id) => {
        set((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === id ? { ...c, archived: true, updatedAt: nowISO() } : c
          ),
        }));
        get().logActivity({
          type: "system",
          contactId: id,
          conversationId: null,
          actorId: get().currentUserId,
          actorName: get().teamMembers.find((m) => m.id === get().currentUserId)?.name ?? "User",
          summary: "Archived a contact",
          detail: null,
        });
      },

      restoreContact: (id) =>
        set((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === id ? { ...c, archived: false, updatedAt: nowISO() } : c
          ),
        })),

      bulkUpdateContacts: (ids, patch) =>
        set((s) => ({
          contacts: s.contacts.map((c) =>
            ids.includes(c.id) ? { ...c, ...patch, updatedAt: nowISO() } : c
          ),
        })),

      addContactTag: (id, tag) =>
        set((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === id && !c.tags.includes(tag)
              ? { ...c, tags: [...c.tags, tag] }
              : c
          ),
        })),

      removeContactTag: (id, tag) =>
        set((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === id ? { ...c, tags: c.tags.filter((t) => t !== tag) } : c
          ),
        })),

      createCompany: (input) => {
        const id = uid("co");
        const ts = nowISO();
        const company: Company = {
          id,
          name: input.name,
          domain: input.domain ?? "",
          industry: input.industry ?? "managed_it_services",
          companySize: input.companySize ?? "",
          location: input.location ?? "",
          timeZone: input.timeZone ?? "UTC",
          accountOwnerId: input.accountOwnerId ?? get().currentUserId,
          customerStatus: input.customerStatus ?? "prospect",
          estimatedValue: input.estimatedValue ?? 0,
          servicesOfInterest: input.servicesOfInterest ?? [],
          currentServices: input.currentServices ?? [],
          renewalDate: input.renewalDate ?? null,
          tags: input.tags ?? [],
          notes: input.notes ?? "",
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ companies: [company, ...s.companies] }));
        return id;
      },

      updateCompany: (id, patch) =>
        set((s) => ({
          companies: s.companies.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c
          ),
        })),

      updateConversation: (id, patch) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, ...patch, lastActivityAt: nowISO() } : c
          ),
        })),

      assignConversation: (id, assigneeId) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, assigneeId, lastActivityAt: nowISO() } : c
          ),
        }));
        const member = get().teamMembers.find((m) => m.id === assigneeId);
        get().logActivity({
          type: "assignment_change",
          contactId: null,
          conversationId: id,
          actorId: get().currentUserId,
          actorName: get().teamMembers.find((m) => m.id === get().currentUserId)?.name ?? "User",
          summary: assigneeId
            ? `Assigned to ${member?.name ?? "a team member"}`
            : "Unassigned conversation",
          detail: null,
        });
      },

      setConversationStatus: (id, status) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, status, lastActivityAt: nowISO() } : c
          ),
        }));
        get().logActivity({
          type: "status_change",
          contactId: null,
          conversationId: id,
          actorId: get().currentUserId,
          actorName: get().teamMembers.find((m) => m.id === get().currentUserId)?.name ?? "User",
          summary: `Status changed to ${status.replace(/_/g, " ")}`,
          detail: null,
        });
      },

      setConversationPriority: (id, priority) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, priority, lastActivityAt: nowISO() } : c
          ),
        }));
        get().logActivity({
          type: "priority_change",
          contactId: null,
          conversationId: id,
          actorId: get().currentUserId,
          actorName: get().teamMembers.find((m) => m.id === get().currentUserId)?.name ?? "User",
          summary: `Priority set to ${priority}`,
          detail: null,
        });
      },

      markConversationRead: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, unreadCount: 0 } : c
          ),
        })),

      markConversationUnread: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, unreadCount: Math.max(1, c.unreadCount) } : c
          ),
        })),

      snoozeConversation: (id) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? { ...c, status: "snoozed", slaState: "paused", slaDueAt: null, lastActivityAt: nowISO() }
              : c
          ),
        }));
        get().logActivity({
          type: "snooze",
          contactId: null,
          conversationId: id,
          actorId: get().currentUserId,
          actorName: get().teamMembers.find((m) => m.id === get().currentUserId)?.name ?? "User",
          summary: "Snoozed conversation",
          detail: null,
        });
      },

      addConversationTag: (id, tag) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id && !c.tags.includes(tag)
              ? { ...c, tags: [...c.tags, tag] }
              : c
          ),
        })),

      bulkUpdateConversations: (ids, patch) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            ids.includes(c.id) ? { ...c, ...patch, lastActivityAt: nowISO() } : c
          ),
        })),

      addMessage: ({ conversationId, body, direction, channel }) => {
        const user = get().teamMembers.find((m) => m.id === get().currentUserId);
        const msg: Message = {
          id: uid("m"),
          conversationId,
          authorId: get().currentUserId,
          authorName: user?.name ?? "You",
          direction,
          channel,
          body,
          status: direction === "internal" ? "simulated" : "simulated",
          createdAt: nowISO(),
        };
        set((s) => ({
          messages: [...s.messages, msg],
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, preview: body.slice(0, 80), lastActivityAt: nowISO() }
              : c
          ),
        }));
        if (direction === "internal") {
          get().logActivity({
            type: "internal_note",
            contactId: null,
            conversationId,
            actorId: get().currentUserId,
            actorName: user?.name ?? "You",
            summary: "Added an internal note",
            detail: body.slice(0, 100),
          });
        } else {
          get().logActivity({
            type: "message",
            contactId: null,
            conversationId,
            actorId: get().currentUserId,
            actorName: user?.name ?? "You",
            summary: "Sent a simulated reply",
            detail: body.slice(0, 100),
          });
        }
      },

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      logActivity: (event) =>
        set((s) => ({
          activityEvents: [
            { ...event, id: uid("ae"), createdAt: nowISO() },
            ...s.activityEvents,
          ].slice(0, 200),
        })),
    }),
    {
      name: "cloudsun-demo-v1",
      storage: createJSONStorage(() => localStorage),
      version: DEMO_VERSION,
      // Migration safety: if stored version mismatches, reseed entity data
      // but preserve UI preferences where possible.
      migrate: (persisted: unknown) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        const p = persisted as Partial<DemoState>;
        if (p.version !== DEMO_VERSION) {
          // Reseed entities, keep UI prefs
          return {
            ...structuredClone(demoSeed),
            version: DEMO_VERSION,
            sidebarCollapsed: p.sidebarCollapsed ?? false,
            theme: p.theme ?? "light",
            currentUserId: p.currentUserId ?? "u-1",
            view: { view: "overview", params: {} },
          } as DemoState;
        }
        return persisted as DemoState;
      },
    }
  )
);

/* ------------------------------------------------------------------ */
/* Selector helpers                                                    */
/* ------------------------------------------------------------------ */

export function useContact(id: string | undefined): Contact | undefined {
  return useDemoStore((s) => s.contacts.find((c) => c.id === id));
}

export function useCompany(id: string | undefined): Company | undefined {
  return useDemoStore((s) => s.companies.find((c) => c.id === id));
}

export function useConversation(id: string | undefined): Conversation | undefined {
  return useDemoStore((s) => s.conversations.find((c) => c.id === id));
}

export function useTeamMember(id: string | undefined | null): TeamMember | undefined {
  return useDemoStore((s) => s.teamMembers.find((m) => m.id === id));
}
