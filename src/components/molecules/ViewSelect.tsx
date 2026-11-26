"use client";

import Link from "next/link";
import { useState } from "react";

import { Chip } from "@/components/atoms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { CALENDAR_VIEWS, type CalendarView, calendarHref } from "@/lib/calendar-view";
import { cn } from "@/lib/utils";

// "Day / Week / Month" dropdown in the calendar toolbar (Figma "Chip" with a chevron, 60:8579):
// the chip shows the current view; the menu links to the same date in another view.
export interface ViewSelectProps {
  base: string;
  view: CalendarView;
  date: string;
}

export function ViewSelect({ base, view, date }: ViewSelectProps) {
  const [open, setOpen] = useState(false);
  const current = CALENDAR_VIEWS.find((v) => v.id === view)?.label ?? "Week";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Chip trailingIcon="chevron-down-18" aria-label={`View: ${current}`} />}
      >
        {current}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-36 gap-0.5 rounded-[12px] border border-slate-200 bg-white p-1 shadow-popover ring-0"
      >
        {CALENDAR_VIEWS.map((v) => (
          <Link
            key={v.id}
            href={calendarHref(base, v.id, date)}
            onClick={() => setOpen(false)}
            aria-current={v.id === view ? "page" : undefined}
            className={cn(
              "rounded-[8px] px-3 py-2 type-ui-14 text-grey-700 hover:bg-slate-50",
              v.id === view && "bg-green-50 font-medium text-green-ink",
            )}
          >
            {v.label}
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
}
