"use server";

import { refresh } from "next/cache";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { authedRequest } from "@/lib/auth/session";
import type { StaffMember } from "@/lib/staff";

import { commandCenterApi, identityApi, listStaff, type StaffQuery } from "./api";
import { toStaffMember } from "./mappers";
import type {
  ApiAdminTask,
  ApiEmploymentType,
  ApiStaff,
  ApiStaffCounts,
  ApiStaffHome,
} from "./types";

// Staff management writes (and the reads client screens re-run) as the signed-in person. Every
// result is { ok, data } or { ok: false, error, code, fields }; validation errors carry the
// backend's per-field messages (400 VALIDATION_FAILED → details.fields, dotted paths).

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      code: string;
      status: number;
      /** VALIDATION_FAILED: field (dotted path) → messages. */
      fields?: Record<string, string[]>;
      /** 409 STAFF_EMAIL_EXISTS: the existing record, when you can see it. */
      staffId?: string;
    };

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    const details = (error instanceof ApiError ? error.details : undefined) as
      { fields?: Record<string, string[]>; staffId?: unknown } | undefined;
    return {
      ok: false,
      error: errorMessage(error),
      code: error instanceof ApiError ? error.code : "INTERNAL",
      status: error instanceof ApiError ? error.status : 500,
      fields: details?.fields,
      staffId: typeof details?.staffId === "string" ? details.staffId : undefined,
    };
  }
}

/**
 * A write that changes what the current page shows: on success the page's server data is
 * refreshed in the same response, so the screen is already up to date when the action returns
 * (no stale list between the success toast and a separate router.refresh()).
 */
async function mutate<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  const result = await run(fn);
  if (result.ok) refresh();
  return result;
}

const id = (value: string) => encodeURIComponent(value);

// ── Staff ────────────────────────────────────────────────────────────────────────────────────

export interface StaffPageResult {
  rows: StaffMember[];
  total: number;
  counts: ApiStaffCounts;
}

/** A page of All staff (search, status, sort and paging run on the server). */
export async function listStaffAction(params: StaffQuery): Promise<ActionResult<StaffPageResult>> {
  return run(async () => {
    const page = await listStaff(params);
    return { rows: page.items.map(toStaffMember), total: page.total, counts: page.counts };
  });
}

export type StaffOption = StaffMember & { homeOptions: ApiStaffHome[] };

/** People to pick from (Assign task): not deactivated, by name, email or staff number. */
export async function searchStaffAction(q: string): Promise<ActionResult<StaffOption[]>> {
  return run(async () => {
    const page = await listStaff({ q, sort: "name", limit: 50 });
    return page.items
      .filter((s) => s.status !== "deactivated")
      .map((s) => ({ ...toStaffMember(s), homeOptions: s.homes ?? [] }));
  });
}

export interface StaffInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  employmentType?: ApiEmploymentType | null;
  /** YYYY-MM-DD. */
  startDate?: string | null;
  avatarFileId?: string | null;
  homes?: { homeId: string; isPrimary?: boolean }[];
  roles?: { roleId: string; homeId?: string }[];
  /** Default true. False creates an invited record without emailing ("Not invited"). */
  sendInvite?: boolean;
}

export async function createStaffAction(input: StaffInput) {
  return run(() =>
    identityApi<ApiStaff>("/staff", { method: "POST", body: { ...input } }).then(toStaffMember),
  );
}

export type StaffPatch = Partial<Omit<StaffInput, "homes" | "roles" | "sendInvite">>;

export async function updateStaffAction(staffId: string, patch: StaffPatch) {
  return mutate(() =>
    identityApi<ApiStaff>(`/staff/${id(staffId)}`, { method: "PATCH", body: { ...patch } }),
  );
}

/** Replaces the person's homes with this complete set (Undo resends the previous set). */
export async function setStaffHomesAction(
  staffId: string,
  homes: { homeId: string; isPrimary?: boolean }[],
) {
  return mutate(() =>
    identityApi<ApiStaff>(`/staff/${id(staffId)}/homes`, { method: "PUT", body: { homes } }),
  );
}

/** Replaces the person's roles with this complete set; omit homeId for provider-wide. */
export async function setStaffRolesAction(
  staffId: string,
  roles: { roleId: string; homeId?: string }[],
) {
  return mutate(() =>
    identityApi<ApiStaff>(`/staff/${id(staffId)}/roles`, { method: "PUT", body: { roles } }),
  );
}

export async function deactivateStaffAction(staffId: string, reason?: string) {
  return mutate(() =>
    identityApi<ApiStaff>(`/staff/${id(staffId)}/deactivate`, {
      method: "POST",
      body: reason ? { reason } : {},
    }),
  );
}

export async function reactivateStaffAction(staffId: string) {
  return mutate(() =>
    identityApi<ApiStaff>(`/staff/${id(staffId)}/reactivate`, { method: "POST", body: {} }),
  );
}

/** Sends (or re-sends) the invitation; also how a "Not invited" person gets their first one. */
export async function resendInviteAction(staffId: string) {
  return mutate(() =>
    identityApi<{ sent: true }>(`/staff/${id(staffId)}/resend-invite`, {
      method: "POST",
      body: {},
    }),
  );
}

// ── Tasks (Command Center admin) ─────────────────────────────────────────────────────────────

export interface TaskInput {
  staffId: string;
  homeId?: string;
  title: string;
  description?: string;
  instructions?: string[];
  priority?: "low" | "medium" | "high";
  /** ISO instant. */
  dueAt: string;
  referenceUrl?: string;
  referenceFileIds?: string[];
}

export async function createTaskAction(input: TaskInput) {
  return run(() =>
    commandCenterApi<ApiAdminTask>("/admin/tasks", { method: "POST", body: { ...input } }),
  );
}

export type TaskPatch = Partial<Omit<TaskInput, "referenceFileIds" | "homeId" | "referenceUrl">> & {
  homeId?: string | null;
  referenceUrl?: string | null;
};

/** Edit or reassign an open task; `version` is the one last read (stale → 409). */
export async function editTaskAction(taskId: string, version: number, patch: TaskPatch) {
  return mutate(() =>
    commandCenterApi<ApiAdminTask>(`/admin/tasks/${id(taskId)}`, {
      method: "PATCH",
      body: { version, ...patch },
    }),
  );
}

export async function cancelTaskAction(taskId: string, version: number) {
  return mutate(() =>
    commandCenterApi<ApiAdminTask>(`/admin/tasks/${id(taskId)}/cancel`, {
      method: "POST",
      body: { version },
    }),
  );
}

// ── Files ────────────────────────────────────────────────────────────────────────────────────

/** An upload's scan state ("pending_scan", "clean", "blocked"…); link it only once "clean". */
export async function fileStatusAction(fileId: string) {
  return run(async () => {
    const file = await authedRequest<{ status?: string }>(`/api/files/${id(fileId)}`);
    return { status: file.status ?? "clean" };
  });
}
