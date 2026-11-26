import type { ApiAttendance } from "@/lib/command-center/types";

import { EMPTY_CLOCK, type ScheduledShift, type ShiftClock } from "./types";

const MINUTE = 60_000;

export interface ClockTotals {
  /** Time worked so far (or in total once clocked out), breaks excluded. */
  workedMs: number;
  /** All break time taken this shift, including a running break. */
  breakUsedMs: number;
  /** Break allowance left (0 once used up). */
  breakLeftMs: number;
  /** True when the allowance is used up. */
  breakAllowanceUsed: boolean;
  /** Time past the scheduled end while still clocked in (0 otherwise). */
  overtimeMs: number;
  /** Time until the scheduled end (0 once past it). */
  shiftLeftMs: number;
}

/**
 * The attendance record on the device clock. `receivedAt` is Date.now() when the response
 * arrived; the gap to serverTime is the device's clock skew.
 */
export function fromAttendance(api: ApiAttendance, receivedAt: number): ShiftClock {
  const record = api.attendance;
  if (api.status === "pending_approval") return { ...EMPTY_CLOCK, status: "pending_approval" };
  if (!record || api.status === "not_clocked_in") return EMPTY_CLOCK;
  const serverNow = Date.parse(api.serverTime);
  const skew = serverNow - receivedAt;
  const running =
    api.status === "on_break" && record.breakStartedAt
      ? serverNow - Date.parse(record.breakStartedAt)
      : 0;
  // Top-level breakSeconds is the live total; fall back to the record's total plus a running break.
  const breakMs =
    api.breakSeconds !== undefined
      ? api.breakSeconds * 1000
      : (record.breakSeconds ?? 0) * 1000 + running;
  const status =
    api.status === "on_break"
      ? "on_break"
      : api.status === "completed"
        ? "completed"
        : "clocked_in";
  return {
    status,
    clockedInAt: Date.parse(record.clockedInAt) - skew,
    clockedOutAt: record.clockedOutAt ? Date.parse(record.clockedOutAt) - skew : null,
    breakMs,
    syncedAt: receivedAt,
  };
}

// Pure maths on the clock record; `now` is passed in so the UI can tick it.
export function deriveTotals(clock: ShiftClock, shift: ScheduledShift, now: number): ClockTotals {
  const breakUsedMs =
    clock.breakMs + (clock.status === "on_break" ? Math.max(0, now - clock.syncedAt) : 0);
  const end = clock.clockedOutAt ?? now;
  const workedMs = clock.clockedInAt ? Math.max(0, end - clock.clockedInAt - breakUsedMs) : 0;
  const allowanceMs = shift.breakAllowanceMinutes * MINUTE;
  const breakLeftMs = Math.max(0, allowanceMs - breakUsedMs);
  const working = clock.status === "clocked_in" || clock.status === "on_break";

  return {
    workedMs,
    breakUsedMs,
    breakLeftMs,
    breakAllowanceUsed: breakLeftMs === 0,
    overtimeMs: working ? Math.max(0, now - shift.endsAt) : 0,
    shiftLeftMs: Math.max(0, shift.endsAt - now),
  };
}

/** Ring fill, 0–1: worked share of the shift, or break share of the allowance while on break. */
export function ringProgress(clock: ShiftClock, shift: ScheduledShift, totals: ClockTotals) {
  if (clock.status === "on_break") {
    const allowance = shift.breakAllowanceMinutes * MINUTE;
    return allowance ? Math.min(1, totals.breakUsedMs / allowance) : 1;
  }
  if (clock.status === "completed") return 1;
  if (clock.status === "clocked_in") {
    return Math.min(1, totals.workedMs / (shift.durationMinutes * MINUTE));
  }
  return 0;
}

/** Overtime arc, 0–1, as a share of the scheduled shift (Figma draws 25 min of 8 h ≈ 6%). */
export function overtimeProgress(shift: ScheduledShift, totals: ClockTotals) {
  return Math.min(1, totals.overtimeMs / (shift.durationMinutes * MINUTE));
}

/** Metres between two points (haversine). */
export function distanceMeters(a: [number, number], b: [number, number]) {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}
