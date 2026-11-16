// Shape of the time clock, written to match the API proposed in docs/command-center.md so the
// localStorage stand-in can be swapped for real endpoints without touching the UI.
// All timestamps are epoch milliseconds (the API sends ISO 8601; convert at the boundary).

export type ClockStatus = "not_clocked_in" | "clocked_in" | "on_break";

export interface ClockBreak {
  startedAt: number;
  /** null while the break is running. */
  endedAt: number | null;
}

export interface ShiftClock {
  status: ClockStatus;
  clockedInAt: number | null;
  breaks: ClockBreak[];
}

/** The scheduled shift the clock runs against. */
export interface ScheduledShift {
  /** "8:00 AM – 4:00 PM", shown as-is. */
  label: string;
  /** Scheduled length, used to fill the ring while working. */
  durationMinutes: number;
  /** Total break allowance per shift, shared across all breaks. */
  breakAllowanceMinutes: number;
}

export const EMPTY_CLOCK: ShiftClock = { status: "not_clocked_in", clockedInAt: null, breaks: [] };
