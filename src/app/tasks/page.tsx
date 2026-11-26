import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardHeader, DashboardTabs, MyTasks, TaskTableSkeleton } from "@/components/organisms";
import { AppShell, TasksTemplate } from "@/components/templates";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";

export const metadata: Metadata = {
  title: "My Tasks | Proben",
};

// My tasks (Figma 60:11012): the task table. The calendar lives under Today's Schedule.
export default function TasksPage() {
  return (
    <AppShell activeNav="home">
      <TasksTemplate
        header={<DashboardHeader />}
        tabs={<DashboardTabs tabs={DASHBOARD_TABS} selected="My Tasks" />}
      >
        <Suspense fallback={<TaskTableSkeleton />}>
          <MyTasks />
        </Suspense>
      </TasksTemplate>
    </AppShell>
  );
}
