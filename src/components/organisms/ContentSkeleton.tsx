import { Skeleton } from "@/components/atoms";
import { ScheduleRowSkeleton } from "@/components/molecules";

// Placeholder while a page's data streams in, so the content area never flashes blank. No Figma
// frame: built from the Figma skeleton parts (Skeleton bars, "Skeleton row" 60:7099).
// `hero`: the My time card's shape (ring + title + 2×2 stats) above the rows (Home overview).
export interface ContentSkeletonProps {
  /** Screen-reader label, e.g. "Loading notifications". */
  label: string;
  rows?: number;
  hero?: boolean;
}

const TITLES = [220, 180, 240, 160, 200, 190];
const SUBTITLES = [140, 120, 160, 100, 130, 150];

export function ContentSkeleton({ label, rows = 5, hero }: ContentSkeletonProps) {
  return (
    <div className="flex w-full flex-col" aria-busy aria-label={label}>
      {hero && (
        <div className="flex w-full flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
          <Skeleton className="size-40 shrink-0 self-center rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-[12px]" />
              ))}
            </div>
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        </div>
      )}
      <div className="flex w-full flex-col gap-5 p-6">
        <Skeleton className="h-4 w-40" />
        <ul className="overflow-clip rounded-[12px] border border-slate-200 bg-white">
          {Array.from({ length: rows }, (_, i) => (
            <ScheduleRowSkeleton
              key={i}
              title={TITLES[i % TITLES.length]}
              subtitle={SUBTITLES[i % SUBTITLES.length]}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
