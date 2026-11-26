
import { EmptyPanel } from "@/components/molecules";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAccessToken } from "@/lib/auth/session";
import { userCan } from "@/lib/auth/user";
import { type CalendarParams, parseCalendarParams } from "@/lib/calendar-view";
import { getTimezone, requestTime } from "@/lib/command-center/api";
import { getDayCalendar, getMonthCalendar } from "@/lib/command-center/calendar-views";
import { dayKey, FALLBACK_TIMEZONE } from "@/lib/command-center/time";

import { DayCalendar } from "./DayCalendar";
import { MonthCalendar } from "./MonthCalendar";
import { WeekCalendarData } from "./WeekCalendarData";

// Calendar body for /schedule and /tasks: Day, Week or Month for the date in the URL
// (`?view=day&date=2026-10-25`, defaults to this week). Reads the session and the search params,
// so render it below a <Suspense> (the app layout's). A load error shows above the (empty)
// calendar.
export interface MyTaskCalendarProps {
  /** "/schedule" or "/tasks": where the toolbar and day links point. */
  base: string;
  searchParams: Promise<CalendarParams>;
}

export async function MyTaskCalendar({ base, searchParams }: MyTaskCalendarProps) {
  const tz = (await getAccessToken()) ? await getTimezone() : FALLBACK_TIMEZONE;
  const now = await requestTime();
  const today = dayKey(now, tz);
  const { view, date } = parseCalendarParams(await searchParams, today);
  // "Add task" is for people who may assign tasks (POST /admin/tasks needs org.manage).
  const canAddTask = await userCan(PERMISSIONS.manageOrg);

  if (view === "day") {
    const data = await getDayCalendar(date);
    return (
      <>
        {data.error && <EmptyPanel message={data.error} />}
        <DayCalendar base={base} data={data} canAddTask={canAddTask} />
      </>
    );
  }
  if (view === "month") {
    const data = await getMonthCalendar(date);
    return (
      <>
        {data.error && <EmptyPanel message={data.error} />}
        <MonthCalendar base={base} date={date} data={data} canAddTask={canAddTask} />
      </>
    );
  }
  // Loaded with the page: moving between weeks keeps the current week on screen until the next
  // one is ready (the layout's progress bar shows meanwhile), rather than emptying it first.
  return <WeekCalendarData base={base} date={date} canAddTask={canAddTask} />;
}
