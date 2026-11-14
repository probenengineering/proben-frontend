import { StatusPill } from "@/components/atoms";
import { OpenShiftItem, type OpenShiftItemProps, SectionHeader } from "@/components/molecules";

// "Open Shifts": header with an orange "N available" pill and link, then the shifts in a card.
export interface OpenShiftsProps {
  items: OpenShiftItemProps[];
  available: number;
}

export function OpenShifts({ items, available }: OpenShiftsProps) {
  return (
    <section className="flex w-full flex-col gap-5 p-6">
      <SectionHeader
        icon="calendar-add"
        title="Open Shifts"
        badge={
          <StatusPill tone="orange" size="sm" dot>
            {available} available
          </StatusPill>
        }
        actionLabel="View all open shifts"
      />
      <ul className="flex w-full flex-col overflow-clip rounded-[16px] border border-white-400">
        {items.map((item, i) => (
          <OpenShiftItem key={`${item.home}-${i}`} {...item} />
        ))}
      </ul>
    </section>
  );
}
