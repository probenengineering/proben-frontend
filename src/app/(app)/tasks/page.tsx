import type { Metadata } from "next";

import { DashboardHeader, DashboardTabs, MyTasks } from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";

// Moving here from another page waits for this page's data, keeping the current page on screen
// (with the progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "My Tasks | Proben",
};

// My tasks (Figma 60:11012): the task table. The calendar lives under Today's Schedule.
export default function TasksPage() {
  return (
    <TasksTemplate
      header={<DashboardHeader />}
      tabs={<DashboardTabs tabs={DASHBOARD_TABS} selected="My Tasks" />}
    >
      <MyTasks />
    </TasksTemplate>
  );
}
