"use client";

import Link from "next/link";

import { Button, DateBadge, Icon, ProgressBar } from "@/components/atoms";
import { AgendaItem } from "@/components/molecules";
import type { ScheduleItem } from "@/types/schedule";

// "Day agenda panel" (Figma 60:7511), shown when a day header is clicked: 372px, 20px radius,
// slate-200 border, popover shadow. Solid date badge + "Tuesday, 23 October" + counts + close;
// progress bar with "83% of the day's tasks done"; the day's agenda cards; Add task / Open day
// view. Add task shows only with `canAddTask` (org.manage) and isn't wired yet; Open day view
// goes to `dayHref`.
export interface CalendarDayPopoverProps {
  weekday: string;
  date: number;
  /** "Tuesday, 23 October". */
  label: string;
  items: ScheduleItem[];
  /** "Open day view" target; the Schedule list when omitted. */
  dayHref?: string;
  /** Show "Add task": the person may assign tasks (org.manage). */
  canAddTask?: boolean;
  onClose: () => void;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function CalendarDayPopover({
  weekday,
  date,
  label,
  items,
  dayHref = "/schedule/list",
  canAddTask = false,
  onClose,
}: CalendarDayPopoverProps) {
  const done = items.filter((i) => i.status === "completed").length;
  const overdue = items.filter((i) => i.status === "overdue").length;
  const share = items.length ? done / items.length : 0;
  const summary = [
    plural(items.length, "task"),
    `${done} completed`,
    ...(overdue ? [`${overdue} overdue`] : []),
  ].join(" · ");

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center gap-3 pt-4.5 pr-4 pb-3.5 pl-5">
        <DateBadge weekday={weekday} day={date} variant="solid" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="type-ui-16 font-semibold text-slate-900">{label}</p>
          <p className="type-ui-12 text-slate-500">{summary}</p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100"
        >
          <Icon name="close-16" size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-5 pb-4">
        <ProgressBar value={share} label="Day progress" />
        <p className="type-ui-12 text-slate-500">
          {Math.round(share * 100)}% of the day’s tasks done
        </p>
      </div>

      <ul className="flex max-h-111 flex-col gap-2 overflow-y-auto border-t border-slate-200 px-5 py-4">
        {items.length === 0 ? (
          <li className="type-ui-13 text-grey-400">Nothing scheduled for this day.</li>
        ) : (
          items.map((item) => (
            <AgendaItem
              key={`${item.kind}-${item.id}`}
              time={item.time}
              title={item.title}
              color={item.type.tone}
              status={item.status}
              href="/schedule/list"
            />
          ))
        )}
      </ul>

      <div className="flex gap-2.5 border-t border-slate-200 px-5 pt-3 pb-4.5">
        {/* Admins only (org.manage). Not wired yet: there's no add-task form in Figma. */}
        {canAddTask && (
          <Button variant="outline" size="pill" className="flex-1 px-4">
            Add task
          </Button>
        )}
        <Button
          variant="green"
          size="pill"
          className="flex-1 px-4"
          render={<Link href={dayHref} />}
          nativeButton={false}
        >
          Open day view
        </Button>
      </div>
    </div>
  );
}
