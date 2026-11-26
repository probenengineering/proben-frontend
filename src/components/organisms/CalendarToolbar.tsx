import { MonthNav, ViewSelect } from "@/components/molecules";
import { type CalendarView, calendarHref, shiftDate } from "@/lib/calendar-view";

// Calendar header (Figma "Header" 60:8572): ‹ October 2026 › on the left (arrows move a day, week
// or month), the Day / Week / Month dropdown on the right.
export interface CalendarToolbarProps {
  base: string;
  view: CalendarView;
  date: string;
  monthLabel: string;
}

const UNIT = { day: "day", week: "week", month: "month" };

export function CalendarToolbar({ base, view, date, monthLabel }: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <MonthNav
        label={monthLabel}
        prevHref={calendarHref(base, view, shiftDate(view, date, -1))}
        nextHref={calendarHref(base, view, shiftDate(view, date, 1))}
        prevLabel={`Previous ${UNIT[view]}`}
        nextLabel={`Next ${UNIT[view]}`}
      />
      <ViewSelect base={base} view={view} date={date} />
    </div>
  );
}
