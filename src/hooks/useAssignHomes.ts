"use client";

import { useMemo, useState } from "react";

import type { HomeOption, ProfileHome } from "@/lib/staff-profile";

// Assign homes drawer state (Figma 103:19806): which assigned homes are marked for removal, which
// available homes are ticked (both by home id), and the search / city filter for the available
// list (the organisation's active homes, less those already assigned).
export function useAssignHomes(
  assigned: ProfileHome[],
  options: HomeOption[],
  initialRemoved: string[] = [],
) {
  const [removed, setRemoved] = useState<string[]>(initialRemoved);
  const [added, setAdded] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");

  const available = useMemo(() => {
    const assignedIds = new Set(assigned.map((h) => h.id));
    return options
      .filter((h) => !assignedIds.has(h.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [assigned, options]);
  const cities = [...new Set(available.flatMap((h) => (h.city ? [h.city] : [])))].sort();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return available.filter(
      (h) =>
        (city === "all" || h.city === city) &&
        (!q || [h.name, h.code, h.detail].some((v) => v.toLowerCase().includes(q))),
    );
  }, [available, city, query]);

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((n) => n !== id) : [...list, id];
  const nameOf = (id: string) =>
    assigned.find((h) => h.id === id)?.name ?? options.find((h) => h.id === id)?.name ?? id;

  return {
    removed,
    added,
    query,
    setQuery,
    city,
    setCity,
    cities,
    availableCount: available.length,
    shown,
    toggleRemoved: (id: string) => setRemoved((r) => toggle(r, id)),
    toggleAdded: (id: string) => setAdded((a) => toggle(a, id)),
    /** Names for the review dialog. */
    addedNames: added.map(nameOf),
    removedNames: removed.map(nameOf),
    kept: assigned.filter((h) => !removed.includes(h.id)).map((h) => h.name),
    changed: removed.length > 0 || added.length > 0,
  };
}

export type AssignHomesState = ReturnType<typeof useAssignHomes>;
