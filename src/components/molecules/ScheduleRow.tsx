"use client";

import { Checkbox, Icon, StatePill, type StatePillTone, TypeTag } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { ScheduleItem, ScheduleStatus } from "@/types/schedule";

// Figma "Task Row" (60:5206): checkbox, 3px category bar (the calendar colour), title and grey
// subtitle, clock + time (170px), Type tag (150px), Status pill (120px), chevron (52px).
// States: Default; Selected (open in the panel: green-50 fill, 3px green left border);
// Completed (ticked, bar 35%, struck-through grey text, tag 50%); Overdue (red time + pill).
// Below md (agreed, not in Figma) the Time and Type columns hide.
const bars = {
  blue: "bg-event-blue",
  purple: "bg-event-purple",
  emerald: "bg-event-green",
  amber: "bg-warning",
};

export const STATUS_PILL: Record<ScheduleStatus, { label: string; tone: StatePillTone }> = {
  upcoming: { label: "Upcoming", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  overdue: { label: "Overdue", tone: "danger" },
};

export interface ScheduleRowProps {
  item: ScheduleItem;
  selected?: boolean;
  onSelect: () => void;
  /** Ticking the checkbox completes the item (events only). */
  onComplete: () => void;
}

export function ScheduleRow({ item, selected, onSelect, onComplete }: ScheduleRowProps) {
  const done = item.status === "completed";
  const overdue = item.status === "overdue";
  return (
    <li
      tabIndex={0}
      aria-current={selected ? "true" : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-4 border-b border-slate-200 px-4 py-3 outline-none hover:bg-slate-50 focus-visible:bg-slate-50",
        selected && "border-l-3 border-l-green-500 bg-green-50 hover:bg-green-50",
      )}
    >
      <span onClick={(event) => event.stopPropagation()} className="flex shrink-0">
        <Checkbox
          aria-label={done ? `${item.title} completed` : `Mark ${item.title} as complete`}
          checked={done}
          disabled={done || !item.canComplete}
          onCheckedChange={(checked) => checked && onComplete()}
          className="size-5 rounded-[6px] border-[1.5px] border-grey-300 data-disabled:opacity-100 [&_svg]:size-4!"
        />
      </span>
      <span
        aria-hidden
        className={cn(
          "h-10 w-[3px] shrink-0 rounded-[2px]",
          bars[item.type.tone],
          done && "opacity-35",
        )}
      />
      <span className={cn("flex min-w-0 flex-1 flex-col gap-0.5", done && "text-grey-400")}>
        <span
          className={cn(
            "truncate type-ui-14 font-medium",
            done ? "line-through" : "text-slate-900",
          )}
        >
          {item.title}
        </span>
        {item.subtitle && (
          <span className={cn("truncate type-ui-12", !done && "text-slate-500")}>
            {item.subtitle}
          </span>
        )}
      </span>
      <span className="hidden w-42.5 shrink-0 items-center gap-1.5 md:flex">
        <Icon name="clock" size={16} />
        <span
          className={cn(
            "type-ui-14 whitespace-nowrap",
            done ? "text-grey-400" : overdue ? "text-danger-700" : "text-grey-700",
          )}
        >
          {item.time}
        </span>
      </span>
      <span className="hidden w-37.5 shrink-0 md:flex">
        <TypeTag label={item.type.label} tone={item.type.tone} muted={done} />
      </span>
      <span className="flex w-30 shrink-0">
        <StatePill tone={STATUS_PILL[item.status].tone}>{STATUS_PILL[item.status].label}</StatePill>
      </span>
      <span className="flex w-13 shrink-0 justify-end">
        <Icon name="chevron-right" size={20} />
      </span>
    </li>
  );
}
