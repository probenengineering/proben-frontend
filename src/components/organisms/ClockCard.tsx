"use client";

import Link from "next/link";

import { Button, ProgressRing, StatePill } from "@/components/atoms";
import { ClockStat } from "@/components/molecules";
import { useShiftClock } from "@/hooks/useShiftClock";
import type { ApiAttendance } from "@/lib/command-center/types";
import type { ScheduledShift } from "@/lib/shift-clock/types";
import type { ClockButtonView } from "@/lib/shift-clock/view";
import { cn } from "@/lib/utils";

import { ClockInDialog } from "./ClockInDialog";
import { ClockOutDialog } from "./ClockOutDialog";

// v2 "My time" card (Figma Time Clock 60:5349): 176px ring with the timer and caption, then the
// title and status pill, a 2×2 grid (Clock-in, Clock-out, Shift, Break), the actions and a note.
// States: 60:9785 not clocked in, 60:9901 clock-in failed, 60:10017 clocked in, 60:10133 on break,
// 60:10249 back from break, plus overtime, shift complete and no shift from the component.
// Below sm (agreed, not in Figma) the details sit under the ring.
export interface ClockCardProps {
  /** null = no shift today. */
  shift: ScheduledShift | null;
  /** The live clock from GET /attendance; null when signed out or it couldn't load. */
  attendance: ApiAttendance | null;
  /** Open shifts count, for the no-shift note. */
  openShiftsAvailable: number;
  /** "Fri, 26 Oct · 8:00 AM at Oakridge Group Home", for the Shift complete note. */
  nextShift?: string;
}

function ClockButton({ label, variant, onClick, href }: ClockButtonView) {
  if (href) {
    return (
      <Button variant={variant} size="pill" render={<Link href={href} />} nativeButton={false}>
        {label}
      </Button>
    );
  }
  return (
    <Button variant={variant} size="pill" onClick={onClick} disabled={variant === "muted"}>
      {label}
    </Button>
  );
}

export function ClockCard({ shift, attendance, openShiftsAvailable, nextShift }: ClockCardProps) {
  const { view, confirmIn, confirmOut } = useShiftClock(
    shift,
    attendance,
    openShiftsAvailable,
    nextShift,
  );
  const [clockIn, clockOut, shiftStat, breakStat] = view.stats;

  return (
    <section className="flex w-full flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
      <ProgressRing
        value={view.ring.value}
        tone={view.ring.tone}
        track={view.ring.track}
        overtime={view.ring.overtime}
        className="self-center"
      >
        <span className="type-ui-30 font-semibold text-slate-900">{view.timer}</span>
        <span className="type-ui-12 text-slate-500">{view.caption}</span>
      </ProgressRing>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <h2 className="type-ui-18 font-semibold whitespace-nowrap text-slate-900">My time</h2>
          <StatePill tone={view.status.tone}>{view.status.label}</StatePill>
        </div>

        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full gap-4">
            <ClockStat {...clockIn} />
            <ClockStat {...clockOut} />
          </div>
          <div className="flex w-full gap-4">
            <ClockStat {...shiftStat} />
            <ClockStat {...breakStat} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-wrap items-start gap-2.5">
            {view.actions.map((action) => (
              <ClockButton key={action.label} {...action} />
            ))}
          </div>
          {view.note && (
            <p
              className={cn("type-ui-13", view.note.danger ? "text-danger-700" : "text-slate-500")}
            >
              {view.note.text}
            </p>
          )}
        </div>
      </div>

      {shift && (
        <ClockInDialog
          shift={shift}
          open={confirmIn.open}
          onOpenChange={confirmIn.setOpen}
          onConfirm={(location) => void confirmIn.clockIn(location)}
        />
      )}
      <ClockOutDialog
        open={confirmOut.open}
        onOpenChange={confirmOut.setOpen}
        summary={confirmOut.summary}
        onConfirm={() => void confirmOut.clockOut()}
      />
    </section>
  );
}
