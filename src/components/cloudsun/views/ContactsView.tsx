"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/lib/demo-store";
import {
  leadStageMeta,
  priorityMeta,
  industryMeta,
  formatCurrency,
  formatRelativeTime,
} from "@/lib/display";
import type { Contact, LeadStage, Priority } from "@/types/domain";
import { PageHeader, ContentSection } from "@/components/cloudsun/shared/PageHeader";
import { SearchField, FilterBar, FilterChip, Select, ViewToggle, ClearFiltersButton } from "@/components/cloudsun/shared/FilterBar";
import { StatusBadge } from "@/components/cloudsun/shared/StatusBadge";
import { ContactAvatar } from "@/components/cloudsun/shared/ContactAvatar";
import { EmptyState, FilteredEmptyState } from "@/components/cloudsun/shared/EmptyState";
import { Button } from "@/components/cloudsun/shared/Button";
import { TagList } from "@/components/cloudsun/shared/TagList";
import { RelativeTime } from "@/components/cloudsun/shared/RelativeTime";
import { Plus, Download, Upload, Users, MoreHorizontal, ChevronLeft, ChevronRight, CheckSquare, Square, Archive } from "lucide-react";

const STAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All stages" },
  ...Object.entries(leadStageMeta).map(([value, m]) => ({ value, label: m.label })),
];

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All priorities" },
  ...Object.entries(priorityMeta).map(([value, m]) => ({ value, label: m.label })),
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently active" },
  { value: "name", label: "Name (A–Z)" },
  { value: "value", label: "Estimated value" },
  { value: "followup", label: "Next follow-up" },
];

export function ContactsView() {
  const contacts = useDemoStore((s) => s.contacts);
  const companies = useDemoStore((s) => s.companies);
  const teamMembers = useDemoStore((s) => s.teamMembers);
  const navigate = useDemoStore((s) => s.navigate);
  const bulkUpdateContacts = useDemoStore((s) => s.bulkUpdateContacts);

  const [search, setSearch] = React.useState("");
  const [stage, setStage] = React.useState("");
  const [priority, setPriority] = React.useState("");
  const [owner, setOwner] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [archived, setArchived] = React.useState(false);
  const [sort, setSort] = React.useState("recent");
  const [view, setView] = React.useState<"table" | "cards">("table");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(0);
  const pageSize = 12;

  const companyMap = React.useMemo(
    () => new Map(companies.map((c) => [c.id, c])),
    [companies]
  );
  const memberMap = React.useMemo(
    () => new Map(teamMembers.map((m) => [m.id, m])),
    [teamMembers]
  );

  const filtered = React.useMemo(() => {
    let list = contacts.filter((c) => c.archived === archived);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.jobTitle.toLowerCase().includes(q) ||
          c.primaryEmail.toLowerCase().includes(q) ||
          c.primaryPhone.includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (stage) list = list.filter((c) => c.leadStage === stage);
    if (priority) list = list.filter((c) => c.priority === priority);
    if (owner) list = list.filter((c) => c.ownerId === owner);
    if (company) list = list.filter((c) => c.companyId === company);

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "name": return a.fullName.localeCompare(b.fullName);
        case "value": return b.estimatedValue - a.estimatedValue;
        case "followup": {
          const av = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Infinity;
          const bv = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Infinity;
          return av - bv;
        }
        default: {
          const av = a.lastInteractionAt ? new Date(a.lastInteractionAt).getTime() : 0;
          const bv = b.lastInteractionAt ? new Date(b.lastInteractionAt).getTime() : 0;
          return bv - av;
        }
      }
    });
    return list;
  }, [contacts, search, stage, priority, owner, company, archived, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  React.useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [search, stage, priority, owner, company, archived, sort]);

  const hasFilters = !!(search || stage || priority || owner || company);
  const clearFilters = () => {
    setSearch(""); setStage(""); setPriority(""); setOwner(""); setCompany("");
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAllOnPage = () => {
    setSelected((s) => {
      const next = new Set(s);
      pageItems.forEach((c) => next.add(c.id));
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const bulkChangeStage = (newStage: LeadStage) => {
    bulkUpdateContacts([...selected], { leadStage: newStage });
    clearSelection();
  };
  const bulkArchive = () => {
    bulkUpdateContacts([...selected], { archived: true });
    clearSelection();
  };

  const openDetail = (id: string) => navigate("contacts", { detailId: id });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Workspace"
        title="Contacts"
        description="Decision-makers, leads and customer contacts across your IT accounts."
        actions={
          <>
            <Button variant="outline" size="sm"><Upload className="h-4 w-4" /> Import</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => navigate("contacts", { detailId: "new" })}><Plus className="h-4 w-4" /> New contact</Button>
          </>
        }
      />

      {/* Filters */}
      <div className="mt-5 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, phone or tag…"
            className="flex-1"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={stage} onChange={setStage} options={STAGE_OPTIONS} ariaLabel="Lead stage" />
            <Select value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} ariaLabel="Priority" />
            <Select
              value={owner}
              onChange={setOwner}
              ariaLabel="Owner"
              options={[{ value: "", label: "All owners" }, ...teamMembers.map((m) => ({ value: m.id, label: m.name }))]}
            />
            <Select
              value={company}
              onChange={setCompany}
              ariaLabel="Company"
              options={[{ value: "", label: "All companies" }, ...companies.map((c) => ({ value: c.id, label: c.name }))]}
            />
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
        <FilterBar>
          <FilterChip
            label={archived ? "Showing archived" : "Active only"}
            active={archived}
            onClick={() => setArchived(!archived)}
          />
          <Select value={sort} onChange={setSort} ariaLabel="Sort" options={SORT_OPTIONS} />
          <span className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "contact" : "contacts"}
          </span>
          {hasFilters && <ClearFiltersButton onClick={clearFilters} />}
        </FilterBar>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 elevation-subtle">
          <span className="text-sm font-medium text-foreground">
            {selected.size} selected
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Select
              value=""
              onChange={(v) => v && bulkChangeStage(v as LeadStage)}
              ariaLabel="Bulk change stage"
              placeholder="Change stage…"
              options={Object.entries(leadStageMeta).map(([value, m]) => ({ value, label: m.label }))}
              className="h-8 text-xs"
            />
            <Button variant="outline" size="sm" onClick={bulkArchive}><Archive className="h-3.5 w-3.5" /> Archive</Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          hasFilters ? (
            <FilteredEmptyState onClear={clearFilters} />
          ) : (
            <EmptyState
              icon={Users}
              title={archived ? "No archived contacts" : "No contacts yet"}
              description={archived ? "Archived contacts will appear here." : "Create your first contact to get started."}
              action={!archived && <Button size="sm" onClick={() => navigate("contacts", { detailId: "new" })}><Plus className="h-4 w-4" /> New contact</Button>}
            />
          )
        ) : view === "table" ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card elevation-subtle">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-inset text-left text-xs text-muted-foreground">
                    <th className="w-10 px-3 py-2.5">
                      <button
                        onClick={selectAllOnPage}
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Select all on page"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-3 py-2.5 font-medium">Contact</th>
                    <th className="px-3 py-2.5 font-medium">Company</th>
                    <th className="px-3 py-2.5 font-medium">Stage</th>
                    <th className="hidden px-3 py-2.5 font-medium lg:table-cell">Owner</th>
                    <th className="hidden px-3 py-2.5 font-medium sm:table-cell">Last activity</th>
                    <th className="hidden px-3 py-2.5 font-medium md:table-cell">Follow-up</th>
                    <th className="hidden px-3 py-2.5 font-medium xl:table-cell">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((c) => {
                    const co = c.companyId ? companyMap.get(c.companyId) : null;
                    const owner = memberMap.get(c.ownerId);
                    const isSel = selected.has(c.id);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => openDetail(c.id)}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-surface-hover",
                          isSel && "bg-primary/5"
                        )}
                      >
                        <td className="px-3 py-2.5" onClick={(e) => { e.stopPropagation(); toggleSelect(c.id); }}>
                          <button className="text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label={`Select ${c.fullName}`}>
                            {isSel ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <ContactAvatar name={c.fullName} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{c.fullName}</p>
                              <p className="truncate text-xs text-muted-foreground">{c.jobTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          {co ? (
                            <span className="truncate text-foreground">{co.name}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge kind="leadStage" value={c.leadStage} />
                        </td>
                        <td className="hidden px-3 py-2.5 lg:table-cell">
                          {owner && (
                            <span className="flex items-center gap-1.5">
                              <ContactAvatar name={owner.name} color={owner.avatarColor} size="xs" />
                              <span className="truncate text-xs text-muted-foreground">{owner.name.split(" ")[0]}</span>
                            </span>
                          )}
                        </td>
                        <td className="hidden px-3 py-2.5 sm:table-cell">
                          <RelativeTime iso={c.lastInteractionAt} className="text-xs text-muted-foreground" />
                        </td>
                        <td className="hidden px-3 py-2.5 md:table-cell">
                          <RelativeTime iso={c.nextFollowUpAt} className="text-xs text-muted-foreground" />
                        </td>
                        <td className="hidden px-3 py-2.5 xl:table-cell">
                          {c.estimatedValue > 0 ? (
                            <span className="tabular-nums font-medium text-foreground">{formatCurrency(c.estimatedValue)}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((c) => {
              const co = c.companyId ? companyMap.get(c.companyId) : null;
              return (
                <button
                  key={c.id}
                  onClick={() => openDetail(c.id)}
                  className="rounded-xl border border-border bg-card p-4 text-left elevation-subtle transition-all hover:elevation-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start gap-3">
                    <ContactAvatar name={c.fullName} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{c.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.jobTitle}</p>
                      <p className="truncate text-xs text-muted-foreground">{co?.name ?? "No company"}</p>
                    </div>
                    <StatusBadge kind="priority" value={c.priority} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge kind="leadStage" value={c.leadStage} />
                    {c.estimatedValue > 0 && (
                      <span className="text-xs font-medium text-muted-foreground">{formatCurrency(c.estimatedValue)}</span>
                    )}
                  </div>
                  {c.tags.length > 0 && <TagList tags={c.tags} className="mt-2" size="xs" />}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Last activity <RelativeTime iso={c.lastInteractionAt} />
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {currentPage + 1} of {totalPages} · {filtered.length} total
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setPage(currentPage + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
