import { EmptyPanel } from "@/components/molecules";
import { getTaskCalendar } from "@/lib/command-center/tasks";

import { WeekCalendar } from "./WeekCalendar";

// Loads the week around `date` and renders it. MyTaskCalendar wraps it in <Suspense> with the
// loading skeleton (Figma 60:8230). A load error shows above the (empty) calendar.
export interface WeekCalendarDataProps {
  base: string;
  date: string;
}

export async function WeekCalendarData({ base, date }: WeekCalendarDataProps) {
  const { error, ...calendar } = await getTaskCalendar(date);
  return (
    <>
      {error && <EmptyPanel message={error} />}
      <WeekCalendar {...calendar} base={base} date={date} />
    </>
  );
}
