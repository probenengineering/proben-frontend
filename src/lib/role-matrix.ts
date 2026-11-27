import { ASSIGNED_HOMES, type PermissionGroup, type StaffRole } from "./staff-roles";

// Roles & permissions matrix (Figma 103:20605): one row per permission in the API catalogue,
// grouped as the catalogue groups them; one column per role. A cell is what the role's own
// permission list says, so it always matches what ProBen enforces.

export type PermissionGrant =
  /** Provider-wide permission held by the role: tick + "Organization-wide". */
  | { kind: "org" }
  /** Home permission held by a role given per home: scope pill, e.g. "Assigned homes". */
  | { kind: "scope"; label: string }
  /** Personal permission (goes with the person, any home): tick only. */
  | { kind: "granted" }
  | { kind: "if-permitted" }
  | { kind: "none" };

export interface MatrixRow {
  group: string;
  permission: string;
  /** One per role, in the roles' order. */
  grants: PermissionGrant[];
}

function grantFor(role: StaffRole, permission: PermissionGroup["permissions"][number]) {
  if (!role.permissions.includes(permission.id)) return { kind: "none" } as const;
  if (permission.scope === "personal") return { kind: "granted" } as const;
  if (permission.scope === "home" && role.homeScoped) {
    return { kind: "scope", label: ASSIGNED_HOMES } as const;
  }
  return { kind: "org" } as const;
}

export function buildMatrix(roles: StaffRole[], groups: PermissionGroup[]): MatrixRow[] {
  return groups.flatMap((group) =>
    group.permissions.map((permission) => ({
      group: group.title,
      permission: permission.label,
      grants: roles.map((role) => grantFor(role, permission)),
    })),
  );
}
