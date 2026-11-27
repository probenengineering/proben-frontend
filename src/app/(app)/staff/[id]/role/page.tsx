import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssignRoleView, DashboardHeader } from "@/components/organisms";
import { FormPageTemplate } from "@/components/templates";
import { getAssignRole } from "@/lib/staff-api/roles";
import { requireAccess } from "@/lib/auth/guard";

// Moving here from another page waits for this page, keeping the current page on screen (with the
// progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "Assign role | Proben",
};

// Assign role (Figma 103:19418; confirm 103:19494; locked roles 103:19600): the person
// (GET /staff/{id}), the roles you may give them (GET /roles?staffId) and the permission catalogue.
export default async function AssignRolePage({ params }: { params: Promise<{ id: string }> }) {
  // Not allowed here (e.g. a typed URL) → sent to Home; see lib/auth/access.ts.
  await requireAccess("manageStaff");
  const { id } = await params;
  const data = await getAssignRole(id);
  if (!data) notFound();
  return (
    <FormPageTemplate header={<DashboardHeader title="Assign role" action={null} />}>
      {"error" in data ? (
        <AssignRoleView error={data.error} />
      ) : (
        <AssignRoleView key={data.staff.id} data={data} />
      )}
    </FormPageTemplate>
  );
}
