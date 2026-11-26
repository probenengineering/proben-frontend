import Link from "next/link";

import { cn } from "@/lib/utils";

// Figma "Week Strip" (60:5620): seven equal day cells. Today has a 10% green tint, green-ink day
// name and a filled green number. A 4px dot marks days with something scheduled.
// "Click a day to open it in the calendar": the calendar has no date in its URL yet, so every day
// links to /tasks.
export interface WeekStripDay {
  /** "2026-10-25", unique per cell. */
  key: string;
  /** "THU". */
  weekday: string;
  /** "25". */
  day: string;
  today?: boolean;
  hasItems?: boolean;
}

export interface WeekStripProps {
  days: WeekStripDay[];
  href?: string;
  /** Per-day link (Home schedule: ?tab=schedule&day=<key>); overrides href. */
  hrefFor?: (key: string) => string;
}

export function WeekStrip({ days, href = "/tasks", hrefFor }: WeekStripProps) {
  return (
    <ol className="flex w-full items-start gap-1 bg-white">
      {days.map((day) => (
        <li key={day.key} className="min-w-0 flex-1">
          <Link
            href={hrefFor ? hrefFor(day.key) : href}
            scroll={hrefFor ? false : undefined}
            aria-current={day.today ? "date" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 rounded-[12px] py-1.5 transition-colors",
              day.today ? "bg-green-500/10" : "hover:bg-slate-50",
            )}
          >
            <span
              className={cn(
                "type-ui-10 font-bold whitespace-nowrap",
                day.today ? "text-green-ink" : "text-week-label",
              )}
            >
              {day.weekday}
            </span>
            <span
              className={cn(
                "flex size-7.5 items-center justify-center rounded-full type-ui-14 font-semibold",
                day.today ? "bg-green-500 text-white" : "text-slate-900",
              )}
            >
              {day.day}
            </span>
            <span
              aria-hidden
              className={cn(
                "size-1 rounded-full",
                day.today ? "bg-green-500" : "bg-grey-400",
                !day.hasItems && "opacity-0",
              )}
            />
          </Link>
        </li>
      ))}
    </ol>
  );
}
