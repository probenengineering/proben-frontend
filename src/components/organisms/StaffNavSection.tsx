import { connection } from "next/server";

import { appAccess } from "@/lib/auth/access";
import { getCurrentUser } from "@/lib/auth/user";

import { StaffNavGroup } from "./StaffNavGroup";

// The sidebar's Staff management group for the signed-in person: only the sub-pages they may open
// (lib/auth/access), and nothing at all for someone with no Staff management access (e.g. care
// staff). Reads the session, so render it inside <Suspense>.
export interface StaffNavSectionProps {
  collapsed?: boolean;
}

export async function StaffNavSection({ collapsed }: StaffNavSectionProps) {
  await connection();
  const access = appAccess((await getCurrentUser())?.permissions);
  if (!access.staffArea) return null;
  return (
    <StaffNavGroup
      collapsed={collapsed}
      show={{
        allStaff: access.viewStaff,
        roles: access.viewRoles,
        homes: access.viewStaff,
        tasks: access.viewTasks,
      }}
    />
  );
}
