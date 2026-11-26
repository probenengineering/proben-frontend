import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeading, SCHEDULE_VIEWS, ViewToggle } from "@/components/molecules";
import {
  DashboardHeader,
  DashboardTabs,
  MySchedule,
  ScheduleListSkeleton,
} from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";

export const metadata: Metadata = {
  title: "Schedule | Proben",
};

// Today's Schedule, list view (Figma 60:6752) with the detail panel (60:6829).
export default function ScheduleListPage() {
  return (
    <TasksTemplate
      dense
      header={<DashboardHeader />}
      tabs={<DashboardTabs tabs={DASHBOARD_TABS} selected="Today’s Schedule" />}
      heading={
        <PageHeading title="Schedule" description="See your current schedule and assignments" />
      }
      actions={<ViewToggle current="list" views={SCHEDULE_VIEWS} />}
    >
      <Suspense fallback={<ScheduleListSkeleton />}>
        <MySchedule />
      </Suspense>
    </TasksTemplate>
  );
}
