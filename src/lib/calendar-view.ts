import { addDays } from "@/lib/command-center/time";

// Calendar view + date from the URL (`?view=day&date=2026-10-25`), shared by /schedule and /tasks.
// Pure, safe on server and client. Dates are "YYYY-MM-DD" keys in the home's timezone.

export type CalendarView = "day" | "week" | "month";

export const CALENDAR_VIEWS: { id: CalendarView; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export interface CalendarParams {
  view?: string | string[];
  date?: string | string[];
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

/** Defaults: week view on `today`. */
export function parseCalendarParams(params: CalendarParams, today: string) {
  const view = first(params.view);
  const date = first(params.date);
  return {
    view: (view === "day" || view === "month" ? view : "week") as CalendarView,
    date: date && DATE.test(date) ? date : today,
  };
}

export function calendarHref(base: string, view: CalendarView, date: string) {
  return `${base}?view=${view}&date=${date}`;
}

/** "2026-10-01" for any day in October. */
export const monthStart = (key: string) => `${key.slice(0, 7)}-01`;

/** Adds whole months, clamping to the month's length (Jan 31 + 1 → Feb 28). */
export function addMonths(key: string, months: number) {
  const [y, m, d] = key.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(d, last));
  return target.toISOString().slice(0, 10);
}

/** Sunday of the week holding `key`. */
export const weekStartOf = (key: string) => addDays(key, -new Date(`${key}T00:00:00Z`).getUTCDay());

/** The previous / next day, week or month. */
export function shiftDate(view: CalendarView, key: string, direction: -1 | 1) {
  if (view === "day") return addDays(key, direction);
  if (view === "week") return addDays(key, 7 * direction);
  return addMonths(key, direction);
}

/** Every day shown by a month grid: Sunday before the 1st to Saturday after the last (5–6 weeks). */
export function monthGridKeys(key: string) {
  const start = weekStartOf(monthStart(key));
  const last = addDays(monthStart(addMonths(monthStart(key), 1)), -1);
  const end = addDays(weekStartOf(last), 6);
  const keys: string[] = [];
  for (let k = start; k <= end; k = addDays(k, 1)) keys.push(k);
  return keys;
}
