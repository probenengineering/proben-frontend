import { TaskColumnHeader, TaskTableHeading, TaskTableRowSkeleton } from "@/components/molecules";

import { TaskTableToolbar } from "./TaskTableToolbar";

// My tasks while loading (Figma 60:11494): the heading, a dimmed toolbar, then the table header
// and five skeleton rows fading from 100% to 40%. The /tasks loading fallback.
const ROWS = [
  [240, 320, 1],
  [200, 260, 0.85],
  [280, 300, 0.7],
  [220, 240, 0.55],
  [180, 280, 0.4],
];

export function TaskTableSkeleton() {
  return (
    <div className="flex w-full flex-col gap-5" aria-busy aria-label="Loading tasks">
      <TaskTableHeading />
      <div className="flex w-full flex-col gap-5 px-5 pt-4">
        <TaskTableToolbar loading />
        <div className="overflow-clip rounded-[12px] border border-slate-200 bg-white">
          <TaskColumnHeader />
          <ul>
            {ROWS.map(([title, subtitle, opacity]) => (
              <TaskTableRowSkeleton
                key={title}
                titleWidth={title}
                subtitleWidth={subtitle}
                opacity={opacity}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
