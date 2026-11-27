import "server-only";

import { connection } from "next/server";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { sessionEnded } from "@/lib/auth/session";
import type { StaffMember } from "@/lib/staff";
import {
  groupPermissions,
  toStaffRole,
  type PermissionGroup,
  type StaffRole,
} from "@/lib/staff-roles";

import { getStaff, listPermissions, listRoles } from "./api";
import { displayName, toStaffMember } from "./mappers";

// Loads Roles & permissions and Assign role: the roles (GET /roles, with ?staffId for Assign role
// so `assignable` describes giving each role to that person) and the permission catalogue
// (GET /permissions). A 401 ends the session; other failures come back as `error`.

// Figma's order (Administrator, Manager, Home Manager, Caregiver) for the defaults, then the other
// defaults; custom roles follow by name.
const ORDER = [
  "provider_admin",
  "regional_manager",
  "home_manager",
  "senior_carer",
  "care_staff",
  "office_staff",
  "information_governance",
];
const rank = (role: StaffRole) => {
  const i = ORDER.indexOf(role.key);
  return i === -1 ? ORDER.length : i;
};
const byOrder = (a: StaffRole, b: StaffRole) => rank(a) - rank(b) || a.name.localeCompare(b.name);

function failed(error: unknown) {
  if (error instanceof ApiError && error.status === 401) sessionEnded(error);
  return errorMessage(error);
}

export type RolesOverviewData =
  { roles: StaffRole[]; groups: PermissionGroup[]; error?: undefined } | { error: string };

export async function getRolesOverview(): Promise<RolesOverviewData> {
  // Request-time data: never prerendered (reading the clock or API before this trips Next).
  await connection();
  try {
    const [roles, catalogue] = await Promise.all([listRoles(), listPermissions()]);
    const groups = groupPermissions(catalogue);
    return {
      roles: roles.map((r) => toStaffRole(r, groups)).sort(byOrder),
      groups,
    };
  } catch (error) {
    return { error: failed(error) };
  }
}

export interface AssignRoleData {
  staff: StaffMember;
  firstName: string;
  /** Homes the person belongs to (home roles are given per home). */
  homeIds: string[];
  /** Role ids they hold now (any scope). */
  currentRoleIds: string[];
  /** Everything their current, still-effective roles grant. */
  currentPermissions: string[];
  roles: StaffRole[];
  groups: PermissionGroup[];
}

/** null = no such person (or not visible to you): the page shows 404. */
export async function getAssignRole(
  staffId: string,
): Promise<AssignRoleData | { error: string } | null> {
  // Request-time data: never prerendered (reading the clock or API before this trips Next).
  await connection();
  try {
    const [person, roles, catalogue] = await Promise.all([
      getStaff(staffId),
      listRoles(staffId),
      listPermissions(),
    ]);
    const groups = groupPermissions(catalogue);
    const byId = new Map(roles.map((r) => [r.id, r]));
    const held = person.roles ?? [];
    const currentPermissions = new Set(
      held
        .filter((r) => r.effective !== false)
        .flatMap((r) => (r.roleId ? (byId.get(r.roleId)?.permissions ?? []) : [])),
    );
    return {
      staff: toStaffMember(person),
      firstName: person.firstName?.trim() || displayName(person).split(" ")[0],
      homeIds: (person.homes ?? []).flatMap((h) => (h.id ? [h.id] : [])),
      currentRoleIds: [...new Set(held.flatMap((r) => (r.roleId ? [r.roleId] : [])))],
      currentPermissions: [...currentPermissions],
      roles: roles.map((r) => toStaffRole(r, groups)).sort(byOrder),
      groups,
    };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    return { error: failed(error) };
  }
}
