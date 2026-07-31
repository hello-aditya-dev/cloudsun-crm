"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { PageHeader, ContentSection } from "@/components/cloudsun/shared/PageHeader";
import { Button } from "@/components/cloudsun/shared/Button";
import { ContactAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { RelativeTime, DateTimeDisplay } from "@/components/cloudsun/shared/RelativeTime";
import {
  Smartphone, Monitor, Shield, LogOut, KeyRound, Bell, Globe,
  Clock, CheckCircle2, AlertTriangle, Ban,
} from "lucide-react";

export function SecuritySettingsView() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const sessions = useAuthStore((s) => s.sessions);
  const revokeSession = useAuthStore((s) => s.revokeSession);
  const signOutEverywhere = useAuthStore((s) => s.signOutEverywhere);

  const activeSessions = sessions.filter((s) => !s.revokedAt);
  const revokedSessions = sessions.filter((s) => s.revokedAt);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader eyebrow="Manage · Settings" title="Security" description="Identity, sessions and account security." />

      <div className="mt-6 space-y-6">
        {/* Identity */}
        <ContentSection title="Identity">
          <div className="rounded-xl border border-border bg-card p-4 elevation-subtle">
            <div className="flex items-center gap-3">
              {currentUser && <ContactAvatar name={currentUser.displayName} color={currentUser.avatarColor} size="lg" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{currentUser?.displayName}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.primaryEmail}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SecurityItem icon={CheckCircle2} label="Email verified" value={currentUser?.emailVerifiedAt ? "Verified" : "Pending"} ok={!!currentUser?.emailVerifiedAt} />
              <SecurityItem icon={KeyRound} label="Sign-in method" value={currentUser?.authProvider === "google" ? "Google" : currentUser?.authProvider === "password" ? "Password" : "—"} ok />
              <SecurityItem icon={Smartphone} label="Mobile verified" value={currentUser?.mobileNumber ?? "Not set"} ok={!!currentUser?.mobileVerifiedAt} />
              <SecurityItem icon={Globe} label="Time zone" value={currentUser?.timeZone ?? "—"} ok />
            </div>
          </div>
        </ContentSection>

        {/* Active sessions */}
        <ContentSection
          title={`Active sessions (${activeSessions.length})`}
          actions={
            activeSessions.length > 1 && (
              <Button variant="outline" size="sm" onClick={() => { if (confirm("Sign out of all sessions?")) signOutEverywhere(); }}>
                <LogOut className="h-3.5 w-3.5" /> Sign out everywhere
              </Button>
            )
          }
        >
          <div className="space-y-2">
            {activeSessions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">No active sessions.</p>
            ) : (
              activeSessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-inset text-muted-foreground">
                    {s.deviceSummary?.includes("Mobile") ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{s.deviceSummary} {s.isCurrent && <span className="ml-1 text-xs text-forest">(this device)</span>}</p>
                    <p className="text-xs text-muted-foreground">IP {s.ipHint} · Last active <RelativeTime iso={s.lastActiveAt} /></p>
                  </div>
                  {!s.isCurrent && (
                    <button onClick={() => revokeSession(s.id)} className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      Revoke
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </ContentSection>

        {/* Security notices */}
        <ContentSection title="Security notices">
          <div className="space-y-2 rounded-xl border border-border bg-card p-4 elevation-subtle">
            <Notice icon={Shield} label="Permission-based access" desc="Role permissions are enforced at the data layer, not just in the browser." />
            <Notice icon={Bell} label="Security notifications" desc="You'll be notified of new sign-ins and security changes." />
            <Notice icon={Clock} label="Session expiry" desc="Sessions expire after 7 days of inactivity." />
          </div>
        </ContentSection>

        {/* Danger zone */}
        <ContentSection title="Account actions">
          <div className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <button onClick={() => { if (confirm("Sign out of all sessions? This will return you to the landing page.")) signOutEverywhere(); }} className="flex w-full items-center gap-3 rounded-lg border border-destructive/30 bg-card p-3 text-left hover:bg-destructive/5">
              <LogOut className="h-5 w-5 text-destructive" />
              <div><p className="text-sm font-medium text-foreground">Sign out everywhere</p><p className="text-xs text-muted-foreground">Revoke all active sessions on all devices</p></div>
            </button>
          </div>
        </ContentSection>
      </div>
    </div>
  );
}

function SecurityItem({ icon: Icon, label, value, ok }: { icon: any; label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("h-4 w-4", ok ? "text-forest" : "text-warning")} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Notice({ icon: Icon, label, desc }: { icon: any; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div><p className="text-sm font-medium text-foreground">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
    </div>
  );
}
