import {
  clockInAction,
  clockOutAction,
  resumeWorkAction,
  startBreakAction,
  type AttendanceResult,
  type ClockInLocation,
} from "@/lib/command-center/attendance-actions";

import { fromAttendance } from "./derive";
import type { ScheduledShift, ShiftClock } from "./types";

// Runs a clock action against the Command Center attendance API. Client-side; the hook owns the
// state and decides how to show a failure (toast, or the "Clock-in failed" card).

export type ClockAction = "clock-in" | "break" | "resume" | "clock-out";

export type ClockActionResult =
  { ok: true; clock: ShiftClock } | { ok: false; error: string; reason?: string };

/** Our own reason when the browser gives no position (the API's are LOCATION_*). */
export const LOCATION_UNAVAILABLE = "LOCATION_UNAVAILABLE";
const LOCATION_ERROR = "Turn on location to clock in at this home, then try again.";

/** The device position, for clock-in at homes that require it. */
export function currentLocation(): Promise<ClockInLocation> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error(LOCATION_ERROR));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: coords.accuracy,
        }),
      () => reject(new Error(LOCATION_ERROR)),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  });
}

async function call(
  action: ClockAction,
  shift: ScheduledShift,
  location?: ClockInLocation,
): Promise<AttendanceResult> {
  switch (action) {
    case "clock-in": {
      let position = location;
      if (!position && shift.requireLocation) {
        try {
          position = await currentLocation();
        } catch (error) {
          return { ok: false, error: (error as Error).message, reason: LOCATION_UNAVAILABLE };
        }
      }
      return clockInAction(shift.id, position);
    }
    case "break":
      return startBreakAction();
    case "resume":
      return resumeWorkAction();
    case "clock-out":
      return clockOutAction();
  }
}

/** `location` = a position already read (by the clock-in modal), so GPS isn't asked twice. */
export async function runClockAction(
  action: ClockAction,
  shift: ScheduledShift,
  location?: ClockInLocation,
): Promise<ClockActionResult> {
  const result = await call(action, shift, location);
  if (!result.ok) return result;
  return { ok: true, clock: fromAttendance(result.data, Date.now()) };
}
