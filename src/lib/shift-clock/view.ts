import type { StatePillTone } from "@/components/atoms";
import type { ClockStatProps } from "@/components/molecules";
import { formatTime } from "@/lib/command-center/time";

import { deriveTotals, overtimeProgress, ringProgress } from "./derive";
import {
  formatCountdown,
  formatDuration,
  formatHoursMinutes,
  formatMiles,
  formatMinutes,
} from "./format";
import { LOCATION_UNAVAILABLE } from "./store";
import type { ScheduledShift, ShiftClock } from "./types";

// What the v2 "My time" card shows for each Figma Time Clock state (60:5349): Not clocked in,
// Clocked in, On break, Back from break, Overtime, Shift complete, No shift, Clock-in failed.
// Labels and button placement stay fixed; values, ring colour and actions change.

export interface ClockButtonView {
  label: string;
  variant: "green" | "outline" | "dark" | "muted";
  onClick?: () => void;
  href?: string;
}

export interface ShiftClockView {
  timer: string;
  caption: string;
  ring: {
    value: number;
    tone: "green" | "caution" | "info";
    track: "default" | "danger";
    overtime: number;
  };
  status: { label: string; tone: StatePillTone };
  /** Clock-in, Clock-out, Shift, Break. */
  stats: [ClockStatProps, ClockStatProps, ClockStatProps, ClockStatProps];
  actions: ClockButtonView[];
  note?: { text: string; danger?: boolean };
}

/** A clock-in the API (or the device) refused because of location. */
export interface ClockInFailure {
  reason: string;
  /** How far the device was from the home, when both positions are known. */
  distanceMeters?: number;
}

export interface ClockViewInput {
  clock: ShiftClock;
  shift: ScheduledShift | null;
  /** Device time; 0 while prerendering (time-dependent text is left out). */
  now: number;
  failure: ClockInFailure | null;
  openShiftsAvailable: number;
  /** "Fri, 26 Oct · 8:00 AM at Oakridge Group Home", for the Shift complete note. */
  nextShift?: string;
  on: {
    clockIn: () => void;
    requestManualClockIn: () => void;
    takeBreak: () => void;
    endBreak: () => void;
    clockOut: () => void;
  };
}

const EMPTY = "—";
const stat = (label: string, value: string, tone?: ClockStatProps["tone"]) => ({
  label,
  value,
  tone,
});

function startsIn(shift: ScheduledShift, now: number) {
  const ms = shift.startsAt - now;
  const span = formatMinutes(Math.abs(ms) / 60_000);
  return ms >= 0
    ? `Your shift at ${shift.homeName} starts in ${span}.`
    : `Your shift at ${shift.homeName} started ${span} ago.`;
}

function failureNote(shift: ScheduledShift, failure: ClockInFailure) {
  if (failure.reason === "LOCATION_OUTSIDE_HOME" && failure.distanceMeters !== undefined) {
    return `Location not verified — you’re ${formatMiles(failure.distanceMeters)} from ${shift.homeName}.`;
  }
  if (failure.reason === "LOCATION_INACCURATE") {
    return "Location not verified — we couldn’t get an accurate position.";
  }
  if (failure.reason === "LOCATION_REQUIRED" || failure.reason === LOCATION_UNAVAILABLE) {
    return `Location not verified — turn on location to clock in at ${shift.homeName}.`;
  }
  return `Location not verified — you need to be at ${shift.homeName} to clock in.`;
}

export function buildClockView(input: ClockViewInput): ShiftClockView {
  const { clock, shift, now, failure, on } = input;

  if (!shift) {
    const open = input.openShiftsAvailable;
    return {
      timer: "--:--",
      caption: "No shift today",
      ring: { value: 0, tone: "green", track: "default", overtime: 0 },
      status: { label: "No shift today", tone: "neutral" },
      stats: [
        stat("Clock-in", EMPTY, "empty"),
        stat("Clock-out", EMPTY, "empty"),
        stat("Shift", "Not scheduled"),
        stat("Break", EMPTY, "empty"),
      ],
      actions: [{ label: "Find open shifts", variant: "green", href: "#open-shifts" }],
      note:
        open > 0 ? { text: `${open} open shift${open === 1 ? "" : "s"} available.` } : undefined,
    };
  }

  const t = deriveTotals(clock, shift, now);
  const time = (ms: number) => formatTime(ms, shift.timeZone);
  const allowance = formatMinutes(shift.breakAllowanceMinutes);
  const shiftStat = stat("Shift", shift.label);
  const clockInStat = stat("Clock-in", clock.clockedInAt ? time(clock.clockedInAt) : EMPTY);
  const ring = {
    value: ringProgress(clock, shift, t),
    tone: "green" as const,
    track: "default" as const,
    overtime: 0,
  };

  if (clock.status === "not_clocked_in") {
    const stats: ShiftClockView["stats"] = [
      stat("Clock-in", EMPTY, "empty"),
      stat("Clock-out", EMPTY, "empty"),
      shiftStat,
      stat("Break", allowance),
    ];
    if (failure) {
      return {
        timer: "00:00",
        caption: "Not started",
        ring: { ...ring, track: "danger" },
        status: { label: "Clock-in failed", tone: "danger" },
        stats,
        actions: [
          { label: "Try again", variant: "green", onClick: on.clockIn },
          {
            label: "Request manual clock-in",
            variant: "outline",
            onClick: on.requestManualClockIn,
          },
        ],
        note: { text: failureNote(shift, failure), danger: true },
      };
    }
    return {
      timer: "00:00",
      caption: "Not started",
      ring,
      status: { label: "Not clocked in", tone: "neutral" },
      stats,
      actions: [{ label: "Clock in", variant: "green", onClick: on.clockIn }],
      note: now ? { text: startsIn(shift, now) } : undefined,
    };
  }

  // No Figma frame: the manual clock-in request is waiting for a manager.
  if (clock.status === "pending_approval") {
    return {
      timer: "00:00",
      caption: "Not started",
      ring,
      status: { label: "Awaiting approval", tone: "warning" },
      stats: [
        stat("Clock-in", EMPTY, "empty"),
        stat("Clock-out", EMPTY, "empty"),
        shiftStat,
        stat("Break", allowance),
      ],
      actions: [],
      note: { text: "Your manual clock-in request is waiting for a manager to approve it." },
    };
  }

  if (clock.status === "completed") {
    return {
      timer: formatHoursMinutes(t.workedMs),
      caption: "Total worked",
      ring: { ...ring, tone: "info" },
      status: { label: "Shift complete", tone: "info" },
      stats: [
        clockInStat,
        stat("Clock-out", clock.clockedOutAt ? time(clock.clockedOutAt) : EMPTY),
        shiftStat,
        stat(
          "Break",
          t.breakUsedMs ? `Taken · ${formatMinutes(t.breakUsedMs / 60_000)}` : "None taken",
        ),
      ],
      // No timesheet page yet.
      actions: [{ label: "View timesheet", variant: "outline" }],
      note: input.nextShift ? { text: `Next shift: ${input.nextShift}.` } : undefined,
    };
  }

  if (clock.status === "on_break") {
    return {
      timer: formatCountdown(t.breakLeftMs),
      caption: "Break left",
      ring: { ...ring, tone: "caution" },
      status: { label: "On break", tone: "warning" },
      stats: [
        clockInStat,
        stat("Clock-out", `Due ${time(shift.endsAt)}`),
        shiftStat,
        stat("Break", `Ends ${time(now + t.breakLeftMs)}`),
      ],
      actions: [{ label: "End break", variant: "green", onClick: on.endBreak }],
      note: {
        text: `Work timer paused at ${formatDuration(t.workedMs)} while you’re on break.`,
      },
    };
  }

  // Clocked in: working, back from break, or past the scheduled end (overtime).
  const breakTaken = t.breakUsedMs > 0;
  const breakStat = t.breakAllowanceUsed
    ? stat("Break", breakTaken ? `Taken · ${formatMinutes(t.breakUsedMs / 60_000)}` : "None")
    : stat("Break", `${formatMinutes(t.breakLeftMs / 60_000)} available`);
  const clockOut: ClockButtonView = { label: "Clock out", variant: "dark", onClick: on.clockOut };

  if (t.overtimeMs >= 60_000) {
    const over = formatMinutes(t.overtimeMs / 60_000);
    return {
      timer: formatHoursMinutes(t.workedMs),
      caption: "Worked today",
      ring: { ...ring, value: 1, overtime: overtimeProgress(shift, t) },
      status: { label: `Overtime · +${over}`, tone: "danger" },
      stats: [
        clockInStat,
        stat("Clock-out", `Was due ${time(shift.endsAt)}`, "danger"),
        shiftStat,
        breakStat,
      ],
      // No overtime approval endpoint yet.
      actions: [{ label: "Request approval", variant: "outline" }, clockOut],
      note: { text: `You’re ${over} past your scheduled end time.`, danger: true },
    };
  }

  return {
    timer: formatHoursMinutes(t.workedMs),
    caption: "Worked today",
    ring,
    status: { label: "Clocked in", tone: "success" },
    stats: [clockInStat, stat("Clock-out", `Due ${time(shift.endsAt)}`), shiftStat, breakStat],
    actions: [
      t.breakAllowanceUsed
        ? { label: "Break used", variant: "muted" }
        : { label: "Take break", variant: "outline", onClick: on.takeBreak },
      clockOut,
    ],
    note: { text: `${formatDuration(t.shiftLeftMs)} left in this shift.` },
  };
}
