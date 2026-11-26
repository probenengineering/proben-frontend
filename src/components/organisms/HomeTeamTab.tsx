"use client";

import { useState } from "react";

import { FilterSelect, PillSearch, TeamMemberCard } from "@/components/molecules";
import type { HomeTeamMember } from "@/types/home";

// Home team tab (Figma 60:13930): search (280px), Role and On shift filters, "8 members · 4 on
// shift now" on the right, then a 4-up grid of member cards (14px gaps). Filtering runs here.
export interface HomeTeamTabProps {
  team: HomeTeamMember[];
}

type ShiftFilter = "any" | "on" | "off";

export function HomeTeamTab({ team }: HomeTeamTabProps) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [onShift, setOnShift] = useState<ShiftFilter>("any");
  const roles = [...new Set(team.flatMap((m) => (m.role ? [m.role] : [])))].sort();
  const onShiftCount = team.filter((m) => m.shift?.tone === "success").length;
  const hasShifts = team.some((m) => m.shift);
  const q = query.trim().toLowerCase();
  const shown = team.filter(
    (m) =>
      (!q || `${m.name} ${m.role ?? ""}`.toLowerCase().includes(q)) &&
      (role === "all" || m.role === role) &&
      (onShift === "any" || (onShift === "on") === (m.shift?.tone === "success")),
  );

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <PillSearch
          value={query}
          onChange={setQuery}
          placeholder="Search team members"
          className="w-full sm:w-70"
        />
        <FilterSelect
          label="Filter by role"
          variant="status"
          showDot={false}
          fieldLabel="Role"
          value={role}
          onChange={setRole}
          options={[{ id: "all", label: "All" }, ...roles.map((r) => ({ id: r, label: r }))]}
        />
        {hasShifts && (
          <FilterSelect
            label="Filter by shift"
            variant="status"
            showDot={false}
            fieldLabel="On shift"
            value={onShift}
            onChange={setOnShift}
            options={[
              { id: "any", label: "Any" },
              { id: "on", label: "On shift" },
              { id: "off", label: "Not on shift" },
            ]}
          />
        )}
        <span className="flex-1" />
        <span className="type-ui-13 text-slate-500">
          {team.length} {team.length === 1 ? "member" : "members"}
          {hasShifts && ` · ${onShiftCount} on shift now`}
        </span>
      </div>
      {shown.length === 0 ? (
        <p className="rounded-[14px] border border-slate-200 bg-white px-4 py-10 text-center type-ui-14 text-slate-500">
          {team.length === 0 ? "No team members yet." : "No team members match these filters."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {shown.map((m) => (
            <TeamMemberCard key={m.id} member={m} />
          ))}
        </ul>
      )}
    </div>
  );
}
