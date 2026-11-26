import { Skeleton } from "@/components/atoms";

import { TASK_COLUMNS } from "./TaskTableRow";

// Loading row of the My tasks table (Figma "Skeleton row" 60:11555): 16px padding and gaps,
// slate-200 bottom border. Title 14px + subtitle 10px bars (8px apart), a 110 × 22 source tag,
// 56px priority, 90px due date, a 96 × 22 status pill. Rows fade out down the list (`opacity`).
export interface TaskTableRowSkeletonProps {
  titleWidth: number;
  subtitleWidth: number;
  opacity?: number;
}

export function TaskTableRowSkeleton({
  titleWidth,
  subtitleWidth,
  opacity = 1,
}: TaskTableRowSkeletonProps) {
  return (
    <li
      aria-hidden
      className="flex items-center gap-4 border-b border-slate-200 p-4 last:border-b-0"
      style={{ opacity }}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 max-w-full" style={{ width: titleWidth }} />
        <Skeleton className="h-2.5 max-w-full" style={{ width: subtitleWidth }} />
      </span>
      <span className={TASK_COLUMNS.source}>
        <Skeleton className="h-5.5 w-27.5" />
      </span>
      <span className={TASK_COLUMNS.priority}>
        <Skeleton className="h-3.5 w-14" />
      </span>
      <span className={TASK_COLUMNS.due}>
        <Skeleton className="h-3.5 w-22.5" />
      </span>
      <span className={TASK_COLUMNS.status}>
        <Skeleton className="h-5.5 w-24 rounded-full" />
      </span>
      <span className="w-5" />
    </li>
  );
}
