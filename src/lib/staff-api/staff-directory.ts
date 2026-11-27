import "server-only";

import { connection } from "next/server";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { canPersonally, PERMISSIONS } from "@/lib/auth/permissions";
import { sessionEnded } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/user";
import { STAFF_PAGE_SIZE } from "@/lib/staff";

import type { StaffPageResult } from "./actions";
import { listStaff } from "./api";
import { toStaffMember } from "./mappers";

// All staff (Figma 103:18355) from GET /api/identity/staff: page 1 by name, six rows, plus the
// counts for the stats line (the caller's whole staff scope). The rest of the paging, search,
// filter and sort run through listStaffAction from the table.

export interface StaffAccess {
  /** staff.manage in any scope: Add staff, Assign role/homes, invitations, deactivate. */
  canManage: boolean;
  /** tasks.assign in any scope (or org.manage): Assign task. */
  canAssignTasks: boolean;
}

export interface StaffDirectory extends StaffAccess {
  initial?: StaffPageResult;
  /** Set when the list couldn't load. */
  error?: string;
}

/** What the signed-in person may do here. The backend still checks every write. */
export async function getStaffAccess(): Promise<StaffAccess> {
  // Request-time data: never prerendered (reading the clock or API before this trips Next).
  await connection();
  const permissions = (await getCurrentUser())?.permissions;
  return {
    canManage: canPersonally(permissions, PERMISSIONS.staffManage),
    canAssignTasks:
      canPersonally(permissions, "tasks.assign") ||
      canPersonally(permissions, PERMISSIONS.manageOrg),
  };
}

export async function getStaffDirectory(): Promise<StaffDirectory> {
  // Request-time data: never prerendered (reading the clock or API before this trips Next).
  await connection();
  const access = await getStaffAccess();
  try {
    const page = await listStaff({ limit: STAFF_PAGE_SIZE, sort: "name" });
    return {
      ...access,
      initial: { rows: page.items.map(toStaffMember), total: page.total, counts: page.counts },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) sessionEnded(error);
    return { ...access, error: errorMessage(error) };
  }
}
