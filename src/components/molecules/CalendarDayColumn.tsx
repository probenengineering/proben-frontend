import { cn } from "@/lib/utils";

import { type CalendarDayTone, dayToneClass } from "./CalendarDayHeader";
import { CalendarEvent, type CalendarEventProps } from "./CalendarEvent";

// One day of the week grid: 72px hour cells (white-200 half-hour line, calendar-line hour line),
// a calendar-line right edge (except the last day) and absolutely placed events.
// Overlapping events share the width via lane/lanes; each leaves 1px for the column line.
const HOUR_HEIGHT = 72;

export interface PlacedEvent extends CalendarEventProps {
  /** Start in hours, e.g. 9.5 = 9:30. */
  start: number;
  /** Length in hours. */
  duration: number;
  lane?: number;
  lanes?: number;
}

export interface CalendarDayColumnProps {
  hours: number[];
  tone?: CalendarDayTone;
  last?: boolean;
  events: PlacedEvent[];
}

export function CalendarDayColumn({
  hours,
  tone = "weekday",
  last,
  events,
}: CalendarDayColumnProps) {
  const firstHour = hours[0] ?? 0;
  return (
    <div
      className={cn(
        "relative min-w-0 flex-1 border-calendar-line",
        !last && "border-r",
        dayToneClass[tone],
      )}
    >
      {hours.map((hour) => (
        <div key={hour} className="h-18 border-b border-calendar-line">
          <div className="h-9 border-b border-white-200" />
        </div>
      ))}
      {events.map(({ start, duration, lane = 0, lanes = 1, ...event }) => (
        <div
          key={`${start}-${lane}-${event.title}`}
          className="absolute"
          style={{
            top: (start - firstHour) * HOUR_HEIGHT,
            height: duration * HOUR_HEIGHT,
            left: `${(lane / lanes) * 100}%`,
            width: `calc(${100 / lanes}% - 1px)`,
          }}
        >
          <CalendarEvent {...event} />
        </div>
      ))}
    </div>
  );
}
