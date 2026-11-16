import {
  EmptyPanel,
  ScheduleItem,
  type ScheduleItemProps,
  SectionHeader,
} from "@/components/molecules";

// "Today's schedule": header with link, then the shifts in a 16px-radius white-400 card,
// or a dashed "No schedule today" box when there are none (Figma 51:10133).
export interface TodayScheduleProps {
  items: Omit<ScheduleItemProps, "first">[];
}

export function TodaySchedule({ items }: TodayScheduleProps) {
  return (
    <section className="flex w-full flex-col gap-5 p-6">
      {/* Figma's link text here also reads "View all open shifts". */}
      <SectionHeader
        icon="calendar-2"
        title="Today’s schedule"
        actionLabel="View all open shifts"
      />
      {items.length === 0 ? (
        <EmptyPanel message="No schedule today" />
      ) : (
        <ul className="flex w-full flex-col overflow-clip rounded-[16px] border border-white-400">
          {items.map((item, i) => (
            <ScheduleItem key={`${item.home}-${i}`} {...item} first={i === 0} />
          ))}
        </ul>
      )}
    </section>
  );
}
