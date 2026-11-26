import "server-only";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { getAccessToken, sessionEnded } from "@/lib/auth/session";
import { addMonths, monthGridKeys, monthStart } from "@/lib/calendar-view";
import type { DayCalendarData, DayEvent, MonthCalendarData, MonthCell } from "@/types/calendar";

import { getTimezone, requestTime } from "./api";
import {
  addDays,
  dayKey,
  formatDay,
  formatTime,
  hourOfDay,
  localDateTime,
  startOfDay,
} from "./time";
import { type CalendarItem, hourRange, loadCalendarItems } from "./tasks";

// Day (Figma 60:8532 / 60:8851) and Month (60:9128) calendar views. Same items as the week view
// (shifts, events, task due times), in the home's timezone.

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const LOOKAHEAD_DAYS = 31;

function handle(error: unknown) {
  if (error instanceof ApiError && error.status === 401) sessionEnded(error);
  return errorMessage(error);
}

const weekdayOf = (key: string) => WEEKDAYS[new Date(`${key}T00:00:00Z`).getUTCDay()];
const chunk = <T>(list: T[]) =>
  Array.from({ length: list.length / 7 }, (_, i) => list.slice(i * 7, i * 7 + 7));

async function context() {
  const tz = (await getAccessToken()) ? await getTimezone() : undefined;
  const now = await requestTime();
  return { tz, now, today: dayKey(now, tz ?? "UTC") };
}

/** "In 36 min · 11:00 AM" (or "In 2h 5m"), for today's next item. */
function upNextLabel(at: number, now: number, tz: string) {
  const minutes = Math.max(1, Math.round((at - now) / 60_000));
  const span = minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `In ${span} · ${formatTime(at, tz)}`;
}

export async function getDayCalendar(focus?: string): Promise<DayCalendarData> {
  const { tz, now, today } = await context();
  const key = focus ?? today;
  const grid = monthGridKeys(key);
  const base: DayCalendarData = {
    focus: key,
    weekday: weekdayOf(key),
    date: Number(key.slice(8)),
    today: key === today,
    monthLabel: formatDay(key, { month: "long", year: "numeric" }),
    startHour: 7,
    endHour: 17,
    events: [],
    mini: {
      monthLabel: formatDay(key, { month: "long", year: "numeric" }),
      weeks: chunk(
        grid.map((k) => ({
          key: k,
          day: Number(k.slice(8)),
          inMonth: k.slice(0, 7) === key.slice(0, 7),
          today: k === today,
          selected: k === key,
          hasItems: false,
        })),
      ),
      prev: addMonths(key, -1),
      next: addMonths(key, 1),
    },
    summary: { total: 0, done: 0, left: 0 },
  };
  if (!tz) return base;

  try {
    const last = grid[grid.length - 1];
    const ahead = addDays(key, LOOKAHEAD_DAYS);
    const items = await loadCalendarItems(
      {
        from: startOfDay(grid[0], tz),
        to: startOfDay(addDays(ahead > last ? ahead : last, 1), tz),
      },
      tz,
      now,
    );
    const onDay = (k: string) => items.filter((i) => dayKey(i.startsAt, tz) === k);
    const busy = new Set(items.map((i) => dayKey(i.startsAt, tz)));
    const events: DayEvent[] = onDay(key)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((i: CalendarItem) => {
        const start = hourOfDay(i.startsAt, tz);
        const end = dayKey(i.endsAt, tz) === key ? hourOfDay(i.endsAt, tz) : 24;
        return {
          start,
          duration: Math.max(0.5, end - start),
          time: `${formatTime(i.startsAt, tz)} – ${formatTime(i.endsAt, tz)}`,
          title: i.title,
          subtitle: i.item?.subtitle,
          color: i.color ?? "blue",
          ...(i.item && { item: i.item }),
        };
      });
    const tracked = onDay(key).filter((i) => i.item);
    const done = tracked.filter((i) => i.item?.status === "completed").length;
    const pending = tracked
      .filter(
        (i) => i.item?.status !== "completed" && (key !== today || Date.parse(i.startsAt) > now),
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const later = items
      .filter((i) => i.item && dayKey(i.startsAt, tz) > key && i.item.status !== "completed")
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
    const nextNote = later
      ? `Next task: ${formatDay(dayKey(later.startsAt, tz), { weekday: "short" })} ${Number(dayKey(later.startsAt, tz).slice(8))} ${formatDay(dayKey(later.startsAt, tz), { month: "short" })}, ${formatTime(later.startsAt, tz)}`
      : "Nothing else scheduled.";
    const [hh, mm] = localDateTime(now, tz).slice(11).split(":").map(Number);

    return {
      ...base,
      ...hourRange(events.map((e) => ({ ...e, day: 0 }))),
      events,
      now:
        key === today
          ? { hour: hh + mm / 60, label: `${hh % 12 || 12}:${String(mm).padStart(2, "0")}` }
          : undefined,
      mini: {
        ...base.mini,
        weeks: base.mini.weeks.map((w) => w.map((d) => ({ ...d, hasItems: busy.has(d.key) }))),
      },
      summary: {
        total: tracked.length,
        done,
        left: tracked.length - done,
        upNext: pending[0]?.item
          ? {
              item: pending[0].item,
              label:
                key === today
                  ? upNextLabel(Date.parse(pending[0].startsAt), now, tz)
                  : pending[0].item.time,
            }
          : undefined,
        note: pending[0]
          ? undefined
          : `Nothing else ${key === today ? "today" : "this day"}. ${nextNote}`,
      },
    };
  } catch (error) {
    return { ...base, error: handle(error) };
  }
}

export async function getMonthCalendar(focus?: string): Promise<MonthCalendarData> {
  const { tz, now, today } = await context();
  const key = focus ?? today;
  const grid = monthGridKeys(key);
  const month = monthStart(key).slice(0, 7);
  const cells = (chips: (k: string) => MonthCell["chips"]): MonthCell[][] =>
    chunk(
      grid.map((k) => ({
        key: k,
        day: Number(k.slice(8)),
        inMonth: k.slice(0, 7) === month,
        today: k === today,
        chips: chips(k),
      })),
    );
  const base: MonthCalendarData = {
    monthLabel: formatDay(key, { month: "long", year: "numeric" }),
    weeks: cells(() => []),
  };
  if (!tz) return base;

  try {
    const items = await loadCalendarItems(
      { from: startOfDay(grid[0], tz), to: startOfDay(addDays(grid[grid.length - 1], 1), tz) },
      tz,
      now,
    );
    const sorted = [...items].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return {
      ...base,
      weeks: cells((k) =>
        sorted
          .filter((i) => dayKey(i.startsAt, tz) === k)
          .map((i) => ({
            time: formatTime(i.startsAt, tz).replace(/ (AM|PM)$/, ""),
            title: i.title,
            color: i.color ?? "blue",
            ...(i.item && { item: i.item }),
          })),
      ),
    };
  } catch (error) {
    return { ...base, error: handle(error) };
  }
}
