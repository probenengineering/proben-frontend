import type { Metadata } from "next";

import { PageHeading, SCHEDULE_VIEWS, ViewToggle } from "@/components/molecules";
import { DashboardHeader, DashboardTabs, MyTaskCalendar } from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";
import type { CalendarParams } from "@/lib/calendar-view";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";

// Moving here from another page waits for this page's data, keeping the current page on screen
// (with the progress bar) instead of flashing a skeleton; the app layout covers a first visit.
export const instant = false;

export const metadata: Metadata = {
  title: "Schedule | Proben",
};

// Today's Schedule, calendar view (Figma 60:6134 empty, 60:6444 with events).
export default function ScheduleCalendarPage({
  searchParams,
}: {
  searchParams: Promise<CalendarParams>;
}) {
  return (
    <TasksTemplate
      dense
      header={<DashboardHeader />}
      tabs={<DashboardTabs tabs={DASHBOARD_TABS} selected="Today’s Schedule" />}
      heading={
        <PageHeading title="Schedule" description="See your current schedule and assignments" />
      }
      actions={<ViewToggle current="calendar" views={SCHEDULE_VIEWS} />}
    >
      <MyTaskCalendar base="/schedule" searchParams={searchParams} />
    </TasksTemplate>
  );
}
