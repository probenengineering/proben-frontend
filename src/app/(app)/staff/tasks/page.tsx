import type { Metadata } from "next";

import {
  AssignTaskButton,
  DashboardHeader,
  StaffTasksList,
  StaffTasksNotice,
} from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import { loadStaffTasks } from "@/lib/staff-api/tasks";
import { requireAccess } from "@/lib/auth/guard";

// Moving here from another page waits for this page, keeping the current page on screen (with the
// progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "Staff tasks | Proben",
};

const param = (value: string | string[] | undefined) =>
  typeof value === "string" && value ? value : undefined;

// Staff tasks (Figma 103:20163; task drawer 103:20222; after assigning 103:20339), live from
// Command Center's admin task list. ?task=<id> opens that task's drawer; ?added=<id> pins the task
// just assigned on top, highlighted.
export default async function StaffTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string | string[]; added?: string | string[] }>;
}) {
  // Not allowed here (e.g. a typed URL) → sent to Home; see lib/auth/access.ts.
  await requireAccess("viewTasks");
  const { task, added } = await searchParams;
  const data = await loadStaffTasks(param(task), param(added));
  return (
    <TasksTemplate
      header={
        <DashboardHeader
          title="Staff tasks"
          action={data.canAssign ? <AssignTaskButton /> : null}
        />
      }
    >
      {data.list ? (
        <StaffTasksList
          initial={data.list}
          manage={data.canAssign}
          openTask={data.open}
          addedTask={data.added}
        />
      ) : (
        <StaffTasksNotice
          tone={data.canView ? "error" : "info"}
          message={
            data.error ??
            "You don’t have access to staff tasks. Ask an administrator if you need it."
          }
        />
      )}
    </TasksTemplate>
  );
}
