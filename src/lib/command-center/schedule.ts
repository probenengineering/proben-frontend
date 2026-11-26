import "server-only";

import { ApiError, errorMessage } from "@/lib/auth/api";
import { getAccessToken, sessionEnded } from "@/lib/auth/session";
import type { ScheduleList } from "@/types/schedule";

import { getTimezone, listEvents, listHomes, listTasks, requestTime } from "./api";
import { dayLabel, eventItem, taskItem, type TimedItem, untimed } from "./schedule-items";
import { addDays, dayKey, formatDay, formatTime, startOfDay, timezoneLabels } from "./time";

// Schedule list (Figma 60:6752) from the Command Center: your calendar events (GET /events, from
// 30 days back so missed ones show as Overdue) and tasks with a due time (GET /tasks). Grouped as
// Overdue (before today), then each day from today to Saturday, in the home's timezone.

const DAY = 24 * 60 * 60_000;
const OVERDUE_LOOKBACK_DAYS = 30;

/** Overdue group time: "Wed 24 · 2:00 PM". */
const overdueTime = (at: number, tz: string) => {
  const key = dayKey(at, tz);
  return `${formatDay(key, { weekday: "short" })} ${Number(key.slice(8))} · ${formatTime(at, tz)}`;
};

export async function getScheduleList(): Promise<ScheduleList> {
  const tz = (await getAccessToken()) ? await getTimezone() : undefined;
  const zone = tz ?? "UTC";
  const now = await requestTime();
  const today = dayKey(now, zone);
  const left = 7 - new Date(`${today}T00:00:00Z`).getUTCDay();
  const keys = Array.from({ length: left }, (_, i) => addDays(today, i));
  const base: ScheduleList = {
    monthLabel: formatDay(today, { month: "long", year: "numeric" }),
    overdue: [],
    days: keys.map((key) => ({ key, label: dayLabel(key), today: key === today, items: [] })),
  };
  if (!tz) return base;

  try {
    const [events, tasks, homes] = await Promise.all([
      listEvents({
        from: now - OVERDUE_LOOKBACK_DAYS * DAY,
        to: startOfDay(addDays(today, left), tz),
      }),
      listTasks(),
      listHomes().catch(() => null),
    ]);
    const ctx = {
      tz,
      now,
      zoneLabel: timezoneLabels(now, tz)[0],
      homeName: (id?: string | null) => homes?.items.find((h) => h.id === id)?.name,
    };
    const items: TimedItem[] = [
      ...events.items.map((e) => eventItem(e, ctx)),
      ...tasks.items.flatMap((t) => taskItem(t, ctx) ?? []),
    ].sort((a, b) => a.at - b.at);

    return {
      ...base,
      overdue: items
        .filter((item) => item.day < today && item.status === "overdue")
        .map((item) => untimed({ ...item, time: overdueTime(item.at, tz) })),
      days: base.days.map((d) => ({
        ...d,
        items: items.filter((item) => item.day === d.key).map(untimed),
      })),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) sessionEnded(error);
    return { ...base, error: errorMessage(error) };
  }
}
