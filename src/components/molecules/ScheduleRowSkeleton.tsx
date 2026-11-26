import { Skeleton } from "@/components/atoms";

// Loading row in the Schedule list (Figma "Skeleton row" 60:7099): same columns as ScheduleRow,
// grey bars instead of content. `title` / `subtitle` vary the bar widths so rows don't look cloned.
export interface ScheduleRowSkeletonProps {
  title?: number;
  subtitle?: number;
}

export function ScheduleRowSkeleton({ title = 220, subtitle = 140 }: ScheduleRowSkeletonProps) {
  return (
    <li className="flex w-full items-center gap-4 border-b border-slate-200 px-4 py-3 last:border-b-0">
      <Skeleton className="size-5 shrink-0" />
      <Skeleton className="h-10 w-[3px] shrink-0 rounded-[2px]" />
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 max-w-full" style={{ width: title }} />
        <Skeleton className="h-2.5 max-w-full" style={{ width: subtitle }} />
      </span>
      <span className="hidden w-42.5 shrink-0 md:block">
        <Skeleton className="h-3.5 w-30" />
      </span>
      <span className="hidden w-37.5 shrink-0 md:block">
        <Skeleton className="h-5.5 w-20 rounded-[4px]" />
      </span>
      <span className="w-30 shrink-0">
        <Skeleton className="h-5.5 w-21 rounded-full" />
      </span>
      <span className="w-13 shrink-0" />
    </li>
  );
}
