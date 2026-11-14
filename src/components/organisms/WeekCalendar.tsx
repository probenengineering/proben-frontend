import { Chip } from "@/components/atoms";
import {
  CalendarDayColumn,
  CalendarDayHeader,
  type CalendarDayTone,
  MonthNav,
  type PlacedEvent,
} from "@/components/molecules";

// Figma "Calendar Base": month nav + "Month" dropdown, then a week grid with hour labels on both
// sides (36px wide, 12px gaps). Below lg the grid keeps its desktop width (1108px) and scrolls
// sideways (agreed).
export interface CalendarDay {
  weekday: string;
  date: number;
  tone?: CalendarDayTone;
}

export interface CalendarEventData extends PlacedEvent {
  /** Column index, 0 = first day shown. */
  day: number;
}

export interface WeekCalendarProps {
  monthLabel: string;
  days: CalendarDay[];
  events: CalendarEventData[];
  /** First and last hour rows, 24h clock. */
  startHour: number;
  endHour: number;
  timezone: [string, string];
}

function hourLabel(hour: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${hour < 12 ? "AM" : "PM"}`;
}

// Figma "text-xs/Medium": Inter Semi Bold 12/16 (no matching text token).
// Left labels are 36px; the right column is 48px so "GMT-5" fits (Figma "EST GMT-5" frame).
const labelClass = "shrink-0 font-inter text-xs leading-4 font-semibold text-calendar-label";

export function WeekCalendar({
  monthLabel,
  days,
  events,
  startHour,
  endHour,
  timezone,
}: WeekCalendarProps) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const labels = (side: "left" | "right") => (
    <div className={`${labelClass} ${side === "left" ? "w-9" : "w-12"}`}>
      {hours.map((hour) => (
        <div key={hour} className="h-18">
          {hourLabel(hour)}
        </div>
      ))}
    </div>
  );

  return (
    <section className="flex w-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <MonthNav label={monthLabel} />
        <Chip trailingIcon="chevron-down-18">Month</Chip>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-277 flex-col">
          <div className="flex gap-3 pl-12">
            <div className="flex flex-1">
              {days.map((day, i) => (
                <CalendarDayHeader key={day.date} {...day} last={i === days.length - 1} />
              ))}
            </div>
            <p className={`${labelClass} w-12`}>
              {timezone[0]}
              <br />
              {timezone[1]}
            </p>
          </div>

          <div className="flex gap-3">
            {labels("left")}
            <div className="flex flex-1">
              {days.map((day, d) => (
                <CalendarDayColumn
                  key={day.date}
                  hours={hours}
                  tone={day.tone}
                  last={d === days.length - 1}
                  events={events.filter((e) => e.day === d)}
                />
              ))}
            </div>
            {labels("right")}
          </div>
        </div>
      </div>
    </section>
  );
}
