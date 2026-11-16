"use client";

import { useSyncExternalStore } from "react";

import { deriveTotals, ringProgress } from "@/lib/shift-clock/derive";
import { formatClockTime, formatDuration, formatTimer } from "@/lib/shift-clock/format";
import { clockIn, clockOut, endBreak, shiftClockStore, startBreak } from "@/lib/shift-clock/store";
import type { ScheduledShift } from "@/lib/shift-clock/types";
import type { StatusPillProps } from "@/components/atoms";

type PillTone = NonNullable<StatusPillProps["tone"]>;

export interface ClockStatView {
  label: string;
  value: string;
  /** Figma greys the break-state labels (#737E8C) but not "Scheduled shift"/"Break time". */
  mutedLabel?: boolean;
  /** Greyed label and value (no shift today). */
  muted?: boolean;
}

export interface ShiftClockView {
  /** Big ring number, "HH : MM". */
  timer: string;
  /** Ring fill 0–1. */
  progress: number;
  /** "fade" = grey→green arc while working; "solid" = bright green while on break. */
  ringVariant: "fade" | "solid";
  /** No onClick = shown but not clickable (no shift today). */
  action: { label: string; tone: PillTone; onClick?: () => void };
  status: { label: string; tone: PillTone };
  clockInTime: string;
  /** False before clocking in: the clock-in row is greyed out. */
  active: boolean;
  /** Bottom row: [left, right]. */
  stats: [ClockStatView, ClockStatView];
}

const subscribeTick = (notify: () => void) => {
  const id = window.setInterval(notify, 1000);
  return () => window.clearInterval(id);
};
const subscribeNever = () => () => {};
/** Whole seconds, so repeated reads within a second return the same snapshot. */
const readNow = () => Math.floor(Date.now() / 1000) * 1000;

// Drives the "My time" card. State lives in the shift-clock store (localStorage until the
// backend exists); this hook ticks `now` every second and maps the record to what the card shows.
export function useShiftClock(shift: ScheduledShift | null): ShiftClockView {
  const clock = useSyncExternalStore(
    shiftClockStore.subscribe,
    shiftClockStore.getSnapshot,
    shiftClockStore.getServerSnapshot,
  );
  // Ticks once a second while the clock runs. Read through a store so Date.now() never runs
  // during prerender (Next flags that); every render after an action reads a fresh time too.
  const running = clock.status !== "not_clocked_in";
  const now = useSyncExternalStore(running ? subscribeTick : subscribeNever, readNow, () => 0);

  // No shift today (Figma 51:10133): everything zeroed and greyed, Clock in not clickable.
  if (!shift) {
    return {
      timer: "00 : 00",
      progress: 0,
      ringVariant: "fade",
      action: { label: "Clock in", tone: "green" },
      status: { label: "Not clocked in", tone: "orange" },
      clockInTime: "00 : 00",
      active: false,
      stats: [
        { label: "Work Duration", value: "00 : 00", muted: true },
        { label: "Break ends in", value: "00 : 00", muted: true },
      ],
    };
  }

  const totals = deriveTotals(clock, shift, now);
  const progress = ringProgress(clock, shift, totals);
  const scheduled = { label: "Scheduled shift", value: shift.label };
  const breakTime = {
    label: "Break time",
    value: formatDuration(shift.breakAllowanceMinutes * 60_000),
  };

  if (clock.status === "not_clocked_in") {
    return {
      timer: "00 : 00",
      progress,
      ringVariant: "fade",
      action: { label: "Clock in", tone: "green", onClick: clockIn },
      status: { label: "Not clocked in", tone: "orange" },
      clockInTime: "00 : 00",
      active: false,
      stats: [scheduled, breakTime],
    };
  }

  const clockInTime = formatClockTime(clock.clockedInAt ?? now);

  if (clock.status === "on_break") {
    return {
      timer: formatTimer(totals.breakUsedMs),
      progress,
      ringVariant: "solid",
      action: { label: "Resume work", tone: "black", onClick: endBreak },
      status: { label: totals.breakAllowanceUsed ? "Break ended" : "On break", tone: "amber" },
      clockInTime,
      active: true,
      stats: [
        { label: "Work Duration", value: formatDuration(totals.workedMs), mutedLabel: true },
        {
          label: "Break ends in",
          value: formatDuration(totals.breakLeftMs, "up"),
          mutedLabel: true,
        },
      ],
    };
  }

  // Clocked in: another break while allowance is left; once it's used up (or the shift is done), clock out.
  const canBreak = !totals.breakAllowanceUsed && !totals.shiftComplete;
  return {
    timer: formatTimer(totals.workedMs),
    progress,
    ringVariant: "fade",
    action: canBreak
      ? { label: "Take break", tone: "black", onClick: startBreak }
      : { label: "Clock out", tone: "green", onClick: clockOut },
    status: { label: "Clocked in", tone: "leaf" },
    clockInTime,
    active: true,
    stats: [scheduled, breakTime],
  };
}
