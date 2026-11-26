"use client";

import { useState } from "react";

import { Button, Checkbox, Textarea } from "@/components/atoms";
import { SummaryRow } from "@/components/molecules";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui";
import type { ClockOutSummary } from "@/hooks/useShiftClock";

// "Clock out and end your shift?" (Figma 60:10864): 480px modal like the clock-in one. Summary of
// the hours (total worked in verified green), an optional shift note and a handover checkbox, then
// Keep working / Clock out. The clock-out API takes no body yet, so the note and the handover tick
// are not sent (see docs/command-center.md).
export interface ClockOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: ClockOutSummary | null;
  onConfirm: () => void;
}

/** Mounted each time the modal opens, so the note and checkbox start empty. */
function ClockOutBody({ summary, onOpenChange, onConfirm }: Omit<ClockOutDialogProps, "open">) {
  const [note, setNote] = useState("");
  const [handover, setHandover] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <DialogTitle className="type-ui-20 font-semibold text-slate-900">
          Clock out and end your shift?
        </DialogTitle>
        <DialogDescription className="type-ui-14 text-slate-500">
          Review your hours before submitting them to your timesheet.
        </DialogDescription>
      </div>

      {summary && (
        <div className="flex flex-col rounded-[14px] bg-slate-50 px-4 py-1.5">
          <SummaryRow label="Clock-in" value={summary.clockIn} divider />
          <SummaryRow label="Clock-out" value={summary.clockOut} divider />
          <SummaryRow label="Break" value={summary.breakTaken} divider />
          <SummaryRow label="Total worked" value={summary.worked} tone="success" />
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="type-ui-14 font-medium text-grey-700">Shift note (optional)</span>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Anything the next caregiver should know about this shift?"
          rows={2}
        />
      </label>

      <label className="flex cursor-pointer items-center gap-2.5 type-ui-14 text-grey-700">
        <Checkbox
          checked={handover}
          onCheckedChange={(checked) => setHandover(checked === true)}
          className="size-4.5 rounded-[5px] [&_svg]:size-3.5!"
        />
        I’ve completed handover with the next caregiver
      </label>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="pill-lg"
          className="flex-1"
          onClick={() => onOpenChange(false)}
        >
          Keep working
        </Button>
        <Button variant="dark" size="pill-lg" className="flex-1" onClick={onConfirm}>
          Clock out
        </Button>
      </div>
    </>
  );
}

export function ClockOutDialog({ open, ...props }: ClockOutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={props.onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-900/40 supports-backdrop-filter:backdrop-blur-none"
        className="flex w-120 max-w-[calc(100%-2rem)] flex-col gap-5 rounded-[24px] bg-white px-7 pt-7 pb-6 shadow-modal ring-0 sm:max-w-120"
      >
        {open && <ClockOutBody {...props} />}
      </DialogContent>
    </Dialog>
  );
}
