"use server";

import { ApiError, errorMessage } from "@/lib/auth/api";
import {
  STAFF_TASK_PAGE_SIZE,
  type StaffTask,
  type StaffTaskFilter,
  type StaffTaskSort,
} from "@/lib/staff-tasks";

import type { ActionResult } from "./actions";
import { getAdminTask, listAdminTasks } from "./api";
import { FILTER_TO_API, SORT_TO_API, toStaffTask } from "./task-mappers";
import type { ApiTaskCounts } from "./types";

// Staff tasks reads the client re-runs (search, filter, sort, paging; a task opened from a link).

export interface StaffTaskListParams {
  q: string;
  filter: StaffTaskFilter;
  sort: StaffTaskSort;
  /** 0-based. */
  page: number;
}

export interface StaffTaskListResult {
  rows: StaffTask[];
  total: number;
  /** Before the status filter and paging (they follow the search). */
  counts: ApiTaskCounts;
}

function failure(error: unknown) {
  return {
    ok: false as const,
    error: errorMessage(error),
    code: error instanceof ApiError ? error.code : "INTERNAL",
    status: error instanceof ApiError ? error.status : 500,
  };
}

export async function listStaffTasksAction(
  params: StaffTaskListParams,
): Promise<ActionResult<StaffTaskListResult>> {
  try {
    const page = await listAdminTasks({
      q: params.q.trim() || undefined,
      status: FILTER_TO_API[params.filter],
      sort: SORT_TO_API[params.sort],
      limit: STAFF_TASK_PAGE_SIZE,
      offset: Math.max(0, params.page) * STAFF_TASK_PAGE_SIZE,
    });
    return {
      ok: true,
      data: { rows: page.items.map(toStaffTask), total: page.total, counts: page.counts },
    };
  } catch (error) {
    return failure(error);
  }
}

export async function getStaffTaskAction(taskId: string): Promise<ActionResult<StaffTask>> {
  try {
    return { ok: true, data: toStaffTask(await getAdminTask(taskId)) };
  } catch (error) {
    return failure(error);
  }
}
