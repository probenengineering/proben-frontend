import "server-only";

import { cache } from "react";

import type { OpenShiftsProps } from "@/components/organisms/OpenShifts";
import type { TodayScheduleProps } from "@/components/organisms/TodaySchedule";
import { ApiError } from "@/lib/auth/api";
import { getAccessToken, sessionEnded } from "@/lib/auth/session";
import {
  commandCenter,
  getTodayOverview,
  listEvents,
  listOpenShifts,
  listShifts,
  requestTime,
} from "@/lib/command-center/api";
import { addDays, dayKey, formatDay, formatTime, startOfDay } from "@/lib/command-center/time";
import type { ApiAttendance, ApiShift } from "@/lib/command-center/types";
import type { ScheduledShift } from "@/lib/shift-clock/types";

import { buildTodaySchedule, toOpenShiftCard, weekStart } from "./dashboard-schedule";

// Data for the v2 Home "Overview" from the Command Center API: the clock's shift (GET /overview
// for today), this week's shifts and events for the schedule card, and open shifts (next 14
// days) for the right column. Cached per request: HomeOverview and HomeAside share it.

export interface DashboardOverview {
  /** Today's shift the clock runs against; null = no shift today. */
  shift: ScheduledShift | null;
  /** Clock state for that shift; null = not clocked in (or signed out / failed to load). */
  attendance: ApiAttendance | null;
  /** "Fri, 26 Oct · 8:00 AM at Oakridge Group Home" (within the next two weeks). */
  nextShift?: string;
  schedule: TodayScheduleProps | null;
  /** The open shifts shown on Home (a preview). */
  openShifts: OpenShiftsProps["items"];
  /** Total open shifts available, for the "N available" pill. */
  openShiftsAvailable: number;
}

export const EMPTY_OVERVIEW: DashboardOverview = {
  shift: null,
  attendance: null,
  schedule: null,
  openShifts: [],
  openShiftsAvailable: 0,
};

const OPEN_SHIFT_PREVIEW = 3;
const DAY = 24 * 60 * 60_000;

export const getDashboardOverview = cache(async (): Promise<DashboardOverview> => {
  if (!(await getAccessToken())) return EMPTY_OVERVIEW;
  try {
    const now = await requestTime();
    const { overview, tz } = await getTodayOverview();
    const today = dayKey(now, tz);
    const week = {
      from: startOfDay(weekStart(today), tz),
      to: startOfDay(addDays(weekStart(today), 7), tz),
    };
    // Shifts run two weeks so the "Next shift" note can look past this week.
    const [shifts, events, open] = await Promise.all([
      listShifts({ from: week.from, to: startOfDay(addDays(weekStart(today), 14), tz) }),
      listEvents(week),
      listOpenShifts({ from: now, to: now + 14 * DAY }),
    ]);
    const todays = overview.schedule.items.filter((s) => s.status !== "cancelled");
    const clock = await clockShift(todays, overview.attendance, Date.parse(overview.serverTime));
    const openItems = open.items.filter((s) => s.status !== "cancelled");
    const next = shifts.items
      .filter((s) => s.status !== "cancelled" && s.id !== clock.shift?.id)
      .filter((s) => Date.parse(s.startsAt) > now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

    return {
      shift: clock.shift ? toScheduledShift(clock.shift, overview.attendance, tz) : null,
      attendance: clock.attendance,
      nextShift: next ? nextShiftLabel(next, tz) : undefined,
      schedule: buildTodaySchedule({
        today,
        tz,
        now,
        shifts: shifts.items.filter((s) => s.status !== "cancelled"),
        events: events.items,
        attendance: overview.attendance,
      }),
      openShifts: openItems.slice(0, OPEN_SHIFT_PREVIEW).map((s) => toOpenShiftCard(s, tz)),
      openShiftsAvailable: open.total ?? openItems.length,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) sessionEnded(error);
    return EMPTY_OVERVIEW;
  }
});

/**
 * The shift the clock is for, with its attendance:
 * - the one being worked (it may have started yesterday);
 * - else the next of today's shifts that hasn't ended (not clocked in yet);
 * - else the one just clocked out of ("Shift complete").
 */
async function clockShift(shifts: ApiShift[], attendance: ApiAttendance, now: number) {
  const record = attendance.attendance;
  const byId = async (id: string) =>
    shifts.find((s) => s.id === id) ??
    commandCenter<ApiShift>(`/shifts/${encodeURIComponent(id)}`).catch(() => null);

  if (record && (attendance.status === "working" || attendance.status === "on_break")) {
    return { shift: await byId(record.shiftId), attendance };
  }
  const pending = attendance.manualClockInRequest;
  if (attendance.status === "pending_approval" && pending) {
    return { shift: await byId(pending.shiftId), attendance };
  }
  const next = shifts
    .filter((s) => Date.parse(s.endsAt) > now && s.id !== record?.shiftId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  if (next) return { shift: next, attendance: null };
  if (record && attendance.status === "completed") {
    return { shift: await byId(record.shiftId), attendance };
  }
  return { shift: null, attendance: null };
}

function nextShiftLabel(shift: ApiShift, tz: string) {
  const zone = shift.home?.details?.timezone ?? tz;
  const key = dayKey(shift.startsAt, zone);
  const day = `${formatDay(key, { weekday: "short" })}, ${formatDay(key, { day: "numeric" })} ${formatDay(key, { month: "short" })}`;
  return `${day} · ${formatTime(shift.startsAt, zone)} at ${shift.home?.name ?? shift.title}`;
}

function toScheduledShift(shift: ApiShift, attendance: ApiAttendance, tz: string): ScheduledShift {
  const d = shift.home?.details;
  const zone = d?.timezone ?? tz;
  const startsAt = Date.parse(shift.startsAt);
  const endsAt = Date.parse(shift.endsAt);
  const record = attendance.attendance?.shiftId === shift.id ? attendance.attendance : null;
  return {
    id: shift.id,
    label: `${formatTime(startsAt, zone)} – ${formatTime(endsAt, zone)}`,
    startsAt,
    endsAt,
    timeZone: zone,
    durationMinutes: Math.max(1, (endsAt - startsAt) / 60_000),
    breakAllowanceMinutes: record?.breakAllowanceMinutes ?? shift.breakMinutes ?? 0,
    homeName: shift.home?.name ?? shift.title,
    role: shift.home?.assignmentRole ?? undefined,
    address: d?.address ?? ([d?.city, d?.region].filter(Boolean).join(", ") || undefined),
    requireLocation: d?.requireLocation,
    latitude: d?.latitude,
    longitude: d?.longitude,
    geofenceRadiusMeters: d?.geofenceRadiusMeters,
  };
}
