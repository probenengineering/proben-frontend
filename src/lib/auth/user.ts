import "server-only";

import { cache } from "react";

import { identity } from "./api";
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
      roles?: { name?: string }[];
    }
  | { type: "support"; id?: string; name: string };

export interface CurrentUser {
  /** Staff ID; tells your own chat messages apart from a colleague's. Empty for support sessions. */
  id: string;
  name: string;
  email?: string;
  /** e.g. "AE", shown in the avatar while there's no photo. */
  initials: string;
  /** Shown in the header tag, e.g. "Caregiver": the first role's name, else the job title. */
  role?: string;
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
    if (me.type === "support") {
      const [first = "", ...rest] = me.name.split(" ");
      return { id: me.id ?? "", name: me.name, initials: initialsOf(first, rest.at(-1) ?? "") };
    }
    return {
      id: me.id,
      name: me.displayName || `${me.firstName} ${me.lastName}`,
      email: me.email,
      initials: initialsOf(me.firstName, me.lastName),
      role: me.roles?.find((r) => r.name)?.name || me.jobTitle || undefined,
    };
  } catch {
    return null;
  }
});
