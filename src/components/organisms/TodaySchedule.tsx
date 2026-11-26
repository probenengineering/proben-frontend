import { Icon } from "@/components/atoms";
import {
  AgendaItem,
  type AgendaItemProps,
  ArrowLink,
  NowIndicator,
  ScheduleEmpty,
  WeekStrip,
  type WeekStripDay,
} from "@/components/molecules";

// v2 "Today's schedule" (Figma 60:9818): header with "Thu, 25 Oct · 0 of 9 done" and a link,
// then a 16px-radius card: the week strip, and today's agenda with the red now line placed
// between the items that have started and the ones that haven't.
export interface TodayScheduleProps {
  /** "Thu, 25 Oct". */
  dateLabel: string;
  done: number;
  total: number;
  days: WeekStripDay[];
  items: (AgendaItemProps & { id: string })[];
  /** Index in `items` the now line goes before (items.length = after all); null = hide it. */
  nowAt: number | null;
  /** "11:10 AM". */
  nowLabel: string;
}

export function TodaySchedule({
  dateLabel,
  done,
  total,
  days,
  items,
  nowAt,
  nowLabel,
}: TodayScheduleProps) {
  const now = <NowIndicator key="now" time={nowLabel} />;
  const rows = items.map((item) => <AgendaItem key={item.id} {...item} />);
  if (nowAt !== null) rows.splice(nowAt, 0, now);

  return (
    <section className="flex w-full flex-col gap-5 p-6">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <Icon name="calendar-2" size={16} />
          <h2 className="type-paragraph-sm font-inter! font-medium whitespace-nowrap text-black">
            Today’s schedule
          </h2>
          <span className="type-ui-13 whitespace-nowrap text-slate-500">
            {total > 0 ? `${dateLabel} · ${done} of ${total} done` : dateLabel}
          </span>
        </div>
        <ArrowLink href="/tasks" className="font-inter!">
          View full schedule
        </ArrowLink>
      </div>

      <div className="flex w-full flex-col overflow-clip rounded-[16px] border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <WeekStrip days={days} />
        </div>
        {items.length === 0 ? (
          <ScheduleEmpty />
        ) : (
          <ul className="flex w-full flex-col gap-2 px-4 pt-3.5 pb-4">{rows}</ul>
        )}
      </div>
    </section>
  );
}
