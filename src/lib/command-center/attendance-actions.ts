"use server";

import { ApiError, errorMessage } from "@/lib/auth/api";

import { commandCenter } from "./api";
import type { ApiAttendance } from "./types";

// Clock actions behind the "My time" card. Each returns the new attendance state (the same body
// as GET /attendance) or an error message for a toast. The server stamps every time.

/** `reason` is the API's details.reason (e.g. LOCATION_OUTSIDE_HOME) when it sent one. */
export type AttendanceResult =
  | { ok: true; data: ApiAttendance }
  | { ok: false; error: string; reason?: string; distanceMeters?: number };

// The API's details.reason (400/409) as plain words; anything else uses the usual message.
const REASONS: Record<string, string> = {
  NOT_CLOCKED_IN: "You're not clocked in.",
  ALREADY_CLOCKED_IN: "You're already clocked in.",
  SHIFT_COMPLETED: "You've already clocked out of this shift.",
  OUTSIDE_SHIFT_WINDOW: "You can only clock in close to your shift's start time.",
  LOCATION_REQUIRED: "Allow location access to clock in at this home.",
  LOCATION_INACCURATE: "We couldn't get an accurate location. Try again with a clearer signal.",
  LOCATION_OUTSIDE_HOME: "You need to be at the home to clock in.",
  HOME_LOCATION_UNCONFIGURED: "This home's location isn't set up yet. Ask your manager.",
};

function clockError(error: unknown) {
  if (error instanceof ApiError) {
    const reason = (error.details as { reason?: string } | undefined)?.reason;
    if (reason && REASONS[reason]) return REASONS[reason];
    if (error.code === "ALREADY_COMPLETED") return REASONS.SHIFT_COMPLETED;
  }
  return errorMessage(error);
}

async function run(call: () => Promise<ApiAttendance>): Promise<AttendanceResult> {
  try {
    return { ok: true, data: await call() };
  } catch (error) {
    const details =
      error instanceof ApiError
        ? (error.details as { reason?: string; distanceMeters?: number } | undefined)
        : undefined;
    return {
      ok: false,
      error: clockError(error),
      ...(details?.reason && { reason: details.reason }),
      // LOCATION_OUTSIDE_HOME: how far the server measured the device from the home.
      ...(typeof details?.distanceMeters === "number" && {
        distanceMeters: details.distanceMeters,
      }),
    };
  }
}

export interface ClockInLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

export async function clockInAction(shiftId: string, location?: ClockInLocation) {
  const body: Record<string, unknown> = { shiftId: String(shiftId) };
  if (location) {
    body.latitude = Number(location.latitude);
    body.longitude = Number(location.longitude);
    body.accuracyMeters = Number(location.accuracyMeters);
  }
  return run(() => commandCenter<ApiAttendance>("/attendance/clock-in", { body }));
}

/**
 * "Request manual clock-in" after a location refusal (POST /attendance/manual-requests). Nothing
 * is clocked until a provider administrator approves; returns the attendance (pending_approval).
 */
export async function requestManualClockInAction(shiftId: string, location?: ClockInLocation) {
  const body: Record<string, unknown> = { shiftId: String(shiftId) };
  if (location) {
    body.latitude = Number(location.latitude);
    body.longitude = Number(location.longitude);
    body.accuracyMeters = Number(location.accuracyMeters);
  }
  return run(async () => {
    await commandCenter("/attendance/manual-requests", { body });
    return commandCenter<ApiAttendance>("/attendance");
  });
}

export async function startBreakAction() {
  return run(() => commandCenter<ApiAttendance>("/attendance/break", { method: "POST" }));
}

export async function resumeWorkAction() {
  return run(() => commandCenter<ApiAttendance>("/attendance/resume", { method: "POST" }));
}

export async function clockOutAction() {
  return run(() => commandCenter<ApiAttendance>("/attendance/clock-out", { method: "POST" }));
}

/**
 * "Request approval" in the Overtime state (POST /attendance/{id}/overtime-requests). Returns the
 * re-read attendance, whose record now carries overtimeRequest: "pending".
 */
export async function requestOvertimeAction(attendanceId: string) {
  return run(async () => {
    await commandCenter(
      `/attendance/${encodeURIComponent(String(attendanceId))}/overtime-requests`,
      {
        method: "POST",
        body: {},
      },
    );
    return commandCenter<ApiAttendance>("/attendance");
  });
}

/** Re-reads the clock, e.g. after a failed action left the UI unsure. */
export async function refreshAttendanceAction() {
  return run(() => commandCenter<ApiAttendance>("/attendance"));
}
