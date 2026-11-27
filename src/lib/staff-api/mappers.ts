import type { StaffMember, StaffStatus, StaffTint } from "@/lib/staff";

import type { ApiEmploymentType, ApiStaff, ApiStaffHome, ApiStaffRole } from "./types";

// API → screen shapes shared by the Staff management screens. Safe on server and client.

const TINTS: StaffTint[] = ["purple", "green", "amber", "pink", "grey", "blue", "teal"];

/** A steady avatar tint per person (Figma's staff tints), picked from their id. */
export function tintFor(key: string): StaffTint {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

export const STATUS_FROM_API: Record<ApiStaff["status"], StaffStatus> = {
  active: "active",
  invited: "pending",
  deactivated: "inactive",
};

export const STATUS_TO_API: Record<StaffStatus, ApiStaff["status"]> = {
  active: "active",
  pending: "invited",
  inactive: "deactivated",
};

export const EMPLOYMENT_LABELS: Record<ApiEmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  bank: "Bank / relief",
};

/** Distinct role names, provider-wide first (a person can hold several, or one per home). */
export function roleNames(roles: ApiStaffRole[]) {
  const sorted = [...roles].sort((a, b) => Number(!!a.homeId) - Number(!!b.homeId));
  return [...new Set(sorted.flatMap((r) => (r.name ? [r.name] : [])))];
}

/** Primary home first, then by name. */
export function sortHomes(homes: ApiStaffHome[]) {
  return [...homes].sort(
    (a, b) =>
      Number(!!b.isPrimary) - Number(!!a.isPrimary) || (a.name ?? "").localeCompare(b.name ?? ""),
  );
}

export const displayName = (s: Pick<ApiStaff, "displayName" | "firstName" | "lastName">) =>
  s.displayName?.trim() || `${s.firstName} ${s.lastName}`.trim();

/** Our download proxy for an uploaded file (it adds the session token). */
export const fileSrc = (fileId: string | null | undefined) =>
  fileId ? `/api/files/${encodeURIComponent(fileId)}?inline=1` : undefined;

/** Our proxy link for an API `avatarUrl` ("/api/files/<id>/content", authenticated). */
export function photoFromAvatarUrl(url: string | null | undefined) {
  const id = url?.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];
  return fileSrc(id);
}

export function toStaffMember(s: ApiStaff): StaffMember {
  const roles = roleNames(s.roles ?? []);
  return {
    id: s.id,
    name: displayName(s),
    email: s.email,
    staffId: s.staffNumber,
    role: roles[0] ?? "No role",
    otherRoles: roles.slice(1),
    homes: sortHomes(s.homes ?? []).flatMap((h) => (h.name ? [h.name] : [])),
    status: STATUS_FROM_API[s.status] ?? "active",
    // Created without sending the invitation (sendInvite: false): "Not invited".
    notInvited: s.status === "invited" && !s.invitedAt,
    everActive: !!s.activatedAt,
    addedAt: (s.createdAt ?? "").slice(0, 10),
    tint: tintFor(s.id),
    photoSrc: fileSrc(s.avatarFileId),
  };
}
