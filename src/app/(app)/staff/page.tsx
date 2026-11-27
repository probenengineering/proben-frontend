import type { Metadata } from "next";

import { AddStaffButton, AllStaff, DashboardHeader } from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import { getStaffDirectory } from "@/lib/staff-api/staff-directory";
import { requireAccess } from "@/lib/auth/guard";

// Moving here from another page waits for this page, keeping the current page on screen (with the
// progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "All staff | Proben",
};

const NOBODY = { rows: [], total: 0, counts: { all: 0, active: 0, invited: 0, deactivated: 0 } };

// All staff (Figma 103:18355; row menu 103:18411; empty 103:18475; loading 103:18500), live from
// GET /api/identity/staff. ?preview=empty or ?preview=loading shows those frames.
export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string | string[] }>;
}) {
  // Not allowed here (e.g. a typed URL) → sent to Home; see lib/auth/access.ts.
  await requireAccess("viewStaff");
  const [{ preview }, directory] = await Promise.all([searchParams, getStaffDirectory()]);
  const initial =
    preview === "loading" ? undefined : preview === "empty" ? NOBODY : directory.initial;
  return (
    <TasksTemplate
      header={
        <DashboardHeader
          title="All staff"
          action={directory.canManage ? <AddStaffButton /> : null}
        />
      }
      fill
    >
      <AllStaff
        initial={initial}
        error={preview ? undefined : directory.error}
        canManage={directory.canManage}
        canAssignTasks={directory.canAssignTasks}
      />
    </TasksTemplate>
  );
}
