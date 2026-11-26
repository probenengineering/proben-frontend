import "server-only";

import type { CalendarDay, CalendarEventData } from "@/components/organisms/WeekCalendar";
import { ApiError, errorMessage } from "@/lib/auth/api";
import { getAccessToken, sessionEnded } from "@/lib/auth/session";
import type { TaskRecord, TaskRecordStatus } from "@/lib/tasks";

import type { ScheduleItem } from "@/types/schedule";

import { getTimezone, listEvents, listHomes, listShifts, listTasks, requestTime } from "./api";
import { weekStartOf } from "@/lib/calendar-view";

import { eventItem, taskItem, untimed } from "./schedule-items";
import {
  addDays,
  dayKey,
  formatDay,
  formatTime,
  hourOfDay,
  localDateTime,
  startOfDay,
  timezoneLabels,
} from "./time";
import type { ApiTaskStatus } from "./types";

// My Tasks from the Command Center API. List: GET /tasks. Calendar (this week, Sun–Sat in the
// home's timezone): your shifts (green), calendar events (blue) and task due times (amber).

const STATUS: Partial<Record<ApiTaskStatus, TaskRecordStatus>> = {
  upcoming: "pending",
  needs_attention: "pending",
  in_progress: "in-progress",
  // Submitted = waiting for manager review: In progress, not Completed (GET /tasks).
  submitted: "in-progress",
  completed: "completed",
};

function handle(error: unknown) {
  if (error instanceof ApiError && error.status === 401) sessionEnded(error);
  return errorMessage(error);
}

export interface TaskList {
  tasks: TaskRecord[];
  /** "2026-11-20" in the home's timezone. */
  today: string;
  error?: string;
}

export async function getTaskList(): Promise<TaskList> {
  if (!(await getAccessToken())) return { tasks: [], today: "" };
  try {
    const [page, tz] = await Promise.all([listTasks(), getTimezone()]);
    const tasks = page.items.flatMap((task): TaskRecord[] => {
      const status = STATUS[task.status];
      // Cancelled tasks and tasks without a due date have no place in the day groups.
      if (!status || !task.dueAt) return [];
      return [
        {
          id: task.id,
          name: task.title,
          description: task.description ?? "",
          due: localDateTime(task.dueAt, tz),
          status,
        },
      ];
    });
    return { tasks, today: dayKey(await requestTime(), tz) };
  } catch (error) {
    return { tasks: [], today: "", error: handle(error) };
  }
}

export interface TaskCalendar {
  monthLabel: string;
  days: CalendarDay[];
  events: CalendarEventData[];
  startHour: number;
  endHour: number;
  timezone: [string, string];
  error?: string;
}

export type CalendarItem = {
  startsAt: string;
  endsAt: string;
  title: string;
  color: CalendarEventData["color"];
  /** Events and tasks: what the popovers and detail panel show. Shifts have none. */
  item?: ScheduleItem;
};

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** The empty week around `focus`: days, month label, hours and zone (also the loading skeleton). */
export function weekShell(focus: string | undefined, now: number, zone: string): TaskCalendar {
  const today = dayKey(now, zone);
  const sunday = weekStartOf(focus ?? today);
  const keys = Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
  return {
    monthLabel: formatDay(focus ?? today, { month: "long", year: "numeric" }),
    days: keys.map((key, i) => ({
      key,
      weekday: WEEKDAYS[i],
      date: Number(key.slice(8)),
      label: `${formatDay(key, { weekday: "long" })}, ${formatDay(key, { day: "numeric" })} ${formatDay(key, { month: "long" })}`,
      tone: key === today ? "today" : i === 0 || i === 6 ? "weekend" : undefined,
    })),
    events: [],
    startHour: 7,
    endHour: 17,
    timezone: timezoneLabels(now, zone),
  };
}

/** Week view around `focus` ("2026-10-25"; defaults to today). */
export async function getTaskCalendar(focus?: string): Promise<TaskCalendar> {
  const tz = (await getAccessToken()) ? await getTimezone() : undefined;
  const zone = tz ?? "UTC";
  const now = await requestTime();
  const sunday = weekStartOf(focus ?? dayKey(now, zone));
  const keys = Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
  const base = weekShell(focus, now, zone);
  if (!tz) return base;

  try {
    const range = { from: startOfDay(sunday, tz), to: startOfDay(addDays(sunday, 7), tz) };
    const items = await loadCalendarItems(range, tz, now);
    const placed = items.flatMap((item) => place(item, keys, tz));
    return { ...base, ...hourRange(placed), events: withLanes(placed) };
  } catch (error) {
    return { ...base, error: handle(error) };
  }
}

/** Puts an item on its start day; one that runs past midnight is cut at the day's end. */
export function place(item: CalendarItem, keys: string[], tz: string): CalendarEventData[] {
  const day = keys.indexOf(dayKey(item.startsAt, tz));
  if (day < 0) return [];
  const start = hourOfDay(item.startsAt, tz);
  const end = dayKey(item.endsAt, tz) === keys[day] ? hourOfDay(item.endsAt, tz) : 24;
  return [
    {
      day,
      start,
      duration: Math.max(0.5, end - start),
      time: formatTime(item.startsAt, tz),
      title: item.title,
      color: item.color,
      ...(item.item && { item: item.item }),
    },
  ];
}

/** Figma shows 7 AM – 5 PM; widen to fit anything earlier or later. */
export function hourRange(events: CalendarEventData[]) {
  let startHour = 7;
  let endHour = 17;
  for (const e of events) {
    startHour = Math.min(startHour, Math.floor(e.start));
    endHour = Math.max(endHour, Math.min(23, Math.ceil(e.start + e.duration) - 1));
  }
  return { startHour, endHour };
}

/** Side-by-side lanes for overlapping events on the same day. */
export function withLanes(events: CalendarEventData[]) {
  const out: CalendarEventData[] = [];
  for (let day = 0; day < 7; day++) {
    const list = events.filter((e) => e.day === day).sort((a, b) => a.start - b.start);
    let group: CalendarEventData[] = [];
    let groupEnd = -1;
    const flush = () => {
      const laneEnds: number[] = [];
      const laned = group.map((e) => {
        let lane = laneEnds.findIndex((end) => end <= e.start);
        if (lane < 0) lane = laneEnds.length;
        laneEnds[lane] = e.start + e.duration;
        return { ...e, lane };
      });
      const lanes = laneEnds.length;
      out.push(...laned.map((e) => (lanes > 1 ? { ...e, lanes } : { ...e, lane: undefined })));
      group = [];
    };
    for (const e of list) {
      if (group.length && e.start >= groupEnd) flush();
      group.push(e);
      groupEnd = Math.max(groupEnd, e.start + e.duration);
    }
    if (group.length) flush();
  }
  return out;
}

/** Your shifts (green), events (blue) and task due times (amber) in a range, with the
 * ScheduleItem the popovers and panels show. Shared by the day, week and month views. */
export async function loadCalendarItems(
  range: { from: number; to: number },
  tz: string,
  now: number,
): Promise<CalendarItem[]> {
  const [shifts, events, tasks, homes] = await Promise.all([
    listShifts(range),
    listEvents(range),
    listTasks(),
    listHomes().catch(() => null),
  ]);
  const ctx = {
    tz,
    now,
    zoneLabel: timezoneLabels(now, tz)[0],
    homeName: (id?: string | null) => homes?.items.find((h) => h.id === id)?.name,
  };
  return [
    ...shifts.items
      .filter((s) => s.status !== "cancelled")
      .map((s) => ({ ...s, title: s.home?.name ?? s.title, color: "green" as const })),
    ...events.items.map((e) => ({
      ...e,
      color: "blue" as const,
      item: untimed(eventItem(e, ctx)),
    })),
    ...tasks.items.flatMap((t) => {
      const item = taskItem(t, ctx);
      return item && t.dueAt
        ? [
            {
              startsAt: t.dueAt,
              endsAt: new Date(Date.parse(t.dueAt) + 30 * 60_000).toISOString(),
              title: t.title,
              color: "amber" as const,
              item: untimed(item),
            },
          ]
        : [];
    }),
  ];
}
