"use client";

import { useState, useSyncExternalStore } from "react";

import type { ApiAttendance } from "@/lib/command-center/types";
import type { ClockInLocation } from "@/lib/command-center/attendance-actions";
import { formatTime } from "@/lib/command-center/time";
import { deriveTotals, distanceMeters, fromAttendance } from "@/lib/shift-clock/derive";
import { formatDuration, formatMinutes } from "@/lib/shift-clock/format";
import { runClockAction, type ClockAction } from "@/lib/shift-clock/store";
import { EMPTY_CLOCK, type ScheduledShift } from "@/lib/shift-clock/types";
import { buildClockView, type ClockInFailure, type ShiftClockView } from "@/lib/shift-clock/view";
import { showToast } from "@/lib/toast";

/** Rows of the "Clock out and end your shift?" summary. */
export interface ClockOutSummary {
  clockIn: string;
  clockOut: string;
  breakTaken: string;
  worked: string;
}

export interface ShiftClockState {
  view: ShiftClockView;
  /** The "Clock in for your shift?" modal (Figma 60:10721). */
  confirmIn: {
    open: boolean;
    setOpen: (open: boolean) => void;
    /** Clocks in with the position the modal already read, if any. */
    clockIn: (location?: ClockInLocation) => Promise<void>;
  };
  /** The "Clock out and end your shift?" modal (Figma 60:10864). */
  confirmOut: {
    open: boolean;
    setOpen: (open: boolean) => void;
    summary: ClockOutSummary | null;
    clockOut: () => Promise<void>;
  };
}

const subscribeTick = (notify: () => void) => {
  const id = window.setInterval(notify, 1000);
  return () => window.clearInterval(id);
};
/** Whole seconds, so repeated reads within a second return the same snapshot. */
const readNow = () => Math.floor(Date.now() / 1000) * 1000;

// Drives the "My time" card. State starts from the server's attendance record and is replaced by
// each action's response; `now` ticks every second (0 while prerendering, so Date.now() never
// runs during prerender). Clock in and clock out each go through a confirmation modal. A location
// refusal on clock-in shows the "Clock-in failed" state; other errors show a toast.
export function useShiftClock(
  shift: ScheduledShift | null,
  initial: ApiAttendance | null,
  openShiftsAvailable: number,
  nextShift?: string,
): ShiftClockState {
  const [clock, setClock] = useState(() =>
    initial ? fromAttendance(initial, Date.parse(initial.serverTime)) : EMPTY_CLOCK,
  );
  const [failure, setFailure] = useState<ClockInFailure | null>(null);
  const [confirmingIn, setConfirmingIn] = useState(false);
  const [confirmingOut, setConfirmingOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const now = useSyncExternalStore(subscribeTick, readNow, () => 0);

  const run = async (action: ClockAction, location?: ClockInLocation) => {
    if (!shift || busy) return;
    setBusy(true);
    try {
      const result = await runClockAction(action, shift, location);
      if (result.ok) {
        setClock(result.clock);
        setFailure(null);
      } else if (action === "clock-in" && result.reason?.startsWith("LOCATION")) {
        const home = shift.latitude !== undefined && shift.longitude !== undefined;
        setFailure({
          reason: result.reason,
          distanceMeters:
            location && home
              ? distanceMeters(
                  [location.latitude, location.longitude],
                  [shift.latitude!, shift.longitude!],
                )
              : undefined,
        });
      } else {
        showToast("error", result.error);
      }
    } finally {
      setBusy(false);
    }
  };

  const view = buildClockView({
    clock,
    shift,
    now,
    failure,
    openShiftsAvailable,
    nextShift,
    on: {
      clockIn: () => setConfirmingIn(true),
      takeBreak: () => void run("break"),
      endBreak: () => void run("resume"),
      clockOut: () => setConfirmingOut(true),
    },
  });

  let summary: ClockOutSummary | null = null;
  if (shift && clock.clockedInAt && now) {
    const totals = deriveTotals(clock, shift, now);
    summary = {
      clockIn: formatTime(clock.clockedInAt, shift.timeZone),
      clockOut: formatTime(now, shift.timeZone),
      breakTaken: formatMinutes(totals.breakUsedMs / 60_000),
      worked: formatDuration(totals.workedMs),
    };
  }

  return {
    view,
    confirmIn: {
      open: confirmingIn,
      setOpen: setConfirmingIn,
      clockIn: async (location) => {
        setConfirmingIn(false);
        await run("clock-in", location);
      },
    },
    confirmOut: {
      open: confirmingOut,
      setOpen: setConfirmingOut,
      summary,
      clockOut: async () => {
        setConfirmingOut(false);
        await run("clock-out");
      },
    },
  };
}
