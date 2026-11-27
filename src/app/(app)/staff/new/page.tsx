import type { Metadata } from "next";

import { AddStaffForm, DashboardHeader } from "@/components/organisms";
import { FormPageTemplate } from "@/components/templates";
import { getStaffFormSetup } from "@/lib/staff-api/staff-form-options";
import { requireAccess } from "@/lib/auth/guard";

// Moving here from another page waits for this page's data, keeping the current page on screen
// (with the progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "Add staff | Proben",
};

// Add staff (Figma 103:18646; validation errors 103:18725; created 103:18807). Roles, homes and
// departments come from the identity API; Create saves the person (POST /staff).
export default async function AddStaffPage() {
  // Not allowed here (e.g. a typed URL) → sent to Home; see lib/auth/access.ts.
  await requireAccess("manageStaff");
  const { options, canManage, error } = await getStaffFormSetup();
  return (
    <FormPageTemplate header={<DashboardHeader title="Add staff" action={null} />}>
      <AddStaffForm options={options} canManage={canManage} loadError={error} />
    </FormPageTemplate>
  );
}
