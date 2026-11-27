"use client";

import { useEffect, useRef, useState } from "react";

import {
  listStaffTasksAction,
  type StaffTaskListParams,
  type StaffTaskListResult,
} from "@/lib/staff-api/task-actions";
import {
  STAFF_TASK_FILTERS,
  STAFF_TASK_PAGE_SIZE,
  STAFF_TASK_SORTS,
  type StaffTask,
  type StaffTaskFilter,
  type StaffTaskSort,
} from "@/lib/staff-tasks";

// Search, status filter, sort and paging for Staff tasks (6 rows a page, Figma 103:20163), run by
// the API (GET /admin/tasks). The current rows stay on screen while the next ones load; a slower,
// older response never replaces a newer one. Typing waits 300ms. Changing the search, filter or
// sort goes back to page 1. The task just assigned (`pinned`) sits on top of the unfiltered first
// page, highlighted (103:20339). The stats keep the unsearched totals.
export { STAFF_TASK_FILTERS, STAFF_TASK_SORTS };
export type { StaffTaskFilter, StaffTaskSort };

const DEFAULTS: StaffTaskListParams = { q: "", filter: "none", sort: "due-asc", page: 0 };
const DEBOUNCE_MS = 300;

export function useStaffTaskFilters(initial: StaffTaskListResult, pinned: StaffTask | null) {
  const [params, setParams] = useState(DEFAULTS);
  /** The rows on screen and the page they're from (the next page may still be loading). */
  const [data, setData] = useState({ ...initial, page: 0 });
  const [totals, setTotals] = useState(initial.counts);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const latest = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // New server data (after a task is assigned or cancelled, the page refreshes): the totals
  // always update; the rows only when the list shows the default first page. A search, filter or
  // later page is kept as it is (the screen re-runs it), so the person's view doesn't reset.
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setTotals(initial.counts);
    const unchanged =
      !params.q.trim() &&
      params.filter === DEFAULTS.filter &&
      params.sort === DEFAULTS.sort &&
      data.page === 0;
    if (unchanged) {
      setData({ ...initial, page: 0 });
      setError(null);
    }
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const load = async (next: StaffTaskListParams) => {
    const call = ++latest.current;
    setLoading(true);
    const result = await listStaffTasksAction(next);
    if (call !== latest.current) return;
    setLoading(false);
    if (!result.ok) return setError(result.error);
    setError(null);
    setData({ ...result.data, page: next.page });
    if (!next.q.trim()) setTotals(result.data.counts);
  };

  const update = (patch: Partial<StaffTaskListParams>, delay = 0) => {
    const next = { ...params, page: 0, ...patch };
    setParams(next);
    clearTimeout(timer.current);
    if (delay) timer.current = setTimeout(() => void load(next), delay);
    else void load(next);
  };

  const pinnedOnTop =
    pinned && data.page === 0 && !params.q.trim() && params.filter === "none" ? pinned : null;
  const rows = pinnedOnTop
    ? [pinnedOnTop, ...data.rows.filter((t) => t.id !== pinnedOnTop.id)]
    : data.rows;
  const start = data.page * STAFF_TASK_PAGE_SIZE;

  return {
    query: params.q,
    setQuery: (q: string) => update({ q }, DEBOUNCE_MS),
    filter: params.filter,
    setFilter: (filter: StaffTaskFilter) => update({ filter }),
    sort: params.sort,
    setSort: (sort: StaffTaskSort) => update({ sort }),
    narrowed: params.q.trim() !== "" || params.filter !== "none",
    rows,
    total: data.total,
    totals,
    loading,
    error,
    /** 1-based range for "Showing 1–6 of 70 tasks". */
    from: data.total ? start + 1 : 0,
    to: start + data.rows.length,
    hasPrevious: data.page > 0,
    hasNext: start + STAFF_TASK_PAGE_SIZE < data.total,
    previous: () => update({ page: Math.max(0, params.page - 1) }),
    next: () => update({ page: params.page + 1 }),
    /** Re-run the current page (after a cancel). */
    refresh: () => void load(params),
  };
}

export type StaffTaskFilters = ReturnType<typeof useStaffTaskFilters>;
