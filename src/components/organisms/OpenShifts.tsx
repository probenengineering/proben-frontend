import { StatusPill } from "@/components/atoms";
import {
  EmptyPanel,
  OpenShiftItem,
  type OpenShiftItemProps,
  SectionHeader,
} from "@/components/molecules";

// "Open Shifts": header with an orange "N available" pill and link, then the shifts in a card.
// Empty (Figma 51:10133): no pill, dashed "No open shift today" box.
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
          available > 0 ? (
            <StatusPill tone="orange" size="sm" dot>
              {available} available
            </StatusPill>
          ) : undefined
        }
        actionLabel="View all open shifts"
      />
      {items.length === 0 ? (
        <EmptyPanel message="No open shift today" />
      ) : (
        <ul className="flex w-full flex-col overflow-clip rounded-[16px] border border-white-400">
          {items.map((item, i) => (
            <OpenShiftItem key={`${item.home}-${i}`} {...item} />
          ))}
        </ul>
      )}
    </section>
  );
}
