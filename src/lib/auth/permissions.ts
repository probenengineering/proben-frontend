// What the signed-in person may do, from GET /auth/me `permissions`. The backend enforces every
// rule; the app uses this only to hide what someone can't do.
//
// Staff sessions send `{ "*": [...provider-wide], "<home id>": [...that home] }`. Support sessions
// send `{ provider: [...], homes: { "<home id>": [...] } }`; both are stored in the staff shape.

/** Permission keys the app checks. Add keys here as screens start using them. */
export const PERMISSIONS = {
  /** Provider-wide admin: assign tasks and events, manage shifts and homes. */
  manageOrg: "org.manage",
  manageRoles: "roles.manage",
  messagingAdmin: "messaging.admin",
  postAnnouncements: "messaging.announcements",
  manageGroups: "messaging.groups",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | (string & {});

/** Scope → permission keys. `*` is provider-wide; other keys are home ids. */
export type PermissionMap = Record<string, string[]>;

const PROVIDER_WIDE = "*";

const keysOf = (value: unknown) =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/** Reads either /auth/me shape into a PermissionMap; anything unexpected becomes no permissions. */
export function normalizePermissions(raw: unknown): PermissionMap {
  if (!raw || typeof raw !== "object") return {};
  const record = raw as Record<string, unknown>;

  if ("provider" in record || "homes" in record) {
    const map: PermissionMap = { [PROVIDER_WIDE]: keysOf(record.provider) };
    const homes = record.homes && typeof record.homes === "object" ? record.homes : {};
    for (const [homeId, keys] of Object.entries(homes)) map[homeId] = keysOf(keys);
    return map;
  }

  return Object.fromEntries(Object.entries(record).map(([scope, keys]) => [scope, keysOf(keys)]));
}

/**
 * True when the person has `permission` provider-wide, or for `homeId` when one is given.
 * Without a homeId only provider-wide permissions count.
 */
export function can(
  permissions: PermissionMap | undefined,
  permission: Permission,
  homeId?: string,
): boolean {
  if (!permissions) return false;
  if (permissions[PROVIDER_WIDE]?.includes(permission)) return true;
  return homeId ? (permissions[homeId]?.includes(permission) ?? false) : false;
}
