import type { Metadata } from "next";

import { PageHeading, ViewToggle } from "@/components/molecules";
import { DashboardHeader, DashboardTabs, WeekCalendar } from "@/components/organisms";
import { AppShell, TasksTemplate } from "@/components/templates";
import { DASHBOARD_TABS } from "@/lib/sample-dashboard";
import { CALENDAR_DAYS, CALENDAR_EVENTS } from "@/lib/sample-tasks";

export const metadata: Metadata = {
  title: "My Tasks | Proben",
};

export default function TasksCalendarPage() {
  return (
    <AppShell activeNav="home">
      <TasksTemplate
        dense
        header={<DashboardHeader greeting="Good morning, Alision" />}
        tabs={<DashboardTabs tabs={DASHBOARD_TABS} selected="My Tasks" />}
        heading={<PageHeading title="My task" description="Manage and track your assigned task" />}
        actions={<ViewToggle current="calendar" />}
      >
        <WeekCalendar
          monthLabel="October 2026"
          days={CALENDAR_DAYS}
          events={CALENDAR_EVENTS}
          startHour={7}
          endHour={17}
          timezone={["EST", "GMT-5"]}
        />
      </TasksTemplate>
    </AppShell>
  );
}
