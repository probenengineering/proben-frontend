import { Chip, Skeleton } from "@/components/atoms";
import { ScheduleRowSkeleton, ScheduleTableHeader } from "@/components/molecules";

// Schedule list while loading (Figma 60:7033): the toolbar (counts aren't known yet, so the chips
// show no numbers) and the table with a grey group band and 8 skeleton rows.
const ROWS: [number, number][] = [
  [220, 140],
  [180, 110],
  [260, 160],
  [200, 120],
  [220, 140],
  [180, 110],
  [260, 160],
  [200, 120],
];

export function ScheduleListSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 px-5 pt-4" aria-busy aria-label="Loading schedule">
      <div className="flex w-full flex-wrap items-center gap-4">
        <Skeleton className="h-6 w-45" />
        <span aria-hidden className="hidden h-5 w-px bg-slate-200 sm:block" />
        <div className="flex flex-wrap gap-2">
          {["All tasks", "Upcoming", "Completed", "Overdue"].map((label, i) => (
            <Chip key={label} variant="outline" selected={i === 0} disabled>
              {label}
            </Chip>
          ))}
        </div>
        <Chip trailingIcon="chevron-down-18" className="ml-auto text-grey-600" disabled>
          Week
        </Chip>
      </div>

      <ul className="flex w-full flex-col overflow-clip rounded-[12px] border border-slate-200 bg-white">
        <ScheduleTableHeader />
        <li className="bg-slate-50 py-3 pl-4">
          <Skeleton className="h-4 w-35" />
        </li>
        {ROWS.map(([title, subtitle], i) => (
          <ScheduleRowSkeleton key={i} title={title} subtitle={subtitle} />
        ))}
      </ul>
    </div>
  );
}
