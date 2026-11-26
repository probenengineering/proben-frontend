import type { TodayScheduleProps } from "@/components/organisms/TodaySchedule";
import type { AgendaStatus, OpenShiftCardProps } from "@/components/molecules";

import { addDays, dayKey, formatDay, formatTime } from "./command-center/time";
import type { ApiAttendance, ApiEvent, ApiShift } from "./command-center/types";

// Maps Command Center shifts and events to the v2 Home "Today's schedule" card (week strip,
// agenda, now line) and the right-column open shift cards. Pure; times in the home's zone.

const upper = (s: string) => s.toUpperCase();

/** Sunday of the week holding `today` ("2026-10-25" → "2026-10-21"). */
export function weekStart(today: string) {
  return addDays(today, -new Date(`${today}T00:00:00Z`).getUTCDay());
}

/** "9:00 – 10:00 AM" (one AM/PM when both ends share it, as in Figma). */
function timeRange(start: string, end: string, tz: string) {
  const a = formatTime(start, tz);
  const b = formatTime(end, tz);
  const [aTime, aHalf] = a.split(" ");
  return aHalf && b.endsWith(aHalf) ? `${aTime} – ${b}` : `${a} – ${b}`;
}

function statusOf(start: string, end: string, now: number, done: boolean): AgendaStatus {
  if (done) return "completed";
  if (now >= Date.parse(end)) return "overdue";
  return now >= Date.parse(start) ? "in_progress" : "upcoming";
}

export interface ScheduleInput {
  today: string;
  tz: string;
  now: number;
  /** This week's shifts and events (cancelled shifts already removed). */
  shifts: ApiShift[];
  events: ApiEvent[];
  attendance: ApiAttendance | null;
}

export function buildTodaySchedule(input: ScheduleInput): TodayScheduleProps {
  const { today, tz, now, shifts, events, attendance } = input;
  const onDay = (key: string) => (item: { startsAt: string }) => dayKey(item.startsAt, tz) === key;
  const record = attendance?.attendance;

  const items = [
    ...shifts.filter(onDay(today)).map((s) => {
      // A shift is done once you've clocked out of it, or once it has ended.
      const done =
        (record?.shiftId === s.id && !!record.clockedOutAt) || now >= Date.parse(s.endsAt);
      return {
        id: `shift-${s.id}`,
        startsAt: s.startsAt,
        time: timeRange(s.startsAt, s.endsAt, tz),
        title: `Shift · ${s.home?.name ?? s.title}`,
        color: "green" as const,
        status: statusOf(s.startsAt, s.endsAt, now, done),
      };
    }),
    ...events.filter(onDay(today)).map((e) => ({
      id: `event-${e.id}`,
      startsAt: e.startsAt,
      time: timeRange(e.startsAt, e.endsAt, tz),
      title: e.title,
      // The API has no event category yet, so every event uses the calendar's blue.
      color: "blue" as const,
      status: statusOf(e.startsAt, e.endsAt, now, !!e.completedAt),
    })),
  ].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const first = weekStart(today);
  const busy = new Set([...shifts, ...events].map((item) => dayKey(item.startsAt, tz)));
  const days = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(first, i);
    return {
      key,
      weekday: upper(formatDay(key, { weekday: "short" })),
      day: formatDay(key, { day: "numeric" }),
      today: key === today,
      hasItems: busy.has(key),
    };
  });

  const nowAt = items.findIndex((item) => Date.parse(item.startsAt) > now);
  return {
    dateLabel: `${formatDay(today, { weekday: "short" })}, ${formatDay(today, { day: "numeric" })} ${formatDay(today, { month: "short" })}`,
    done: items.filter((item) => item.status === "completed").length,
    total: items.length,
    days,
    items: items.map(({ id, time, title, color, status }) => ({ id, time, title, color, status })),
    nowAt: nowAt === -1 ? items.length : nowAt,
    nowLabel: formatTime(now, tz),
  };
}

export function toOpenShiftCard(shift: ApiShift, tz: string): OpenShiftCardProps & { id: string } {
  const zone = shift.home?.details?.timezone ?? tz;
  const key = dayKey(shift.startsAt, zone);
  const d = shift.home?.details;
  const place = [d?.city, d?.region].filter(Boolean).join(", ");
  return {
    id: shift.id,
    weekday: upper(formatDay(key, { weekday: "short" })),
    day: formatDay(key, { day: "numeric" }),
    home: shift.home?.name ?? shift.title,
    meta: [`${formatTime(shift.startsAt, zone)} – ${formatTime(shift.endsAt, zone)}`, place]
      .filter(Boolean)
      .join(" · "),
  };
}
