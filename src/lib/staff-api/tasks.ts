import "server-only";

import { connection } from "next/server";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { can, canPersonally, type PermissionMap } from "@/lib/auth/permissions";
import { sessionEnded } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/user";
import { STAFF_TASK_PAGE_SIZE, type StaffTask } from "@/lib/staff-tasks";

import type { StaffOption } from "./actions";
import { getAdminTask, getStaff, listAdminTasks, listStaff } from "./api";
import { toStaffMember } from "./mappers";
import { SORT_TO_API, toStaffTask } from "./task-mappers";
import type { StaffTaskListResult } from "./task-actions";
import type { ApiStaff } from "./types";

// Server loads for Staff tasks (Figma 103:20163) and Assign task (103:20399). Access follows the
// handover (S17): tasks.view / tasks.assign per home, or provider-wide org.manage. The backend
// enforces it; these only decide what to show.

const VIEW = ["tasks.view", "tasks.assign", "org.manage"];
const ASSIGN = ["tasks.assign", "org.manage"];

const anyScope = (permissions: PermissionMap, keys: string[]) =>
  keys.some((key) => canPersonally(permissions, key));

function rethrowEnded(error: unknown) {
  if (error instanceof ApiError && error.status === 401) sessionEnded(error);
}

export interface StaffTasksData {
  canView: boolean;
  canAssign: boolean;
  /** Page 1, due date first; undefined when it couldn't load (see `error`). */
  list?: StaffTaskListResult;
  /** ?task=<id>, loaded in case it isn't on page 1. */
  open?: StaffTask;
  /** ?added=<id>: the task just assigned, pinned on top and highlighted (Figma 103:20339). */
  added?: StaffTask;
  error?: string;
}

export async function loadStaffTasks(openId?: string, addedId?: string): Promise<StaffTasksData> {
  // Request-time data: never prerendered (reading the clock or API before this trips Next).
  await connection();
  const user = await getCurrentUser();
  const permissions = user?.permissions ?? {};
  const canView = anyScope(permissions, VIEW);
  const canAssign = anyScope(permissions, ASSIGN);
  if (!canView) return { canView, canAssign };

  const one = (id?: string) =>
    id
      ? getAdminTask(id)
          .then(toStaffTask)
          .catch((error) => {
            rethrowEnded(error);
            return undefined;
          })
      : undefined;
  try {
    const [page, open, added] = await Promise.all([
      listAdminTasks({ sort: SORT_TO_API["due-asc"], limit: STAFF_TASK_PAGE_SIZE, offset: 0 }),
      one(openId),
      one(addedId),
    ]);
    return {
      canView,
      canAssign,
      list: { rows: page.items.map(toStaffTask), total: page.total, counts: page.counts },
      open,
      added,
    };
  } catch (error) {
    rethrowEnded(error);
    return { canView, canAssign, error: errorMessage(error) };
  }
}

const toOption = (s: ApiStaff): StaffOption => ({
  ...toStaffMember(s),
  homeOptions: s.homes ?? [],
});

export interface AssignTaskData {
  canAssign: boolean;
  /** People to pick from (not deactivated), name order; the picker searches for more. */
  options: StaffOption[];
  /** ?staff=<id>, when it's someone you can see. */
  preset?: StaffOption;
  /**
   * Homes you can assign tasks in: "all" with provider-wide authority (then a home is optional),
   * else these ids (a home is required, and only these are offered).
   */
  homeScope: "all" | string[];
  error?: string;
}

export async function loadAssignTask(staffId?: string): Promise<AssignTaskData> {
  // Request-time data: never prerendered (reading the clock or API before this trips Next).
  await connection();
  const user = await getCurrentUser();
  const permissions = user?.permissions ?? {};
  const canAssign = anyScope(permissions, ASSIGN);
  const providerWide = ASSIGN.some((key) => can(permissions, key));
  const homeScope = providerWide
    ? ("all" as const)
    : Object.entries(permissions)
        .filter(([scope, keys]) => scope !== "*" && ASSIGN.some((key) => keys.includes(key)))
        .map(([scope]) => scope);
  if (!canAssign) return { canAssign, options: [], homeScope };

  try {
    const [page, preset] = await Promise.all([
      listStaff({ sort: "name", limit: 50 }),
      staffId
        ? getStaff(staffId).catch((error) => {
            rethrowEnded(error);
            return undefined;
          })
        : undefined,
    ]);
    return {
      canAssign,
      homeScope,
      options: page.items.filter((s) => s.status !== "deactivated").map(toOption),
      preset: preset && preset.status !== "deactivated" ? toOption(preset) : undefined,
    };
  } catch (error) {
    rethrowEnded(error);
    return { canAssign, homeScope, options: [], error: errorMessage(error) };
  }
}
