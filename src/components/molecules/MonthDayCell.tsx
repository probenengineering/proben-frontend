import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import type { MonthCell } from "@/types/calendar";

// Month view day (Figma "Day 1" 60:9197): 118px tall, slate-200 grid lines, 8/8/6/8 padding, 4px
// gaps. Number Inter Medium 13/18 (other months grey-300 on white-50; today Semi Bold on
// calendar-today with a green "Today" pill, 10/14). Up to 2 event pills (20px, 4px radius, 12%
// tint, 2 × 12 bar, Inter 11/14 in the event colour), then "+N more" (Semi Bold 11/14 slate-500).
// Selected (its day popover is open, Figma 60:9442): green-tint fill, 2px green-500 outline and a
// white Semi Bold number on a green-500 circle. A button: MonthCalendar opens the day popover.
const pills = {
  blue: { tint: "bg-event-blue/12", bar: "bg-event-blue", text: "text-event-blue-text" },
  green: { tint: "bg-event-green/12", bar: "bg-event-green", text: "text-event-green-text" },
  purple: { tint: "bg-event-purple/12", bar: "bg-event-purple", text: "text-event-purple-text" },
  amber: { tint: "bg-warning/12", bar: "bg-warning", text: "text-event-amber-text" },
};

const SHOWN = 2;

export interface MonthDayCellProps extends ComponentProps<"button"> {
  cell: MonthCell;
  selected?: boolean;
}

export function MonthDayCell({ cell, selected, className, ...rest }: MonthDayCellProps) {
  const more = cell.chips.length - SHOWN;
  return (
    <button
      type="button"
      aria-label={`${cell.day}, ${cell.chips.length} items`}
      {...rest}
      className={cn(
        "flex h-29.5 min-w-0 flex-1 cursor-pointer flex-col gap-1 border-r border-b border-slate-200 px-2 pt-2 pb-1.5 text-left last:border-r-0",
        selected
          ? "bg-green-tint ring-2 ring-green-500 ring-inset"
          : !cell.inMonth
            ? "bg-white-50 hover:bg-slate-50"
            : cell.today
              ? "bg-calendar-today"
              : "bg-white hover:bg-slate-50",
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "flex size-6.5 items-center justify-center rounded-full type-ui-13",
            cell.today || selected ? "font-semibold" : "font-medium",
            selected ? "bg-green-500 text-white" : cell.inMonth ? "text-black" : "text-grey-300",
          )}
        >
          {cell.day}
        </span>
        {cell.today && (
          <span className="rounded-full bg-green-500 px-1.5 py-px type-ui-10 font-semibold text-white">
            Today
          </span>
        )}
      </span>
      {cell.inMonth &&
        cell.chips.slice(0, SHOWN).map((chip, i) => (
          <span
            key={`${chip.time}-${chip.title}-${i}`}
            className={cn(
              "flex h-5 w-full items-center gap-1 rounded-[4px] py-[3px] pr-1.5 pl-1",
              pills[chip.color].tint,
            )}
          >
            <span
              aria-hidden
              className={cn("h-3 w-0.5 shrink-0 rounded-[1px]", pills[chip.color].bar)}
            />
            <span className={cn("truncate type-ui-11-14", pills[chip.color].text)}>
              <span className="font-semibold">{chip.time}</span> {chip.title}
            </span>
          </span>
        ))}
      {cell.inMonth && more > 0 && (
        <span className="type-ui-11-14 font-semibold text-slate-500">+{more} more</span>
      )}
    </button>
  );
}
