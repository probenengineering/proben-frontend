"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/atoms";
import { LocationCheck, type LocationCheckProps, SummaryRow } from "@/components/molecules";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";
import type { ClockInLocation } from "@/lib/command-center/attendance-actions";
import { formatTime } from "@/lib/command-center/time";
import { distanceMeters } from "@/lib/shift-clock/derive";
import { formatMiles, formatMinutes } from "@/lib/shift-clock/format";
import { currentLocation } from "@/lib/shift-clock/store";
import type { ScheduledShift } from "@/lib/shift-clock/types";

// "Clock in for your shift?" (Figma 60:10721): 480px modal, 24px radius, 40% slate-900 scrim.
// Summary of the shift, then a location check when the home requires GPS: the position is read
// when the modal opens and compared with the home's geofence; Clock in sends that position.
export interface ClockInDialogProps {
  shift: ScheduledShift;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (location?: ClockInLocation) => void;
}

type Check = { state: LocationCheckProps["state"]; location?: ClockInLocation; detail?: string };

const TITLES = {
  checking: "Checking your location…",
  verified: "Location verified",
  failed: "Location not verified",
};

function judge(shift: ScheduledShift, location: ClockInLocation): Check {
  const { latitude, longitude, geofenceRadiusMeters: radius } = shift;
  if (latitude === undefined || longitude === undefined || radius === undefined) {
    return { state: "verified", location };
  }
  const meters = distanceMeters([location.latitude, location.longitude], [latitude, longitude]);
  return meters <= radius
    ? { state: "verified", location, detail: shift.address && `You’re at ${shift.address}` }
    : { state: "failed", location, detail: `You’re ${formatMiles(meters)} from ${shift.homeName}` };
}

/** Mounted each time the modal opens, so the time and the location check start fresh. */
function ClockInBody({ shift, onOpenChange, onConfirm }: Omit<ClockInDialogProps, "open">) {
  const [openedAt] = useState(() => Date.now());
  const [check, setCheck] = useState<Check>({ state: "checking" });

  useEffect(() => {
    if (!shift.requireLocation) return;
    let live = true;
    currentLocation().then(
      (location) => live && setCheck(judge(shift, location)),
      (error: Error) => live && setCheck({ state: "failed", detail: error.message }),
    );
    return () => {
      live = false;
    };
  }, [shift]);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <DialogTitle className="type-ui-20 font-semibold text-slate-900">
          Clock in for your shift?
        </DialogTitle>
        <DialogDescription className="type-ui-14 text-slate-500">
          Your time starts the moment you confirm.
        </DialogDescription>
      </div>

      <div className="flex flex-col rounded-[14px] bg-slate-50 px-4 py-1.5">
        <div className="flex flex-col gap-0.5 py-2.5">
          <p className="type-ui-16 font-semibold text-slate-900">{shift.homeName}</p>
          <p className="type-ui-13 text-slate-500">
            {[shift.role, shift.label].filter(Boolean).join(" · ")}
          </p>
        </div>
        <SummaryRow label="Clock-in time" value={formatTime(openedAt, shift.timeZone)} divider />
        <SummaryRow label="Paid break" value={formatMinutes(shift.breakAllowanceMinutes)} />
      </div>

      {shift.requireLocation && (
        <LocationCheck state={check.state} title={TITLES[check.state]} detail={check.detail} />
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="pill-lg"
          className="flex-1"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          variant="green"
          size="pill-lg"
          className="flex-1"
          disabled={shift.requireLocation && check.state === "checking"}
          onClick={() => onConfirm(check.location)}
        >
          Clock in
        </Button>
      </div>
    </>
  );
}

export function ClockInDialog({ open, ...props }: ClockInDialogProps) {
  return (
    <Dialog open={open} onOpenChange={props.onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-900/40 supports-backdrop-filter:backdrop-blur-none"
        className="flex w-120 max-w-[calc(100%-2rem)] flex-col gap-5 rounded-[24px] bg-white px-7 pt-7 pb-6 shadow-modal ring-0 sm:max-w-120"
      >
        {open && <ClockInBody {...props} />}
      </DialogContent>
    </Dialog>
  );
}
