// What the signed-in person may do, from GET /auth/me `permissions`. The backend enforces every
// rule; the app uses this only to hide what someone can't do.
//
// Staff sessions send `{ "*": [...provider-wide], "<home id>": [...that home] }`. Support sessions
// send `{ provider: [...], homes: { "<home id>": [...] } }`; both are stored in the staff shape.

/**
 * The backend's permission catalogue (docs/roles-and-permissions.md §3). Scope: personal and
 * provider keys live under "*"; home keys can be provider-wide ("*") or per home id.
 */
export const PERMISSIONS = {
  directoryView: "directory.view",
  directoryViewAll: "directory.view_all",
  messagingUse: "messaging.use",
  sendAttachments: "messaging.attachments.send",
  sendVoiceNotes: "messaging.voice_notes.send",
  startCalls: "messaging.calls.start",
  createGroups: "messaging.groups.create",
  /** Home scope: manage groups linked to a home. */
  manageGroups: "messaging.groups.manage",
  sendPriority: "messaging.priority.send",
  /** Home scope. */
  postAnnouncements: "messaging.announcements.send",
  messagingAdmin: "messaging.admin",
  messagingContentAccess: "messaging.content.access",
  messagingLegalHold: "messaging.legal_hold.manage",
  messagingExport: "messaging.export",
  messagingReports: "messaging.reports.view",
  /** Provider-wide only: Command Center administration (assign tasks and events, shifts, homes). */
  manageOrg: "org.manage",
  staffView: "staff.view",
  staffManage: "staff.manage",
  manageRoles: "roles.manage",
  providerSettings: "provider.settings.manage",
  supportGrants: "support.grants.manage",
  auditView: "audit.view",
  reportsView: "reports.view",
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
 * For personal permissions (sending attachments, starting calls…): granted by any role, whether
 * assigned provider-wide or for one home. The backend hasn't confirmed which scope key carries a
 * personal grant from a home-scoped role, so any scope counts (the backend still enforces it).
 */
export function canPersonally(permissions: PermissionMap | undefined, permission: Permission) {
  return Object.values(permissions ?? {}).some((keys) => keys.includes(permission));
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
