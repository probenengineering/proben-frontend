"use client";

import { ProgressRing, StatusPill } from "@/components/atoms";
import { TimeStat } from "@/components/molecules";
import { useShiftClock } from "@/hooks/useShiftClock";
import type { ScheduledShift } from "@/lib/shift-clock/types";

// "My time" block: progress ring with the running time and the clock action, then the shift
// details. States (Figma): not clocked in, clocked in (51:9269), on break / break ended
// (51:9961), work resumed (51:9441), no shift today (51:10133). Below sm the details sit
// under the ring.
export interface ClockCardProps {
  /** null = no shift today: zeroed, greyed, Clock in not clickable. */
  shift: ScheduledShift | null;
}

export function ClockCard({ shift }: ClockCardProps) {
  const clock = useShiftClock(shift);
  const [left, right] = clock.stats;

  return (
    <section className="flex w-full flex-col gap-5 p-6 sm:flex-row sm:items-stretch">
      <div className="shrink-0 self-start p-2">
        <ProgressRing value={clock.progress} variant={clock.ringVariant}>
          <span className="type-heading-sm font-medium text-black">{clock.timer}</span>
          <StatusPill tone={clock.action.tone} onClick={clock.action.onClick}>
            {clock.action.label}
          </StatusPill>
        </ProgressRing>
      </div>

      <div className="flex w-full flex-col justify-between gap-4 py-3 sm:w-61.75 sm:gap-0">
        <div className="flex items-center gap-2.5">
          <h2 className="type-paragraph-lg font-medium whitespace-nowrap text-black">My time</h2>
          <StatusPill tone={clock.status.tone}>{clock.status.label}</StatusPill>
        </div>
        <TimeStat
          layout="inline"
          label="Clock-in time"
          value={clock.clockInTime}
          muted={!clock.active}
          mutedLabel
        />
        <div className="flex w-full items-start justify-between">
          <TimeStat {...left} />
          <TimeStat {...right} align="end" />
        </div>
      </div>
    </section>
  );
}
