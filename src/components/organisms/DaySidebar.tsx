import { AgendaItem, MiniMonth, SummaryStat } from "@/components/molecules";
import { calendarHref } from "@/lib/calendar-view";
import type { DayCalendarData } from "@/types/calendar";
import type { ScheduleStatus } from "@/types/schedule";

// Day view right column (Figma "Day sidebar" 60:8667): the mini calendar, then "Day summary"
// (16px-radius slate-200 card): Tasks / Done / Left tiles, "Up next" with the next agenda card, or
// a note when nothing's left ("Nothing else today. Next task: Mon 29 Oct, 9:00 AM").
export interface DaySidebarProps {
  base: string;
  data: DayCalendarData;
  /** Up next's status with any local "complete" applied. */
  upNextStatus?: ScheduleStatus;
}

export function DaySidebar({ base, data, upNextStatus }: DaySidebarProps) {
  const { summary } = data;
  return (
    <div className="flex w-full flex-col gap-4 lg:w-85 lg:shrink-0">
      <MiniMonth
        monthLabel={data.mini.monthLabel}
        weeks={data.mini.weeks}
        dayHref={(key) => calendarHref(base, "day", key)}
        prevHref={calendarHref(base, "day", data.mini.prev)}
        nextHref={calendarHref(base, "day", data.mini.next)}
      />
      <div className="flex flex-col gap-3.5 rounded-[16px] border border-slate-200 bg-white p-4">
        <p className="type-ui-14 font-semibold text-slate-900">Day summary</p>
        <div className="flex gap-2">
          <SummaryStat value={summary.total} label="Tasks" />
          <SummaryStat value={summary.done} label="Done" tone="success" />
          <SummaryStat value={summary.left} label="Left" />
        </div>
        <p className="type-ui-12 font-medium text-slate-500">Up next</p>
        {summary.upNext ? (
          <ul>
            <AgendaItem
              time={summary.upNext.label}
              title={summary.upNext.item.title}
              color={summary.upNext.item.type.tone}
              status={upNextStatus ?? summary.upNext.item.status}
              href={calendarHref(base, "day", data.focus)}
            />
          </ul>
        ) : (
          <p className="type-ui-13-20 text-slate-500">{summary.note}</p>
        )}
      </div>
    </div>
  );
}
