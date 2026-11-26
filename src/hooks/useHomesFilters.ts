"use client";

import { useState } from "react";

import type { HomesView } from "@/components/molecules";
import type { AssignedHome } from "@/types/home";

// My homes search, filters and sort (Figma 60:12810 / 60:12897 / 60:12982), all in the browser:
// search matches name, code, street, city line and ZIP; Assignment (All / Active / Upcoming);
// City (All + the homes' cities); Sort (Name A–Z / Z–A, City). Also the List / Map view.
export type AssignmentFilter = "all" | "active" | "upcoming";
export type HomeSort = "name" | "name-desc" | "city";

export const HOME_SORTS: { id: HomeSort; label: string }[] = [
  { id: "name", label: "Name (A–Z)" },
  { id: "name-desc", label: "Name (Z–A)" },
  { id: "city", label: "City" },
];

export function useHomesFilters(homes: AssignedHome[], initialView: HomesView = "list") {
  const [query, setQuery] = useState("");
  const [assignment, setAssignment] = useState<AssignmentFilter>("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<HomeSort>("name");
  const [view, setView] = useState<HomesView>(initialView);

  const cities = [...new Set(homes.flatMap((h) => (h.city ? [h.city] : [])))].sort();
  const q = query.trim().toLowerCase();
  const shown = homes
    .filter(
      (h) =>
        (!q ||
          [h.name, h.code, h.street, h.cityLine, h.address]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        (assignment === "all" || h.assignment.status === assignment) &&
        (city === "all" || h.city === city),
    )
    .sort((a, b) =>
      sort === "city"
        ? (a.city ?? "").localeCompare(b.city ?? "") || a.name.localeCompare(b.name)
        : sort === "name-desc"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name),
    );

  return {
    query,
    setQuery,
    assignment,
    setAssignment,
    city,
    setCity,
    cities,
    sort,
    setSort,
    view,
    setView,
    shown,
    filtered: q !== "" || assignment !== "all" || city !== "all",
    clear: () => {
      setQuery("");
      setAssignment("all");
      setCity("all");
    },
  };
}
