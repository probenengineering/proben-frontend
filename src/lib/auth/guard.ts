import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";

import { type AccessArea, type AppAccess, appAccess } from "./access";
import { getCurrentUser } from "./user";

/**
 * At the top of a page: someone who can't open `area` (e.g. typing /staff/roles without the
 * permission) is sent to Home instead of seeing the page. Returns the person's access map so the
 * page can hide the actions they can't take.
 */
export async function requireAccess(area: AccessArea): Promise<AppAccess> {
  await connection();
  const user = await getCurrentUser();
  const access = appAccess(user?.permissions);
  if (!access[area]) redirect("/");
  return access;
}
