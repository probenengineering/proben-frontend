"use client";

import { useState, useTransition } from "react";

import {
  CalendarDayColumn,
  CalendarDayHeader,
  type CalendarDayTone,
  CalendarSkeletonBlock,
  type PlacedEvent,
  WEEK_SKELETON,
} from "@/components/molecules";
import { CalendarEvent } from "@/components/molecules/CalendarEvent";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { calendarHref } from "@/lib/calendar-view";
import { completeEventAction } from "@/lib/command-center/schedule-actions";
import { showToast } from "@/lib/toast";
import type { ScheduleItem } from "@/types/schedule";

import { CalendarDayPopover } from "./CalendarDayPopover";
import { CalendarToolbar } from "./CalendarToolbar";
import { CalendarEventPopover } from "./CalendarEventPopover";
import { ScheduleDetailPanel } from "./ScheduleDetailPanel";

// Figma "Calendar Base": month nav + "Month" dropdown, then a week grid with hour labels on both
// sides (36px wide, 12px gaps). Clicking a day header opens the day agenda (60:7203); clicking an
// event or task opens its quick peek (60:7539), whose View details opens the detail panel.
// Shifts aren't clickable. Below lg the grid keeps its 1108px width and scrolls sideways (agreed).
export interface CalendarDay {
  /** "2026-10-23". */
  key: string;
  weekday: string;
  date: number;
  /** "Tuesday, 23 October". */
  label: string;
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
  /** Route the toolbar links point at ("/schedule" or "/tasks"). */
  base: string;
  /** "2026-10-25": the date in the URL (any day of the week shown). */
  date: string;
  /** Loading skeleton (Figma 60:8230): grey blocks instead of events, headers inert. */
  loading?: boolean;
}

function hourLabel(hour: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${hour < 12 ? "AM" : "PM"}`;
}

// Figma "text-xs/Medium": Inter Semi Bold 12/16 (no matching text token).
const labelClass = "shrink-0 font-inter text-xs leading-4 font-semibold text-calendar-label";
const keyOf = (item: ScheduleItem) => `${item.kind}-${item.id}`;

export function WeekCalendar({
  monthLabel,
  days,
  events,
  startHour,
  endHour,
  timezone,
  loading,
  base,
  date,
}: WeekCalendarProps) {
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [openEvent, setOpenEvent] = useState<string | null>(null);
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const local = (item: ScheduleItem): ScheduleItem =>
    completed.has(keyOf(item)) ? { ...item, status: "completed", canComplete: false } : item;
  const items = events.flatMap((e) => (e.item ? [{ day: e.day, item: local(e.item) }] : []));
  const detail = items.find((i) => keyOf(i.item) === detailKey)?.item ?? null;

  const complete = (item: ScheduleItem) => {
    if (!item.canComplete) return;
    const key = keyOf(item);
    setCompleted((prev) => new Set(prev).add(key));
    startTransition(async () => {
      const result = await completeEventAction(item.id);
      if (!result.ok) {
        setCompleted((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        showToast("error", result.error);
      }
    });
  };

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

  const renderEvent = (placed: PlacedEvent) => {
    const { start, duration, lane, lanes, item, ...event } = placed;
    void [start, duration, lane, lanes];
    if (!item) return <CalendarEvent {...event} />;
    const current = local(item);
    const key = keyOf(current);
    return (
      <Popover open={openEvent === key} onOpenChange={(open) => setOpenEvent(open ? key : null)}>
        <PopoverTrigger
          render={<button type="button" className="block size-full cursor-pointer" />}
          aria-label={`${current.title}, ${current.time}`}
        >
          <CalendarEvent {...event} selected={openEvent === key} />
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={8}
          className="w-75 gap-0 rounded-[16px] border border-slate-200 bg-white px-4 pt-3.5 pb-4 shadow-popover ring-0"
        >
          <CalendarEventPopover
            item={current}
            onComplete={() => complete(current)}
            onViewDetails={() => {
              setOpenEvent(null);
              setDetailKey(key);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <section className="flex w-full flex-col gap-4 p-4">
      <CalendarToolbar base={base} view="week" date={date} monthLabel={monthLabel} />

      <div className="overflow-x-auto">
        <div className="flex min-w-277 flex-col">
          <div className="flex gap-3 pl-12">
            <div className="flex flex-1">
              {days.map((day, d) => (
                <Popover
                  key={day.key}
                  open={openDay === d}
                  onOpenChange={(open) => setOpenDay(open ? d : null)}
                >
                  <PopoverTrigger
                    disabled={loading}
                    render={<button type="button" className="flex min-w-0 flex-1 cursor-pointer" />}
                    aria-label={`${day.label}: show the day’s agenda`}
                  >
                    <CalendarDayHeader
                      weekday={day.weekday}
                      date={day.date}
                      tone={day.tone}
                      selected={openDay === d}
                      last={d === days.length - 1}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    sideOffset={8}
                    className="w-93 gap-0 rounded-[20px] border border-slate-200 bg-white p-0 shadow-popover ring-0"
                  >
                    <CalendarDayPopover
                      weekday={day.weekday}
                      date={day.date}
                      label={day.label}
                      items={items.filter((i) => i.day === d).map((i) => i.item)}
                      dayHref={calendarHref(base, "day", day.key)}
                      onClose={() => setOpenDay(null)}
                    />
                  </PopoverContent>
                </Popover>
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
                  key={day.key}
                  hours={hours}
                  tone={day.tone}
                  selected={openDay === d}
                  last={d === days.length - 1}
                  events={(loading ? WEEK_SKELETON : events).filter((e) => e.day === d)}
                  renderEvent={loading ? (e) => <CalendarSkeletonBlock event={e} /> : renderEvent}
                />
              ))}
            </div>
            {labels("right")}
          </div>
        </div>
      </div>

      <ScheduleDetailPanel
        item={detail}
        onClose={() => setDetailKey(null)}
        onComplete={complete}
        pending={pending}
      />
    </section>
  );
}
