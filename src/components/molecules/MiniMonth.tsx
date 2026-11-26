import Link from "next/link";

import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { MiniMonthDay } from "@/types/calendar";

// Day view mini calendar (Figma "Mini calendar" 60:8668): 16px-radius slate-200 card, 16px padding.
// Header "October 2026" (Inter Semi Bold 14/20) with ‹ › links; S M T … (Inter Semi Bold 11/16
// grey-400); 32px day circles (Inter 13/18 grey-700, other months grey-300) with a 4px grey dot on
// days that have items. Selected = green-500 fill, white Semi Bold; today (when not selected) =
// 1.5px green-500 ring (Figma 60:8851).
export interface MiniMonthProps {
  monthLabel: string;
  weeks: MiniMonthDay[][];
  dayHref: (key: string) => string;
  prevHref: string;
  nextHref: string;
}

const LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export function MiniMonth({ monthLabel, weeks, dayHref, prevHref, nextHref }: MiniMonthProps) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[16px] border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <p className="flex-1 type-ui-14 font-semibold text-slate-900">{monthLabel}</p>
        <Link href={prevHref} aria-label="Previous month" className="flex">
          <Icon name="chevron-left" size={16} />
        </Link>
        <Link href={nextHref} aria-label="Next month" className="flex">
          <Icon name="chevron-right" size={16} />
        </Link>
      </div>
      <div className="flex" aria-hidden>
        {LETTERS.map((l, i) => (
          <span key={i} className="flex-1 text-center type-ui-11 font-semibold text-grey-400">
            {l}
          </span>
        ))}
      </div>
      {weeks.map((week) => (
        <div key={week[0].key} className="flex">
          {week.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-0.5">
              <Link
                href={dayHref(d.key)}
                aria-current={d.selected ? "date" : undefined}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full type-ui-13",
                  d.selected
                    ? "bg-green-500 font-semibold text-white"
                    : d.today
                      ? "border-[1.5px] border-green-500 text-grey-700"
                      : d.inMonth
                        ? "text-grey-700 hover:bg-slate-50"
                        : "text-grey-300 hover:bg-slate-50",
                )}
              >
                {d.day}
              </Link>
              <span
                aria-hidden
                className={cn(
                  "size-1 rounded-full",
                  d.selected ? "bg-green-500" : "bg-grey-400",
                  (!d.hasItems || !d.inMonth) && "opacity-0",
                )}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
