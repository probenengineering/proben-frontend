import type { ScheduleItem, ScheduleStatus } from "@/types/schedule";

import { dayKey, formatDay, formatTime } from "./time";
import type { ApiEvent, ApiTask } from "./types";

// Maps Command Center events and tasks to ScheduleItem, shared by the Schedule list
// (schedule.ts) and the calendar popovers (tasks.ts). Pure; times in the home's zone.

export interface ItemContext {
  tz: string;
  now: number;
  /** "WAT", for the panel's time row. */
  zoneLabel: string;
  homeName: (id?: string | null) => string | undefined;
}

/** A ScheduleItem plus its start instant, for sorting and placing. */
export type TimedItem = ScheduleItem & { at: number };

/** "9:00 – 10:00 AM": one AM/PM when both ends share it. */
export function timeRange(start: string, end: string, tz: string) {
  const a = formatTime(start, tz);
  const b = formatTime(end, tz);
  const [aTime, aHalf] = a.split(" ");
  return aHalf && b.endsWith(aHalf) ? `${aTime} – ${b}` : `${a} – ${b}`;
}

/** "Thursday, 25 Oct" (or "… 2026" with the year). */
export const dayLabel = (key: string, year = false) =>
  `${formatDay(key, { weekday: "long" })}, ${formatDay(key, { day: "numeric" })} ${formatDay(key, { month: "short" })}${year ? ` ${key.slice(0, 4)}` : ""}`;

function eventStatus(e: ApiEvent, now: number): ScheduleStatus {
  if (e.completedAt) return "completed";
  if (now >= Date.parse(e.endsAt)) return "overdue";
  return now >= Date.parse(e.startsAt) ? "in_progress" : "upcoming";
}

function taskStatus(t: ApiTask): ScheduleStatus {
  if (t.status === "completed" || t.status === "submitted") return "completed";
  if (t.isOverdue) return "overdue";
  return t.status === "in_progress" ? "in_progress" : "upcoming";
}

export function eventItem(e: ApiEvent, ctx: ItemContext): TimedItem {
  const day = dayKey(e.startsAt, ctx.tz);
  const home = ctx.homeName(e.homeId);
  const time = timeRange(e.startsAt, e.endsAt, ctx.tz);
  return {
    id: e.id,
    kind: "event",
    at: Date.parse(e.startsAt),
    title: e.title,
    subtitle: home,
    day,
    time,
    // No event category in the API yet (backend R20): every event is a blue "Event".
    type: { label: "Event", tone: "blue" },
    status: eventStatus(e, ctx.now),
    dateLabel: dayLabel(day, true),
    timeDetail: `${time} · ${ctx.zoneLabel}`,
    home,
    description: e.description,
    canComplete: !e.completedAt,
  };
}

/** Null for tasks with no due time or cancelled ones. */
export function taskItem(t: ApiTask, ctx: ItemContext): TimedItem | null {
  if (!t.dueAt || t.status === "cancelled") return null;
  const day = dayKey(t.dueAt, ctx.tz);
  const home = ctx.homeName(t.homeId);
  const due = `Due ${formatTime(t.dueAt, ctx.tz)}`;
  return {
    id: t.id,
    kind: "task",
    at: Date.parse(t.dueAt),
    title: t.title,
    subtitle: home,
    day,
    time: due,
    type: { label: "Task", tone: "amber" },
    status: taskStatus(t),
    dateLabel: dayLabel(day, true),
    timeDetail: `${due} · ${ctx.zoneLabel}`,
    home,
    description: t.description,
    canComplete: false,
  };
}

/** Drops the sort key. */
export function untimed(item: TimedItem): ScheduleItem {
  const { at, ...rest } = item;
  void at;
  return rest;
}
