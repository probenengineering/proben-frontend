"use client";

import { FilterSelect, PillSearch } from "@/components/molecules";
import type { useHomesFilters } from "@/hooks/useHomesFilters";
import { HOME_SORTS } from "@/hooks/useHomesFilters";

// My homes toolbar (Figma "Search & filters" 60:12873): a 340px search box, Assignment and City
// pills (36px, grey label + Semi Bold value), then on the right the count ("5 homes" or "1 of 5
// homes", 13/18 slate-500) and Sort. The map view keeps the count but not Sort (60:13347).
export interface HomesToolbarProps {
  filters: ReturnType<typeof useHomesFilters>;
  total: number;
}

const ASSIGNMENTS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
] as const;

export function HomesToolbar({ filters: f, total }: HomesToolbarProps) {
  const count = f.filtered
    ? `${f.shown.length} of ${total} homes`
    : `${total} ${total === 1 ? "home" : "homes"}`;
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <PillSearch
        value={f.query}
        onChange={f.setQuery}
        placeholder="Search by name, address, city or ZIP"
        className="w-full sm:w-85"
      />
      <FilterSelect
        label="Filter by assignment"
        variant="status"
        showDot={false}
        fieldLabel="Assignment"
        value={f.assignment}
        onChange={f.setAssignment}
        options={[...ASSIGNMENTS]}
      />
      <FilterSelect
        label="Filter by city"
        variant="status"
        showDot={false}
        fieldLabel="City"
        value={f.city}
        onChange={f.setCity}
        options={[{ id: "all", label: "All" }, ...f.cities.map((c) => ({ id: c, label: c }))]}
      />
      <span className="flex-1" />
      <span className="type-ui-13 text-slate-500">{count}</span>
      {f.view === "list" && (
        <FilterSelect
          label="Sort homes"
          variant="status"
          showDot={false}
          fieldLabel="Sort"
          value={f.sort}
          onChange={f.setSort}
          options={HOME_SORTS}
        />
      )}
    </div>
  );
}
