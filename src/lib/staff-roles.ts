import type { ApiPermission, ApiRole } from "@/lib/staff-api/types";

// Roles for Assign role (Figma 103:19418) and Roles & permissions (103:20605), from the identity
// API: every role the organisation has (seven defaults plus any custom ones) with its real name,
// description, permissions and staff count, and the permission catalogue (GET /permissions) that
// labels and groups them. Nothing here is ranked: who may give a role comes from the API's
// `assignable` flags. Safe on server and client.

export interface StaffRole {
  /** Role id (roleId in assignments). */
  id: string;
  key: string;
  name: string;
  description: string;
  /** Scope badge: "Organization-wide" or "Assigned homes" (the role's recommended scope). */
  scope: string;
  /** Recommended per home (one assignment per home) rather than provider-wide. */
  homeScoped: boolean;
  /** Up to three things the role can do, from its actual permissions (catalogue labels). */
  capabilities: string[];
  permissions: string[];
  /** False when the signed-in person can't give this role (to this person, on Assign role). */
  assignable: boolean;
  assignableScopes: { providerWide: boolean; homeIds: string[] };
  /** People holding the role. */
  staff: number;
}

export interface PermissionGroup {
  title: string;
  permissions: { id: string; label: string; scope: ApiPermission["scope"] }[];
}

export const ORGANIZATION_WIDE = "Organization-wide";
export const ASSIGNED_HOMES = "Assigned homes";

// Catalogue groups in the order the screens list them (others follow, alphabetically).
const GROUP_ORDER = ["Staff", "Homes", "Tasks", "Messaging", "Administration"];
const groupRank = (group: string) => {
  const i = GROUP_ORDER.indexOf(group);
  return i === -1 ? GROUP_ORDER.length : i;
};

/** "Start voice and video calls (anyone can answer…)" → "Start voice and video calls". */
export function shortLabel(label: string) {
  return label.split(/ \(|; /)[0].trim();
}

/** The catalogue grouped for display (Staff, Homes, Tasks, Messaging, Administration…). */
export function groupPermissions(catalogue: ApiPermission[]): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>();
  for (const p of catalogue) {
    const group = groups.get(p.group) ?? { title: p.group, permissions: [] };
    group.permissions.push({ id: p.key, label: shortLabel(p.label || p.key), scope: p.scope });
    groups.set(p.group, group);
  }
  return [...groups.values()].sort(
    (a, b) => groupRank(a.title) - groupRank(b.title) || a.title.localeCompare(b.title),
  );
}

/** Up to three headline capabilities: provider and home permissions first, then personal ones. */
function capabilitiesOf(permissions: Set<string>, groups: PermissionGroup[]) {
  const all = groups.flatMap((g) => g.permissions).filter((p) => permissions.has(p.id));
  const wider = all.filter((p) => p.scope !== "personal");
  return [...wider, ...all.filter((p) => p.scope === "personal")].slice(0, 3).map((p) => p.label);
}

export function toStaffRole(role: ApiRole, groups: PermissionGroup[]): StaffRole {
  const homeScoped = role.recommendedScope === "homes";
  return {
    id: role.id,
    key: role.key,
    name: role.name,
    description: role.description?.trim() || "No description.",
    scope: homeScoped ? ASSIGNED_HOMES : ORGANIZATION_WIDE,
    homeScoped,
    capabilities: capabilitiesOf(new Set(role.permissions), groups),
    permissions: role.permissions,
    assignable: role.assignable !== false,
    assignableScopes: {
      providerWide: role.assignableScopes?.providerWide ?? false,
      homeIds: role.assignableScopes?.homeIds ?? [],
    },
    staff: role.assignedCount ?? 0,
  };
}

/** Catalogue labels for permissions in `to` but not `from` (gains) and the reverse (loses). */
export function accessChanges(from: string[], to: string[], groups: PermissionGroup[]) {
  const had = new Set(from);
  const will = new Set(to);
  const all = groups.flatMap((g) => g.permissions);
  return {
    gains: all.filter((p) => will.has(p.id) && !had.has(p.id)).map((p) => p.label),
    loses: all.filter((p) => had.has(p.id) && !will.has(p.id)).map((p) => p.label),
  };
}

export type RoleAssignment = { roleId: string; homeId?: string };

/**
 * The complete role set to save when `role` replaces whatever the person holds (PUT
 * /staff/{id}/roles). Home roles: one per home the person belongs to that the signed-in person may
 * give it in. Organisation roles: provider-wide when allowed, else per home. `reason` explains a
 * role that can't be given here.
 */
export function assignmentsFor(
  role: StaffRole,
  memberHomeIds: string[],
): { roles: RoleAssignment[] } | { reason: "no-homes" | "no-allowed-homes" | "not-allowed" } {
  const allowed = new Set(role.assignableScopes.homeIds);
  const homes = memberHomeIds.filter((h) => allowed.has(h));
  const perHome = homes.map((homeId) => ({ roleId: role.id, homeId }));
  if (!role.homeScoped && role.assignableScopes.providerWide) {
    return { roles: [{ roleId: role.id }] };
  }
  if (perHome.length > 0) return { roles: perHome };
  if (memberHomeIds.length === 0 && role.homeScoped) return { reason: "no-homes" };
  if (memberHomeIds.length > 0 && allowed.size > 0) return { reason: "no-allowed-homes" };
  return { reason: "not-allowed" };
}
