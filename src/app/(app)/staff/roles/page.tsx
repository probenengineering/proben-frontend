import type { Metadata } from "next";

import { DashboardHeader, RolesOverview } from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import { getRolesOverview } from "@/lib/staff-api/roles";
import { requireAccess } from "@/lib/auth/guard";

// Moving here from another page waits for this page, keeping the current page on screen (with the
// progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "Roles & permissions | Proben",
};

// Roles & permissions (Figma 103:20605): every role with its staff count (GET /roles) and the
// permission matrix from the catalogue (GET /permissions).
export default async function RolesPage() {
  // Not allowed here (e.g. a typed URL) → sent to Home; see lib/auth/access.ts.
  await requireAccess("viewRoles");
  const data = await getRolesOverview();
  return (
    <TasksTemplate header={<DashboardHeader title="Roles & permissions" action={null} />}>
      <RolesOverview data={data} />
    </TasksTemplate>
  );
}
