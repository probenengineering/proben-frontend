import "server-only";

import { connection } from "next/server";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { canPersonally, PERMISSIONS } from "@/lib/auth/permissions";
import { sessionEnded } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/user";
import { type StaffFormOptions, uniqueLabels } from "@/lib/staff-form";

import { identityApi, listOrgHomes, listRoles } from "./api";
import { EMPLOYMENT_LABELS } from "./mappers";
import type { ApiEmploymentType } from "./types";

// What Add staff needs from the API: the roles you may give (GET /roles, without staffId = what
// you may assign when creating staff), the organisation's active homes (GET /homes) and its
// departments (GET /departments). Departments are optional: if they fail the field is disabled.

export interface StaffFormSetup {
  /** staff.manage in any scope (provider-wide or a home). */
  canManage: boolean;
  options?: StaffFormOptions;
  /** Roles or homes couldn't load. */
  error?: string;
}

export async function getStaffFormSetup(): Promise<StaffFormSetup> {
  // Request-time data: never prerendered (reading the clock or API before this trips Next).
  await connection();
  const user = await getCurrentUser();
  if (!canPersonally(user?.permissions, PERMISSIONS.staffManage)) return { canManage: false };
  try {
    const [roles, homes, departments] = await Promise.all([
      listRoles(),
      listOrgHomes(),
      identityApi<{ id?: string; name?: string }[]>("/departments").catch(() => null),
    ]);

    const givable = roles
      .filter((r) => r.assignable !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
    const active = homes
      .filter((h) => h.id && h.name && (!h.status || h.status === "active"))
      .sort((a, b) => a.name!.localeCompare(b.name!));
    const depts = Array.isArray(departments)
      ? departments.filter((d) => d.id && d.name).sort((a, b) => a.name!.localeCompare(b.name!))
      : null;

    const roleLabels = uniqueLabels(
      givable,
      (r) => r.name,
      (r) => r.key,
    );
    const homeLabels = uniqueLabels(
      active,
      (h) => h.name!,
      (h) => h.code,
    );
    const deptLabels =
      depts &&
      uniqueLabels(
        depts,
        (d) => d.name!,
        () => null,
      );

    return {
      canManage: true,
      options: {
        roles: givable.map((r, i) => ({
          id: r.id,
          label: roleLabels[i],
          recommendedScope: r.recommendedScope,
          providerWide: r.assignableScopes?.providerWide ?? false,
          homeIds: r.assignableScopes?.homeIds ?? [],
        })),
        homes: active.map((h, i) => ({ id: h.id!, label: homeLabels[i] })),
        departments: depts && depts.map((d, i) => ({ id: d.id!, label: deptLabels![i] })),
        employmentTypes: (Object.keys(EMPLOYMENT_LABELS) as ApiEmploymentType[]).map((id) => ({
          id,
          label: EMPLOYMENT_LABELS[id],
        })),
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) sessionEnded(error);
    return { canManage: true, error: errorMessage(error) };
  }
}
