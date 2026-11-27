import type { Metadata } from "next";

import { DashboardHeader, HomeAssignmentsList } from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import { getHomeStaffing } from "@/lib/staff-api/home-staffing";
import { requireAccess } from "@/lib/auth/guard";

// Moving here from another page waits for this page, keeping the current page on screen (with the
// progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "Home assignments | Proben",
};

// Home assignments (Figma 103:20849), live from GET /api/identity/homes/assignments.
export default async function HomeAssignmentsPage() {
  // Not allowed here (e.g. a typed URL) → sent to Home; see lib/auth/access.ts.
  await requireAccess("viewStaff");
  const { homes, totals, error } = await getHomeStaffing();
  return (
    <TasksTemplate header={<DashboardHeader title="Home assignments" action={null} />}>
      <HomeAssignmentsList homes={homes} totals={totals} error={error} />
    </TasksTemplate>
  );
}
