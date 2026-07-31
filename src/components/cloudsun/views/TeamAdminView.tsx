"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useDemoStore } from "@/lib/demo-store";
import { roleMeta, ROLE_LIST } from "@/config/rbac";
import { PageHeader, ContentSection } from "@/components/cloudsun/shared/PageHeader";
import { ContactAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { Button } from "@/components/cloudsun/shared/Button";
import { EmptyState } from "@/components/cloudsun/shared/EmptyState";
import { RelativeTime } from "@/components/cloudsun/shared/RelativeTime";
import type { RoleKey } from "@/types/domain";
import {
  UserPlus, Mail, Clock, MoreHorizontal, Ban, RotateCcw, Shield,
  Users, Send, Copy, CheckCircle2,
} from "lucide-react";

export function TeamAdminView() {
  const organisations = useAuthStore((s) => s.organisations);
  const memberships = useAuthStore((s) => s.memberships);
  const invitations = useAuthStore((s) => s.invitations);
  const currentUser = useAuthStore((s) => s.currentUser);
  const selectedOrgId = useAuthStore((s) => s.selectedOrgId);
  const suspendMember = useAuthStore((s) => s.suspendMember);
  const reactivateMember = useAuthStore((s) => s.reactivateMember);
  const changeMemberRole = useAuthStore((s) => s.changeMemberRole);
  const createInvitation = useAuthStore((s) => s.createInvitation);
  const revokeInvitation = useAuthStore((s) => s.revokeInvitation);
  const teams = useDemoStore((s) => s.teams);

  const org = organisations.find((o) => o.id === selectedOrgId);
  const orgMemberships = memberships.filter((m) => m.organisationId === selectedOrgId);
  const orgInvitations = invitations.filter((i) => i.organisationId === selectedOrgId && i.status === "pending");

  const [showInvite, setShowInvite] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState<string | null>(null);

  // Count owners — protect last owner
  const ownerCount = orgMemberships.filter((m) => m.roleKey === "owner" && m.status === "active").length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Manage"
        title="Team"
        description={`Members and invitations for ${org?.name ?? "your organisation"}.`}
        actions={<Button size="sm" onClick={() => setShowInvite(!showInvite)}><UserPlus className="h-4 w-4" /> Invite member</Button>}
      />

      {showInvite && (
        <InvitePanel
          teams={teams}
          onInvite={(email, roleKey, teamId) => {
            createInvitation({ email, roleKey, teamId });
            setShowInvite(false);
          }}
          onClose={() => setShowInvite(false)}
        />
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
          <p className="text-xs text-muted-foreground">Active members</p>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">{orgMemberships.filter((m) => m.status === "active").length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
          <p className="text-xs text-muted-foreground">Pending invitations</p>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">{orgInvitations.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
          <p className="text-xs text-muted-foreground">Owners</p>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">{ownerCount}</p>
          <p className="text-[10px] text-muted-foreground">Last-owner protection active</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {/* Pending invitations */}
        {orgInvitations.length > 0 && (
          <ContentSection title={`Pending invitations (${orgInvitations.length})`}>
            <div className="space-y-2">
              {orgInvitations.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning"><Mail className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">{roleMeta[inv.roleKey].label} · expires <RelativeTime iso={inv.expiresAt} /></p>
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?invite=${inv.token}`)} className="rounded-lg p-2 text-muted-foreground hover:bg-surface-hover hover:text-foreground" aria-label="Copy invite link"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => revokeInvitation(inv.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/5 hover:text-destructive" aria-label="Revoke invitation"><Ban className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </ContentSection>
        )}

        {/* Active members */}
        <ContentSection title={`Members (${orgMemberships.length})`}>
          <div className="overflow-hidden rounded-xl border border-border bg-card elevation-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-inset text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2.5 font-medium">Member</th>
                  <th className="px-3 py-2.5 font-medium">Role</th>
                  <th className="hidden px-3 py-2.5 font-medium sm:table-cell">Status</th>
                  <th className="hidden px-3 py-2.5 font-medium md:table-cell">Joined</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orgMemberships.map((m) => {
                  const isCurrentUser = m.userId === currentUser?.id;
                  const isLastOwner = m.roleKey === "owner" && ownerCount <= 1;
                  return (
                    <tr key={m.id} className="hover:bg-surface-hover">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <ContactAvatar name={currentUser && isCurrentUser ? currentUser.displayName : m.userId} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {currentUser && isCurrentUser ? currentUser.displayName : `User ${m.userId.slice(-4)}`}
                              {isCurrentUser && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{m.jobTitle || m.roleKey}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          value={m.roleKey}
                          onChange={(e) => changeMemberRole(m.id, e.target.value as RoleKey)}
                          disabled={isLastOwner || (m.roleKey === "owner" && !orgMemberships.find((x) => x.userId === currentUser?.id && x.roleKey === "owner"))}
                          aria-label={`Change role for ${m.userId}`}
                          className="h-8 rounded-lg border border-input bg-card px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        >
                          {ROLE_LIST.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
                        </select>
                      </td>
                      <td className="hidden px-3 py-2.5 sm:table-cell">
                        <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold", m.status === "active" ? "bg-forest/10 text-forest" : m.status === "suspended" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>
                          {m.status}
                        </span>
                      </td>
                      <td className="hidden px-3 py-2.5 md:table-cell text-xs text-muted-foreground"><RelativeTime iso={m.joinedAt} /></td>
                      <td className="px-3 py-2.5">
                        {!isLastOwner && !isCurrentUser && (
                          <div className="relative">
                            <button onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground" aria-label="More actions"><MoreHorizontal className="h-4 w-4" /></button>
                            {menuOpen === m.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                                <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-border bg-popover p-1 elevation-floating">
                                  {m.status === "active" ? (
                                    <button onClick={() => { suspendMember(m.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-destructive hover:bg-destructive/5"><Ban className="h-3.5 w-3.5" /> Suspend</button>
                                  ) : (
                                    <button onClick={() => { reactivateMember(m.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-forest hover:bg-forest/5"><RotateCcw className="h-3.5 w-3.5" /> Reactivate</button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        {isLastOwner && <Shield className="h-4 w-4 text-muted-foreground" aria-label="Last owner — cannot modify" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ContentSection>
      </div>
    </div>
  );
}

function InvitePanel({
  teams, onInvite, onClose,
}: {
  teams: ReturnType<typeof useDemoStore.getState>["teams"];
  onInvite: (email: string, roleKey: RoleKey, teamId: string | null) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<RoleKey>("employee");
  const [team, setTeam] = React.useState("");
  const [error, setError] = React.useState("");

  const send = () => {
    if (!email.includes("@")) { setError("Enter a valid email."); return; }
    onInvite(email, role, team || null);
  };

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Invite a team member</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">×</button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="colleague@company.com" className="h-9 flex-1 rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <select value={role} onChange={(e) => setRole(e.target.value as RoleKey)} aria-label="Filter by role" className="h-9 rounded-lg border border-input bg-card px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          {ROLE_LIST.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
        </select>
        <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Filter by team" className="h-9 rounded-lg border border-input bg-card px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">No team</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <Button size="sm" onClick={send}><Send className="h-3.5 w-3.5" /> Send invite</Button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <p className="mt-2 text-xs text-muted-foreground">The invitee must sign in with the invited email address. Invitations expire after 7 days.</p>
    </div>
  );
}
