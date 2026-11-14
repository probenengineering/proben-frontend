import type { Metadata } from "next";

import { PageHeading, ViewToggle } from "@/components/molecules";
import { DashboardHeader, DashboardTabs, TaskGroup } from "@/components/organisms";
import { AppShell, TasksTemplate } from "@/components/templates";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";
import { TASK_GROUPS } from "@/lib/sample-tasks";

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
        actions={<ViewToggle current="list" filterLabel="Due soon" />}
      >
        {TASK_GROUPS.map((group) => (
          <TaskGroup key={group.title} {...group} />
        ))}
      </TasksTemplate>
    </AppShell>
  );
}
