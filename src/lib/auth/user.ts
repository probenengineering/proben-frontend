import "server-only";

import { cache } from "react";

import { identity } from "./api";
import { can, normalizePermissions, type Permission, type PermissionMap } from "./permissions";
import { getAccessToken } from "./session";

// The signed-in person, from GET /auth/me. Staff have a name and email; Proben support staff
// (support sessions) have only a name. There's no profile photo in the API yet.

type Me =
  | {
      type?: "staff";
      id: string;
      displayName: string;
      firstName: string;
      lastName: string;
      email: string;
      jobTitle?: string | null;
      roles?: { key?: string; name?: string; homeId?: string | null }[];
      permissions?: unknown;
      modules?: string[];
    }
  | { type: "support"; id?: string; name?: string; permissions?: unknown };

export interface UserRole {
  key: string;
  name: string;
  /** Set when the role applies to one home only. */
  homeId?: string;
}

export interface CurrentUser {
  /** Staff ID; tells your own chat messages apart from a colleague's. Empty for support sessions. */
  id: string;
  name: string;
  email?: string;
  /** e.g. "AE", shown in the avatar while there's no photo. */
  initials: string;
  /** Shown in the header tag, e.g. "Caregiver": the first role's name, else the job title. */
  role?: string;
  /** Every role held, provider-wide or per home. */
  roles: UserRole[];
  /** What this person may do; check with `can()` from ./permissions. */
  permissions: PermissionMap;
  /** Product areas enabled for the provider. */
  modules: string[];
}

function initialsOf(...names: string[]) {
  return names
    .map((name) => name.trim()[0] ?? "")
    .join("")
    .toUpperCase();
}

/** The signed-in person, or null when signed out (or the session can't be read). Once per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  try {
    const me = await identity<Me>("/auth/me", { accessToken });
    const permissions = normalizePermissions(me.permissions);
    if (me.type === "support") {
      const name = me.name?.trim() || "Proben support";
      const [first = "", ...rest] = name.split(" ");
      return {
        id: me.id ?? "",
        name,
        initials: initialsOf(first, rest.at(-1) ?? ""),
        roles: [],
        permissions,
        modules: [],
      };
    }
    const roles = (me.roles ?? []).flatMap((r) =>
      r.name ? [{ key: r.key ?? "", name: r.name, homeId: r.homeId ?? undefined }] : [],
    );
    return {
      id: me.id,
      name: me.displayName || `${me.firstName} ${me.lastName}`,
      email: me.email,
      initials: initialsOf(me.firstName, me.lastName),
      // Prefer a provider-wide role (e.g. "Provider administrator") over a home role.
      role: (roles.find((r) => !r.homeId) ?? roles[0])?.name || me.jobTitle || undefined,
      roles,
      permissions,
      modules: Array.isArray(me.modules) ? me.modules : [],
    };
  } catch {
    return null;
  }
});

/** Whether the signed-in person has `permission` (provider-wide, or for `homeId`). */
export async function userCan(permission: Permission, homeId?: string) {
  const user = await getCurrentUser();
  return can(user?.permissions, permission, homeId);
}
