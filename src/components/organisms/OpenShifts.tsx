import { Icon, StatusPill } from "@/components/atoms";
import { ArrowLink, OpenShiftCard, type OpenShiftCardProps } from "@/components/molecules";

// v2 "Open Shifts" in the Home right column (Figma 60:9879): header with the orange
// "N available" pill and "View all", then compact Open Shift Cards.
export interface OpenShiftsProps {
  items: (OpenShiftCardProps & { id: string })[];
  available: number;
}

export function OpenShifts({ items, available }: OpenShiftsProps) {
  return (
    <section id="open-shifts" className="flex w-full scroll-mt-6 flex-col gap-3">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Icon name="calendar-add" size={16} />
          <h2 className="type-paragraph-sm font-inter! font-medium whitespace-nowrap text-black">
            Open Shifts
          </h2>
          {available > 0 && (
            <StatusPill tone="orange" size="sm" dot>
              {available} available
            </StatusPill>
          )}
        </div>
        <ArrowLink className="font-inter!">View all</ArrowLink>
      </div>
      {items.length === 0 ? (
        <p className="type-ui-14 text-slate-500">No open shifts right now.</p>
      ) : (
        <ul className="flex w-full flex-col gap-2">
          {items.map(({ id, ...item }) => (
            <OpenShiftCard key={id} {...item} />
          ))}
        </ul>
      )}
    </section>
  );
}
