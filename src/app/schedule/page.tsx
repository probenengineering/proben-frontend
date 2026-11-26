import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeading, SCHEDULE_VIEWS, ViewToggle } from "@/components/molecules";
import { DashboardHeader, DashboardTabs, MyTaskCalendar } from "@/components/organisms";
import { AppShell, TasksTemplate } from "@/components/templates";
import type { CalendarParams } from "@/lib/calendar-view";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";

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
    <AppShell activeNav="home">
      <TasksTemplate
        dense
        header={<DashboardHeader />}
        tabs={<DashboardTabs tabs={DASHBOARD_TABS} selected="Today’s Schedule" />}
        heading={
          <PageHeading title="Schedule" description="See your current schedule and assignments" />
        }
        actions={<ViewToggle current="calendar" views={SCHEDULE_VIEWS} />}
      >
        <Suspense>
          <MyTaskCalendar base="/schedule" searchParams={searchParams} />
        </Suspense>
      </TasksTemplate>
    </AppShell>
  );
}
