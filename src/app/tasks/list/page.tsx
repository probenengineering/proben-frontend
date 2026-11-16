import type { Metadata } from "next";

import { PageHeading } from "@/components/molecules";
import { DashboardHeader, DashboardTabs, TaskListBoard } from "@/components/organisms";
import { AppShell, TasksTemplate } from "@/components/templates";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";
import { SAMPLE_TODAY, TASK_RECORDS } from "@/lib/sample-tasks";

export const metadata: Metadata = {
  title: "My Tasks | Proben",
};

export default function TasksListPage() {
  return (
    <AppShell activeNav="home">
      <TasksTemplate
        header={<DashboardHeader greeting="Good morning, Alision" />}
        tabs={<DashboardTabs tabs={DASHBOARD_TABS} selected="My Tasks" />}
        heading={<PageHeading title="My task" description="Manage and track your assigned task" />}
      >
        <TaskListBoard tasks={TASK_RECORDS} today={SAMPLE_TODAY} />
      </TasksTemplate>
    </AppShell>
  );
}
