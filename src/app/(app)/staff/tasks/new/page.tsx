import type { Metadata } from "next";

import { AssignTaskForm, DashboardHeader, StaffTasksNotice } from "@/components/organisms";
import { FormPageTemplate } from "@/components/templates";
import { loadAssignTask } from "@/lib/staff-api/tasks";
import { requireAccess } from "@/lib/auth/guard";

// Moving here from another page waits for this page, keeping the current page on screen (with the
// progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "Assign task | Proben",
};

// Assign task (Figma 103:20399). People come from the staff API; ?staff=<id> pre-fills Assign to.
export default async function AssignTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ staff?: string | string[] }>;
}) {
  // Not allowed here (e.g. a typed URL) → sent to Home; see lib/auth/access.ts.
  await requireAccess("assignTasks");
  const { staff } = await searchParams;
  const data = await loadAssignTask(typeof staff === "string" && staff ? staff : undefined);
  return (
    <FormPageTemplate header={<DashboardHeader title="Assign task" action={null} />}>
      {data.canAssign && !data.error ? (
        <AssignTaskForm options={data.options} preset={data.preset} homeScope={data.homeScope} />
      ) : (
        <StaffTasksNotice
          tone={data.canAssign ? "error" : "info"}
          message={data.error ?? "You don’t have permission to assign tasks. Ask an administrator."}
        />
      )}
    </FormPageTemplate>
  );
}
