"use client";

import { Button, Icon } from "@/components/atoms";
import { DayEventCard } from "@/components/molecules";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { itemKey, useScheduleActions } from "@/hooks/useScheduleActions";
import { formatDay } from "@/lib/command-center/time";
import type { DayCalendarData } from "@/types/calendar";

import { CalendarEventPopover } from "./CalendarEventPopover";
import { CalendarToolbar } from "./CalendarToolbar";
import { DaySidebar } from "./DaySidebar";
import { ScheduleDetailPanel } from "./ScheduleDetailPanel";

// Day view (Figma 60:8532; empty 60:8851): toolbar, then the timeline (date + "Today" pill +
// count, 72px hour rows with half-hour lines, event cards, red now line) beside DaySidebar.
// Clicking an event opens its quick peek → detail panel. "Add a task" shows only with
// `canAddTask` (org.manage) and isn't wired yet. Below lg the sidebar stacks underneath.
const HOUR = 72;
const hourLabel = (hour: number) => `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;

export interface DayCalendarProps {
  base: string;
  data: DayCalendarData;
  /** Show "Add a task" on an empty day: the person may assign tasks (org.manage). */
  canAddTask?: boolean;
}

export function DayCalendar({ base, data, canAddTask = false }: DayCalendarProps) {
  const actions = useScheduleActions();
  const hours = Array.from(
    { length: data.endHour - data.startHour + 1 },
    (_, i) => data.startHour + i,
  );
  const top = (hour: number) => (hour - data.startHour) * HOUR;
  const items = data.events.flatMap((e) => (e.item ? [actions.local(e.item)] : []));
  const detail = items.find((i) => itemKey(i) === actions.detailKey) ?? null;
  const count = data.summary.total;
  const longDate = `${formatDay(data.focus, { weekday: "long" })}, ${data.date} ${formatDay(data.focus, { month: "short" })}`;

  return (
    <section className="flex w-full flex-col gap-4 p-4">
      <CalendarToolbar base={base} view="day" date={data.focus} monthLabel={data.monthLabel} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 bg-white">
          <div className="flex items-center gap-3 pt-1 pb-3 pl-14">
            <span className="flex flex-col font-inter">
              <span className="type-ui-10 font-bold text-week-label">{data.weekday}</span>
              {/* Figma: Inter Medium 22/30, as in the week headers (no text token). */}
              <span className="text-[22px] leading-7.5 font-medium text-black">{data.date}</span>
            </span>
            {data.today && (
              <span className="rounded-full bg-green-500 px-2 py-0.5 type-ui-12 font-medium text-white">
                Today
              </span>
            )}
            <span className="ml-auto type-ui-12 text-slate-500">
              {count === 0 ? "No tasks" : `${count} task${count === 1 ? "" : "s"}`}
            </span>
          </div>

          <div className="relative" style={{ height: hours.length * HOUR }}>
            {hours.map((hour) => (
              <div key={hour} className="absolute inset-x-0" style={{ top: top(hour) }}>
                <span className="absolute left-0 font-inter text-xs leading-4 font-semibold text-week-label">
                  {hourLabel(hour)}
                </span>
                <div
                  className={`absolute right-2 left-14 h-18 border border-white ${data.today ? "bg-calendar-today" : "bg-white-50"}`}
                >
                  <div className="mt-8.75 h-px bg-white" />
                </div>
              </div>
            ))}

            {data.events.map((event, i) => {
              const style = {
                top: top(event.start) + 2,
                height: Math.max(28, event.duration * HOUR - 4),
              };
              const current = event.item ? actions.local(event.item) : undefined;
              const key = current ? itemKey(current) : `shift-${i}`;
              const card = (
                <DayEventCard
                  time={event.time}
                  title={event.title}
                  subtitle={event.subtitle}
                  color={event.color}
                  duration={event.duration}
                  done={current?.status === "completed"}
                  selected={actions.openKey === key}
                />
              );
              return (
                <div key={key} className="absolute right-3 left-15" style={style}>
                  {current ? (
                    <Popover
                      open={actions.openKey === key}
                      onOpenChange={(open) => actions.setOpenKey(open ? key : null)}
                    >
                      <PopoverTrigger
                        render={<button type="button" className="block size-full cursor-pointer" />}
                        aria-label={`${current.title}, ${event.time}`}
                      >
                        {card}
                      </PopoverTrigger>
                      <PopoverContent
                        side="right"
                        align="start"
                        sideOffset={8}
                        className="w-75 gap-0 rounded-[16px] border border-slate-200 bg-white px-4 pt-3.5 pb-4 shadow-popover ring-0"
                      >
                        <CalendarEventPopover
                          item={current}
                          onComplete={() => actions.complete(current)}
                          onViewDetails={() => actions.showDetails(current)}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    card
                  )}
                </div>
              );
            })}

            {data.now && data.now.hour >= data.startHour && data.now.hour <= data.endHour + 1 && (
              <div
                className="pointer-events-none absolute inset-x-0"
                style={{ top: top(data.now.hour) }}
              >
                <span className="absolute left-3.5 -translate-y-1/2 type-ui-10 font-semibold text-danger-500">
                  {data.now.label}
                </span>
                <span className="absolute left-12.75 size-2.5 -translate-y-1/2 rounded-full bg-danger-500" />
                <span className="absolute right-2 left-14 h-0.5 -translate-y-1/2 bg-danger-500" />
              </div>
            )}

            {data.events.length === 0 && (
              <div className="absolute top-24 left-1/2 flex w-77.5 max-w-[calc(100%-4rem)] -translate-x-1/2 flex-col items-center gap-3 rounded-[16px] border border-slate-200 bg-white px-8 py-7 text-center shadow-card">
                <span className="flex size-14 items-center justify-center rounded-full bg-green-500/12">
                  <Icon name="calendar-green" size={26} />
                </span>
                <p className="type-ui-16 font-semibold text-slate-900">No tasks on this day</p>
                <p className="type-ui-13-20 text-slate-500">Nothing is scheduled for {longDate}.</p>
                {/* Admins only (org.manage). Not wired yet: there's no add-task form in Figma. */}
                {canAddTask && (
                  <Button variant="green" size="pill" className="px-4">
                    Add a task
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <DaySidebar
          base={base}
          data={data}
          upNextStatus={
            data.summary.upNext ? actions.local(data.summary.upNext.item).status : undefined
          }
        />
      </div>

      <ScheduleDetailPanel
        item={detail}
        onClose={actions.closeDetails}
        onComplete={actions.complete}
        pending={actions.pending}
      />
    </section>
  );
}
