"use client";

import { useMemo, useState } from "react";

import {
  FilterSelect,
  HomeAssignmentRow,
  HomeAssignmentTableHeader,
  NoticeBanner,
  PillSearch,
} from "@/components/molecules";
import { type Coverage, COVERAGE_LABELS, type HomeAssignment } from "@/lib/home-assignments";
import { showToast } from "@/lib/toast";

// Home assignments body (Figma 103:20849): a 300px search and the Filters (coverage) pill, "8
// homes · 10 staff" (13/18 slate-500) on the right, then the homes table (white, slate-200 border,
// 12px radius); 20px padding and gaps. Live from GET /homes/assignments; `totals` counts homes
// and distinct active staff before filters. "Manage" isn't designed yet.
type Filter = "none" | Coverage;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "none", label: "None" },
  ...(Object.entries(COVERAGE_LABELS) as [Coverage, string][]).map(([id, label]) => ({
    id,
    label,
  })),
];

export interface HomeAssignmentsListProps {
  homes: HomeAssignment[];
  totals: { homes: number; staff: number };
  /** Set when the homes couldn't load. */
  error?: string;
}

export function HomeAssignmentsList({ homes, totals, error }: HomeAssignmentsListProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("none");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return homes.filter(
      (h) =>
        (filter === "none" || h.coverage === filter) &&
        (!q || [h.name, h.code, h.city, h.address ?? ""].some((v) => v.toLowerCase().includes(q))),
    );
  }, [homes, query, filter]);
  const narrowed = query.trim() !== "" || filter !== "none";
  const count = narrowed ? `${shown.length} of ${totals.homes} homes` : `${totals.homes} homes`;

  return (
    <div className="flex flex-col gap-5 px-5">
      <div className="flex flex-wrap items-center gap-2">
        <PillSearch
          value={query}
          onChange={setQuery}
          placeholder="Search by home name or address"
          className="w-full sm:w-75"
        />
        <FilterSelect
          label="Filter by coverage"
          variant="status"
          showDot={false}
          fieldLabel="Filters"
          value={filter}
          onChange={setFilter}
          options={FILTERS}
        />
        <span className="flex-1" />
        <span className="type-ui-13 text-slate-500">
          {count} · {totals.staff} staff
        </span>
      </div>
      {error && <NoticeBanner message={error} />}
      <div className="w-full overflow-clip rounded-[12px] border border-slate-200 bg-white">
        <HomeAssignmentTableHeader />
        <ul className="flex flex-col">
          {shown.map((home) => (
            <HomeAssignmentRow
              key={home.id ?? home.name}
              home={home}
              onManage={() => showToast("error", "Managing a home’s staff isn’t available yet.")}
            />
          ))}
          {shown.length === 0 && (
            <li className="px-4 py-6 text-center type-ui-13 text-slate-500">
              {narrowed ? "No homes match your search." : "No homes yet."}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
