import type { ScheduledShift, ShiftClock } from "./types";

const MINUTE = 60_000;

export interface ClockTotals {
  /** Time worked so far, breaks excluded. */
  workedMs: number;
  /** All break time taken this shift, including a running break. */
  breakUsedMs: number;
  /** Break allowance left (0 once used up). */
  breakLeftMs: number;
  /** True when the allowance is used up. */
  breakAllowanceUsed: boolean;
  /** True once worked time reaches the scheduled length. */
  shiftComplete: boolean;
}

// Pure maths on the clock record; `now` is passed in so the UI can tick it.
// The backend should compute the same numbers server-side (see docs/command-center.md).
export function deriveTotals(clock: ShiftClock, shift: ScheduledShift, now: number): ClockTotals {
  const breakUsedMs = clock.breaks.reduce(
    (sum, b) => sum + Math.max(0, (b.endedAt ?? now) - b.startedAt),
    0,
  );
  const workedMs = clock.clockedInAt ? Math.max(0, now - clock.clockedInAt - breakUsedMs) : 0;
  const allowanceMs = shift.breakAllowanceMinutes * MINUTE;
  const breakLeftMs = Math.max(0, allowanceMs - breakUsedMs);

  return {
    workedMs,
    breakUsedMs,
    breakLeftMs,
    breakAllowanceUsed: breakLeftMs === 0,
    shiftComplete: workedMs >= shift.durationMinutes * MINUTE,
  };
}

/** Ring fill, 0–1: worked share of the shift, or break share of the allowance while on break. */
export function ringProgress(clock: ShiftClock, shift: ScheduledShift, totals: ClockTotals) {
  if (clock.status === "on_break") {
    return Math.min(1, totals.breakUsedMs / (shift.breakAllowanceMinutes * MINUTE));
  }
  if (clock.status === "clocked_in") {
    return Math.min(1, totals.workedMs / (shift.durationMinutes * MINUTE));
  }
  return 0;
}
