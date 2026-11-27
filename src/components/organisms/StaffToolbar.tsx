"use client";

import { FilterSelect, PillSearch } from "@/components/molecules";
import type { StaffFilters } from "@/hooks/useStaffFilters";
import { STAFF_FILTERS, STAFF_SORTS } from "@/lib/staff";

// All staff toolbar (Figma "Toolbar" 103:18390): 320px pill search, the "Filters" pill, then on
// the right the count ("10 staff", or "3 of 10 staff" when narrowed; "— staff" while loading,
// 13/18 slate-500) and Sort. 10px gaps; wraps on small screens.
export interface StaffToolbarProps {
  filters?: StaffFilters;
}

export function StaffToolbar({ filters: f }: StaffToolbarProps) {
  const count = !f
    ? "— staff"
    : f.narrowed
      ? `${f.total} of ${f.counts.total} staff`
      : `${f.counts.total} staff`;
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <PillSearch
        value={f?.query ?? ""}
        onChange={(value) => f?.setQuery(value)}
        placeholder="Search by name, staff ID, or email"
        className="w-full sm:w-80"
      />
      <FilterSelect
        label="Filter staff"
        variant="status"
        showDot={false}
        fieldLabel="Filters"
        value={f?.filter ?? "none"}
        onChange={(value) => f?.setFilter(value)}
        options={STAFF_FILTERS}
      />
      <span className="flex-1" />
      <span className="type-ui-13 text-slate-500">{count}</span>
      <FilterSelect
        label="Sort staff"
        variant="status"
        showDot={false}
        fieldLabel="Sort"
        value={f?.sort ?? "name-asc"}
        onChange={(value) => f?.setSort(value)}
        options={STAFF_SORTS}
      />
    </div>
  );
}
