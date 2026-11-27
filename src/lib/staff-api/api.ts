import "server-only";

import type { RequestOptions } from "@/lib/auth/api";
import { authedRequest } from "@/lib/auth/session";

import type {
  ApiActivity,
  ApiAdminTask,
  ApiAdminTaskPage,
  ApiAdminTaskStatus,
  ApiCoverage,
  ApiHomeStaffingPage,
  ApiOrgHome,
  ApiPermission,
  ApiRole,
  ApiStaff,
  ApiStaffPage,
  ApiStaffSort,
  ApiStaffStatus,
  ApiTaskSort,
} from "./types";

// Staff management reads as the signed-in person (identity /staff, /roles, /permissions, /homes;
// commandcenter /admin/tasks). Server-side only. Writes are in ./actions.

type Options = Omit<RequestOptions, "accessToken">;

export const identityApi = <T>(path: string, options: Options = {}) =>
  authedRequest<T>(`/api/identity${path}`, options);

export const commandCenterApi = <T>(path: string, options: Options = {}) =>
  authedRequest<T>(`/api/commandcenter${path}`, options);

/** "?q=x&limit=6", leaving out empty values. */
export function query(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

const id = (value: string) => encodeURIComponent(value);

export interface StaffQuery {
  q?: string;
  status?: ApiStaffStatus;
  sort?: ApiStaffSort;
  homeId?: string;
  limit?: number;
  offset?: number;
}

export const listStaff = (params: StaffQuery = {}) =>
  identityApi<ApiStaffPage>(`/staff${query({ ...params })}`);

export const getStaff = (staffId: string) => identityApi<ApiStaff>(`/staff/${id(staffId)}`);

export const listStaffActivity = (staffId: string, limit = 25, offset = 0) =>
  identityApi<{ items: ApiActivity[]; total: number }>(
    `/staff/${id(staffId)}/activity${query({ limit, offset })}`,
  );

/** With `staffId`, `assignable` describes giving each role to that person. */
export const listRoles = (staffId?: string) =>
  identityApi<ApiRole[]>(`/roles${query({ staffId })}`);

export const listPermissions = () => identityApi<ApiPermission[]>("/permissions");

export const listOrgHomes = () => identityApi<ApiOrgHome[]>("/homes");

export interface HomeStaffingQuery {
  q?: string;
  city?: string;
  coverage?: ApiCoverage;
  limit?: number;
  offset?: number;
}

export const listHomeStaffing = (params: HomeStaffingQuery = {}) =>
  identityApi<ApiHomeStaffingPage>(`/homes/assignments${query({ ...params })}`);

export interface AdminTaskQuery {
  staffId?: string;
  homeId?: string;
  q?: string;
  status?: ApiAdminTaskStatus | "all" | "overdue";
  sort?: ApiTaskSort;
  limit?: number;
  offset?: number;
}

export const listAdminTasks = (params: AdminTaskQuery = {}) =>
  commandCenterApi<ApiAdminTaskPage>(`/admin/tasks${query({ ...params })}`);

export const getAdminTask = (taskId: string) =>
  commandCenterApi<ApiAdminTask>(`/admin/tasks/${id(taskId)}`);
