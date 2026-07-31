"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import { industryMeta, customerStatusMeta, formatCurrency, formatRelativeTime } from "@/lib/display";
import type { Industry, CustomerStatus } from "@/types/domain";
import { PageHeader } from "@/components/cloudsun/shared/PageHeader";
import { SearchField, FilterBar, Select, ClearFiltersButton, ViewToggle } from "@/components/cloudsun/shared/FilterBar";
import { StatusBadge } from "@/components/cloudsun/shared/StatusBadge";
import { ContactAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { EmptyState, FilteredEmptyState } from "@/components/cloudsun/shared/EmptyState";
import { Button } from "@/components/cloudsun/shared/Button";
import { RelativeTime } from "@/components/cloudsun/shared/RelativeTime";
import { Plus, Download, Building2, ChevronLeft, ChevronRight, Users, MessageSquare } from "lucide-react";

const INDUSTRY_OPTIONS = [
  { value: "", label: "All industries" },
  ...Object.entries(industryMeta).map(([value, label]) => ({ value, label })),
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...Object.entries(customerStatusMeta).map(([value, m]) => ({ value, label: m.label })),
];

export function CompaniesView() {
  const companies = useDemoStore((s) => s.companies);
  const contacts = useDemoStore((s) => s.contacts);
  const conversations = useDemoStore((s) => s.conversations);
  const teamMembers = useDemoStore((s) => s.teamMembers);
  const navigate = useDemoStore((s) => s.navigate);

  const [search, setSearch] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [owner, setOwner] = React.useState("");
  const [view, setView] = React.useState<"table" | "cards">("cards");
  const [page, setPage] = React.useState(0);
  const pageSize = 9;

  const memberMap = React.useMemo(() => new Map(teamMembers.map((m) => [m.id, m])), [teamMembers]);

  const enriched = React.useMemo(() => {
    return companies.map((co) => {
      const coContacts = contacts.filter((c) => c.companyId === co.id && !c.archived);
      const coConversations = conversations.filter((cv) => cv.companyId === co.id);
      return {
        ...co,
        contactCount: coContacts.length,
        openConversations: coConversations.filter((cv) => !["closed", "resolved", "spam"].includes(cv.status)).length,
        lastActivity: coConversations.length ? coConversations.map((cv) => cv.lastActivityAt).sort().reverse()[0] : co.updatedAt,
      };
    });
  }, [companies, contacts, conversations]);

  const filtered = React.useMemo(() => {
    let list = enriched;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (industry) list = list.filter((c) => c.industry === industry);
    if (status) list = list.filter((c) => c.customerStatus === status);
    if (owner) list = list.filter((c) => c.accountOwnerId === owner);
    return list;
  }, [enriched, search, industry, status, owner]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  React.useEffect(() => { setPage(0); }, [search, industry, status, owner]);

  const hasFilters = !!(search || industry || status || owner);
  const clearFilters = () => { setSearch(""); setIndustry(""); setStatus(""); setOwner(""); };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Workspace"
        title="Companies"
        description="Customer and prospect organisations across the IT industry."
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => navigate("companies", { detailId: "new" })}><Plus className="h-4 w-4" /> New company</Button>
          </>
        }
      />

      <div className="mt-5 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField value={search} onChange={setSearch} placeholder="Search by name, domain, location…" className="flex-1" />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={industry} onChange={setIndustry} options={INDUSTRY_OPTIONS} ariaLabel="Industry" />
            <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} ariaLabel="Status" />
            <Select value={owner} onChange={setOwner} ariaLabel="Owner" options={[{ value: "", label: "All owners" }, ...teamMembers.map((m) => ({ value: m.id, label: m.name }))]} />
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
        <FilterBar>
          <span className="text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? "company" : "companies"}</span>
          {hasFilters && <ClearFiltersButton onClick={clearFilters} />}
        </FilterBar>
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          hasFilters ? <FilteredEmptyState onClear={clearFilters} /> : (
            <EmptyState
              icon={Building2}
              title="No companies yet"
              description="Create your first company to start building your account map."
              action={<Button size="sm" onClick={() => navigate("companies", { detailId: "new" })}><Plus className="h-4 w-4" /> New company</Button>}
            />
          )
        ) : view === "table" ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card elevation-subtle">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-inset text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2.5 font-medium">Company</th>
                    <th className="px-3 py-2.5 font-medium">Industry</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="hidden px-3 py-2.5 font-medium sm:table-cell">Owner</th>
                    <th className="hidden px-3 py-2.5 font-medium md:table-cell">Contacts</th>
                    <th className="hidden px-3 py-2.5 font-medium md:table-cell">Open</th>
                    <th className="hidden px-3 py-2.5 font-medium lg:table-cell">Value</th>
                    <th className="hidden px-3 py-2.5 font-medium xl:table-cell">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((co) => {
                    const owner = memberMap.get(co.accountOwnerId);
                    return (
                      <tr key={co.id} onClick={() => navigate("companies", { detailId: co.id })} className="cursor-pointer transition-colors hover:bg-surface-hover">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-inset text-muted-foreground">
                              <Building2 className="h-4 w-4" aria-hidden />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{co.name}</p>
                              <p className="truncate text-xs text-muted-foreground">{co.domain}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{industryMeta[co.industry]}</td>
                        <td className="px-3 py-2.5"><StatusBadge kind="customerStatus" value={co.customerStatus} /></td>
                        <td className="hidden px-3 py-2.5 sm:table-cell">
                          {owner && <span className="flex items-center gap-1.5"><ContactAvatar name={owner.name} color={owner.avatarColor} size="xs" /><span className="text-xs text-muted-foreground">{owner.name.split(" ")[0]}</span></span>}
                        </td>
                        <td className="hidden px-3 py-2.5 md:table-cell"><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" />{co.contactCount}</span></td>
                        <td className="hidden px-3 py-2.5 md:table-cell"><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="h-3 w-3" />{co.openConversations}</span></td>
                        <td className="hidden px-3 py-2.5 lg:table-cell"><span className="tabular-nums font-medium text-foreground">{formatCurrency(co.estimatedValue)}</span></td>
                        <td className="hidden px-3 py-2.5 xl:table-cell"><RelativeTime iso={co.lastActivity} className="text-xs text-muted-foreground" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((co) => {
              const owner = memberMap.get(co.accountOwnerId);
              return (
                <button key={co.id} onClick={() => navigate("companies", { detailId: co.id })} className="rounded-xl border border-border bg-card p-4 text-left elevation-subtle transition-all hover:elevation-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-inset text-muted-foreground">
                        <Building2 className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{co.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{co.domain}</p>
                      </div>
                    </div>
                    <StatusBadge kind="customerStatus" value={co.customerStatus} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{industryMeta[co.industry]}</p>
                  <p className="text-xs text-muted-foreground">{co.location}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{co.contactCount}</span>
                      <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" />{co.openConversations}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(co.estimatedValue)}</span>
                  </div>
                  {owner && <p className="mt-2 text-[10px] text-muted-foreground">Owner: {owner.name}</p>}
                </button>
              );
            })}
          </div>
        )}

        {filtered.length > pageSize && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Page {currentPage + 1} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft className="h-4 w-4" /> Prev</Button>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setPage(currentPage + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
