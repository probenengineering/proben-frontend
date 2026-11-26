// The "My time" clock, mapped from the Command Center attendance API (GET /attendance).
// Timestamps are epoch ms on the device clock (server times shifted by the measured skew).

/** "completed" = clocked out of this shift (Figma "Shift complete"). */
export type ClockStatus = "not_clocked_in" | "clocked_in" | "on_break" | "completed";

export interface ShiftClock {
  status: ClockStatus;
  clockedInAt: number | null;
  /** Set once clocked out. */
  clockedOutAt: number | null;
  /** Break time used as of `syncedAt` (all breaks, including a running one). */
  breakMs: number;
  /** When the record was read; a running break keeps counting from here. */
  syncedAt: number;
}

/** The scheduled shift the clock runs against. */
export interface ScheduledShift {
  /** Shift ID, sent with clock-in. */
  id: string;
  /** "8:00 AM – 4:00 PM", shown as-is. */
  label: string;
  /** Epoch ms. */
  startsAt: number;
  endsAt: number;
  /** IANA zone the times are shown in (the home's). */
  timeZone: string;
  /** Scheduled length, used to fill the ring while working. */
  durationMinutes: number;
  /** Total break allowance per shift, shared across all breaks. */
  breakAllowanceMinutes: number;
  /** "Oakridge Group Home". */
  homeName: string;
  /** "Direct Support Professional" (your role at the home), when known. */
  role?: string;
  /** Street address for "You're at …". */
  address?: string;
  /** The home requires GPS to clock in. */
  requireLocation?: boolean;
  /** Home position and geofence, for the location check before clocking in. */
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
}

export const EMPTY_CLOCK: ShiftClock = {
  status: "not_clocked_in",
  clockedInAt: null,
  clockedOutAt: null,
  breakMs: 0,
  syncedAt: 0,
};
