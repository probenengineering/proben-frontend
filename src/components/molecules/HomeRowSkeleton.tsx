import { Skeleton } from "@/components/atoms";

import { HOME_TABLE_COLUMNS } from "./HomeTableHeader";

// Loading row of the My homes table (Figma "Skeleton row" in 60:13068): 16px padding and gaps,
// slate-200 divider. 40px tile (12px radius); name 14px + code 10px bars (8px apart); street 160
// + city 120 bars; a 70 × 22 pill; then role 150 and action 80 bars. Rows fade down the list.
export interface HomeRowSkeletonProps {
  nameWidth: number;
  opacity?: number;
}

export function HomeRowSkeleton({ nameWidth, opacity = 1 }: HomeRowSkeletonProps) {
  return (
    <li
      aria-hidden
      className="flex items-center gap-4 border-b border-slate-200 p-4 last:border-b-0"
      style={{ opacity }}
    >
      <Skeleton className="size-10 shrink-0 rounded-[12px]" />
      <span className={`flex flex-col gap-2 ${HOME_TABLE_COLUMNS.home}`}>
        <Skeleton className="h-3.5 max-w-full" style={{ width: nameWidth }} />
        <Skeleton className="h-2.5 w-17.5" />
      </span>
      <span className={`flex-col gap-2 ${HOME_TABLE_COLUMNS.address}`}>
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-2.5 w-30" />
      </span>
      <span className={HOME_TABLE_COLUMNS.assignment}>
        <Skeleton className="h-5.5 w-17.5 rounded-full" />
      </span>
      <span className={HOME_TABLE_COLUMNS.role}>
        <Skeleton className="h-3 w-37.5" />
      </span>
      <span className={`flex ${HOME_TABLE_COLUMNS.action}`}>
        <Skeleton className="h-3 w-20" />
      </span>
    </li>
  );
}
