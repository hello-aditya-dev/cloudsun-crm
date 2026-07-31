/**
 * CloudSun — domain types for the IT CRM.
 *
 * These types model the customer, lead, company and conversation
 * workspace. No dental/healthcare concepts exist here.
 */

export type ID = string;

export type ISODate = string;

/* ------------------------------------------------------------------ */
/* Channels                                                            */
/* ------------------------------------------------------------------ */

export type Channel =
  | "phone"
  | "email"
  | "whatsapp"
  | "webchat"
  | "internal"
  | "system";

/* ------------------------------------------------------------------ */
/* Lead stages                                                         */
/* ------------------------------------------------------------------ */

export type LeadStage =
  | "new"
  | "uncontacted"
  | "attempted"
  | "connected"
  | "qualified"
  | "interested"
  | "opportunity"
  | "customer"
  | "at_risk"
  | "inactive"
  | "not_interested"
  | "invalid"
  | "do_not_contact";

/* ------------------------------------------------------------------ */
/* Priorities & statuses                                               */
/* ------------------------------------------------------------------ */

export type Priority = "low" | "normal" | "high" | "urgent";

export type ConversationStatus =
  | "open"
  | "unassigned"
  | "mine"
  | "waiting_customer"
  | "waiting_internal"
  | "needs_approval"
  | "snoozed"
  | "resolved"
  | "closed"
  | "spam";

export type SlaState =
  | "safe"
  | "approaching"
  | "at_risk"
  | "breached"
  | "paused";

export type CustomerStatus =
  | "prospect"
  | "active"
  | "renewing"
  | "at_risk"
  | "churned"
  | "former";

/* ------------------------------------------------------------------ */
/* Company                                                             */
/* ------------------------------------------------------------------ */

export type Industry =
  | "managed_it_services"
  | "cybersecurity"
  | "cloud_migration"
  | "saas_implementation"
  | "network_infrastructure"
  | "it_support"
  | "software_development"
  | "data_engineering"
  | "business_automation"
  | "unified_communications";

export interface Company {
  id: ID;
  name: string;
  domain: string;
  industry: Industry;
  companySize: string;
  location: string;
  timeZone: string;
  accountOwnerId: ID;
  customerStatus: CustomerStatus;
  estimatedValue: number;
  servicesOfInterest: string[];
  currentServices: string[];
  renewalDate: ISODate | null;
  tags: string[];
  notes: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export type PreferredChannel = Channel;

export interface Contact {
  id: ID;
  fullName: string;
  jobTitle: string;
  companyId: ID | null;
  primaryEmail: string;
  secondaryEmail: string | null;
  primaryPhone: string;
  secondaryPhone: string | null;
  whatsappNumber: string | null;
  location: string;
  timeZone: string;
  preferredLanguage: string;
  preferredChannel: PreferredChannel;
  leadStage: LeadStage;
  leadSource: string;
  ownerId: ID;
  priority: Priority;
  estimatedValue: number;
  tags: string[];
  notes: string;
  marketingConsent: boolean;
  doNotContact: boolean;
  archived: boolean;
  lastInteractionAt: ISODate | null;
  nextFollowUpAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Messages & conversations                                            */
/* ------------------------------------------------------------------ */

export type MessageDirection = "inbound" | "outbound" | "internal";

export type MessageStatus =
  | "simulated"
  | "draft"
  | "pending_provider"
  | "delivered"
  | "failed";

export interface Message {
  id: ID;
  conversationId: ID;
  authorId: ID | null; // null for customer/system
  authorName: string;
  direction: MessageDirection;
  channel: Channel;
  body: string;
  status: MessageStatus;
  createdAt: ISODate;
}

export interface Conversation {
  id: ID;
  contactId: ID;
  companyId: ID | null;
  channel: Channel;
  subject: string;
  preview: string;
  status: ConversationStatus;
  priority: Priority;
  assigneeId: ID | null;
  teamId: ID | null;
  slaState: SlaState;
  slaDueAt: ISODate | null;
  unreadCount: number;
  sentiment: "positive" | "neutral" | "negative" | null;
  tags: string[];
  relatedCallId: ID | null;
  relatedFollowUpId: ID | null;
  lastActivityAt: ISODate;
  createdAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Calls                                                               */
/* ------------------------------------------------------------------ */

export type CallDirection = "inbound" | "outbound" | "missed";
export type CallOutcome =
  | "completed"
  | "voicemail"
  | "no_answer"
  | "busy"
  | "failed"
  | "scheduled";

export interface Call {
  id: ID;
  contactId: ID;
  companyId: ID | null;
  direction: CallDirection;
  channel: Channel;
  phoneNumber: string;
  durationSeconds: number;
  outcome: CallOutcome;
  recordingAvailable: boolean;
  summary: string;
  agentId: ID | null;
  startedAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Follow-ups                                                          */
/* ------------------------------------------------------------------ */

export type FollowUpType =
  | "callback"
  | "demo"
  | "meeting"
  | "check_in"
  | "proposal"
  | "renewal"
  | "escalation";

export type FollowUpStatus = "scheduled" | "completed" | "overdue" | "cancelled";

export interface FollowUp {
  id: ID;
  contactId: ID;
  conversationId: ID | null;
  type: FollowUpType;
  dueAt: ISODate;
  ownerId: ID;
  status: FollowUpStatus;
  notes: string;
}

/* ------------------------------------------------------------------ */
/* Team members                                                        */
/* ------------------------------------------------------------------ */

export type TeamRole =
  | "account_owner"
  | "operations_manager"
  | "customer_success_manager"
  | "technical_lead"
  | "support_specialist"
  | "sales_developer";

export interface TeamMember {
  id: ID;
  name: string;
  email: string;
  role: TeamRole;
  avatarColor: string;
  initials: string;
  status: "online" | "busy" | "away" | "offline";
  teamId: ID | null;
}

export interface Team {
  id: ID;
  name: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/* Activity & audit                                                    */
/* ------------------------------------------------------------------ */

export type ActivityType =
  | "message"
  | "call"
  | "internal_note"
  | "stage_change"
  | "owner_change"
  | "follow_up"
  | "status_change"
  | "priority_change"
  | "assignment_change"
  | "snooze"
  | "automation"
  | "system";

export interface ActivityEvent {
  id: ID;
  type: ActivityType;
  contactId: ID | null;
  conversationId: ID | null;
  actorId: ID | null;
  actorName: string;
  summary: string;
  detail: string | null;
  createdAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export type NotificationType =
  | "pricing_enquiry"
  | "support_escalation"
  | "renewal_reminder"
  | "assigned_conversation"
  | "sla_risk"
  | "follow_up_due"
  | "integration_disconnected"
  | "mention";

export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  relatedType: "conversation" | "contact" | "company" | "follow_up" | null;
  relatedId: ID | null;
  createdAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Navigation / routing                                                */
/* ------------------------------------------------------------------ */

export type ViewId =
  | "overview"
  | "inbox"
  | "contacts"
  | "companies"
  | "calls"
  | "calendar"
  | "knowledge"
  | "automations"
  | "analytics"
  | "team"
  | "integrations"
  | "settings"
  | "billing"
  | "audit_log";

export interface NavItem {
  id: ViewId;
  label: string;
  path: string;
  icon: string;
  group: NavGroup;
  mobileVisible: boolean;
  keywords: string[];
  description: string;
  available: boolean;
}

export type NavGroup = "workspace" | "customer_operations" | "manage";

/* ------------------------------------------------------------------ */
/* UI view state (client-side router)                                  */
/* ------------------------------------------------------------------ */

export interface ViewParams {
  detailId?: string;
  [key: string]: string | undefined;
}

export interface ViewState {
  view: ViewId;
  params: ViewParams;
}
