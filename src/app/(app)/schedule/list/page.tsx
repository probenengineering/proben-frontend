import type { Metadata } from "next";

import { PageHeading, SCHEDULE_VIEWS, ViewToggle } from "@/components/molecules";
import { DashboardHeader, DashboardTabs, MySchedule } from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";

// Moving here from another page waits for this page's data, keeping the current page on screen
// (with the progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

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
      <MySchedule />
    </TasksTemplate>
  );
}
