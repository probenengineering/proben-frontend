"use client";

import { useState } from "react";

import { MonthDayCell } from "@/components/molecules";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { calendarHref } from "@/lib/calendar-view";
import type { MonthCalendarData, MonthCell } from "@/types/calendar";
import type { ScheduleItem } from "@/types/schedule";

import { CalendarDayPopover } from "./CalendarDayPopover";
import { CalendarToolbar } from "./CalendarToolbar";

// Month view (Figma 60:9128): toolbar, then a 12px-radius slate-200 grid: SUN … SAT header
// (Inter Bold 10/14 week-label, 34px) and 5–6 weeks of day cells. Clicking a day selects it and
// opens its day popover 10px to the right (Figma 60:9442); "Open day view" goes to the Day view.
// Below lg the grid keeps its width and scrolls sideways, like the week view.
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const utc = (key: string) => new Date(`${key}T00:00:00Z`);
const weekday = (key: string) =>
  utc(key).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }).toUpperCase();
/** "Tuesday, 23 October". */
const longLabel = (key: string) => {
  const part = (o: Intl.DateTimeFormatOptions) =>
    utc(key).toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
  return `${part({ weekday: "long" })}, ${part({ day: "numeric" })} ${part({ month: "long" })}`;
};
const itemsOf = (cell: MonthCell) =>
  cell.chips.flatMap((c): ScheduleItem[] => (c.item ? [c.item] : []));

export interface MonthCalendarProps {
  base: string;
  date: string;
  data: MonthCalendarData;
  /** Show "Add task" in the day popover: the person may assign tasks (org.manage). */
  canAddTask?: boolean;
}

export function MonthCalendar({ base, date, data, canAddTask = false }: MonthCalendarProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  return (
    <section className="flex w-full flex-col gap-4 p-4">
      <CalendarToolbar base={base} view="month" date={date} monthLabel={data.monthLabel} />
      <div className="overflow-x-auto">
        <div className="flex min-w-277 flex-col overflow-clip rounded-[12px] border border-slate-200 bg-white">
          <div className="flex border-b border-slate-200">
            {WEEKDAYS.map((d) => (
              <span key={d} className="flex-1 py-2.5 pl-3 type-ui-10 font-bold text-week-label">
                {d}
              </span>
            ))}
          </div>
          {data.weeks.map((week) => (
            <div key={week[0].key} className="flex [&:last-child>*]:border-b-0">
              {week.map((cell) => (
                <Popover
                  key={cell.key}
                  open={openKey === cell.key}
                  onOpenChange={(open) => setOpenKey(open ? cell.key : null)}
                >
                  <PopoverTrigger
                    render={<MonthDayCell cell={cell} selected={openKey === cell.key} />}
                  />
                  <PopoverContent
                    side="right"
                    align="center"
                    sideOffset={10}
                    className="w-93 gap-0 rounded-[20px] border border-slate-200 bg-white p-0 shadow-popover ring-0"
                  >
                    <CalendarDayPopover
                      weekday={weekday(cell.key)}
                      date={cell.day}
                      label={longLabel(cell.key)}
                      items={itemsOf(cell)}
                      dayHref={calendarHref(base, "day", cell.key)}
                      canAddTask={canAddTask}
                      onClose={() => setOpenKey(null)}
                    />
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
