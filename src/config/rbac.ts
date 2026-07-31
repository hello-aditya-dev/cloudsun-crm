import type { Permission, Role, RoleKey, OnboardingStep } from "@/types/domain";

/**
 * CloudSun — Role and Permission definitions.
 *
 * Identity, membership and authority are separate concepts.
 * Permissions are explicit, not inferred from role names alone.
 */

/* ------------------------------------------------------------------ */
/* Permissions                                                         */
/* ------------------------------------------------------------------ */

export const PERMISSIONS: Permission[] = [
  // Organisation
  { key: "organisation.view", category: "organisation", description: "View organisation details" },
  { key: "organisation.update", category: "organisation", description: "Update organisation configuration" },
  { key: "organisation.manage_security", category: "organisation", description: "Manage organisation-wide security" },
  { key: "organisation.manage_billing", category: "organisation", description: "Manage billing and plans" },

  // Members
  { key: "members.view", category: "members", description: "View organisation members" },
  { key: "members.invite", category: "members", description: "Invite new members" },
  { key: "members.update", category: "members", description: "Update member roles and teams" },
  { key: "members.suspend", category: "members", description: "Suspend or revoke memberships" },
  { key: "members.assign_roles", category: "members", description: "Assign roles to members" },

  // Teams
  { key: "teams.view", category: "teams", description: "View teams" },
  { key: "teams.create", category: "teams", description: "Create new teams" },
  { key: "teams.update", category: "teams", description: "Update team configuration" },
  { key: "teams.manage_members", category: "teams", description: "Manage team membership" },

  // Contacts
  { key: "contacts.view_all", category: "contacts", description: "View all contacts in the organisation" },
  { key: "contacts.view_team", category: "contacts", description: "View contacts in assigned teams" },
  { key: "contacts.view_assigned", category: "contacts", description: "View assigned contacts" },
  { key: "contacts.create", category: "contacts", description: "Create new contacts" },
  { key: "contacts.update", category: "contacts", description: "Update contact information" },
  { key: "contacts.archive", category: "contacts", description: "Archive contacts" },
  { key: "contacts.export", category: "contacts", description: "Export contact data" },

  // Companies
  { key: "companies.view_all", category: "companies", description: "View all companies" },
  { key: "companies.view_team", category: "companies", description: "View team-scoped companies" },
  { key: "companies.create", category: "companies", description: "Create new companies" },
  { key: "companies.update", category: "companies", description: "Update company information" },
  { key: "companies.export", category: "companies", description: "Export company data" },

  // Conversations
  { key: "conversations.view_all", category: "conversations", description: "View all conversations" },
  { key: "conversations.view_team", category: "conversations", description: "View team conversations" },
  { key: "conversations.view_assigned", category: "conversations", description: "View assigned conversations" },
  { key: "conversations.assign", category: "conversations", description: "Assign conversations" },
  { key: "conversations.reply", category: "conversations", description: "Reply to conversations" },
  { key: "conversations.add_note", category: "conversations", description: "Add internal notes" },
  { key: "conversations.close", category: "conversations", description: "Close or resolve conversations" },
  { key: "conversations.export", category: "conversations", description: "Export conversation data" },

  // Integrations
  { key: "integrations.view", category: "integrations", description: "View integrations" },
  { key: "integrations.connect", category: "integrations", description: "Connect new integrations" },
  { key: "integrations.disconnect", category: "integrations", description: "Disconnect integrations" },

  // Audit
  { key: "audit.view", category: "audit", description: "View audit log" },

  // Reports
  { key: "reports.view", category: "reports", description: "View reports and analytics" },
  { key: "reports.export", category: "reports", description: "Export reports" },

  // Billing
  { key: "billing.view", category: "billing", description: "View billing and invoices" },
  { key: "billing.manage", category: "billing", description: "Manage billing and subscription" },
];

/* ------------------------------------------------------------------ */
/* Roles with permission sets                                          */
/* ------------------------------------------------------------------ */

const allPerms = (cats: string[]) =>
  PERMISSIONS.filter((p) => cats.includes(p.category)).map((p) => p.key);

export const ROLES: Record<RoleKey, Role> = {
  owner: {
    id: "role-owner",
    key: "owner",
    name: "Organisation owner",
    description:
      "Full authority over the organisation, billing, security, all teams, records, integrations and ownership transfer.",
    isSystem: true,
    permissions: PERMISSIONS.map((p) => p.key), // all permissions
  },
  administrator: {
    id: "role-admin",
    key: "administrator",
    name: "Administrator",
    description:
      "Manages memberships, teams, roles below owner, organisation configuration, contacts, companies, conversations and integrations.",
    isSystem: true,
    permissions: allPerms([
      "members", "teams", "contacts", "companies", "conversations", "integrations", "audit", "reports", "organisation",
    ]),
  },
  operations_manager: {
    id: "role-ops-manager",
    key: "operations_manager",
    name: "Operations manager",
    description:
      "Manages assigned departments, teams, work allocation, contacts, companies, conversations and operational reports.",
    isSystem: true,
    permissions: [
      "organisation.view",
      "members.view", "teams.view", "teams.create", "teams.update", "teams.manage_members",
      "contacts.view_all", "contacts.create", "contacts.update", "contacts.archive",
      "companies.view_all", "companies.create", "companies.update",
      "conversations.view_all", "conversations.assign", "conversations.reply", "conversations.add_note", "conversations.close",
      "integrations.view",
      "audit.view", "reports.view",
    ],
  },
  supervisor: {
    id: "role-supervisor",
    key: "supervisor",
    name: "Supervisor",
    description:
      "Manages assigned teams, employees, team-scoped conversations, work assignment and escalations.",
    isSystem: true,
    permissions: [
      "organisation.view",
      "members.view", "teams.view", "teams.manage_members",
      "contacts.view_team", "contacts.update",
      "companies.view_team",
      "conversations.view_team", "conversations.assign", "conversations.reply", "conversations.add_note", "conversations.close",
      "reports.view",
    ],
  },
  employee: {
    id: "role-employee",
    key: "employee",
    name: "Employee",
    description:
      "Accesses assigned contacts, authorised companies, assigned or team conversations. Can create notes and update permitted fields.",
    isSystem: true,
    permissions: [
      "organisation.view",
      "members.view",
      "teams.view",
      "contacts.view_assigned", "contacts.create", "contacts.update",
      "companies.view_team",
      "conversations.view_assigned", "conversations.reply", "conversations.add_note",
    ],
  },
  analyst: {
    id: "role-analyst",
    key: "analyst",
    name: "Analyst",
    description:
      "Views authorised reports and aggregated records. Cannot modify operational records by default.",
    isSystem: true,
    permissions: [
      "organisation.view",
      "members.view",
      "contacts.view_all",
      "companies.view_all",
      "conversations.view_all",
      "audit.view", "reports.view", "reports.export",
    ],
  },
  read_only: {
    id: "role-readonly",
    key: "read_only",
    name: "Read-only",
    description: "Can view explicitly authorised modules. Cannot mutate data.",
    isSystem: true,
    permissions: [
      "organisation.view",
      "members.view",
      "contacts.view_team",
      "companies.view_team",
      "conversations.view_team",
    ],
  },
};

export const ROLE_LIST = Object.values(ROLES);

export function getRole(key: RoleKey): Role {
  return ROLES[key];
}

export function hasPermission(
  roleKey: RoleKey | undefined,
  permission: string
): boolean {
  if (!roleKey) return false;
  return ROLES[roleKey]?.permissions.includes(permission) ?? false;
}

export function hasAnyPermission(
  roleKey: RoleKey | undefined,
  permissions: string[]
): boolean {
  if (!roleKey) return false;
  const rolePerms = ROLES[roleKey]?.permissions ?? [];
  return permissions.some((p) => rolePerms.includes(p));
}

/* ------------------------------------------------------------------ */
/* Role metadata for display                                           */
/* ------------------------------------------------------------------ */

export const roleMeta: Record<RoleKey, { label: string; tone: "ember" | "forest" | "info" | "neutral"; description: string }> = {
  owner: { label: "Owner", tone: "ember", description: "Full organisation authority" },
  administrator: { label: "Administrator", tone: "forest", description: "Manages members and configuration" },
  operations_manager: { label: "Operations manager", tone: "forest", description: "Manages departments and teams" },
  supervisor: { label: "Supervisor", tone: "info", description: "Manages a team and its work" },
  employee: { label: "Employee", tone: "info", description: "Works on assigned records" },
  analyst: { label: "Analyst", tone: "neutral", description: "Views reports and analytics" },
  read_only: { label: "Read-only", tone: "neutral", description: "View access only" },
};

/* ------------------------------------------------------------------ */
/* Onboarding step definitions per role                                */
/* ------------------------------------------------------------------ */

export const onboardingSteps: Record<RoleKey, OnboardingStep[]> = {
  owner: [
    { id: "welcome", title: "Welcome", description: "What will be configured and your responsibilities as owner" },
    { id: "org-profile", title: "Organisation profile", description: "Name, website, industry, country, time zone" },
    { id: "business-functions", title: "Business functions", description: "Select your IT operations functions" },
    { id: "teams", title: "Teams", description: "Create recommended teams" },
    { id: "roles", title: "Roles and control", description: "Review default roles and permissions" },
    { id: "invite-managers", title: "Invite managers", description: "Invite administrators and supervisors" },
    { id: "invite-employees", title: "Invite employees", description: "Invite team members" },
    { id: "customer-data", title: "Customer data", description: "Choose how to start with customer records" },
    { id: "integrations", title: "Integrations", description: "Review communication channels" },
    { id: "preferences", title: "Work preferences", description: "Working hours, response targets, notifications" },
    { id: "security", title: "Security review", description: "Confirm identity, sessions and access principles" },
    { id: "review", title: "Review and launch", description: "Confirm setup and open CloudSun" },
  ],
  administrator: [
    { id: "welcome", title: "Welcome", description: "Your role as administrator" },
    { id: "profile", title: "Profile", description: "Confirm your profile details" },
    { id: "mobile", title: "Mobile verification", description: "Confirm your verified mobile" },
    { id: "powers", title: "Administrator powers", description: "Review what you can and cannot do" },
    { id: "teams", title: "Teams", description: "Review teams you can manage" },
    { id: "settings", title: "Organisation settings", description: "Review configurable settings" },
    { id: "notifications", title: "Notifications", description: "Set notification preferences" },
    { id: "security", title: "Security acknowledgement", description: "Confirm security responsibilities" },
    { id: "tour", title: "Product tour", description: "Quick orientation" },
    { id: "enter", title: "Enter workspace", description: "Open your administrator overview" },
  ],
  operations_manager: [
    { id: "welcome", title: "Welcome", description: "Your role as operations manager" },
    { id: "profile", title: "Profile", description: "Confirm your profile" },
    { id: "departments", title: "Assigned departments", description: "Review your department scope" },
    { id: "teams", title: "Managed teams", description: "Review teams you manage" },
    { id: "work-allocation", title: "Work allocation", description: "Understand work distribution" },
    { id: "visibility", title: "Contact and conversation visibility", description: "What you can see" },
    { id: "escalations", title: "Escalation preferences", description: "How escalations reach you" },
    { id: "notifications", title: "Notifications", description: "Set notification preferences" },
    { id: "tour", title: "Product tour", description: "Quick orientation" },
    { id: "enter", title: "Enter workspace", description: "Open your operations overview" },
  ],
  supervisor: [
    { id: "welcome", title: "Welcome", description: "Your role as supervisor" },
    { id: "profile", title: "Profile", description: "Confirm your profile" },
    { id: "team", title: "Assigned team", description: "Review your team" },
    { id: "employees", title: "Assigned employees", description: "Review team members" },
    { id: "assignment", title: "Conversation assignment", description: "Your assignment responsibilities" },
    { id: "escalations", title: "Escalation workflow", description: "How to handle escalations" },
    { id: "notifications", title: "Notifications", description: "Set notification preferences" },
    { id: "tour", title: "Product tour", description: "Quick orientation" },
    { id: "enter", title: "Enter workspace", description: "Open your supervisor overview" },
  ],
  employee: [
    { id: "welcome", title: "Welcome", description: "Your organisation, role, team and supervisor" },
    { id: "profile", title: "Profile", description: "Display name, job title, mobile, time zone" },
    { id: "responsibilities", title: "Responsibilities", description: "What you can and cannot do" },
    { id: "communication", title: "Communication preferences", description: "Email, in-app, assignment notifications" },
    { id: "availability", title: "Availability", description: "Working days, hours and time zone" },
    { id: "tour", title: "Product tour", description: "Overview, inbox, contacts, companies, search" },
    { id: "ready", title: "Ready", description: "Open your workspace" },
  ],
  analyst: [
    { id: "welcome", title: "Welcome", description: "Your role as analyst" },
    { id: "profile", title: "Profile", description: "Confirm your profile" },
    { id: "reports", title: "Report access", description: "Review available reports" },
    { id: "notifications", title: "Notifications", description: "Set notification preferences" },
    { id: "enter", title: "Enter workspace", description: "Open your analytics overview" },
  ],
  read_only: [
    { id: "welcome", title: "Welcome", description: "Your read-only access" },
    { id: "profile", title: "Profile", description: "Confirm your profile" },
    { id: "scope", title: "Access scope", description: "What you can view" },
    { id: "enter", title: "Enter workspace", description: "Open your read-only overview" },
  ],
};

/* ------------------------------------------------------------------ */
/* Role-specific default landing view                                  */
/* ------------------------------------------------------------------ */

export function defaultViewForRole(roleKey: RoleKey): import("@/types/domain").ViewId {
  switch (roleKey) {
    case "owner":
    case "administrator":
      return "overview";
    case "operations_manager":
      return "overview";
    case "supervisor":
      return "inbox";
    case "employee":
      return "inbox";
    case "analyst":
      return "analytics";
    case "read_only":
      return "overview";
    default:
      return "overview";
  }
}
