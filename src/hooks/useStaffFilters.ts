"use client";

import { useEffect, useRef, useState } from "react";

import type { ApiStaffSort, ApiStaffStatus } from "@/lib/staff-api/types";
import { listStaffAction, type StaffPageResult } from "@/lib/staff-api/actions";
import { STAFF_PAGE_SIZE, type StaffCounts, type StaffFilter, type StaffSort } from "@/lib/staff";

// Search, status filter, sort and paging for the All staff table (6 rows a page, Figma 103:18355),
// run on the server (GET /staff via listStaffAction). Changing the search, filter or sort goes
// back to page 1. Typing waits 300ms; a slower earlier answer never replaces a newer one. The
// current rows stay on screen while the next page loads.

const STATUS: Record<StaffFilter, ApiStaffStatus | undefined> = {
  none: undefined,
  active: "active",
  pending: "invited",
  inactive: "deactivated",
};

const SORT: Record<StaffSort, ApiStaffSort> = {
  "name-asc": "name",
  "name-desc": "-name",
  "added-desc": "-createdAt",
  "added-asc": "createdAt",
};

interface Params {
  query: string;
  filter: StaffFilter;
  sort: StaffSort;
  page: number;
}

const FIRST: Params = { query: "", filter: "none", sort: "name-asc", page: 0 };

export function useStaffFilters(initial: StaffPageResult) {
  const [params, setParams] = useState<Params>(FIRST);
  const [data, setData] = useState(initial);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const latest = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const load = (next: Params, wait = 0) => {
    setParams(next);
    setLoading(true);
    const id = ++latest.current;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const result = await listStaffAction({
        q: next.query.trim() || undefined,
        status: STATUS[next.filter],
        sort: SORT[next.sort],
        limit: STAFF_PAGE_SIZE,
        offset: next.page * STAFF_PAGE_SIZE,
      });
      if (id !== latest.current) return;
      setLoading(false);
      if (!result.ok) return setError(result.error);
      setError(undefined);
      // A row removed from under the last page (e.g. filtered after deactivating): step back.
      if (result.data.rows.length === 0 && next.page > 0 && result.data.total > 0) {
        return load({ ...next, page: Math.ceil(result.data.total / STAFF_PAGE_SIZE) - 1 });
      }
      setData(result.data);
    }, wait);
  };

  const { total, counts: raw } = data;
  const start = params.page * STAFF_PAGE_SIZE;
  const counts: StaffCounts = {
    total: raw.all,
    active: raw.active,
    pending: raw.invited,
    inactive: raw.deactivated,
  };

  return {
    query: params.query,
    setQuery: (query: string) => load({ ...params, query, page: 0 }, 300),
    filter: params.filter,
    setFilter: (filter: StaffFilter) => load({ ...params, filter, page: 0 }),
    sort: params.sort,
    setSort: (sort: StaffSort) => load({ ...params, sort, page: 0 }),
    rows: data.rows,
    /** People matching the search and filter. */
    total,
    /** The whole staff scope, for the stats line and "3 of 10 staff". */
    counts,
    /** True when a search or status filter narrows the list. */
    narrowed: params.query.trim() !== "" || params.filter !== "none",
    /** 1-based range for "Showing 1–6 of 10 staff". */
    from: data.rows.length ? start + 1 : 0,
    to: start + data.rows.length,
    hasPrevious: params.page > 0,
    hasNext: start + data.rows.length < total,
    previous: () => load({ ...params, page: Math.max(0, params.page - 1) }),
    next: () => load({ ...params, page: params.page + 1 }),
    /** Re-runs the current page (after an invitation, deactivation or reactivation). */
    reload: () => load(params),
    loading,
    error,
  };
}

export type StaffFilters = ReturnType<typeof useStaffFilters>;
