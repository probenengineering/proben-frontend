import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { ScheduleItem } from "@/types/schedule";

import { type CalendarDayTone, dayToneClass } from "./CalendarDayHeader";
import { CalendarEvent, type CalendarEventProps } from "./CalendarEvent";

// One day of the week grid: 72px hour cells (white-200 half-hour line, calendar-line hour line),
// a calendar-line right edge (except the last day) and absolutely placed events.
// Overlapping events share the width via lane/lanes; each leaves 1px for the column line.
// Selected (day popover open, Figma 60:7203): green-tint fill. `renderEvent` lets the calendar
// draw each event inside its popover trigger.
const HOUR_HEIGHT = 72;

export interface PlacedEvent extends CalendarEventProps {
  /** Start in hours, e.g. 9.5 = 9:30. */
  start: number;
  /** Length in hours. */
  duration: number;
  lane?: number;
  lanes?: number;
  /** Events and tasks: what the popovers show. Shifts have none. */
  item?: ScheduleItem;
}

export interface CalendarDayColumnProps {
  hours: number[];
  tone?: CalendarDayTone;
  last?: boolean;
  selected?: boolean;
  events: PlacedEvent[];
  renderEvent?: (event: PlacedEvent) => ReactNode;
}

function plainEvent(placed: PlacedEvent) {
  const { start, duration, lane, lanes, item, ...event } = placed;
  void [start, duration, lane, lanes, item];
  return <CalendarEvent {...event} />;
}

export function CalendarDayColumn({
  hours,
  tone = "weekday",
  last,
  selected,
  events,
  renderEvent = plainEvent,
}: CalendarDayColumnProps) {
  const firstHour = hours[0] ?? 0;
  return (
    <div
      className={cn(
        "relative min-w-0 flex-1 border-calendar-line",
        !last && "border-r",
        selected ? "bg-green-tint" : dayToneClass[tone],
      )}
    >
      {hours.map((hour) => (
        <div key={hour} className="h-18 border-b border-calendar-line">
          <div className="h-9 border-b border-white-200" />
        </div>
      ))}
      {events.map((event) => {
        const { start, duration, lane = 0, lanes = 1 } = event;
        return (
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
            {renderEvent(event)}
          </div>
        );
      })}
    </div>
  );
}
