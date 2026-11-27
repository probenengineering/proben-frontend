"use server";

import { ApiError, errorMessage } from "@/lib/auth/api";
import type { StaffMember } from "@/lib/staff";

import type { ActionResult, StaffInput } from "./actions";
import { identityApi } from "./api";
import { toStaffMember } from "./mappers";
import type { ApiStaff } from "./types";

// Add staff: POST /staff (CreateStaffDto), including the department, which the shared StaffInput
// leaves out. Errors carry the backend's per-field messages (400 VALIDATION_FAILED) and, for a
// duplicate email (409 STAFF_EMAIL_EXISTS), the existing record's id when you can see it.

export type AddStaffInput = StaffInput & { departmentId?: string };

export async function addStaffAction(input: AddStaffInput): Promise<ActionResult<StaffMember>> {
  try {
    const staff = await identityApi<ApiStaff>("/staff", { method: "POST", body: { ...input } });
    return { ok: true, data: toStaffMember(staff) };
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
